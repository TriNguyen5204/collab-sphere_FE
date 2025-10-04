# Terraform outputs for CollabSphere infrastructure

output "app_server_id" {
  description = "ID of the application EC2 instance"
  value       = aws_instance.app_server.id
}

output "app_server_public_ip" {
  description = "Public IP address of the application server (Elastic IP)"
  value       = aws_eip.app_server.public_ip
}

output "app_server_private_ip" {
  description = "Private IP address of the application server"
  value       = aws_instance.app_server.private_ip
}

output "app_server_public_dns" {
  description = "Public DNS name of the application server"
  value       = aws_instance.app_server.public_dns
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app_server.id
}

output "ssh_key_name" {
  description = "Name of the SSH key pair"
  value       = aws_key_pair.app_server.key_name
}

output "ansible_inventory_path" {
  description = "Path to generated Ansible inventory file"
  value       = local_file.ansible_inventory.filename
}

output "ssh_connection_string" {
  description = "SSH command to connect to the app server"
  value       = "ssh -i ${var.ssh_private_key_path} ubuntu@${aws_eip.app_server.public_ip}"
  sensitive   = true
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.app_server.public_ip}"
}

output "jenkins_deploy_host" {
  description = "DEPLOY_HOST parameter for Jenkins pipeline"
  value       = "ubuntu@${aws_eip.app_server.public_ip}"
  sensitive   = true
}

output "docker_image_full_name" {
  description = "Full Docker image name"
  value       = "${var.docker_hub_username}/${var.docker_image_name}"
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}
