#!/usr/bin/env sh
# Prints secrets for production .env — run once and paste into your host.
JWT=$(openssl rand -base64 48 | tr -d '\n')
echo "JWT_SECRET=$JWT"
