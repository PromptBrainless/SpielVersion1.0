import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function attach(server, root) {
  server.middlewares.use(async (req, res, next) => {
    const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
    if (pathOnly === "/__lindendorf/upload") {
      const method = (req.method ?? "GET").toUpperCase();
      res.setHeader("content-type", "application/json; charset=utf-8");
      if (method !== "POST") {
        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: "method" }));
        return;
      }
      try {
        const raw = (await readBody(req)) || "{}";
        const body = JSON.parse(raw);
        const data = String(body.data ?? "");
        const mime = String(body.mime ?? "image/jpeg");
        const audio = mime.startsWith("audio/");
        const max = audio ? 12_000_000 : 3_500_000;
        if (!data || data.length > max) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: audio ? "Ton zu groß oder leer." : "Bild zu groß oder leer." }));
          return;
        }
        const dir = join(root, audio ? "public/art/sl/ton" : "public/art/sl");
        mkdirSync(dir, { recursive: true });
        const ext = audio
          ? mime.includes("mpeg") || mime.includes("mp3")
            ? "mp3"
            : mime.includes("ogg")
              ? "ogg"
              : mime.includes("wav")
                ? "wav"
                : mime.includes("mp4")
                  ? "m4a"
                  : "webm"
          : "jpg";
        const name = `u${Date.now().toString(36)}.${ext}`;
        writeFileSync(join(dir, name), Buffer.from(data, "base64"));
        res.end(JSON.stringify({ ok: true, src: audio ? `/art/sl/ton/${name}` : `/art/sl/${name}` }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
      }
      return;
    }
    if (pathOnly !== "/__lindendorf/text-pack") {
      next();
      return;
    }
    const packPath = join(root, "src/game/text-pack.json");
    const method = (req.method ?? "GET").toUpperCase();
    res.setHeader("content-type", "application/json; charset=utf-8");
    try {
      if (method === "GET") {
        res.end(readFileSync(packPath, "utf8"));
        return;
      }
      if (method !== "POST") {
        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: "method" }));
        return;
      }
      const raw = (await readBody(req)) || "{}";
      const body = JSON.parse(raw);
      const pack = body.pack ?? { version: 1, patches: {} };
      writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`);
      if (body.spielleiter && typeof body.spielleiter === "object") {
        writeFileSync(
          join(root, "src/game/spielleiter-karten.json"),
          `${JSON.stringify(body.spielleiter, null, 2)}\n`,
        );
      }
      let apply = null;
      if (body.apply) {
        const run = spawnSync("node", [join(root, "scripts/apply-text-pack.mjs")], {
          encoding: "utf8",
          cwd: root,
        });
        const out = (run.stdout || "").trim().split("\n").pop() || "";
        try {
          apply = JSON.parse(out);
        } catch {
          apply = { error: (run.stderr || out || "apply failed").slice(0, 400) };
        }
      }
      res.end(JSON.stringify({ ok: true, apply }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
    }
  });
}

export function textPackPlugin() {
  return {
    name: "lindendorf-text-pack",
    configureServer(server) {
      attach(server, server.config.root);
    },
    configurePreviewServer(server) {
      attach(server, server.config.root);
    },
  };
}
