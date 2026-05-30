import { FlexEditor } from "@/components/settings/flex-editor";

export const dynamic = "force-dynamic";

export default function SettingsFlexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          จัดการ Flex Message Templates
        </h1>
        <p className="text-sm text-muted-foreground">
          แก้ไขรูปแบบการ์ดข้อความที่บอทใช้ตอบลูกค้าใน LINE OA
          เพิ่มเทมเพลตได้หลายแบบ และเลือกค่าเริ่มต้นต่อเหตุการณ์
        </p>
      </div>
      <FlexEditor />
    </div>
  );
}
