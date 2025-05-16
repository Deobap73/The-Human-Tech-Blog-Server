#!/bin/bash

echo "🔐 Teste de login completo:"

echo "1️⃣ Login como admin..."
TOKEN=$(curl -s -c cookies.txt http://localhost:5000/api/auth/csrf | jq -r .csrfToken)
ACCESS=$(curl -s -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: $TOKEN" \
     -X POST http://localhost:5000/api/auth/login \
     -d '{"email": "berto@example.com", "password": "123456"}' | jq -r .accessToken)

echo "✅ Token: $ACCESS"
echo

echo "2️⃣ Validando token com /auth/me..."
curl -s -H "Authorization: Bearer $ACCESS" http://localhost:5000/api/auth/me | jq
echo

echo "3️⃣ Logout..."
TOKEN=$(curl -s -c cookies.txt http://localhost:5000/api/auth/csrf | jq -r .csrfToken)
curl -s -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
     -H "X-XSRF-TOKEN: $TOKEN" \
     -X POST http://localhost:5000/api/auth/logout
echo "🚪 Logout concluído."
