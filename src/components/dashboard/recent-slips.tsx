"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import type { SlipRow } from "@/types/database";

const STATUS_META = {
  success: { label: "ยืนยันแล้ว", Icon: CheckCircle2, variant: "success" as const },
  duplicate: { label: "สลิปซ้ำ", Icon: AlertTriangle, variant: "warning" as const },
  error: { label: "ตรวจไม่ผ่าน", Icon: XCircle, variant: "destructive" as const },
};

export function RecentSlips() {
  const [slips, setSlips] = useState<SlipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/slips?limit=8", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => alive && setSlips(j.slips ?? []))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>สลิปล่าสุด</CardTitle>
        <CardDescription>8 รายการที่เพิ่งเข้ามา</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-14 rounded-2xl bg-secondary/40 animate-pulse" />
            ))}
          </ul>
        ) : slips.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">ยังไม่มีสลิป รอลูกค้าโอนนะคะ</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {slips.map((s) => {
              const meta = STATUS_META[s.status];
              const Icon = meta.Icon;
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2.5"
                >
                  <span className="rounded-xl bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.sender_name ?? "ไม่ทราบชื่อผู้โอน"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatThaiDate(s.trans_date ?? s.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {s.amount != null ? formatTHB(Number(s.amount)) : "-"}
                    </p>
                    <Badge variant={meta.variant} className="mt-0.5">
                      {meta.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
