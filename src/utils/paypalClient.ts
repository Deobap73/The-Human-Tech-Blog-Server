// src/utils/paypalClient.ts
// Description: Minimal PayPal REST v2 client using fetch (Node 18+). Handles OAuth token and Orders API.
// I deliberately ignore client-provided amount; server enforces env price.

import { env } from '../config/env';

const API_BASE = env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

interface PaypalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

let cachedToken: { token: string; exp: number } | null = null;

const getBasicAuthHeader = (): string => {
  const creds = `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`;
  return 'Basic ' + Buffer.from(creds).toString('base64');
};

const fetchAccessToken = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 30) {
    return cachedToken.token;
  }
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal OAuth failed: ${res.status} ${txt}`);
  }
  const data = (await res.json()) as PaypalAccessToken;
  cachedToken = { token: data.access_token, exp: Math.floor(Date.now() / 1000) + data.expires_in };
  return data.access_token;
};

export const paypalApi = {
  createOrder: async (amount: number, currency: 'EUR') => {
    const token = await fetchAccessToken();
    const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`PayPal createOrder failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json as { id: string; status: string };
  },

  captureOrder: async (orderId: string) => {
    const token = await fetchAccessToken();
    const res = await fetch(
      `${API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(json)}`);
    }
    return json as any; // PayPal capture response
  },
};
