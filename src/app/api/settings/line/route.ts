import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PayloadSchema = z.object({
  channel_access_token: z.string().trim().optional().nullable(),
  channel_secret: z.string().trim().optional().nullable(),
  webhook_url: z.string().trim().url().optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("line_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, settings: data });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  // Ensure single-row.
  const { data: existing } = await supabase
    .from("line_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const patch = {
    ...parsed.data,
    webhook_url: parsed.data.webhook_url || null,
  };

  if (!existing) {
    const { data, error } = await supabase
      .from("line_settings")
      .insert(patch)
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  }

  const { data, error } = await supabase
    .from("line_settings")
    .update(patch)
    .eq("id", existing.id)
    .select()
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, settings: data });
}
