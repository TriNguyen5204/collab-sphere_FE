output "public_ip" {
  description = "The public IP address of the newly created application server."
  value       = aws_eip_association.eip_assoc.public_ip
}

output "instance_id" {
  description = "The ID of the newly created EC2 instance."
  value       = aws_instance.app_server.id
}

output "elastic_ip" {
  description = "The Elastic IP associated with the instance."
  value       = aws_eip_association.eip_assoc.public_ip
}