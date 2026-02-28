output "public_ip" {
  value = aws_eip.ipfs.public_ip
}

output "ipfs_gateway_url" {
  value = "http://${aws_eip.ipfs.public_ip}:8080"
}

output "ipfs_api_url" {
  value = "http://${aws_eip.ipfs.public_ip}:5001"
}

output "ssh_command" {
  value = "ssh ubuntu@${aws_eip.ipfs.public_ip}"
}
