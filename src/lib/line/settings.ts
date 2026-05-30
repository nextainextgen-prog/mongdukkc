import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface LineCredentials {
  channelAccessToken: string;
  channelSecret: string;
  isActive: boolean;
}

/**
 * In-memory cache of LINE credentials. On Vercel Fluid Compute the same
 * function instance can handle many requests, so this dramatically reduces
 * average webhook latency (skip Supabase round-trip on hot path).
 * TTL is short so admin edits propagate within ~30 s.
 */
const TTL_MS = 30_000;
let _cache: { creds: LineCredentials; expires: number } | null = null;

export function invalidateLineCredentialsCache() {
  _cache = null;
}

export async function getLineCredentials(): Promise<LineCredentials | null> {
  const now = Date.now();
  if (_cache && now < _cache.expires) return _cache.creds;

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

  const creds: LineCredentials = {
    channelAccessToken,
    channelSecret,
    isActive: data?.is_active ?? true,
  };
  _cache = { creds, expires: now + TTL_MS };
  return creds;
}
