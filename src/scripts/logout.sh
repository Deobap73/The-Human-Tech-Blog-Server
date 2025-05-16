#!/bin/bash

# Faz logout com o cookie e token atual
TOKEN=$(curl -s -c cookies.txt http://localhost:5000/api/auth/csrf | jq -r .csrfToken)

curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: $TOKEN" \
     -X POST http://localhost:5000/api/auth/logout
