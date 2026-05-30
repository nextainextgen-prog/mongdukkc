import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEY = "merchant_accounts";

export interface MerchantAccount {
  id: string;
  label: string;          // ชื่อให้คนเรียก เช่น "บัญชีหลัก"
  bank: string;           // ธนาคาร เช่น "SCB", "KBANK"
  account_name: string;   // ชื่อบัญชีตรงกับที่ขึ้นในสลิป
  account_number?: string | null; // เลขบัญชี (เก็บไว้แสดงในแอดมิน ไม่ใช่สำหรับ match)
  is_active: boolean;
}

export interface MerchantAccountsSetting {
  accounts: MerchantAccount[];
  enforce: boolean;       // ถ้า true จะ reject สลิปที่ผู้รับไม่ตรง
}

const DEFAULT: MerchantAccountsSetting = { accounts: [], enforce: false };

export async function getMerchantAccountsSetting(): Promise<MerchantAccountsSetting> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (!data?.value) return DEFAULT;
  const value = data.value as MerchantAccountsSetting;
  return {
    accounts: Array.isArray(value.accounts) ? value.accounts : [],
    enforce: Boolean(value.enforce),
  };
}

export async function saveMerchantAccountsSetting(s: MerchantAccountsSetting) {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("app_settings")
    .select("id")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (existing) {
    const { data, error } = await supabase
      .from("app_settings")
      .update({ value: s })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("app_settings")
    .insert({ key: SETTINGS_KEY, value: s })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Lenient text-match helper:
 * lowercases, strips spaces, punctuation, common prefixes like "นาย/นาง/นางสาว/MR/MRS"
 */
export function normalizeName(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/นาย|นาง|นางสาว|น\.ส\.|ดร\.|mr\.?|mrs\.?|ms\.?|miss/gi, "")
    .replace(/[\s\-._*()\[\]]/g, "")
    .trim();
}

export function normalizeBank(s: string | null | undefined): string {
  if (!s) return "";
  return s.toLowerCase().replace(/[\s\-._]/g, "").trim();
}

/**
 * Returns the matching account, or null if no active accounts match.
 * If no accounts configured, returns "skip" so the slip is accepted as before.
 */
export function findMatchingAccount(
  receiverName: string | null,
  receiverBank: string | null,
  accounts: MerchantAccount[],
): MerchantAccount | null | "skip" {
  const active = accounts.filter((a) => a.is_active);
  if (active.length === 0) return "skip";

  const rn = normalizeName(receiverName);
  const rb = normalizeBank(receiverBank);

  for (const acc of active) {
    const accName = normalizeName(acc.account_name);
    const accBank = normalizeBank(acc.bank);
    if (!accName) continue;

    const nameMatch = rn.includes(accName) || accName.includes(rn);
    const bankMatch = !acc.bank || !rb || rb.includes(accBank) || accBank.includes(rb);

    if (nameMatch && bankMatch) return acc;
  }
  return null;
}
