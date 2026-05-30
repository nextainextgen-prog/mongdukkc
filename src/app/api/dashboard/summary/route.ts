import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface SummaryRow {
  amount: number | null;
  status: string;
  created_at: string;
  trans_date: string | null;
}

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const nowBangkok = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
  );
  const startOfDay = new Date(nowBangkok);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(nowBangkok.getFullYear(), nowBangkok.getMonth(), 1);
  const startOf30 = new Date(nowBangkok);
  startOf30.setDate(startOf30.getDate() - 29);
  startOf30.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("slips")
    .select("amount,status,created_at,trans_date")
    .gte("created_at", startOf30.toISOString())
    .returns<SummaryRow[]>();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const success = (data ?? []).filter((r) => r.status === "success");

  const sum = (rows: SummaryRow[]) =>
    rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const today = success.filter(
    (r) => new Date(r.trans_date ?? r.created_at) >= startOfDay,
  );
  const month = success.filter(
    (r) => new Date(r.trans_date ?? r.created_at) >= startOfMonth,
  );

  // Per-day series for last 14 days (for a simple sparkline).
  const days: { date: string; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfDay);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const rows = success.filter((r) => {
      const t = new Date(r.trans_date ?? r.created_at);
      return t >= d && t < next;
    });
    days.push({
      date: d.toISOString().slice(0, 10),
      total: sum(rows),
      count: rows.length,
    });
  }

  // Counters
  const counts = (data ?? []).reduce(
    (acc, r) => {
      acc.total += 1;
      acc[r.status as "success" | "duplicate" | "error"] =
        (acc[r.status as "success" | "duplicate" | "error"] ?? 0) + 1;
      return acc;
    },
    { total: 0, success: 0, duplicate: 0, error: 0 } as Record<string, number>,
  );

  return NextResponse.json({
    ok: true,
    summary: {
      today: { total: sum(today), count: today.length },
      month: { total: sum(month), count: month.length },
      last30: { total: sum(success), count: success.length },
      counts,
      days,
    },
  });
}
