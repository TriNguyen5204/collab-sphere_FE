# CollabSphere Infrastructure - Main Configuration
# This creates the complete AWS infrastructure for the frontend application

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Optional: Configure S3 backend for state management
  # backend "s3" {
  #   bucket = "collabsphere-terraform-state"
  #   key    = "frontend/terraform.tfstate"
  #   region = "ap-southeast-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# Data source for latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# VPC (optional - using default VPC for simplicity)
data "aws_vpc" "default" {
  default = true
}

# Security Group for Application Server
resource "aws_security_group" "app_server" {
  name_prefix = "${var.project_name}-${var.environment}-app-"
  description = "Security group for ${var.project_name} application server"
  vpc_id      = data.aws_vpc.default.id

  # SSH access from Jenkins server only
  ingress {
    description = "SSH from Jenkins"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.jenkins_server_ip != "" ? ["${var.jenkins_server_ip}/32"] : var.allowed_ssh_cidrs
  }

  # HTTP access from internet
  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access from internet (for future SSL)
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-app-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# EC2 Key Pair (create from public key)
resource "aws_key_pair" "app_server" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = var.ssh_public_key

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-key"
    }
  )
}

# Application Server EC2 Instance
resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.app_instance_type
  key_name      = aws_key_pair.app_server.key_name

  vpc_security_group_ids = [aws_security_group.app_server.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true
    encrypted             = true

    tags = merge(
      var.tags,
      {
        Name = "${var.project_name}-${var.environment}-app-root-volume"
      }
    )
  }

  # Basic user data to prepare instance
  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              # Update system
              apt-get update
              
              # Install basic tools
              apt-get install -y python3 python3-pip curl wget git
              
              # Create marker file for Ansible
              touch /tmp/terraform-provisioned
              
              # Log completion
              echo "$(date): Terraform user_data completed" >> /var/log/user-data.log
              EOF

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  monitoring = var.enable_monitoring

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-app-server"
      Role        = "application"
      Provisioner = "Terraform+Ansible"
    }
  )

  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP for static public IP
resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-app-eip"
    }
  )

  depends_on = [aws_instance.app_server]
}

# Generate Ansible inventory file
resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/templates/inventory.tpl", {
    app_server_ip = aws_eip.app_server.public_ip
    ssh_user      = "ubuntu"
    ssh_key_path  = var.ssh_private_key_path
  })
  filename = "${path.module}/inventory"

  depends_on = [aws_eip.app_server]
}

# Generate terraform.tfvars template
resource "local_file" "tfvars_example" {
  content  = <<-EOT
    # Copy this file to terraform.tfvars and fill in your values
    
    aws_region          = "ap-southeast-1"
    project_name        = "collabsphere"
    environment         = "prod"
    app_instance_type   = "t3.small"
    
    # SSH Configuration
    ssh_key_name         = "your-key-name"
    ssh_public_key_path  = "~/.ssh/id_rsa.pub"
    jenkins_server_ip    = "1.2.3.4"  # Your Jenkins server IP
    
    # Optional: Additional SSH access
    # allowed_ssh_cidrs = ["10.0.0.0/8"]
    
    # Docker Configuration
    docker_hub_username = "nguyense21"
    docker_image_name   = "collab-sphere-fe"
    
    # Monitoring
    enable_monitoring      = true
    backup_retention_days = 7
  EOT
  filename = "${path.module}/terraform.tfvars.example"
}

# CloudWatch Log Group (optional monitoring)
resource "aws_cloudwatch_log_group" "app_server" {
  count             = var.enable_monitoring ? 1 : 0
  name              = "/aws/ec2/${var.project_name}-${var.environment}"
  retention_in_days = var.backup_retention_days

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-logs"
    }
  )
}
