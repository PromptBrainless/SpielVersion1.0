import { createServerFn } from "@tanstack/react-start";
import { fundFuerSzene } from "./json/baum";
import { SzeneSchema, type SzeneJson } from "./json/schema";
import { WeltAuflageSchema } from "./welt";
import { grokFassung, type RagEingabe } from "./werkstatt-rag";
import { ART_SICHT, GROK_STIMME, GROK_SZENE } from "./werkstatt-vertrag";
import { KANON_NAMEN } from "./werkstatt-rag";

const ART = new Set([
  "title",
  "road",
  "stranger",
  "village",
  "townhall",
  "tavern",
  "well",
  "mill",
  "apothecary",
  "smithy",
  "forest",
  "ditch",
  "chapel",
  "camp",
  "evidence",
  "sneak",
  "combat",
  "gate",
  "death",
  "return",
]);
const PORTRAITS = new Set(["holm", "mara", "kess", "miller", "kern", "sanna", "smith", "beggar", "grovin"]);

function alsSzene(parsed: SzeneJson, data: RagEingabe): SzeneJson {
  const vorlage = fundFuerSzene(data.id, data.title)?.szene;
  const art = ART.has(parsed.art) ? parsed.art : data.art || vorlage?.art || "village";
  const portraitRoh = parsed.portrait === undefined ? data.portrait || vorlage?.portrait || null : parsed.portrait;
  const portrait = portraitRoh && PORTRAITS.has(portraitRoh) ? portraitRoh : null;
  const szene: SzeneJson = {
    id: data.id || vorlage?.id || parsed.id,
    title: parsed.title || data.title,
    art,
    portrait,
    lines: parsed.lines.map(String).filter((zeile) => zeile.trim().length > 0).slice(0, 20),
    choices: parsed.choices.map(String).filter((wahl) => wahl.trim().length > 0).slice(0, 16),
  };
  if (vorlage?.successLines) szene.successLines = parsed.successLines?.length ? parsed.successLines : vorlage.successLines;
  if (vorlage?.failureLines) szene.failureLines = parsed.failureLines?.length ? parsed.failureLines : vorlage.failureLines;
  if (vorlage?.passLines) szene.passLines = parsed.passLines?.length ? parsed.passLines : vorlage.passLines;
  if (!szene.choices.length) szene.choices = data.choices.length ? data.choices : ["Weiter"];
  return szene;
}

function innerOf(input: unknown): Record<string, unknown> {
  const rec = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  if (rec.data && typeof rec.data === "object" && !Array.isArray(rec.data)) {
    return rec.data as Record<string, unknown>;
  }
  return rec;
}

function alsEingabe(input: unknown): RagEingabe {
  const inner = innerOf(input);
  const liste = (wert: unknown, max: number) =>
    Array.isArray(wert) ? wert.map(String).slice(0, max) : [];
  return {
    id: String(inner.id ?? "").slice(0, 80),
    title: String(inner.title ?? "").slice(0, 200),
    art: String(inner.art ?? "").slice(0, 40),
    portrait: inner.portrait == null ? "" : String(inner.portrait).slice(0, 40),
    lines: liste(inner.lines, 60),
    choices: liste(inner.choices, 16),
    wissen: liste(inner.wissen, 16),
  };
}

export const formuliereText = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const inner = innerOf(input);
    return {
      text: String(inner.text ?? "").slice(0, 12_000),
      hinweis: String(inner.hinweis ?? "").slice(0, 800),
      title: String(inner.title ?? "").slice(0, 200),
      art: String(inner.art ?? "").slice(0, 40),
    };
  })
  .handler(async ({ data }) => {
    if (!data.text.trim()) return { ok: false as const, error: "Kein Text." };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Kein xAI-Schlüssel auf dem Server." };
    const sicht = ART_SICHT[data.art] ?? "";
    const erlaubt = KANON_NAMEN.filter((name) => data.text.includes(name) || data.title.includes(name.split(" ")[0]));
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.65,
          max_tokens: 8000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: GROK_STIMME },
            {
              role: "user",
              content: [
                "Nur diese Seite. Nichts anderes.",
                data.title && `Titel dieser Seite: ${data.title}`,
                sicht && `Licht und Ort dieser Karte, nur wenn der Text ihn braucht: ${sicht}`,
                erlaubt.length ? `Namen, die hier vorkommen dürfen: ${erlaubt.join(", ")}` : "Keine Eigennamen erfinden.",
                data.hinweis && `Hinweis der Spielleitung, gilt nur für diese Seite: ${data.hinweis}`,
                "Länger als die Eingabe, aber auf demselben Fleck. Keine anderen Orte.",
                "Ausgangstext dieser Seite:",
                data.text,
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        }),
      });
      if (!res.ok) {
        const roh = await res.text().catch(() => "");
        return { ok: false as const, error: `xAI ${res.status}${roh ? `: ${roh.slice(0, 160)}` : ""}` };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const roh = body.choices?.[0]?.message?.content ?? "";
      const start = roh.indexOf("{");
      const end = roh.lastIndexOf("}");
      if (start < 0 || end <= start) return { ok: false as const, error: "Keine Formulierung." };
      const parsed = JSON.parse(roh.slice(start, end + 1)) as { text?: unknown; lines?: unknown };
      const text = typeof parsed.text === "string"
        ? parsed.text
        : Array.isArray(parsed.lines)
          ? parsed.lines.map(String).join("\n\n")
          : "";
      if (!text.trim()) return { ok: false as const, error: "Leere Formulierung." };
      if (text.trim().length < data.text.trim().length) {
        return { ok: false as const, error: "Die Fassung war kürzer als der Ausgangstext. Noch einmal formulieren." };
      }
      return { ok: true as const, text: text.trim() };
    } catch (fehler) {
      return { ok: false as const, error: fehler instanceof Error ? fehler.message : "xAI nicht erreichbar." };
    }
  });

export { grokFassung };

export const entwerfeSzene = createServerFn({ method: "POST" })
  .validator(alsEingabe)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Kein xAI-Schlüssel auf dem Server." };

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.7,
          max_tokens: 8000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: GROK_SZENE },
            { role: "user", content: grokFassung(data) },
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
      let rohJson: unknown;
      try {
        rohJson = JSON.parse(roh.slice(start, end + 1));
      } catch {
        return { ok: false as const, error: "Die Antwort war kein JSON." };
      }
      const rec = rohJson && typeof rohJson === "object" ? (rohJson as Record<string, unknown>) : {};
      const kern = Array.isArray(rec.szenen) ? rec.szenen[0] : rohJson;
      const objekt = kern && typeof kern === "object" ? (kern as Record<string, unknown>) : rec;
      const geprueft = SzeneSchema.safeParse({
        ...objekt,
        id: data.id || String(objekt.id ?? "szene"),
        title: String(objekt.title ?? data.title),
        art: String(objekt.art ?? (data.art || "village")),
        portrait: objekt.portrait === undefined ? data.portrait || null : objekt.portrait,
        lines: Array.isArray(objekt.lines) ? objekt.lines.map(String).slice(0, 16) : data.lines,
        choices: Array.isArray(objekt.choices) ? objekt.choices.map(String).slice(0, 16) : data.choices,
      });
      if (!geprueft.success) return { ok: false as const, error: "Kein gültiges Szenen-JSON." };
      return { ok: true as const, ...alsSzene(geprueft.data, data) };
    } catch (fehler) {
      return { ok: false as const, error: fehler instanceof Error ? fehler.message : "xAI nicht erreichbar." };
    }
  });

function szeneAusRoh(roh: unknown, idHint = ""): SzeneJson | null {
  const rec = roh && typeof roh === "object" ? (roh as Record<string, unknown>) : {};
  let kern: unknown = rec;
  if (Array.isArray(rec.szenen)) {
    kern =
      rec.szenen.find((eintrag) => eintrag && typeof eintrag === "object" && String((eintrag as { id?: string }).id) === idHint) ??
      rec.szenen[0];
  } else if (Array.isArray(rec.teile)) {
    const szenen = (rec.teile as { szenen?: unknown[] }[]).flatMap((teil) => (Array.isArray(teil.szenen) ? teil.szenen : []));
    kern =
      szenen.find((eintrag) => eintrag && typeof eintrag === "object" && String((eintrag as { id?: string }).id) === idHint) ??
      szenen[0];
  }
  const objekt = kern && typeof kern === "object" ? (kern as Record<string, unknown>) : rec;
  const id = String(objekt.id ?? rec.id ?? (idHint || "szene"));
  const geprueft = SzeneSchema.safeParse({
    id,
    title: String(objekt.title ?? rec.title ?? "Szene"),
    art: String(objekt.art ?? rec.art ?? "village"),
    portrait: objekt.portrait === undefined ? rec.portrait ?? null : objekt.portrait,
    lines: Array.isArray(objekt.lines) ? objekt.lines.map(String) : Array.isArray(rec.lines) ? rec.lines.map(String) : [],
    choices: Array.isArray(objekt.choices)
      ? objekt.choices.map(String)
      : Array.isArray(rec.choices)
        ? rec.choices.map(String)
        : ["Weiter"],
    successLines: objekt.successLines,
    failureLines: objekt.failureLines,
    passLines: objekt.passLines,
  });
  if (!geprueft.success || !geprueft.data.lines.length) return null;
  return geprueft.data;
}

export const legeKiSzeneAb = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const inner = innerOf(input);
    return {
      inhalt: String(inner.inhalt ?? "").slice(0, 120_000),
      id: String(inner.id ?? "").slice(0, 80),
    };
  })
  .handler(async ({ data }) => {
    let roh: unknown;
    try {
      roh = JSON.parse(data.inhalt);
    } catch {
      return { ok: false as const, error: "Kein JSON zum Ablegen." };
    }
    const szene = szeneAusRoh(roh, data.id);
    if (!szene) return { ok: false as const, error: "Szenen-JSON unvollständig. lines fehlen." };

    const { mkdir, readFile, writeFile } = await import("node:fs/promises");
    const { dirname, join } = await import("node:path");
    const kiPfad = join(process.cwd(), "src/game/json/ki-auflagen.json");
    let bestand: Record<string, unknown> = {};
    try {
      bestand = JSON.parse(await readFile(kiPfad, "utf8")) as Record<string, unknown>;
    } catch {
      bestand = {};
    }
    bestand[szene.id] = {
      title: szene.title,
      art: szene.art,
      lines: szene.lines,
      choices: szene.choices,
      portrait: szene.portrait ?? null,
    };
    await mkdir(dirname(kiPfad), { recursive: true });
    await writeFile(kiPfad, `${JSON.stringify(bestand, null, 2)}\n`, "utf8");

    const fund = fundFuerSzene(szene.id, szene.title);
    let datei = "json/ki-auflagen.json";
    if (fund) {
      const teilPfad = join(process.cwd(), "src/game/json/quests", fund.teil.datei);
      try {
        const teil = JSON.parse(await readFile(teilPfad, "utf8")) as { szenen?: SzeneJson[] };
        if (Array.isArray(teil.szenen)) {
          teil.szenen = teil.szenen.map((eintrag) => (eintrag.id === szene.id ? { ...eintrag, ...szene } : eintrag));
          await writeFile(teilPfad, `${JSON.stringify(teil, null, 2)}\n`, "utf8");
          datei = fund.teil.datei;
        }
      } catch {
        /* nur ki-auflagen.json */
      }
    }
    return { ok: true as const, id: szene.id, datei };
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
  .validator((input: unknown) => {
    const inner = innerOf(input);
    return {
      schluessel: String(inner.schluessel ?? "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "karte",
      inhalt: String(inner.inhalt ?? "").slice(0, 80_000),
    };
  })
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
    if (bestehend.pending) {
      return {
        ok: false as const,
        error: "GitHub wartet auf Freigabe.",
        loginRequired: Boolean(bestehend.loginRequired),
        loginUrl: bestehend.loginUrl,
        pending: true,
      };
    }
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
