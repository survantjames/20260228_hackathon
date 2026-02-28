#!/usr/bin/env python3
"""Upload a file to your IPFS node and spit out a QR code for downloading it."""

import sys
import os
import json
from urllib.parse import urlparse

import requests
import qrcode


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <ipfs-api-url> <file>")
        print(f"  e.g. {sys.argv[0]} http://54.123.45.67:5001 cat.jpg")
        sys.exit(1)

    api_url = sys.argv[1].rstrip("/")
    filepath = sys.argv[2]

    if not os.path.isfile(filepath):
        print(f"Error: {filepath} not found")
        sys.exit(1)

    filename = os.path.basename(filepath)

    # Upload to IPFS via the node's HTTP API
    print(f"Uploading {filename} ...")
    with open(filepath, "rb") as f:
        resp = requests.post(
            f"{api_url}/api/v0/add",
            files={"file": (filename, f)},
        )
    resp.raise_for_status()
    result = json.loads(resp.text)
    cid = result["Hash"]
    size = result.get("Size", "?")
    print(f"Pinned! CID: {cid}  ({size} bytes)")

    # Build the gateway download URL (same host, port 8080)
    host = urlparse(api_url).hostname
    gateway_url = f"http://{host}:8080/ipfs/{cid}?filename={filename}"
    print(f"Download URL: {gateway_url}")

    # Generate QR code
    qr_file = f"{os.path.splitext(filename)[0]}_qr.png"
    img = qrcode.make(gateway_url)
    img.save(qr_file)
    print(f"QR code saved to: {qr_file}")


if __name__ == "__main__":
    main()
