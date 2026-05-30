"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, MessageCircleHeart, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/slips", label: "สลิป", icon: Receipt },
  { href: "/settings/line", label: "LINE", icon: MessageCircleHeart },
  { href: "/settings/flex", label: "Flex", icon: Palette },
];

export function MobileTopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
      <Image src="/mascot.png" alt="" width={36} height={36} className="object-contain" />
      <p className="font-display text-base font-bold text-primary">มองดึก KC</p>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur grid grid-cols-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
