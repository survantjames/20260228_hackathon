# IPFS Chat — Setup & Deployment Guide

A real-time decentralized chat app built on IPFS pubsub, with a Next.js web frontend deployed to Vercel and an IPFS node running on AWS EC2 via Terraform.

---

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured (`aws configure`)
- [Node.js](https://nodejs.org/) >= 18
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)

---

## Part 1: Deploy the IPFS Node on AWS (Terraform)

The Terraform config lives in `ipfs-service/terraform/`. It provisions:

- An EC2 `t3.small` instance (Ubuntu 22.04) running **Kubo v0.24.0** (IPFS daemon)
- An Elastic IP so the address never changes across reboots
- A security group opening ports `4001` (swarm), `5001` (API), and `8080` (gateway)
- Pubsub enabled at boot via `user-data.sh`

### Step 1 — Configure AWS credentials

```bash
aws configure
# Enter your Access Key ID, Secret Access Key, and region (default: us-west-2)
```

### Step 2 — Get your public IP

Terraform needs your IP to scope API access. Find it with:

```bash
curl -s https://checkip.amazonaws.com
# e.g. 203.0.113.42
```

### Step 3 — Initialize and apply Terraform

```bash
cd ipfs-service/terraform

terraform init

terraform apply \
  -var="my_ip_cidr=203.0.113.42/32"
```

Review the plan and type `yes` to confirm. Provisioning takes ~2 minutes.

### Step 4 — Note the outputs

After apply completes, Terraform prints:

```
public_ip         = "44.234.x.x"
ipfs_api_url      = "http://44.234.x.x:5001"
ipfs_gateway_url  = "http://44.234.x.x:8080"
ssh_command       = "ssh ubuntu@44.234.x.x"
```

Save the `public_ip` — you'll need it for the next section.

### Step 5 — Verify the node is running

SSH in and check the daemon (allow ~60 seconds after apply for boot):

```bash
ssh ubuntu@44.234.x.x
systemctl status ipfs
# should show: active (running)

# Confirm pubsub is enabled
ipfs config Pubsub.Enabled
# true
```

### Tearing down

```bash
terraform destroy -var="my_ip_cidr=203.0.113.42/32"
```

---

## Part 2: Deploy the Web App to Vercel

The Next.js app lives in `web/`. It connects to your IPFS node via two environment variables.

### Step 1 — Set environment variables

Create `web/.env.local` (or configure in the Vercel dashboard):

```env
IPFS_API_URL=http://<public_ip>:5001
NEXT_PUBLIC_IPFS_GATEWAY=http://<public_ip>:8080
```

Replace `<public_ip>` with the IP from Terraform output.

> `IPFS_API_URL` is server-side only (used by API routes to upload/pin content).
> `NEXT_PUBLIC_IPFS_GATEWAY` is exposed to the browser for rendering IPFS-hosted images.

### Step 2 — Install dependencies and test locally

```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

### Step 3 — Deploy to Vercel

#### Option A: Vercel CLI (recommended for first deploy)

```bash
cd web
vercel

# Follow the prompts:
#   - Link to existing project or create new
#   - Set root directory: web (or . if already inside)
#   - Framework: Next.js (auto-detected)
```

Add the environment variables when prompted, or run afterward:

```bash
vercel env add IPFS_API_URL
vercel env add NEXT_PUBLIC_IPFS_GATEWAY
```

Then deploy to production:

```bash
vercel --prod
```

#### Option B: GitHub integration (auto-deploy on push)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Set **Root Directory** to `web`.
4. Add the two environment variables under **Environment Variables**.
5. Click **Deploy**.

Every subsequent push to `main` will trigger an automatic redeploy.

---

## Environment Variables Reference

| Variable | Where used | Description |
|---|---|---|
| `IPFS_API_URL` | Server (API routes) | IPFS Kubo API endpoint, e.g. `http://44.234.x.x:5001` |
| `NEXT_PUBLIC_IPFS_GATEWAY` | Browser | IPFS HTTP gateway for loading content, e.g. `http://44.234.x.x:8080` |

---

## Architecture Overview

```
Browser
  │
  ├── Next.js (Vercel)
  │     ├── /api/posts   — read/write posts, pins to IPFS
  │     ├── /api/feed    — SSE stream; subscribes to IPFS pubsub
  │     └── /api/media   — proxies file uploads to IPFS
  │
  └── IPFS Gateway (EC2 :8080) — serves images by CID
        │
        IPFS Node (EC2 :5001)
          └── pubsub topic: ipfs-chat:<channel>
                └── real-time delivery to all connected servers
```

---

## Updating an Existing EC2 Node

If you provisioned the EC2 instance before pubsub was added to `user-data.sh`, enable it manually:

```bash
ssh ubuntu@<public_ip>
IPFS_PATH=/home/ubuntu/.ipfs ipfs config --json Pubsub.Enabled true
sudo systemctl restart ipfs
```
