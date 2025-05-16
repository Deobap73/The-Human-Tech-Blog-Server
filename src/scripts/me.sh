#!/bin/bash

# Usa o último accessToken para obter o utilizador autenticado
echo "Introduz o accessToken:"
read TOKEN

curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/auth/me
