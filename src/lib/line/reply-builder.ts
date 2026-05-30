import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyFlexVars, buildFlexMessage } from "@/lib/line/flex";
import { formatTHB, formatThaiDate } from "@/lib/utils";
import type { FlexKind } from "@/types/database";
import type { VerifySlipResult } from "@/lib/slips/service";

/**
 * Derive a public base URL we can use to host images inside Flex Message JSON.
 * LINE requires HTTPS and won't accept localhost. Resolution order:
 *   1. webhook_url in DB (always HTTPS for LINE, never localhost)
 *   2. NEXT_PUBLIC_APP_URL env (only if HTTPS + not localhost)
 *   3. empty (caller should fall back to text reply)
 */
function isUsableBase(s: string | undefined | null): boolean {
  if (!s) return false;
  if (!/^https:\/\//i.test(s)) return false;
  if (/localhost|127\.0\.0\.1|10\.\d|192\.168\./i.test(s)) return false;
  return true;
}

async function resolveImageBase(supabase: ReturnType<typeof createSupabaseAdminClient>): Promise<string> {
  const { data } = await supabase
    .from("line_settings")
    .select("webhook_url")
    .limit(1)
    .maybeSingle();
  const webhook = data?.webhook_url as string | undefined;
  if (webhook) {
    try {
      const u = new URL(webhook);
      const origin = `${u.protocol}//${u.host}`;
      if (isUsableBase(origin)) return origin;
    } catch {
      // fallthrough
    }
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (isUsableBase(fromEnv)) return fromEnv!.replace(/\/$/, "");
  return "";
}

const ALT_TEXT: Record<FlexKind, string> = {
  success: "ตรวจสลิปสำเร็จ",
  duplicate: "สลิปนี้ถูกใช้แล้ว",
  error: "ตรวจสลิปไม่สำเร็จ",
  custom: "ข้อความจากร้านมองดึก KC",
};

export async function buildReplyForSlipResult(result: VerifySlipResult) {
  const kind: FlexKind =
    result.status === "success"
      ? "success"
      : result.status === "duplicate"
        ? "duplicate"
        : "error";

  const supabase = createSupabaseAdminClient();
  const { data: template } = await supabase
    .from("flex_templates")
    .select("*")
    .eq("kind", kind)
    .eq("is_default", true)
    .maybeSingle();

  // Fall back to a plain text message if no template was seeded.
  if (!template) {
    const text =
      kind === "success"
        ? `ขอบคุณค่ะ ตรวจสลิปสำเร็จ ยอด ${formatTHB(result.flatten?.amount ?? 0)}`
        : kind === "duplicate"
          ? "ขออภัยค่ะ สลิปนี้เคยถูกใช้แล้ว"
          : `ไม่สามารถตรวจสลิปได้: ${result.errorMessage ?? ""}`;
    return [{ type: "text", text }];
  }

  const image_base = await resolveImageBase(supabase);
  const vars = buildVars(result, image_base);
  const filled = applyFlexVars(template.content as Record<string, unknown>, vars);
  return [buildFlexMessage(ALT_TEXT[kind], filled)];
}

function buildVars(result: VerifySlipResult, imageBase: string): Record<string, string> {
  const f = result.flatten;
  return {
    amount: f?.amount != null ? formatTHB(f.amount).replace("฿", "").trim() : "-",
    sender_name: f?.sender_name ?? "-",
    sender_bank: f?.sender_bank ?? "-",
    receiver_name: f?.receiver_name ?? "-",
    receiver_bank: f?.receiver_bank ?? "-",
    date: f?.trans_date ? formatThaiDate(f.trans_date) : "-",
    trans_ref: f?.trans_ref ?? "-",
    error: result.errorMessage ?? "",
    image_base: imageBase,
  };
}
