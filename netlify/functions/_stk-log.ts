import { createClient } from "@supabase/supabase-js";

type LogRow = {
  kind: "request" | "callback";
  checkout_request_id?: string;
  phone?: string;
  amount_kes?: number | null;
  result_code?: string;
  result_desc?: string;
  request?: unknown;
  response?: unknown;
};

/** Best-effort write to public.kcb_stk_log; never throws. */
export async function logStk(row: LogRow) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await sb.from("kcb_stk_log").insert({
      kind: row.kind,
      checkout_request_id: row.checkout_request_id || "",
      phone: row.phone || "",
      amount_kes: row.amount_kes ?? null,
      result_code: row.result_code || "",
      result_desc: row.result_desc || "",
      request: row.request ?? null,
      response: row.response ?? null,
    });
    if (error) console.warn("[stk-log]", error.message);
  } catch (err) {
    console.warn("[stk-log]", err);
  }
}
