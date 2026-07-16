const buckets = new Map();

function readInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientKey(req, scope) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const realIp = String(req.headers["x-real-ip"] || "").trim();
  const ip = forwarded || realIp || req.socket?.remoteAddress || "unknown";
  return `${scope}:${ip}`;
}

function checkRateLimit(req, options = {}) {
  const scope = options.scope || "default";
  const limit = readInt(options.limit, 10);
  const windowMs = readInt(options.windowMs, 10 * 60 * 1000);
  const now = Date.now();
  const key = clientKey(req, scope);
  const bucket = buckets.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(key, recent);
    return { ok: false, retryAfterSeconds, limit, windowMs };
  }

  recent.push(now);
  buckets.set(key, recent);
  cleanupBuckets(now, windowMs);
  return { ok: true, retryAfterSeconds: 0, limit, windowMs };
}

function cleanupBuckets(now, windowMs) {
  if (buckets.size < 500) return;
  for (const [key, timestamps] of buckets.entries()) {
    const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);
    if (recent.length) {
      buckets.set(key, recent);
    } else {
      buckets.delete(key);
    }
  }
}

function sendRateLimited(res, sendJson, result) {
  res.setHeader("Retry-After", String(result.retryAfterSeconds));
  return sendJson(res, 429, {
    error: "rate_limited",
    message: "アクセスが集中しています。少し時間をおいてからもう一度お試しください。",
    retry_after_seconds: result.retryAfterSeconds,
  });
}

module.exports = {
  checkRateLimit,
  readInt,
  sendRateLimited,
};
