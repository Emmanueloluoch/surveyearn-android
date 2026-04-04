import crypto from "crypto";
import { logger } from "./logger";

// ─────────────────────────────────────────────────────────────────────────────
// Safaricom Daraja B2C payout service
//
// Add these in the Secrets panel when you have real credentials:
//
//   MPESA_CONSUMER_KEY       — Daraja app consumer key
//   MPESA_CONSUMER_SECRET    — Daraja app consumer secret
//   MPESA_SHORTCODE          — B2C business shortcode (e.g. 600000 for sandbox)
//   MPESA_INITIATOR_NAME     — Initiator name configured on the Daraja portal
//   MPESA_INITIATOR_PASSWORD — Initiator password from the portal
//   MPESA_ENVIRONMENT        — "sandbox" (default) or "production"
//   MPESA_CALLBACK_URL       — Public HTTPS URL for B2C result callback
//                              Defaults to https://<your-replit-domain>/api/mpesa/callback
//
// Note: MPESA_PASSKEY is for STK Push (C2B collections). For payouts (B2C)
//       you need the MPESA_INITIATOR_* credentials above instead.
//
// Points → KES conversion: 1 point = 1 KES
// ─────────────────────────────────────────────────────────────────────────────

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE = "https://api.safaricom.co.ke";

// Safaricom sandbox public certificate for SecurityCredential generation
const SANDBOX_CERT = `-----BEGIN CERTIFICATE-----
MIIGkzCCBHugAwIBAgIIn277jGXMPRQwDQYJKoZIhvcNAQELBQAwgZAxCzAJBgNV
BAYTAktFMRAwDgYDVQQIEwdOYWlyb2JpMRAwDgYDVQQHEwdOYWlyb2JpMRIwEAYD
VQQKEwlTYWZhcmljb20xEjAQBgNVBAsTCUxpdmUgQVBJUzEQMA4GA1UEAxMHbXBl
c2FjYTETMBEGCSqGSIb3DQEJARYEMG1wZXNhMB4XDTE4MDEwNTA4MTIzNloXDTI4
MDEwMzA4MTIzNlowgY8xCzAJBgNVBAYTAktFMRAwDgYDVQQIEwdOYWlyb2JpMRAw
DgYDVQQHEwdOYWlyb2JpMREwDwYDVQQKEwhTYWZhcmljbzESMBAGA1UECxMJTGl2
ZSBBUFJTMQ8wDQYDVQQDEwZtcGVzYWExJDAiBgkqhkiG9w0BCQEWFW1wZXNhLWFw
aUBzYWZhcmljb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC5JMHIY
rkNWuCR4iHi3EzO8RxjtyxVJJNuiHziFi7tDUhQXAX7qCy6Y3CjXHCXjdqm+A3c
k4hUvFiCuSFbZq3Ft7JZpiUjm1r7F01EEIoD3jYKBT8x0VJVRjZsIjOr6Tit7h9
fFmIWEWtHEDHqTMsqsmPFI1w1QIYerrnF5Fx6Ql+OWKN0L9v6mcBjE4PGKOT7GC
L3f/1bUhz4/8rSCelKPiFLJDMpq4R6j4a+FBnr3fEJUGH9o/eLbRfvNXXsKCHWh
vlqS7bVBqGbRn/FBxcgCk7BwAXXA6R30hBOBPqBa/wD3DJgAl6bHpQRGpXiZ/7x
L7e7gJvhUOYfzrChAgMBAAGjggHUMIIB0DAdBgNVHSUEFjAUBggrBgEFBQcDAQYI
KwYBBQUHAwIwHQYDVR0OBBYEFBs5RYP1giA8mMWLGbgGBoKBiFAlMB8GA1UdIwQY
MBaAFBP4HuPQSHQpMlAqGJmI5WAmKi+aMEwGA1UdIARFMEMwQQYJKwYBBAGCmGkB
MDQwMgYIKwYBBQUHAgEWJmh0dHBzOi8vd3d3LnNhZmFyaWNvbS5jby5rZS9tcGVz
YWNhMFcGA1UdHwRQME4wTKBKoEiGRmh0dHBzOi8vd3d3LnNhZmFyaWNvbS5jby5r
ZS9tcGVzYWNhL2Rvd25sb2Fkcy9tcGVzYS1zYW5kYm94LmNybDCBkQYIKwYBBQUH
AQEEgYQwgYEwSAYIKwYBBQUHMAKGPGh0dHBzOi8vd3d3LnNhZmFyaWNvbS5jby5r
ZS9tcGVzYWNhL2Rvd25sb2Fkcy9tcGVzYWNhLmNydDA1BggrBgEFBQcwAYYpaHR0
cHM6Ly93d3cuc2FmYXJpY29tLmNvLmtlL21wZXNhY2Evb2NzcDAOBgNVHQ8BAf8E
BAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMA0GCSqGSIb3DQEB
CwUAA4ICAQBsqJmFQxKBSnL3cJCMKg8yoaV3KjYMmMbTzgXOqLDsoCsxT1vxKpMa
fE1VN/u9NmKQPZPNBnQ08FJVPVR0kc0YD0W7CWTQJMO7TNNI1nSXbwN3J4YXSQ
ZrK/uW4PwZPmI4E0sMUbFRvFhAo1A3RNWv0JMk2BVzCaGj8h9SFr9dqvfA5kz+
BQ8bLKUJNF0nfA3C2FPiDjB/DamlUYC6SYJy2QJCGxCxJOCX9O4FYFwMiUlDMY
a6XT8V7qLpYj3nqhz8SKbr6jJM5tGN8P7LWKM+ZVH0rjRaST+xMjQDLmJsTlkMO
/lFdlrM3WxRjFJNVAX1S5VVAJV6ymHUDL2LtEZjqjjKSynklj5A/dqt7BN/Z8d
Yd/jN6vEsL7G1YSJa2lqkFSFuFH0aNx6mOkPTFHv5Iqe7q8XPTX5YFEKQy+C5c
iFkYW5YlPqFp9eeWBWFsGEi5z+Q4QSTwMPXxjzPCPqIjnWfzNdEqbqBHsRRb3d
Vr/KFmRFfr1PkJOb4XUdM5uIKs9K2ARPkc8J1GtOJ0Y0S8GxQ0XPv0nFUiVBRh
xkPSgvPbcEhGKeSEA+R3A68T6A/4aIOFp/y8dJQTKjKFOBjZ2M4KfN7v7Aq3Js
v8GkFDLJqnJSfvHj5gWLUBNz+3bS/K8A+MhVYrGrJA==
-----END CERTIFICATE-----`;

function getBaseUrl(): string {
  return (process.env.MPESA_ENVIRONMENT ?? "sandbox") === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

function isMpesaConfigured(): boolean {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_INITIATOR_NAME &&
    process.env.MPESA_INITIATOR_PASSWORD
  );
}

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
  );

  if (!res.ok) {
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function generateSecurityCredential(initiatorPassword: string): string {
  const cert = SANDBOX_CERT;
  const encrypted = crypto.publicEncrypt(
    { key: cert, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(initiatorPassword)
  );
  return encrypted.toString("base64");
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  return cleaned;
}

export interface PayoutResult {
  success: boolean;
  simulated: boolean;
  message: string;
  reference?: string;
}

export async function sendMpesaPayout(
  phone: string,
  amount: number,
  remarks = "Survey reward payout"
): Promise<PayoutResult> {
  if (!isMpesaConfigured()) {
    logger.info({ phone, amount }, "M-Pesa not configured — simulated payout");
    return {
      success: true,
      simulated: true,
      message: `Simulated M-Pesa payout of KES ${amount} to ${phone}`,
    };
  }

  const token = await getAccessToken();
  const securityCredential = generateSecurityCredential(
    process.env.MPESA_INITIATOR_PASSWORD!
  );
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ??
    `https://${(process.env.REPLIT_DOMAINS ?? "localhost").split(",")[0]}/api/mpesa/callback`;

  const res = await fetch(`${getBaseUrl()}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: formatPhone(phone),
      Remarks: remarks,
      QueueTimeOutURL: callbackUrl,
      ResultURL: callbackUrl,
      Occasion: "SurveyReward",
    }),
  });

  const data = (await res.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    ConversationID?: string;
    errorMessage?: string;
  };

  if (!res.ok || data.ResponseCode !== "0") {
    const msg = data.ResponseDescription ?? data.errorMessage ?? "M-Pesa request failed";
    logger.error({ phone, amount, mpesaResponse: data }, "M-Pesa payout failed");
    throw new Error(msg);
  }

  logger.info({ phone, amount, conversationId: data.ConversationID }, "M-Pesa payout initiated");
  return {
    success: true,
    simulated: false,
    message: `M-Pesa payout of KES ${amount} initiated to ${phone}`,
    reference: data.ConversationID,
  };
}
