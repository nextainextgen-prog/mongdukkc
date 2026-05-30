import { NextRequest, NextResponse } from "next/server";
import { verifyAndStoreSlip } from "@/lib/slips/service";
import type { ThunderVerifyInput } from "@/lib/thunder/client";

export const runtime = "nodejs";

/**
 * Verify a slip via Thunder V2 + store in Supabase.
 * Accepts JSON body { payload | base64 | url } or multipart with "file".
 */
export async function POST(req: NextRequest) {
  let input: ThunderVerifyInput;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "missing file field" },
        { status: 400 },
      );
    }
    input = { image: file, fileName: file.name };
  } else {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;
    if (body.payload) input = { payload: body.payload };
    else if (body.base64) input = { base64: body.base64 };
    else if (body.url) input = { url: body.url };
    else
      return NextResponse.json(
        { ok: false, error: "provide payload, base64, url, or multipart file" },
        { status: 400 },
      );
  }

  const result = await verifyAndStoreSlip(input, { source: "api" });

  return NextResponse.json({
    ok: result.status === "success",
    status: result.status,
    slip: result.slip,
    flatten: result.flatten,
    error: result.errorMessage,
  });
}
