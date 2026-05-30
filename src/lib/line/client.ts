/**
 * Thin LINE Messaging API client. We talk to LINE via fetch (not the SDK)
 * so the same code runs on Fluid Compute without bundling the heavy SDK.
 */

import crypto from "node:crypto";

const LINE_API = "https://api.line.me/v2/bot";

export function verifyLineSignature(
  rawBody: string,
  signature: string | null,
  channelSecret: string,
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");
  // Use timingSafeEqual on equal-length buffers.
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function lineReply(
  channelAccessToken: string,
  replyToken: string,
  messages: unknown[],
): Promise<void> {
  const res = await fetch(`${LINE_API}/message/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE reply failed (${res.status}): ${text}`);
  }
}

export async function linePush(
  channelAccessToken: string,
  to: string,
  messages: unknown[],
): Promise<void> {
  const res = await fetch(`${LINE_API}/message/push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE push failed (${res.status}): ${text}`);
  }
}

export async function fetchLineMessageContent(
  channelAccessToken: string,
  messageId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    },
  );
  if (!res.ok) {
    throw new Error(`LINE content fetch failed (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return { buffer: buf, contentType: res.headers.get("content-type") ?? "image/jpeg" };
}
