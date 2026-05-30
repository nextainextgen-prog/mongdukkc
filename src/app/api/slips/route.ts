import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 30), 100);
  const status = url.searchParams.get("status");

  const supabase = createSupabaseAdminClient();
  let q = supabase
    .from("slips")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slips: data });
}

/**
 * DELETE all slips. Use ?status=xxx to limit, or ?id=xxx to delete one.
 * Admin-only tooling for testing — guard with auth before production.
 */
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const status = url.searchParams.get("status");

  const supabase = createSupabaseAdminClient();
  let q = supabase.from("slips").delete({ count: "exact" });
  if (id) q = q.eq("id", id);
  else if (status) q = q.eq("status", status);
  else q = q.neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  const { error, count } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
