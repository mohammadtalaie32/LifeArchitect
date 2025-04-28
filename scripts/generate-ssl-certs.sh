#!/bin/bash
set -e

# This script generates self-signed SSL certificates for local development
CERT_DIR="./nginx/ssl"
DOMAIN="localhost"

echo "Generating self-signed SSL certificates for $DOMAIN..."

# Ensure directory exists
mkdir -p $CERT_DIR

# Generate a private key
openssl genrsa -out $CERT_DIR/key.pem 2048

# Generate a Certificate Signing Request (CSR)
openssl req -new -key $CERT_DIR/key.pem -out $CERT_DIR/csr.pem -subj "/CN=$DOMAIN/O=Local Development/C=US"

# Generate a self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in $CERT_DIR/csr.pem -signkey $CERT_DIR/key.pem -out $CERT_DIR/cert.pem

# Clean up the CSR (we don't need it anymore)
rm $CERT_DIR/csr.pem

echo "SSL certificates have been generated in $CERT_DIR"
echo "  - Certificate: $CERT_DIR/cert.pem"
echo "  - Private key: $CERT_DIR/key.pem"
echo ""
echo "Note: Since this is a self-signed certificate, your browser will show a security warning."
echo "You can proceed anyway for local development purposes."