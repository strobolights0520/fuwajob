const { readJson, sendJson } = require("./_openai");

const HEADERS = [
  "received_at",
  "event_type",
  "session_id",
  "input_text",
  "ai_summary",
  "verbs",
  "nouns",
  "values",
  "question_title",
  "question_body",
  "question_choices",
  "selected_answer",
  "result_headline",
  "near_paths",
  "wide_paths",
  "industries",
  "page_url",
  "app_version",
];

function cleanValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(" / ").slice(0, 4000);
  if (typeof value === "object") return JSON.stringify(value).slice(0, 4000);
  return String(value).slice(0, 4000);
}

function buildPayload(body) {
  const payload = {};
  for (const key of HEADERS) payload[key] = cleanValue(body[key]);
  payload.received_at = new Date().toISOString();
  if (process.env.LOG_WEBHOOK_TOKEN) payload.token = process.env.LOG_WEBHOOK_TOKEN;
  return payload;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });

  try {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return sendJson(res, 200, { ok: true, skipped: "missing_google_sheet_webhook_url" });

    const body = await readJson(req);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: JSON.stringify(buildPayload(body)),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return sendJson(res, 200, { ok: false, status: response.status });
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 200, { ok: false, error: error.message || "log_failed" });
  }
};
