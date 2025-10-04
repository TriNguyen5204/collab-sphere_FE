# Terraform variables for CollabSphere infrastructure

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "collabsphere"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_instance_type" {
  description = "EC2 instance type for app server"
  type        = string
  default     = "t3.small"
}

variable "ssh_key_name" {
  description = "Name for the EC2 key pair"
  type        = string
  default     = "collabsphere-key"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "jenkins_server_ip" {
  description = "IP address of Jenkins server for SSH access."
  type        = string
  default     = ""
}

variable "allowed_ssh_cidrs" {
  description = "List of CIDR blocks allowed to SSH to app server (used if jenkins_server_ip is empty)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "docker_hub_username" {
  description = "Docker Hub username"
  type        = string
  default     = "nguyense21"
}

variable "docker_image_name" {
  description = "Docker image name"
  type        = string
  default     = "collab-sphere-fe"
}

variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "CollabSphere"
    ManagedBy   = "Terraform"
    Team        = "DevOps"
  }
}
