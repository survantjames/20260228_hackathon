# ipfs-service

Janky IPFS file sharing service. Upload a file, get a QR code, show it to someone, they download the file.

## Setup

### 1. Deploy the IPFS node

```bash
cd terraform
echo "my_ip_cidr = \"$(curl -s ifconfig.me)/32\"" > terraform.tfvars
terraform init
terraform apply
```

Wait ~2 minutes for the EC2 instance to finish installing IPFS.

### 2. Upload a file and get a QR code

```bash
pip install -r requirements.txt
python upload.py http://$(cd terraform && terraform output -raw public_ip):5001 myfile.pdf
```

This uploads the file to your IPFS node and saves a `myfile_qr.png` in the current directory. Show the QR code to someone and they can download the file.

## Architecture

- EC2 instance (t3.small) in us-west-2 running [kubo](https://github.com/ipfs/kubo) v0.24.0
- IPFS API (port 5001) locked to your IP via security group
- IPFS gateway (port 8080) open to the world for downloads
- Elastic IP so the address is stable

## Teardown

```bash
cd terraform
terraform destroy
```
