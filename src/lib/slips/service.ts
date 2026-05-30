import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  verifyBankSlip,
  flattenThunderSlip,
  type ThunderVerifyInput,
  type ThunderVerifyResponse,
} from "@/lib/thunder/client";
import {
  getMerchantAccountsSetting,
  findMatchingAccount,
} from "@/lib/accounts/service";
import type { SlipKind, SlipRow } from "@/types/database";

export interface VerifySlipResult {
  status: SlipKind;                     // success | duplicate | error
  slip: SlipRow | null;
  flatten: ReturnType<typeof flattenThunderSlip> | null;
  thunder: ThunderVerifyResponse;
  errorMessage?: string;
}

export interface VerifySlipOptions {
  source?: "line" | "manual" | "api";
  lineUserId?: string | null;
}

/**
 * Run the slip through Thunder V2, store the result in Supabase, and report
 * success / duplicate / error. Duplicate detection relies on the unique index
 * on `slips.trans_ref`.
 */
export async function verifyAndStoreSlip(
  input: ThunderVerifyInput,
  options: VerifySlipOptions = {},
): Promise<VerifySlipResult> {
  const supabase = createSupabaseAdminClient();
  const source = options.source ?? "api";
  const lineUserId = options.lineUserId ?? null;

  const thunder = await verifyBankSlip(input);

  if (!thunder.success) {
    const errorMessage = thunder.error?.message ?? "Unknown Thunder error";
    const { data, error: dbErr } = await supabase
      .from("slips")
      .insert({
        status: "error",
        source,
        line_user_id: lineUserId,
        raw_response: thunder,
        error_message: errorMessage,
      })
      .select()
      .single();

    return {
      status: "error",
      slip: dbErr ? null : (data as SlipRow),
      flatten: null,
      thunder,
      errorMessage,
    };
  }

  const flat = flattenThunderSlip(thunder);

  // Thunder also flags duplicates from its side (checkDuplicate=true). Honor it.
  if (thunder.data?.isDuplicate === true) {
    const { data: dup } = await supabase
      .from("slips")
      .insert({
        ...flat,
        status: "duplicate",
        source,
        line_user_id: lineUserId,
        raw_response: thunder,
        error_message: "Thunder flagged duplicate",
        trans_ref: null,
      })
      .select()
      .single();
    return {
      status: "duplicate",
      slip: dup as SlipRow | null,
      flatten: flat,
      thunder,
      errorMessage: "สลิปนี้ถูกใช้ไปแล้ว",
    };
  }

  // Receiver-account check: only when enforce=true and at least one active account.
  const accountSettings = await getMerchantAccountsSetting();
  if (accountSettings.enforce) {
    const match = findMatchingAccount(
      flat.receiver_name,
      flat.receiver_bank,
      accountSettings.accounts,
    );
    if (match === null) {
      const reason = `ผู้รับในสลิป (${flat.receiver_name ?? "-"} / ${flat.receiver_bank ?? "-"}) ไม่ตรงกับบัญชีของร้าน`;
      const { data: errRow } = await supabase
        .from("slips")
        .insert({
          ...flat,
          status: "error",
          source,
          line_user_id: lineUserId,
          raw_response: thunder,
          error_message: reason,
          trans_ref: null,
        })
        .select()
        .single();
      return {
        status: "error",
        slip: errRow as SlipRow | null,
        flatten: flat,
        thunder,
        errorMessage: reason,
      };
    }
  }

  // Insert; rely on the unique index on trans_ref to detect duplicates.
  const { data: inserted, error: insertErr } = await supabase
    .from("slips")
    .insert({
      ...flat,
      status: "success",
      source,
      line_user_id: lineUserId,
      raw_response: thunder,
    })
    .select()
    .single();

  if (!insertErr && inserted) {
    return {
      status: "success",
      slip: inserted as SlipRow,
      flatten: flat,
      thunder,
    };
  }

  // 23505 = unique_violation -> duplicate slip.
  const isUniqueViolation =
    (insertErr as { code?: string } | null)?.code === "23505";

  if (isUniqueViolation) {
    // Still log this duplicate attempt so the merchant can audit.
    const { data: dup } = await supabase
      .from("slips")
      .insert({
        ...flat,
        status: "duplicate",
        source,
        line_user_id: lineUserId,
        raw_response: thunder,
        error_message: "slip already used",
        // Set trans_ref to null so the unique index doesn't reject the audit log too.
        trans_ref: null,
      })
      .select()
      .single();

    return {
      status: "duplicate",
      slip: dup as SlipRow | null,
      flatten: flat,
      thunder,
      errorMessage: "สลิปนี้ถูกใช้ไปแล้ว",
    };
  }

  // Any other DB error -> mark as error.
  return {
    status: "error",
    slip: null,
    flatten: flat,
    thunder,
    errorMessage: insertErr?.message ?? "Database error",
  };
}
