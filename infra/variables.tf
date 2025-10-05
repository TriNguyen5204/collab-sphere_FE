variable "aws_region" {
  description = "The AWS region where resources will be created."
  type        = string
  default     = "ap-southeast-1"
}

variable "instance_type" {
  description = "The EC2 instance type for the application server."
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "The name of the EC2 Key Pair to use for SSH access."
  type        = string
  default     = "asia-pacific"
}

variable "project_name" {
  description = "A name for the project to be used in resource tags."
  type        = string
  default     = "CollabSphere"
}

variable "deploy_color" {
  description = "The color for the Blue-Green deployment."
  type        = string
  default     = "green"
}

variable "elastic_ip_allocation_id" {
  description = "The Allocation ID of the Elastic IP to associate."
  type        = string
  default     = "eipalloc-0d96b96f8d9c83fff" 
}