provider "aws" {
  region = var.aws_region
}

resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-SG"
  description = "Security group for the ${var.project_name} application server"

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-SG"
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0df7a207adb9748c7"
  instance_type = var.instance_type
  security_groups = [aws_security_group.app_sg.name]
  key_name      = var.key_name
  
  # User data to ensure SSH is ready
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y openssh-server
              systemctl enable ssh
              systemctl start ssh
              # Signal that instance is ready
              /opt/aws/bin/cfn-signal -e $? --stack ${var.project_name} --resource app_server || true
              EOF

  tags = {
    Name    = "${var.project_name}-App-Server-${var.deploy_color}"
    Project = var.project_name
    Color   = var.deploy_color
  }
}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.app_server.id
  allocation_id = var.elastic_ip_allocation_id
}