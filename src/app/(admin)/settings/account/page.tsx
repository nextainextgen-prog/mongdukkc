"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Plus, Trash2, ShieldAlert, Landmark } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  label: string;
  bank: string;
  account_name: string;
  account_number?: string | null;
  is_active: boolean;
}

const BANKS = [
  "SCB", "KBANK", "BAY", "BBL", "KTB", "TTB", "GSB", "BAAC",
  "CIMB", "LH BANK", "TMB", "TISCO", "UOB", "PromptPay", "TrueMoney Wallet",
];

function emptyAccount(): Account {
  return {
    id: crypto.randomUUID(),
    label: "บัญชีหลัก",
    bank: "SCB",
    account_name: "",
    account_number: "",
    is_active: true,
  };
}

export default function AccountSettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [enforce, setEnforce] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/settings/accounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const s = j.settings ?? { accounts: [], enforce: false };
        setAccounts(s.accounts ?? []);
        setEnforce(Boolean(s.enforce));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function update(id: string, patch: Partial<Account>) {
    setAccounts((cur) => cur.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function add() {
    setAccounts((cur) => [...cur, emptyAccount()]);
  }

  function remove(id: string) {
    setAccounts((cur) => cur.filter((a) => a.id !== id));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts, enforce }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "save failed");
      toast.success("บันทึกบัญชีร้านสำเร็จ");
    } catch (e) {
      toast.error("บันทึกไม่สำเร็จ", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          บัญชีรับเงินของร้าน
        </h1>
        <p className="text-sm text-muted-foreground">
          ใส่ชื่อบัญชีของร้านที่ใช้รับโอน ระบบจะเทียบ &ldquo;ผู้รับ&rdquo; ในสลิปกับบัญชีที่นี่
          เพื่อป้องกันการปลอมสลิปโอนเข้าบัญชีคนอื่น
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            โหมดบังคับตรวจ
          </CardTitle>
          <CardDescription>
            ถ้าเปิดสวิตช์: สลิปที่ &ldquo;ผู้รับ&rdquo; ไม่ตรงกับบัญชีใด ๆ ของร้าน → ตอบ Flex ผิดพลาด
            ไม่นับเป็นรายได้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4 cursor-pointer">
            <div>
              <p className="font-medium text-sm">บังคับตรวจบัญชีผู้รับ</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enforce
                  ? "เปิด · สลิปต้องโอนเข้าบัญชีของร้านเท่านั้น"
                  : "ปิด · ระบบรับทุกสลิปที่ Thunder ยืนยันว่าเป็นสลิปจริง (ไม่ดูบัญชีรับ)"}
              </p>
            </div>
            <Switch checked={enforce} onCheckedChange={setEnforce} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              บัญชีของร้าน ({accounts.length})
            </span>
            <Button size="sm" variant="outline" onClick={add}>
              <Plus className="h-4 w-4" />
              เพิ่มบัญชี
            </Button>
          </CardTitle>
          <CardDescription>
            ใส่ <strong>ชื่อบัญชี</strong> ให้ตรงกับที่ขึ้นในแอปธนาคารเลย (เช่น &ldquo;นางสาว มองดึก ช้อป&rdquo;)
            ระบบจะ match แบบ ignore เคส/ช่องว่าง/คำนำหน้า
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              ยังไม่มีบัญชี กดปุ่ม &ldquo;เพิ่มบัญชี&rdquo; ด้านบนเพื่อเริ่ม
            </div>
          ) : (
            accounts.map((acc, idx) => (
              <div
                key={acc.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={acc.is_active ? "success" : "secondary"}>
                    {acc.is_active ? "ใช้งาน" : "ปิดอยู่"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={acc.is_active}
                      onCheckedChange={(v) => update(acc.id, { is_active: v })}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(acc.id)}
                      aria-label="ลบบัญชี"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`label-${idx}`}>ชื่อเรียก</Label>
                    <Input
                      id={`label-${idx}`}
                      value={acc.label}
                      onChange={(e) => update(acc.id, { label: e.target.value })}
                      placeholder="บัญชีหลัก"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`bank-${idx}`}>ธนาคาร</Label>
                    <Select
                      id={`bank-${idx}`}
                      value={acc.bank}
                      onChange={(e) => update(acc.id, { bank: e.target.value })}
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`name-${idx}`}>
                      ชื่อบัญชี (ตามที่ขึ้นในสลิป) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`name-${idx}`}
                      value={acc.account_name}
                      onChange={(e) => update(acc.id, { account_name: e.target.value })}
                      placeholder="เช่น นางสาว มองดึก ช้อป"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`num-${idx}`}>
                      เลขบัญชี (ไม่บังคับ — เก็บไว้ดูเอง)
                    </Label>
                    <Input
                      id={`num-${idx}`}
                      value={acc.account_number ?? ""}
                      onChange={(e) => update(acc.id, { account_number: e.target.value })}
                      placeholder="123-4-56789-0"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving || loading}>
              <Save className="h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>วิธีหาชื่อบัญชีที่ถูกต้อง</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90 space-y-2">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>เปิดแอปธนาคาร → เลือกบัญชี → ดูชื่อบัญชี</li>
            <li>หรือ เปิดสลิปที่เคยมีคนโอนมาจริง → ดูช่อง &ldquo;ผู้รับ&rdquo;</li>
            <li>คัดลอกชื่อมาวางที่ช่อง &ldquo;ชื่อบัญชี&rdquo; เลย ระบบจะ normalize ช่องว่าง/เคสให้</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            ตัวอย่างที่ตรงกัน: &ldquo;นางสาว มองดึก ช้อป&rdquo; ↔ &ldquo;นางสาว มองดึก  ช้อป&rdquo; ↔ &ldquo;มองดึก ช้อป&rdquo;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
