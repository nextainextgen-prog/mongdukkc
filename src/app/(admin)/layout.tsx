import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar, MobileBottomNav } from "@/components/layout/mobile-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-dotted">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
