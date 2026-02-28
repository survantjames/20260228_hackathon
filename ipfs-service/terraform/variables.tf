variable "region" {
  description = "AWS region"
  default     = "us-west-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.small"
}

variable "my_ip_cidr" {
  description = "Your IP in CIDR notation (e.g. 203.0.113.42/32) to lock down API access"
}
