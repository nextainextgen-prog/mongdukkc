# มองดึก KC — Admin Console

ระบบจัดการหลังบ้านสำหรับร้านค้าออนไลน์ มองดึก KC (เฟส 1)

> ตรวจสลิปอัตโนมัติผ่าน Thunder Solution V2 + ตอบลูกค้าใน LINE OA ด้วย Flex Message ปรับธีมได้ + Dashboard แสดงรายได้

---

## เทคโนโลยีที่ใช้

| Layer | Stack |
|-------|-------|
| Frontend / Backend | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (ธีม CI ในตัว) |
| Database | Supabase (Postgres + RLS) |
| Slip Verification | [Thunder Solution V2](https://document.thunder.in.th/th/guide/getting-started) |
| Messaging | LINE Messaging API (Flex Message) |
| Deploy | Vercel |

## ธีม CI

- Primary: `#8B1A23` (แดงเข้ม)
- Secondary: `#F5E6A8` (ครีมเหลือง)
- Accent: `#5BB8E8` (ฟ้าสดใส)
- ไอคอนทั้งหมดจาก `lucide-react` — ห้ามใช้อิโมจิ
- มาสคอตอยู่ที่ `public/mascot.svg` (placeholder ทดแทนได้ด้วยรูปจริงตอนได้รับ)

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── (admin)/                หน้า admin (sidebar layout)
│   │   ├── dashboard/          แดชบอร์ดหลัก + มาสคอต
│   │   ├── slips/              ประวัติสลิป
│   │   └── settings/
│   │       ├── line/           ตั้งค่า LINE OA
│   │       └── flex/           จัดการ Flex Templates
│   └── api/
│       ├── line/webhook/       LINE webhook handler
│       ├── slips/              CRUD + verify endpoint
│       ├── settings/line/      LINE settings
│       ├── settings/flex/      Flex templates
│       └── dashboard/summary/  สรุปยอดรายได้
├── components/
│   ├── ui/                     shadcn-style primitives (CI theme)
│   ├── layout/                 Sidebar, MobileNav
│   ├── dashboard/              MascotHero, Summary, Revenue, RecentSlips
│   └── settings/               FlexEditor + Preview
├── lib/
│   ├── thunder/client.ts       Thunder V2 client
│   ├── line/
│   │   ├── client.ts           LINE Messaging API + signature verify
│   │   ├── settings.ts         โหลด credentials จาก DB / env
│   │   ├── flex.ts             apply {{var}} substitution
│   │   └── reply-builder.ts    เลือก Flex template ตามผลตรวจ
│   ├── slips/service.ts        verify + store + duplicate detection
│   ├── supabase/               browser / server / admin clients
│   └── utils.ts                helpers
├── types/database.ts           shape ของ rows
└── ...
supabase/
├── schema.sql                  รัน 1 ครั้งใน Supabase SQL editor
└── seed_flex_templates.sql     seed Flex templates default
```

---

## ขั้นตอนติดตั้ง

### 1. ติดตั้ง dependencies

```bash
pnpm install
```

### 2. สร้างโปรเจกต์ Supabase

1. ไปที่ <https://supabase.com> สร้าง project ใหม่
2. คัดลอก `Project URL`, `anon public key`, `service_role key`
3. รัน SQL ใน Supabase SQL editor ตามลำดับ:
   - `supabase/schema.sql` — สร้างตาราง
   - `supabase/seed_flex_templates.sql` — Flex templates เริ่มต้น 3 ชุด

### 3. ตั้งค่า environment

คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่า:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

THUNDER_API_BASE_URL=https://api.thunder.in.th/v2
THUNDER_API_KEY=cacacf7a-732c-4325-8078-9fe7c15ccd14
```

> `LINE_CHANNEL_*` ใส่ผ่านหน้า `/settings/line` ในแอปได้เลย ไม่ต้องเซ็ตใน env

### 4. รัน dev server

```bash
pnpm dev
```

เปิด <http://localhost:3000> → ระบบจะ redirect ไปหน้า `/dashboard`

---

## การเชื่อมต่อ LINE OA

1. สร้าง Channel แบบ **Messaging API** ใน [LINE Developers Console](https://developers.line.biz/console/)
2. เข้าหน้า `/settings/line` ในแอป
3. คัดลอก **Webhook URL** ที่หน้าแสดง ไปวางใน LINE Console → Messaging API → Webhook URL
4. กรอก **Channel Access Token** และ **Channel Secret** แล้วกดบันทึก
5. กดเปิด `เปิดรับ Webhook`
6. ใน LINE OA Manager → ปิด `Auto-reply` เพื่อให้บอทของเราตอบเอง

ลูกค้าส่งสลิปเข้า LINE OA → ระบบตรวจ → ตอบ Flex Message อัตโนมัติ

---

## การปรับ Flex Message

- เข้าหน้า `/settings/flex`
- มีเทมเพลตเริ่มต้น 3 แบบ (สำเร็จ / ซ้ำ / ผิดพลาด)
- กด `+` เพิ่มเทมเพลตใหม่ได้ ตั้งเป็นค่าเริ่มต้นของเหตุการณ์ใดก็ได้
- ตัวแปรที่ใช้ใน JSON ได้:
  - `{{amount}}` ยอดเงิน
  - `{{sender_name}}` / `{{sender_bank}}`
  - `{{receiver_name}}` / `{{receiver_bank}}`
  - `{{date}}` วันที่/เวลาแบบไทย
  - `{{trans_ref}}` เลขอ้างอิงสลิป
  - `{{error}}` ข้อความ error (ใช้กับ template kind = error)

หน้านี้มี Preview ในตัว — เห็นการ์ดเปลี่ยนทันทีตอนแก้ JSON

---

## ทดสอบ API ด้วย cURL

ตรวจสลิปจาก QR payload (ไม่ต้องใช้ LINE):

```bash
curl -X POST http://localhost:3000/api/slips/verify \
  -H 'Content-Type: application/json' \
  -d '{"payload":"00020101021229370016A00000067701011201..."}'
```

ตรวจสลิปจากไฟล์รูป:

```bash
curl -X POST http://localhost:3000/api/slips/verify \
  -F file=@./slip.jpg
```

---

## Phase 1 — สิ่งที่ทำเสร็จแล้ว

- [x] Scaffold Next.js + Tailwind + ธีม CI
- [x] Supabase schema + seed Flex templates + reserved schemas (`money`, `stock`, `reports`)
- [x] Thunder V2 client + slip service พร้อม duplicate detection ผ่าน unique index บน `trans_ref`
- [x] LINE webhook + HMAC signature verify + image content fetch + Flex reply
- [x] Admin layout (sidebar เดสก์ท็อป / bottom nav มือถือ)
- [x] หน้า Dashboard + Mascot + การ์ดรายรับ/รายได้/ต้นทุน/กำไร + กราฟ 14 วัน + สลิปล่าสุด
- [x] หน้า Slips ประวัติ + กรองตามสถานะ
- [x] หน้า Settings/LINE ตั้งค่า Channel + Active toggle
- [x] หน้า Settings/Flex CRUD + JSON editor + Preview ในตัว

## Phase 2+ ที่วางโครงไว้แล้ว

- รายรับ / รายจ่าย (schema `money`)
- ต้นทุน / กำไร (เพิ่ม `cost` column ใน `slips`)
- สต๊อกสินค้า (schema `stock`)
- รายงาน (schema `reports`)
- Sign-in (Supabase Auth) — ตอนนี้ admin routes ยังเปิดสาธารณะ ต้องปิดด้วย firewall/auth ก่อน deploy จริง

---

## License

Private — © มองดึก KC
