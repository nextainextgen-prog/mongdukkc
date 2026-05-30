"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  Coins,
  PiggyBank,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTHB } from "@/lib/utils";

interface SummaryResponse {
  ok: boolean;
  summary?: {
    today: { total: number; count: number };
    month: { total: number; count: number };
    last30: { total: number; count: number };
    counts: { total: number; success: number; duplicate: number; error: number };
    days: { date: string; total: number; count: number }[];
  };
}

type AccentKey = "primary" | "accent" | "success" | "warning";

const ACCENT: Record<AccentKey, { bg: string; text: string; bar: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  accent: { bg: "bg-accent/15", text: "text-accent-foreground", bar: "bg-accent" },
  success: { bg: "bg-[color:var(--success)]/10", text: "text-[color:var(--success)]", bar: "bg-[color:var(--success)]" },
  warning: { bg: "bg-[color:var(--warning)]/10", text: "text-[color:var(--warning)]", bar: "bg-[color:var(--warning)]" },
};

export function SummaryCards() {
  const [data, setData] = useState<SummaryResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: SummaryResponse) => {
        if (alive) setData(j.summary ?? null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Placeholders for future modules — owner asked us to leave room.
  const todayTotal = data?.today.total ?? 0;
  const monthTotal = data?.month.total ?? 0;
  const cost = 0;
  const profit = monthTotal - cost;

  const cards: {
    key: string;
    title: string;
    value: string;
    sub: string;
    icon: typeof Wallet;
    accent: AccentKey;
    soon?: boolean;
  }[] = [
    {
      key: "today",
      title: "รายรับวันนี้",
      value: formatTHB(todayTotal),
      sub: `${data?.today.count ?? 0} รายการที่ยืนยันแล้ว`,
      icon: Wallet,
      accent: "primary",
    },
    {
      key: "month",
      title: "รายได้เดือนนี้",
      value: formatTHB(monthTotal),
      sub: `${data?.month.count ?? 0} รายการ`,
      icon: TrendingUp,
      accent: "accent",
    },
    {
      key: "cost",
      title: "ต้นทุน",
      value: formatTHB(cost),
      sub: "ยังไม่ได้บันทึก",
      icon: Coins,
      accent: "warning",
      soon: true,
    },
    {
      key: "profit",
      title: "กำไร",
      value: formatTHB(profit),
      sub: "คำนวณจากต้นทุนที่บันทึก",
      icon: PiggyBank,
      accent: "success",
      soon: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const a = ACCENT[c.accent];
        return (
          <Card key={c.key} className="animate-pop-in overflow-hidden relative">
            <div className={`absolute inset-x-0 top-0 h-1 ${a.bar}`} aria-hidden />
            <CardContent className="p-5 pt-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl ${a.bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${a.text}`} />
                </div>
                {c.soon && <Badge variant="secondary">เร็ว ๆ นี้</Badge>}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{c.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {loading ? "—" : c.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        );
      })}

      {/* Placeholder "add card" — owner asked design to support adding cards later */}
      <Card className="border-2 border-dashed border-border bg-transparent shadow-none flex items-center justify-center min-h-[160px] text-muted-foreground">
        <button
          type="button"
          className="flex flex-col items-center gap-2 text-sm hover:text-primary transition-colors"
          disabled
        >
          <span className="rounded-2xl bg-secondary/40 p-2.5">
            <Plus className="h-5 w-5" />
          </span>
          เพิ่มการ์ดในอนาคต
        </button>
      </Card>
    </div>
  );
}
