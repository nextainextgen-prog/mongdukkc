"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  Star,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { applyFlexVars } from "@/lib/line/flex";

interface FlexTemplate {
  id: string;
  name: string;
  kind: "success" | "duplicate" | "error" | "custom";
  is_default: boolean;
  content: Record<string, unknown>;
  updated_at: string;
}

const KIND_LABEL: Record<FlexTemplate["kind"], string> = {
  success: "ตรวจสำเร็จ",
  duplicate: "สลิปซ้ำ",
  error: "ตรวจไม่ผ่าน",
  custom: "ทั่วไป",
};

const PREVIEW_VARS = {
  amount: "1,250.00",
  sender_name: "คุณลูกค้าน่ารัก",
  sender_bank: "SCB",
  receiver_name: "ร้านมองดึก KC",
  receiver_bank: "KBank",
  date: "28 พ.ค. 2569 14:30 น.",
  trans_ref: "20260528ABCDEF1234",
  error: "อ่านสลิปไม่ได้ ลองส่งใหม่อีกครั้งนะคะ",
};

const STARTER_TEMPLATE = {
  type: "bubble",
  size: "mega",
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      { type: "text", text: "ข้อความใหม่จากมองดึก KC", weight: "bold", size: "lg" },
      { type: "text", text: "{{amount}} บาท", color: "#8B1A23", size: "xl", weight: "bold" },
    ],
  },
};

export function FlexEditor() {
  const [templates, setTemplates] = useState<FlexTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<FlexTemplate | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );

  // Track which template id we have hydrated into the draft to avoid
  // re-syncing on every render once the user starts typing.
  const [draftSourceId, setDraftSourceId] = useState<string | null>(null);
  if (selected && selected.id !== draftSourceId) {
    setDraftSourceId(selected.id);
    setDraft({ ...selected });
    setJsonText(JSON.stringify(selected.content, null, 2));
    setJsonError(null);
  }

  useEffect(() => {
    let alive = true;
    fetch("/api/settings/flex", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const list: FlexTemplate[] = j.templates ?? [];
        setTemplates(list);
        if (list[0]) setSelectedId(list[0].id);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const j = await fetch("/api/settings/flex", { cache: "no-store" }).then((r) => r.json());
      const list: FlexTemplate[] = j.templates ?? [];
      setTemplates(list);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft) return;
    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(jsonText);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
      toast.error("JSON ไม่ถูกต้อง");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/settings/flex/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          kind: draft.kind,
          is_default: draft.is_default,
          content: parsedContent,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "save failed");
      toast.success("บันทึกเทมเพลตเรียบร้อย");
      await fetchTemplates();
    } catch (e) {
      toast.error("บันทึกไม่สำเร็จ", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function createNew() {
    const res = await fetch("/api/settings/flex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "เทมเพลตใหม่",
        kind: "custom",
        is_default: false,
        content: STARTER_TEMPLATE,
      }),
    });
    const j = await res.json();
    if (!j.ok) {
      toast.error("สร้างไม่สำเร็จ");
      return;
    }
    await fetchTemplates();
    setSelectedId(j.template.id);
    toast.success("สร้างเทมเพลตใหม่แล้ว");
  }

  async function remove(id: string) {
    if (!confirm("ลบเทมเพลตนี้?")) return;
    const res = await fetch(`/api/settings/flex/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (!j.ok) {
      toast.error("ลบไม่สำเร็จ");
      return;
    }
    toast.success("ลบแล้ว");
    setSelectedId(null);
    await fetchTemplates();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>เทมเพลต</span>
            <Button size="sm" variant="ghost" onClick={createNew} aria-label="เพิ่มเทมเพลต">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading ? (
            <ul className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="h-10 rounded-xl bg-secondary/40 animate-pulse" />
              ))}
            </ul>
          ) : (
            templates.map((t) => {
              const active = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left rounded-2xl px-3 py-2 transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{t.name}</span>
                    {t.is_default && <Star className={`h-3.5 w-3.5 ${active ? "" : "text-primary"}`} />}
                  </div>
                  <span className={`text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {KIND_LABEL[t.kind]}
                  </span>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {!draft ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            เลือกเทมเพลตทางซ้าย หรือกด + เพื่อสร้างใหม่
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดเทมเพลต</CardTitle>
              <CardDescription>
                ใช้ตัวแปร <code>{"{{amount}}"}</code>, <code>{"{{sender_name}}"}</code>,{" "}
                <code>{"{{date}}"}</code>, <code>{"{{trans_ref}}"}</code> ภายใน JSON ได้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ชื่อเทมเพลต</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ใช้กับเหตุการณ์</Label>
                  <Select
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft({ ...draft, kind: e.target.value as FlexTemplate["kind"] })
                    }
                  >
                    <option value="success">{KIND_LABEL.success}</option>
                    <option value="duplicate">{KIND_LABEL.duplicate}</option>
                    <option value="error">{KIND_LABEL.error}</option>
                    <option value="custom">{KIND_LABEL.custom}</option>
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.is_default}
                  onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
                  className="h-4 w-4 accent-[color:var(--primary)]"
                />
                <span className="text-sm">
                  ใช้เป็นค่าเริ่มต้นสำหรับ {KIND_LABEL[draft.kind]}
                </span>
                {draft.is_default && (
                  <Badge variant="default" className="ml-auto">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> ค่าเริ่มต้น
                  </Badge>
                )}
              </label>

              <div className="space-y-2">
                <Label>Flex Message JSON</Label>
                <Textarea
                  rows={16}
                  spellCheck={false}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="text-xs"
                />
                {jsonError && (
                  <p className="text-xs text-destructive">JSON error: {jsonError}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => remove(draft.id)}>
                  <Trash2 className="h-4 w-4" />
                  ลบ
                </Button>
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <FlexPreview jsonText={jsonText} />
        </div>
      )}
    </div>
  );
}

function FlexPreview({ jsonText }: { jsonText: string }) {
  let parsed: Record<string, unknown> | null = null;
  let error: string | null = null;
  try {
    const raw = JSON.parse(jsonText) as Record<string, unknown>;
    parsed = applyFlexVars(raw, PREVIEW_VARS);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent-foreground" />
          ตัวอย่างการ์ด
        </CardTitle>
        <CardDescription>
          เรนเดอร์แบบประมาณ จะไม่เหมือนใน LINE 100% แต่ใช้ตรวจสอบโครงสร้างได้
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">JSON ไม่ถูกต้อง: {error}</p>
        ) : (
          <div className="max-w-sm mx-auto">
            <RenderBubble bubble={parsed as Record<string, unknown>} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BoxLike {
  type?: string;
  layout?: string;
  contents?: BoxLike[];
  text?: string;
  color?: string;
  size?: string;
  weight?: string;
  align?: string;
  margin?: string;
  spacing?: string;
  flex?: number;
  wrap?: boolean;
  paddingAll?: string;
  styles?: { header?: { backgroundColor?: string }; body?: { backgroundColor?: string }; footer?: { backgroundColor?: string } };
  header?: BoxLike;
  body?: BoxLike;
  footer?: BoxLike;
  backgroundColor?: string;
}

function RenderBubble({ bubble }: { bubble: Record<string, unknown> }) {
  const b = bubble as BoxLike;
  if (!b) return null;
  const styles = b.styles ?? {};
  return (
    <div className="rounded-3xl overflow-hidden border border-border shadow-md">
      {b.header && (
        <div style={{ backgroundColor: styles.header?.backgroundColor ?? "#FFFFFF" }} className="p-4">
          <RenderBox node={b.header} />
        </div>
      )}
      {b.body && (
        <div style={{ backgroundColor: styles.body?.backgroundColor ?? "#FFFFFF" }} className="p-4">
          <RenderBox node={b.body} />
        </div>
      )}
      {b.footer && (
        <div style={{ backgroundColor: styles.footer?.backgroundColor ?? "#FFFFFF" }} className="p-4 border-t border-border/60">
          <RenderBox node={b.footer} />
        </div>
      )}
    </div>
  );
}

function RenderBox({ node }: { node: BoxLike }) {
  if (!node) return null;
  if (node.type === "text") {
    const sizeMap: Record<string, string> = {
      xxs: "text-[10px]", xs: "text-xs", sm: "text-sm", md: "text-base",
      lg: "text-lg", xl: "text-xl", xxl: "text-2xl", "3xl": "text-3xl",
    };
    const weightCls = node.weight === "bold" ? "font-bold" : "font-normal";
    const alignCls =
      node.align === "center" ? "text-center" : node.align === "end" ? "text-right" : "text-left";
    return (
      <p
        className={`${sizeMap[node.size ?? "md"] ?? "text-base"} ${weightCls} ${alignCls} ${
          node.wrap ? "whitespace-pre-wrap break-words" : "truncate"
        }`}
        style={{ color: node.color ?? "#2A1416" }}
      >
        {node.text ?? ""}
      </p>
    );
  }
  if (node.type === "separator") {
    return <hr style={{ borderColor: node.color ?? "#EFE0BC" }} className="my-2" />;
  }
  if (node.type === "box") {
    const layout = node.layout ?? "vertical";
    const spacingClass = spacingMap[node.spacing ?? "md"];
    if (layout === "baseline") {
      return (
        <div className={`flex items-baseline ${spacingClass}`}>
          {(node.contents ?? []).map((c, i) => (
            <div
              key={i}
              style={{ flex: c.flex ?? 1 }}
              className="min-w-0"
            >
              <RenderBox node={c} />
            </div>
          ))}
        </div>
      );
    }
    if (layout === "horizontal") {
      return (
        <div className={`flex ${spacingClass}`}>
          {(node.contents ?? []).map((c, i) => (
            <div key={i} style={{ flex: c.flex ?? 1 }} className="min-w-0">
              <RenderBox node={c} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className={`flex flex-col ${spacingClass}`}>
        {(node.contents ?? []).map((c, i) => (
          <RenderBox key={i} node={c} />
        ))}
      </div>
    );
  }
  return null;
}

const spacingMap: Record<string, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
  xl: "gap-4",
  xxl: "gap-6",
};
