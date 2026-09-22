import type { Held } from "./types";

export type KnowledgeKey =
  | "dorf_ankunft"
  | "artefakt_gesehen"
  | "artefakt_erhalten"
  | "holm_besucht"
  | "auftrag_erhalten"
  | "banditen_bekannt"
  | "rotes_siegel_gesehen"
  | "hang_hinweis"
  | "glockenweg_bekannt"
  | "glocke_vorteil"
  | "banditen_gewarnt"
  | "muehle_stillstand"
  | "renniks_druck"
  | "fluechtlinge_muehle"
  | "wasser_truebung"
  | "grovin_zisterne"
  | "dennek_schuld"
  | "versorgung_muster"
  | "gasse_leer"
  | "kesseljahr"
  | "ilses_liste"
  | "ungerufener_name";

export type WissensTyp = "material" | "sozial" | "ort" | "übernatürlich";

export const KNOWLEDGE_META: Record<KnowledgeKey, { typ: WissensTyp; label: string }> = {
  dorf_ankunft: { typ: "ort", label: "Du bist in Lindendorf angekommen." },
  artefakt_gesehen: { typ: "übernatürlich", label: "Ein silbernes Kirchenzeichen am Weg." },
  artefakt_erhalten: { typ: "material", label: "Das silberne Artefakt liegt bei dir." },
  holm_besucht: { typ: "sozial", label: "Du warst im Rathaus bei Holm." },
  auftrag_erhalten: { typ: "sozial", label: "Holm hat dir den Auftrag gegeben." },
  banditen_bekannt: { typ: "ort", label: "Banditen sitzen im Steinbruch." },
  rotes_siegel_gesehen: { typ: "material", label: "Rotes Wachs, ein gebrochenes Siegel." },
  hang_hinweis: { typ: "ort", label: "Der Hang über dem Dorf trägt eine Spur." },
  glockenweg_bekannt: { typ: "ort", label: "Der alte Glockenweg ist kein Gerücht mehr." },
  glocke_vorteil: { typ: "material", label: "Die Glocke am Hang bleibt still." },
  banditen_gewarnt: { typ: "sozial", label: "Die Banditen wissen, dass jemand kommt." },
  muehle_stillstand: { typ: "material", label: "Die Mühle liefert kein Mehl." },
  renniks_druck: { typ: "sozial", label: "Jemand presst die Mühle vom Ufer her." },
  fluechtlinge_muehle: { typ: "sozial", label: "In der Kornkammer versteckt Bertok Menschen." },
  wasser_truebung: { typ: "material", label: "Das Brunnenwasser ist trüb." },
  grovin_zisterne: { typ: "ort", label: "Grovin leitet Wasser in eine Zisterne." },
  dennek_schuld: { typ: "sozial", label: "Dennek hat Grovin nie bezahlt." },
  versorgung_muster: { typ: "sozial", label: "Mehl und Wasser werden dem Tal auf dieselbe Art genommen." },
  gasse_leer: { typ: "ort", label: "Hinter der Gerberei liegt eine leere Gasse." },
  kesseljahr: { typ: "sozial", label: "Im Kesseljahr wurde die Gasse abgeriegelt." },
  ilses_liste: { typ: "material", label: "Ilse Brandtner hat die Toten unter der Kirche versteckt." },
  ungerufener_name: { typ: "sozial", label: "Jemand wurde aus dem Dorf fortgeschafft. Der Name fehlt." },
};

export type KnowledgeState = ReadonlySet<KnowledgeKey>;

export function deriveKnowledge(held: Held): KnowledgeState {
  const knowledge = new Set<KnowledgeKey>(["dorf_ankunft", "artefakt_gesehen"]);
  if (held.artefaktErhalten) knowledge.add("artefakt_erhalten");
  if (held.holmBesucht) {
    knowledge.add("holm_besucht");
    knowledge.add("banditen_bekannt");
    knowledge.add("rotes_siegel_gesehen");
    knowledge.add("muehle_stillstand");
  }
  if (held.muehleBesucht) knowledge.add("muehle_stillstand");
  if (held.auftragErhalten) knowledge.add("auftrag_erhalten");
  if (held.sannaGeholfen || held.mehlsackGefunden || held.holmSiegelGefunden || held.artefaktErhalten) {
    knowledge.add("hang_hinweis");
    knowledge.add("glockenweg_bekannt");
  }
  if (held.glockeGestoppt) knowledge.add("glocke_vorteil");
  if (held.banditenGewarnt) knowledge.add("banditen_gewarnt");
  if (held.muellerVertraut || held.renniksBeweis || held.loesungswegMuehle) knowledge.add("renniks_druck");
  if (held.fluechtlingeEntdeckt) knowledge.add("fluechtlinge_muehle");
  if (held.truebungBestaetigt || held.spurAmBrunnen) knowledge.add("wasser_truebung");
  if (held.grovinGenannt || held.grovinsGrund || held.loesungswegBrunnen) knowledge.add("grovin_zisterne");
  if (held.dennekEntlarvt) knowledge.add("dennek_schuld");
  if (
    (held.muehleBesucht || held.loesungswegMuehle || held.holmBesucht) &&
    (held.truebungBestaetigt || held.loesungswegBrunnen)
  ) {
    knowledge.add("versorgung_muster");
  }
  if (held.gasseBesucht || held.loesungswegGasse) knowledge.add("gasse_leer");
  if (held.gasseGeschichteGehoert || held.vahlGrossvater || held.loesungswegGasse) knowledge.add("kesseljahr");
  if (held.ilsesAufzeichnungenGefunden || held.loesungswegGasse) knowledge.add("ilses_liste");
  if (held.fadenGeschlossen || held.ungerufenerNameGeloest || held.koehlerBefragt || held.schnurLetzterKnoten) {
    knowledge.add("ungerufener_name");
  }
  return knowledge;
}

export function knows(held: Held, key: KnowledgeKey): boolean {
  return deriveKnowledge(held).has(key);
}

export function knowledgeLabels(held: Held): { sicher: string[]; offen: string[] } {
  const knowledge = deriveKnowledge(held);
  const sicher: string[] = [];
  if (knowledge.has("banditen_bekannt")) sicher.push("Banditen sitzen im alten Steinbruch.");
  if (knowledge.has("auftrag_erhalten")) sicher.push("Holm hat dir den Auftrag gegeben.");
  if (knowledge.has("artefakt_erhalten")) sicher.push("Das silberne Artefakt gehört zur Kirche.");
  if (knowledge.has("glocke_vorteil")) sicher.push("Die Glocke am Hang bleibt still.");
  if (knowledge.has("banditen_gewarnt")) sicher.push("Die Banditen wissen, dass jemand kommt.");
  if (knowledge.has("muehle_stillstand") && !held.loesungswegMuehle) sicher.push("Die Mühle liefert kein Mehl mehr.");
  if (held.loesungswegMuehle === "schleich" || held.loesungswegMuehle === "verhandelt") {
    sicher.push("Die Mühle mahlt wieder. Das Dorf weiß nicht genau, warum.");
  } else if (held.loesungswegMuehle === "kampf") {
    sicher.push("Die Mühle mahlt wieder. Am Steg hat man Blut gesehen.");
  } else if (held.loesungswegMuehle === "verraten") {
    sicher.push("Die Mühle hat ihren Schutzbrief. Bertoks Blick ist leer.");
  }
  if (knowledge.has("renniks_druck") && !held.loesungswegMuehle) sicher.push("Jemand presst die Mühle vom Ufer her.");
  if (knowledge.has("fluechtlinge_muehle") && held.loesungswegMuehle !== "verraten") {
    sicher.push("In der Kornkammer versteckt Bertok Lenes Schwester und deren Kinder.");
  }
  if (knowledge.has("wasser_truebung") && !held.loesungswegBrunnen) {
    sicher.push("Das Brunnenwasser ist trüb und macht krank.");
  }
  if (held.loesungswegBrunnen === "bestochen") {
    sicher.push("Das Wasser reicht wieder. Es reicht nicht für alle.");
  } else if (held.loesungswegBrunnen) {
    sicher.push("Das Brunnenwasser ist wieder klar.");
  }
  if (knowledge.has("dennek_schuld")) sicher.push("Dennek hat Grovin nie bezahlt.");
  if (held.grovinVersprechen) {
    sicher.push("Holm schuldet Grovin eine Zahl, die nicht in der Kasse steht.");
  }
  if (knowledge.has("grovin_zisterne") && !held.loesungswegBrunnen) {
    sicher.push("Grovin leitet Dorfwasser in eine Zisterne am Waldrand.");
  }
  if (knowledge.has("versorgung_muster") && held.loesungswegMuehle && held.loesungswegBrunnen) {
    sicher.push("Mehl und Wasser wurden dem Tal auf dieselbe Art genommen.");
  }
  if (held.loesungswegGasse === "veroeffentlicht") {
    sicher.push("Der Rat hat Ilse Brandtners Liste gehört. Vahl hat seinen Sitz verloren.");
  } else if (held.loesungswegGasse === "weitergegeben") {
    sicher.push("Holm hat den Bauplatz ruhen lassen. Die Liste liegt in seiner Schublade.");
  } else if (held.loesungswegGasse === "erpresst") {
    sicher.push("Vahl hat die Baumannschaft abbestellt. Die Wahrheit bleibt zwischen euch.");
  } else if (held.loesungswegGasse === "vernichtet") {
    sicher.push("Ilse Brandtners Liste ist Asche. Die Gerbereigasse wird bebaut.");
  } else if (knowledge.has("ilses_liste")) {
    sicher.push("Ilse Brandtner hat die Toten des Kesseljahrs unter der Kirche versteckt.");
  } else if (knowledge.has("kesseljahr")) {
    sicher.push("Im Kesseljahr wurde die Gerbereigasse abgeriegelt. Vahl will sie bebauen.");
  } else if (knowledge.has("gasse_leer")) {
    sicher.push("Hinter der Gerberei liegt eine Gasse, die niemand mehr als Weg benutzt.");
  }
  if (knowledge.has("ungerufener_name") && held.fadenGeschlossen) {
    sicher.push("Du kennst einen Namen, den das Dorf nicht mehr ruft.");
  } else if (knowledge.has("ungerufener_name")) {
    sicher.push("Fäden, Wolle und ein abgeschabter Name gehören zusammen. Jemand fehlt.");
  }

  const offen: string[] = [];
  if (!knowledge.has("banditen_bekannt")) offen.push("Warum steigt Rauch aus dem Steinbruch?");
  if (!knowledge.has("glockenweg_bekannt")) offen.push("Wer benutzt die Glocke am Hang?");
  if (!knowledge.has("artefakt_erhalten")) offen.push("Was geschah mit dem silbernen Artefakt?");
  if (knowledge.has("muehle_stillstand") && !held.loesungswegMuehle && !knowledge.has("renniks_druck")) {
    offen.push("Warum steht die Mühle still, obwohl das Rad sich dreht?");
  }
  if (knowledge.has("wasser_truebung") && !held.loesungswegBrunnen && !knowledge.has("grovin_zisterne")) {
    offen.push("Was macht das Brunnenwasser bitter?");
  }
  if (
    knowledge.has("versorgung_muster") &&
    (!held.loesungswegMuehle || !held.loesungswegBrunnen)
  ) {
    offen.push("Wer rechnet mit Mehl und Wasser gleichzeitig?");
  }
  if (knowledge.has("kesseljahr") && !held.loesungswegGasse && !knowledge.has("ilses_liste")) {
    offen.push("Wohin hat Ilse Brandtner die Namen der Gasse gebracht?");
  } else if (knowledge.has("ilses_liste") && !held.loesungswegGasse) {
    offen.push("Was tust du mit Ilse Brandtners Liste, bevor die Baumannschaft kommt?");
  } else if (knowledge.has("gasse_leer") && !held.loesungswegGasse && !knowledge.has("kesseljahr")) {
    offen.push("Warum geht in der Gerbereigasse niemand mehr?");
  }
  return { sicher, offen };
}
