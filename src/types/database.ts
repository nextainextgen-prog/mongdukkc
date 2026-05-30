/**
 * Supabase-aware shape for the mongdukkc schema.
 * Keep in sync with supabase/schema.sql.
 */

export type SlipKind = "success" | "duplicate" | "error";

export interface SlipRow {
  id: string;
  trans_ref: string | null;
  amount: number | null;
  currency: string | null;
  trans_date: string | null;
  sender_name: string | null;
  sender_bank: string | null;
  receiver_name: string | null;
  receiver_bank: string | null;
  status: SlipKind;
  source: "line" | "manual" | "api";
  line_user_id: string | null;
  raw_response: unknown;
  error_message: string | null;
  created_at: string;
}

export interface LineSettingsRow {
  id: string;
  channel_access_token: string | null;
  channel_secret: string | null;
  webhook_url: string | null;
  is_active: boolean;
  updated_at: string;
}

export type FlexKind = "success" | "duplicate" | "error" | "custom";

export interface FlexTemplateRow {
  id: string;
  name: string;
  kind: FlexKind;
  is_default: boolean;
  content: Record<string, unknown>;
  updated_at: string;
  created_at: string;
}

export interface AppSettingRow {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}
