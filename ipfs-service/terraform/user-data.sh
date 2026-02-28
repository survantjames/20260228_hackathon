#!/bin/bash
set -ex

# Install kubo (IPFS)
cd /tmp
wget -q https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
tar xzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
./install.sh

# Init IPFS as ubuntu user
sudo -u ubuntu IPFS_PATH=/home/ubuntu/.ipfs ipfs init

# Listen on all interfaces for API + gateway
sudo -u ubuntu IPFS_PATH=/home/ubuntu/.ipfs ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
sudo -u ubuntu IPFS_PATH=/home/ubuntu/.ipfs ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080

# Allow cross-origin API access (janky but functional)
sudo -u ubuntu IPFS_PATH=/home/ubuntu/.ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
sudo -u ubuntu IPFS_PATH=/home/ubuntu/.ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT","POST","GET"]'

# Systemd service
cat > /etc/systemd/system/ipfs.service <<'UNIT'
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
User=ubuntu
Environment=IPFS_PATH=/home/ubuntu/.ipfs
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable ipfs
systemctl start ipfs
