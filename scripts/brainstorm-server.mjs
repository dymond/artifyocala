import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usageAndExit() {
  // Keep stdout clean: start-server.sh depends on JSON output.
  process.stderr.write(
    [
      "Usage:",
      "  node scripts/brainstorm-server.mjs --project-dir <path> [--host 127.0.0.1] [--port 0] [--url-host localhost] [--idle-ms 1800000]",
      "",
    ].join("\n"),
  );
  process.exit(2);
}

function parseArgs(argv) {
  const args = {
    projectDir: "",
    host: "127.0.0.1",
    port: 0,
    urlHost: "localhost",
    idleMs: 30 * 60 * 1000,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project-dir") args.projectDir = argv[++i] ?? "";
    else if (a === "--host") args.host = argv[++i] ?? args.host;
    else if (a === "--port") args.port = Number.parseInt(argv[++i] ?? "0", 10);
    else if (a === "--url-host") args.urlHost = argv[++i] ?? args.urlHost;
    else if (a === "--idle-ms")
      args.idleMs = Number.parseInt(argv[++i] ?? "", 10);
    else if (a === "--help" || a === "-h") usageAndExit();
    else usageAndExit();
  }
  if (!args.projectDir) usageAndExit();
  return args;
}

function safeJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readFileMaybe(p) {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

function newestHtmlFile(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const html = entries
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => e.name)
    .map((name) => {
      const fp = path.join(dir, name);
      const st = fs.statSync(fp);
      return { name, fp, mtimeMs: st.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return html[0]?.fp ?? null;
}

function wrapFragment(fragmentHtml, helperJs) {
  const frag = fragmentHtml.trimStart();
  if (frag.startsWith("<!DOCTYPE") || frag.startsWith("<html")) {
    // Full document; inject helper script at end of body if possible.
    if (frag.includes("</body>")) {
      return frag.replace(
        "</body>",
        `<script>${helperJs}</script></body>`,
      );
    }
    return frag + `\n<script>${helperJs}</script>\n`;
  }

  const css = `
    :root { color-scheme: dark; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: #0b0b14; color: #f4f5fc; }
    .frame { max-width: 1100px; margin: 0 auto; padding: 28px 18px 44px; }
    h2 { font-size: 1.55rem; margin: 0 0 6px; letter-spacing: -0.02em; }
    .subtitle { margin: 0 0 18px; color: rgba(244,245,252,0.65); line-height: 1.35; }
    .options { display: grid; gap: 12px; }
    .option { display:flex; gap: 14px; align-items: stretch; border: 1px solid rgba(200,206,255,0.22); border-radius: 14px; padding: 14px 14px; background: linear-gradient(180deg, rgba(27,27,56,0.72), rgba(18,18,42,0.72)); cursor: pointer; }
    .option:hover { border-color: rgba(165,158,255,0.55); }
    .option.selected { border-color: rgba(255,77,92,0.85); box-shadow: 0 0 0 1px rgba(255,77,92,0.25) inset, 0 0 22px rgba(255,77,92,0.15); }
    .letter { width: 38px; height: 38px; border-radius: 12px; display:flex; align-items:center; justify-content:center; font-weight: 800; letter-spacing: 0.08em; background: rgba(107,100,201,0.2); border: 1px solid rgba(107,100,201,0.3); }
    .content h3 { margin: 2px 0 4px; font-size: 1.05rem; }
    .content p { margin: 0; color: rgba(244,245,252,0.7); line-height: 1.35; }
    .bar { position: fixed; left: 0; right:0; bottom: 0; padding: 10px 14px; background: rgba(10,10,18,0.85); border-top: 1px solid rgba(200,206,255,0.18); backdrop-filter: blur(10px); }
    .bar-inner { max-width: 1100px; margin: 0 auto; display:flex; justify-content: space-between; gap: 12px; align-items:center; }
    .pill { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(244,245,252,0.7); }
    .kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(200,206,255,0.2); background: rgba(30,30,56,0.55); }
  `;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Visual Companion</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="frame">
${fragmentHtml}
    </div>
    <div class="bar" role="status" aria-live="polite">
      <div class="bar-inner">
        <div class="pill">Selection writes to <span class="kbd">events</span></div>
        <div class="pill">Newest file auto-served</div>
      </div>
    </div>
    <script>${helperJs}</script>
  </body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv);

  const sessionId = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const baseDir = path.join(args.projectDir, ".superpowers", "brainstorm", sessionId);
  const screenDir = path.join(baseDir, "content");
  const stateDir = path.join(baseDir, "state");
  const eventsPath = path.join(stateDir, "events");
  const serverInfoPath = path.join(stateDir, "server-info");
  const serverStoppedPath = path.join(stateDir, "server-stopped");

  await ensureDir(screenDir);
  await ensureDir(stateDir);

  const helperPath = path.join(__dirname, "visual-companion-helper.js");
  const helperJs = readFileMaybe(helperPath) ?? "";

  let lastActivity = Date.now();
  const touch = () => {
    lastActivity = Date.now();
  };

  const server = http.createServer(async (req, res) => {
    touch();
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname === "/__health") {
      return safeJson(res, 200, { ok: true });
    }
    if (url.pathname === "/__events" && req.method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString("utf-8");
      try {
        const evt = JSON.parse(raw);
        await fsp.appendFile(eventsPath, JSON.stringify(evt) + "\n", "utf-8");
        return safeJson(res, 200, { ok: true });
      } catch (e) {
        return safeJson(res, 400, { ok: false, error: String(e) });
      }
    }
    if (url.pathname === "/") {
      const fp = newestHtmlFile(screenDir);
      if (!fp) {
        const html = wrapFragment(
          `<h2>Visual companion is running</h2>
<p class="subtitle">Write an <code>.html</code> file into <code>${escapeHtml(
            screenDir,
          )}</code> and refresh.</p>`,
          helperJs,
        );
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(html);
      }
      const raw = fs.readFileSync(fp, "utf-8");
      const html = wrapFragment(raw, helperJs);
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      });
      return res.end(html);
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });

  server.on("error", async (err) => {
    await fsp.writeFile(serverStoppedPath, String(err), "utf-8");
    process.exitCode = 1;
  });

  server.listen({ host: args.host, port: args.port }, async () => {
    const addr = server.address();
    const port =
      typeof addr === "object" && addr && "port" in addr ? addr.port : args.port;

    const info = {
      type: "server-started",
      port,
      url: `http://${args.urlHost}:${port}`,
      screen_dir: screenDir,
      state_dir: stateDir,
      pid: process.pid,
    };

    await fsp.writeFile(serverInfoPath, JSON.stringify(info, null, 2), "utf-8");
    process.stdout.write(JSON.stringify(info) + "\n");
  });

  const timer = setInterval(async () => {
    if (Date.now() - lastActivity < args.idleMs) return;
    clearInterval(timer);
    await fsp.writeFile(serverStoppedPath, "idle-timeout", "utf-8");
    server.close(() => process.exit(0));
  }, 2000).unref();
}

await main();
