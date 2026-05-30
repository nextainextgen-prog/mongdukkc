import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface LineCredentials {
  channelAccessToken: string;
  channelSecret: string;
  isActive: boolean;
}

/**
 * Load LINE credentials, preferring the DB-managed row so the merchant can
 * rotate them via the admin UI. Falls back to env so dev still works.
 */
export async function getLineCredentials(): Promise<LineCredentials | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("line_settings")
    .select("channel_access_token,channel_secret,is_active")
    .limit(1)
    .maybeSingle();

  const channelAccessToken =
    data?.channel_access_token || process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const channelSecret =
    data?.channel_secret || process.env.LINE_CHANNEL_SECRET || "";

  if (!channelAccessToken || !channelSecret) return null;

  return {
    channelAccessToken,
    channelSecret,
    isActive: data?.is_active ?? true,
  };
}
