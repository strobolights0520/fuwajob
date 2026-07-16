const OPENAI_URL = "https://api.openai.com/v1/responses";

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64_000) {
        reject(new Error("request_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const message = response.output?.find((item) => item.type === "message");
  const textPart = message?.content?.find((part) => part.type === "output_text");
  return textPart?.text || "";
}

async function callOpenAIJson({ schemaName, schema, instructions, input, maxOutputTokens = 2200 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error("missing_openai_api_key");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input,
      max_output_tokens: maxOutputTokens,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(raw.error?.message || `openai_error_${response.status}`);
    error.statusCode = response.status;
    error.details = raw.error;
    throw error;
  }

  const outputText = extractOutputText(raw);
  if (!outputText) {
    const error = new Error("empty_openai_response");
    error.statusCode = 502;
    throw error;
  }

  try {
    return JSON.parse(outputText);
  } catch {
    const error = new Error("invalid_openai_json");
    error.statusCode = 502;
    error.rawText = outputText;
    throw error;
  }
}

module.exports = {
  callOpenAIJson,
  readJson,
  sendJson,
};
