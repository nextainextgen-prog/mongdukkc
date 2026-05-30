import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  kind: z.enum(["success", "duplicate", "error", "custom"]).optional(),
  is_default: z.boolean().optional(),
  content: z.unknown().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  // If becoming the default for its kind, unset existing default first.
  if (parsed.data.is_default) {
    const { data: existing } = await supabase
      .from("flex_templates")
      .select("kind")
      .eq("id", id)
      .maybeSingle();
    const kind = parsed.data.kind ?? existing?.kind;
    if (kind) {
      await supabase
        .from("flex_templates")
        .update({ is_default: false })
        .eq("kind", kind)
        .eq("is_default", true)
        .neq("id", id);
    }
  }

  const { data, error } = await supabase
    .from("flex_templates")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, template: data });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("flex_templates").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
