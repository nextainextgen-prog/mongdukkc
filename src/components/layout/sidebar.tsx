"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  MessageCircleHeart,
  Palette,
  Wallet,
  Boxes,
  BarChart3,
  Settings as SettingsIcon,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
  badge?: string;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "ภาพรวม",
    items: [
      { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
      { href: "/slips", label: "ประวัติสลิป", icon: Receipt },
    ],
  },
  {
    section: "ตั้งค่า",
    items: [
      { href: "/settings/account", label: "บัญชีรับเงิน", icon: Landmark },
      { href: "/settings/line", label: "LINE OA", icon: MessageCircleHeart },
      { href: "/settings/flex", label: "Flex Templates", icon: Palette },
    ],
  },
  {
    section: "เร็ว ๆ นี้",
    items: [
      { href: "#", label: "รายรับ-รายจ่าย", icon: Wallet, disabled: true, badge: "Soon" },
      { href: "#", label: "สต๊อกสินค้า", icon: Boxes, disabled: true, badge: "Soon" },
      { href: "#", label: "รายงาน", icon: BarChart3, disabled: true, badge: "Soon" },
      { href: "#", label: "ทั่วไป", icon: SettingsIcon, disabled: true, badge: "Soon" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="rounded-2xl bg-primary/10 p-1.5 flex items-center justify-center w-12 h-12">
          <Image
            src="/mascot.png"
            alt="มองดึก KC"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-tight text-primary">
            มองดึก KC
          </p>
          <p className="text-xs text-muted-foreground">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.section}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.disabled ? "#" : item.href}
                      aria-disabled={item.disabled}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all",
                        item.disabled && "opacity-50 cursor-not-allowed",
                        !item.disabled && active && "bg-primary text-primary-foreground shadow-md shadow-primary/20",
                        !item.disabled && !active && "hover:bg-secondary/50 text-foreground",
                      )}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault();
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        v0.1 · เฟส 1 · Thunder V2
      </div>
    </aside>
  );
}
