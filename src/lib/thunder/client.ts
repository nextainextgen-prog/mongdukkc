/**
 * Thunder Solution V2 slip verification client.
 * Docs: https://document.thunder.in.th/th/guide/getting-started
 */

const BASE_URL =
  process.env.THUNDER_API_BASE_URL?.replace(/\/$/, "") ??
  "https://api.thunder.in.th/v2";

export interface ThunderSlipParty {
  bank: { id?: string; name?: string; short?: string };
  account: { name?: { th?: string; en?: string }; value?: string };
}

export interface ThunderVerifySuccess {
  success: true;
  data: {
    rawSlip?: {
      transRef?: string;
      date?: string;
      countryCode?: string;
      amount?: { amount?: number; local?: { currency?: string } };
      sender?: ThunderSlipParty;
      receiver?: ThunderSlipParty;
    };
    isDuplicate?: boolean;
    [k: string]: unknown;
  };
  message?: string;
}

export interface ThunderVerifyError {
  success: false;
  error: { code: string; message: string };
}

export type ThunderVerifyResponse = ThunderVerifySuccess | ThunderVerifyError;

export type ThunderVerifyInput =
  | { payload: string }
  | { base64: string }
  | { url: string }
  | { image: Blob; fileName?: string };

function getApiKey(): string {
  const key = process.env.THUNDER_API_KEY;
  if (!key) throw new Error("THUNDER_API_KEY is not configured");
  return key;
}

export async function verifyBankSlip(
  input: ThunderVerifyInput,
): Promise<ThunderVerifyResponse> {
  const url = `${BASE_URL}/verify/bank`;
  const apiKey = getApiKey();

  let body: BodyInit;
  const headers: HeadersInit = { Authorization: `Bearer ${apiKey}` };

  if ("image" in input) {
    const form = new FormData();
    // Thunder V2 expects field name "image" (multipart/form-data).
    form.append("image", input.image, input.fileName ?? "slip.jpg");
    form.append("checkDuplicate", "true");
    body = form;
    // FormData sets its own Content-Type with boundary.
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ ...input, checkDuplicate: true });
  }

  const res = await fetch(url, { method: "POST", headers, body });
  let json: ThunderVerifyResponse;
  try {
    json = (await res.json()) as ThunderVerifyResponse;
  } catch {
    return {
      success: false,
      error: {
        code: `HTTP_${res.status}`,
        message: `Thunder API returned non-JSON (status ${res.status})`,
      },
    };
  }

  // Defensive normalization: ensure `success` boolean exists.
  if (typeof json.success !== "boolean") {
    return {
      success: false,
      error: {
        code: "MALFORMED_RESPONSE",
        message: "Thunder API response missing 'success' field",
      },
    };
  }
  return json;
}

export function flattenThunderSlip(res: ThunderVerifySuccess) {
  const slip = res.data?.rawSlip ?? {};
  return {
    trans_ref: slip.transRef ?? null,
    amount: slip.amount?.amount ?? null,
    currency: slip.amount?.local?.currency ?? "THB",
    trans_date: slip.date ?? null,
    sender_name:
      slip.sender?.account?.name?.th ??
      slip.sender?.account?.name?.en ??
      null,
    sender_bank: slip.sender?.bank?.name ?? slip.sender?.bank?.short ?? null,
    receiver_name:
      slip.receiver?.account?.name?.th ??
      slip.receiver?.account?.name?.en ??
      null,
    receiver_bank:
      slip.receiver?.bank?.name ?? slip.receiver?.bank?.short ?? null,
  };
}
