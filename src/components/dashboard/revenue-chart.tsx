"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatTHB } from "@/lib/utils";

interface Day {
  date: string;
  total: number;
  count: number;
}

export function RevenueChart() {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => alive && setDays(j?.summary?.days ?? []))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const max = Math.max(1, ...days.map((d) => d.total));
  const total = days.reduce((acc, d) => acc + d.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายรับ 14 วันล่าสุด</CardTitle>
        <CardDescription>
          รวม {formatTHB(total)} จากสลิปที่ตรวจสอบแล้ว
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {loading
            ? Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-xl bg-secondary/60 animate-pulse"
                  style={{ height: `${30 + ((i * 37) % 60)}%` }}
                />
              ))
            : days.map((d) => {
                const h = Math.max(4, (d.total / max) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-primary/70 to-accent/80 transition-all hover:from-primary hover:to-accent"
                      style={{ height: `${h}%` }}
                      title={`${d.date} · ${formatTHB(d.total)} · ${d.count} รายการ`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
