"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Copy, Power, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface LineSettings {
  id: string;
  channel_access_token: string | null;
  channel_secret: string | null;
  webhook_url: string | null;
  is_active: boolean;
  updated_at: string;
}

export default function SettingsLinePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [active, setActive] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const localFallback = typeof window === "undefined"
    ? ""
    : `${window.location.origin}/api/line/webhook`;
  const displayWebhookUrl = webhookUrl || localFallback;

  useEffect(() => {
    fetch("/api/settings/line", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const s: LineSettings | null = j.settings;
        if (s) {
          setToken(s.channel_access_token ?? "");
          setSecret(s.channel_secret ?? "");
          setActive(s.is_active);
          setWebhookUrl(s.webhook_url ?? "");
          setUpdatedAt(s.updated_at);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/line", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_access_token: token,
          channel_secret: secret,
          // Send webhook_url ONLY if user explicitly entered one; never overwrite
          // with the local origin since LINE can't reach localhost.
          ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
          is_active: active,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "save failed");
      setUpdatedAt(j.settings.updated_at);
      toast.success("บันทึกการตั้งค่า LINE OA สำเร็จ");
    } catch (e) {
      toast.error("บันทึกไม่สำเร็จ", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText(displayWebhookUrl);
    toast.success("คัดลอก URL แล้ว วางในช่อง Webhook URL ของ LINE Console ได้เลย");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">ตั้งค่า LINE OA</h1>
          <p className="text-sm text-muted-foreground">
            เชื่อมต่อ Channel Access Token และ Channel Secret ของ LINE Official Account
          </p>
        </div>
        <Badge variant={active ? "success" : "secondary"}>
          {active ? "เปิดใช้งาน" : "ปิดอยู่"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Channel Credentials
          </CardTitle>
          <CardDescription>
            ดูจาก{" "}
            <a
              href="https://developers.line.biz/console/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            >
              LINE Developers Console
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            ในเมนู Messaging API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL (สาธารณะ — LINE ใช้เรียกเข้ามา)</Label>
            <div className="flex gap-2">
              <Input
                id="webhook"
                value={displayWebhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://xxx.ngrok-free.dev/api/line/webhook"
                className="font-mono text-xs"
              />
              <Button type="button" variant="outline" onClick={copyWebhook}>
                <Copy className="h-4 w-4" />
                คัดลอก
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ ต้องเป็น HTTPS public URL (ngrok หรือ Vercel) ไม่ใช่ localhost
              ระบบจะไม่ทับค่าเดิมถ้าช่องนี้ว่าง
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Channel Access Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Long-lived access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Channel Secret</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Channel secret (32 hex)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4">
            <div>
              <p className="font-medium text-sm flex items-center gap-2">
                <Power className="h-4 w-4 text-primary" />
                เปิดรับ Webhook
              </p>
              <p className="text-xs text-muted-foreground">
                ปิดไว้ถ้ายังไม่อยากให้บอทตอบลูกค้า
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {updatedAt ? `อัปเดตล่าสุด: ${new Date(updatedAt).toLocaleString("th-TH")}` : ""}
            </p>
            <Button onClick={save} disabled={saving || loading}>
              <Save className="h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>วิธีเชื่อมต่อ LINE OA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/90">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>เข้าสู่ LINE Developers Console และเลือก Provider ของร้าน</li>
            <li>เปิด Channel แบบ Messaging API (ถ้ายังไม่มี ให้สร้างใหม่)</li>
            <li>คัดลอก Channel Secret และ Channel Access Token มาใส่ในหน้านี้</li>
            <li>วาง Webhook URL ด้านบนใน LINE Console และเปิด Use Webhook</li>
            <li>ใน LINE OA Manager ปิด Auto-reply เพื่อให้บอทเราตอบเอง</li>
            <li>กด &ldquo;Verify&rdquo; ใน LINE Console เพื่อยืนยันว่า webhook ตอบ 200</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
