import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getMerchantAccountsSetting,
  saveMerchantAccountsSetting,
} from "@/lib/accounts/service";

export const runtime = "nodejs";

const AccountSchema = z.object({
  id: z.string(),
  label: z.string(),
  bank: z.string(),
  account_name: z.string(),
  account_number: z.string().optional().nullable(),
  is_active: z.boolean(),
});

const BodySchema = z.object({
  accounts: z.array(AccountSchema),
  enforce: z.boolean(),
});

export async function GET() {
  const s = await getMerchantAccountsSetting();
  return NextResponse.json({ ok: true, settings: s });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await saveMerchantAccountsSetting(parsed.data);
  return NextResponse.json({ ok: true, settings: parsed.data });
}
