import { createServerFn } from "@tanstack/react-start";
import { WeltAuflageSchema } from "./welt";

const STIMME = `Du schreibst eine Entwurfsszene für Lindendorf, How to be a Hero.
Deutsch, Du, Präsens, Anführungszeichen „…“.
Kein Pathos, keine Emojis, keine leuchtende Magie, kein „Schicksal“, kein „In einer Welt“.
Sätze dürfen lang sein. Leer dürfen sie nicht sein.
Antworte NUR mit JSON: { "title": string, "lines": string[], "choices": string[] }.
Das ist ein Entwurf, kein Kanon.`;

const ZEIT_MS = 18_000;

export const entwerfeSzene = createServerFn({ method: "POST" })
  .validator((input: { title: string; lines: string[]; choices: string[]; wissen: string[] }) => ({
    title: String(input?.title ?? "").slice(0, 120),
    lines: Array.isArray(input?.lines) ? input.lines.map(String).slice(0, 24) : [],
    choices: Array.isArray(input?.choices) ? input.choices.map(String).slice(0, 12) : [],
    wissen: Array.isArray(input?.wissen) ? input.wissen.map(String).slice(0, 12) : [],
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Kein xAI-Schlüssel auf dem Server." };

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ZEIT_MS);
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        signal: ac.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4-fast",
          max_tokens: 700,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: STIMME },
            {
              role: "user",
              content: JSON.stringify({
                title: data.title,
                lines: data.lines,
                choices: data.choices,
                wissen: data.wissen,
              }),
            },
          ],
        }),
      });
      if (!res.ok) {
        const roh = await res.text().catch(() => "");
        return { ok: false as const, error: `xAI ${res.status}${roh ? `: ${roh.slice(0, 160)}` : ""}` };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content ?? "";
      const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const roh = fence?.[1] ?? text;
      const start = roh.indexOf("{");
      const end = roh.lastIndexOf("}");
      if (start < 0 || end <= start) return { ok: false as const, error: "Die Antwort war kein JSON." };
      const parsed = JSON.parse(roh.slice(start, end + 1)) as { title?: string; lines?: string[]; choices?: string[] };
      return {
        ok: true as const,
        title: parsed.title ?? data.title,
        lines: Array.isArray(parsed.lines) ? parsed.lines.map(String) : data.lines,
        choices: Array.isArray(parsed.choices) ? parsed.choices.map(String) : data.choices,
      };
    } catch (fehler) {
      const name = fehler instanceof Error ? fehler.name : "";
      if (name === "AbortError" || name === "TimeoutError") {
        return { ok: false as const, error: "Zeitüberschreitung. Entwurf abgebrochen." };
      }
      return { ok: false as const, error: fehler instanceof Error ? fehler.message : "xAI nicht erreichbar." };
    } finally {
      clearTimeout(timer);
    }
  });

function shaAus(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.sha === "string") return rec.sha;
  const inner = rec.content;
  if (inner && typeof inner === "object" && typeof (inner as { sha?: string }).sha === "string") {
    return (inner as { sha: string }).sha;
  }
  return undefined;
}

export const legeKanonAufGithub = createServerFn({ method: "POST" })
  .validator((input: { schluessel: string; inhalt: string }) => ({
    schluessel: input.schluessel.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "karte",
    inhalt: input.inhalt.slice(0, 80_000),
  }))
  .handler(async ({ data }) => {
    let roh: unknown;
    try {
      roh = JSON.parse(data.inhalt);
    } catch {
      return { ok: false as const, error: "Kein JSON.", loginRequired: false };
    }
    const geprueft = WeltAuflageSchema.safeParse(roh);
    if (!geprueft.success) return { ok: false as const, error: "Auflage ungültig.", loginRequired: false };

    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType } = await import("@/lib/app-data/types");
    const options = { connectorType: ConnectorType.Mcp, connectorCatalogId: "github" };
    const owner = "PromptBrainless";
    const repo = "SpielVersion1.0";
    const path = `docs/kanon-auflagen/${data.schluessel}.json`;
    const bestehend = await callTool("github___get_file_contents", { owner, repo, path }, options);
    if (bestehend.loginRequired) {
      return {
        ok: false as const,
        error: bestehend.errorMessage ?? "GitHub anmelden.",
        loginRequired: true,
        loginUrl: bestehend.loginUrl,
        pending: bestehend.pending,
      };
    }
    const sha = shaAus(bestehend.data);
    const geschrieben = await callTool(
      "github___create_or_update_file",
      {
        owner,
        repo,
        path,
        content: JSON.stringify(geprueft.data, null, 2) + "\n",
        message: `Kanon-Auflage: ${data.schluessel}`,
        branch: "main",
        ...(sha ? { sha } : {}),
      },
      options,
    );
    if (geschrieben.loginRequired) {
      return {
        ok: false as const,
        error: geschrieben.errorMessage ?? "GitHub anmelden.",
        loginRequired: true,
        loginUrl: geschrieben.loginUrl,
        pending: geschrieben.pending,
      };
    }
    if (!geschrieben.ok) {
      return { ok: false as const, error: geschrieben.errorMessage ?? "GitHub hat abgelehnt.", loginRequired: false };
    }
    return { ok: true as const, pfad: path };
  });
