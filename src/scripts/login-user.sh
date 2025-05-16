#!/bin/bash

# Login script for user
EMAIL="alex@example.com"
PASSWORD="123456"

# Get fresh CSRF token and cookie
TOKEN=$(curl -s -c cookies.txt http://localhost:5000/api/auth/csrf | jq -r .csrfToken)

# Perform login
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: ${TOKEN}" \
     -X POST http://localhost:5000/api/auth/login \
     -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"
