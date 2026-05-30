import { MascotHero } from "@/components/dashboard/mascot-hero";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSlips } from "@/components/dashboard/recent-slips";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const shopName = process.env.NEXT_PUBLIC_APP_NAME ?? "มองดึก KC";
  return (
    <div className="space-y-6">
      <MascotHero shopName={shopName} />
      <SummaryCards />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <RecentSlips />
        </div>
      </div>
    </div>
  );
}
