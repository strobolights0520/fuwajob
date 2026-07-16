import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4180);
const require = createRequire(import.meta.url);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  if (safePath === "/api/interpret" || safePath === "/api/explore" || safePath === "/api/log") {
    try {
      const handler = require(join(root, `${safePath}.js`));
      handler(req, res);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: error.message || "api_load_failed" }));
    }
    return;
  }

  const filePath = join(root, safePath === "/" ? "index.html" : safePath);

  try {
    if (!statSync(filePath).isFile()) throw new Error("not found");
    res.setHeader("Content-Type", types[extname(filePath)] || "application/octet-stream");
    createReadStream(filePath).pipe(res);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`やりたいことマッピング prototype: http://127.0.0.1:${port}`);
});
