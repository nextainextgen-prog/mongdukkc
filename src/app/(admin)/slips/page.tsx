"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Filter,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import type { SlipRow } from "@/types/database";

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "ทั้งหมด" },
  { key: "success", label: "ยืนยันแล้ว" },
  { key: "duplicate", label: "ซ้ำ" },
  { key: "error", label: "ผิดพลาด" },
];

const STATUS_META: Record<
  string,
  { label: string; Icon: typeof CheckCircle2; variant: "success" | "warning" | "destructive" }
> = {
  success: { label: "ยืนยันแล้ว", Icon: CheckCircle2, variant: "success" },
  duplicate: { label: "ซ้ำ", Icon: AlertTriangle, variant: "warning" },
  error: { label: "ผิดพลาด", Icon: XCircle, variant: "destructive" },
};

export default function SlipsPage() {
  const [slips, setSlips] = useState<SlipRow[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadTick((t) => t + 1);
  }, []);

  const onFilterChange = useCallback((next: string) => {
    setLoading(true);
    setFilter(next);
  }, []);

  useEffect(() => {
    let alive = true;
    const qs = filter ? `?status=${filter}&limit=50` : "?limit=50";
    fetch(`/api/slips${qs}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (alive) setSlips(j.slips ?? []);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [filter, reloadTick]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">ประวัติสลิป</h1>
          <p className="text-sm text-muted-foreground">
            รายการสลิปที่ตรวจสอบผ่านระบบทั้งหมด
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card border border-border hover:bg-secondary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ ({slips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ul className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="h-16 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </ul>
          ) : slips.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">ยังไม่มีสลิปในหมวดนี้</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {slips.map((s) => {
                const meta = STATUS_META[s.status] ?? STATUS_META.error;
                const Icon = meta.Icon;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="rounded-xl bg-muted p-2">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.sender_name ?? "ไม่ทราบชื่อผู้โอน"}{" "}
                        <span className="text-muted-foreground">
                          {s.sender_bank ? `· ${s.sender_bank}` : ""}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatThaiDate(s.trans_date ?? s.created_at)}{" "}
                        {s.trans_ref && (
                          <span className="ml-1 font-mono opacity-70">{s.trans_ref}</span>
                        )}
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
    </div>
  );
}
