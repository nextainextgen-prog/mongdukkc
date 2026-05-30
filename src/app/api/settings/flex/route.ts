import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CreateSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["success", "duplicate", "error", "custom"]),
  is_default: z.boolean().optional(),
  content: z.unknown(),
});

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("flex_templates")
    .select("*")
    .order("kind", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, templates: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const supabase = createSupabaseAdminClient();

  // If the new template is marked default, unset other defaults of the same kind first.
  if (parsed.data.is_default) {
    await supabase
      .from("flex_templates")
      .update({ is_default: false })
      .eq("kind", parsed.data.kind)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("flex_templates")
    .insert(parsed.data)
    .select()
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, template: data });
}
