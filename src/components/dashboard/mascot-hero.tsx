"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MascotHero({ shopName }: { shopName: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-[#5A1015] text-primary-foreground p-6 sm:p-8 shadow-lg shadow-primary/20">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -right-4 -bottom-12 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            สวัสดีค่ะคุณเจ้าของร้าน
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold leading-tight">
            ยินดีต้อนรับสู่ระบบจัดการ
            <br />
            <span className="text-secondary">{shopName}</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-primary-foreground/85 max-w-md">
            ระบบจะตรวจสลิปและตอบลูกค้าใน LINE OA ให้อัตโนมัติ ดูยอดรายได้รวมแบบเรียลไทม์ได้เลย
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/settings/line">
              <Button variant="secondary" size="lg">
                <MessageCircleHeart className="h-4 w-4" />
                ตั้งค่า LINE OA
              </Button>
            </Link>
            <Link href="/settings/flex">
              <Button variant="accent" size="lg">
                จัดการ Flex Templates
              </Button>
            </Link>
          </div>
        </div>
        <div className="hidden sm:block relative w-44 h-44 lg:w-56 lg:h-56 shrink-0 animate-float">
          <Image
            src="/mascot.png"
            alt="มาสคอตมองดึก KC"
            fill
            priority
            sizes="(min-width: 1024px) 224px, 176px"
            className="drop-shadow-xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}
