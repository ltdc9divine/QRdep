import "server-only";
import { PayOS } from "@payos/node";

export function isPayOSConfigured() {
  return Boolean(
    process.env.PAYOS_CLIENT_ID?.trim() &&
      process.env.PAYOS_API_KEY?.trim() &&
      process.env.PAYOS_CHECKSUM_KEY?.trim(),
  );
}

export function getPayOSClient() {
  const clientId = process.env.PAYOS_CLIENT_ID?.trim();
  const apiKey = process.env.PAYOS_API_KEY?.trim();
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim();

  if (!clientId || !apiKey || !checksumKey) return null;

  return new PayOS({
    clientId,
    apiKey,
    checksumKey,
    logLevel: "error",
    maxRetries: 1,
    timeout: 15000,
  });
}