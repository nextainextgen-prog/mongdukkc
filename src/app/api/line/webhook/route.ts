import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  lineReply,
  fetchLineMessageContent,
} from "@/lib/line/client";
import { getLineCredentials } from "@/lib/line/settings";
import { verifyAndStoreSlip } from "@/lib/slips/service";
import { buildReplyForSlipResult } from "@/lib/line/reply-builder";

export const runtime = "nodejs";

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { id: string; type: string };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  const creds = await getLineCredentials();
  if (!creds) {
    console.error("[line/webhook] LINE credentials not configured");
    // 200 to LINE so they don't disable the webhook; merchant fixes via admin UI.
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }
  if (!creds.isActive) {
    return NextResponse.json({ ok: false, reason: "inactive" });
  }

  if (!verifyLineSignature(raw, signature, creds.channelSecret)) {
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 401 });
  }

  let payload: { events?: LineEvent[] };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const events = payload.events ?? [];
  await Promise.all(events.map((ev) => handleEvent(ev, creds)));

  return NextResponse.json({ ok: true });
}

async function handleEvent(ev: LineEvent, creds: { channelAccessToken: string }) {
  if (ev.type !== "message" || !ev.message || !ev.replyToken) return;

  // Slip-only mode (per shop owner): reply solely when the customer sends an
  // image. Text / sticker / video / etc. are ignored silently so the OA never
  // chatters at customers.
  if (ev.message.type !== "image") return;

  try {
    const { buffer, contentType } = await fetchLineMessageContent(
      creds.channelAccessToken,
      ev.message.id,
    );
    const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
    const result = await verifyAndStoreSlip(
      { image: blob, fileName: `${ev.message.id}.jpg` },
      { source: "line", lineUserId: ev.source?.userId ?? null },
    );
    const messages = await buildReplyForSlipResult(result);
    await lineReply(creds.channelAccessToken, ev.replyToken, messages);
  } catch (err) {
    // Slip-only mode: log internal errors but do not message the customer.
    console.error("[line/webhook] image handling failed (silent)", err);
  }
}

// LINE verifies webhooks with a quick GET to check reachability sometimes; respond OK.
export async function GET() {
  return NextResponse.json({ ok: true, service: "line-webhook" });
}
