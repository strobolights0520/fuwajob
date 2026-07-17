const { sendJson } = require("./_openai");
const { checkRateLimit, readInt, sendRateLimited } = require("./_rate-limit");

function cleanInput(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 36);
}

function isDisplayableInput(value) {
  const text = cleanInput(value);
  if (text.length < 2) return false;
  if (/https?:\/\//i.test(text)) return false;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return false;
  if (/\d{2,4}[-\s]?\d{2,4}[-\s]?\d{3,4}/.test(text)) return false;
  return true;
}

function normalizeItems(items) {
  const seen = new Set();
  const normalized = [];

  for (const item of Array.isArray(items) ? items : []) {
    const input = cleanInput(typeof item === "string" ? item : item?.input_text);
    if (!isDisplayableInput(input) || seen.has(input)) continue;
    seen.add(input);
    normalized.push(input);
    if (normalized.length >= 10) break;
  }

  return normalized;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
  const debug = new URL(req.url, "https://fuwajob.local").searchParams.get("debug") === "1";

  const rateLimit = checkRateLimit(req, {
    scope: "recent-inputs",
    limit: readInt(process.env.RECENT_INPUTS_RATE_LIMIT, 60),
    windowMs: readInt(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
  });
  if (!rateLimit.ok) return sendRateLimited(res, sendJson, rateLimit);

  try {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return sendJson(res, 200, debug ? { items: [], debug: "missing_google_sheet_webhook_url" } : { items: [] });

    const url = new URL(webhookUrl);
    url.searchParams.set("mode", "recent_inputs");
    url.searchParams.set("limit", "10");
    if (debug) url.searchParams.set("debug", "1");
    if (process.env.LOG_WEBHOOK_TOKEN) url.searchParams.set("token", process.env.LOG_WEBHOOK_TOKEN);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const response = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      return sendJson(
        res,
        200,
        debug
          ? {
              items: [],
              debug: "google_sheet_webhook_error",
              status: response.status,
              upstream_error: data?.error || "unknown",
            }
          : { items: [] }
      );
    }

    const items = normalizeItems(data.items);
    sendJson(
      res,
      200,
      debug
        ? {
            items,
            debug: "ok",
            upstream_count: Array.isArray(data.items) ? data.items.length : 0,
            upstream_debug: data.debug || null,
          }
        : { items }
    );
  } catch (error) {
    sendJson(res, 200, debug ? { items: [], debug: "recent_inputs_failed", error: error.message || "unknown" } : { items: [] });
  }
};
