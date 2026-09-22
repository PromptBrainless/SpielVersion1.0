import { leseEinstellungen } from "./einstellungen";

const PAUSE_MS = 480;

export type StimmeZug = { src: string; name: string };
export type StimmeRoh = string | { src?: string; name?: string };

export const FIGUR_NAME: Record<string, string> = {
  holm: "Holm",
  mara: "Mara",
  kess: "Kess",
  miller: "Bertok",
  kern: "Kern",
  sanna: "Sanna",
  smith: "Schmied",
  beggar: "Fenn",
  grovin: "Grovin",
  dennek: "Dennek",
  lene: "Lene",
  vahl: "Vahl",
  grete: "Grete",
  rennik: "Rennik",
  jorren: "Jorren",
};

export function zugName(index: number, antwort = "Antwort") {
  return index % 2 === 0 ? "Erzähler" : antwort;
}

export function alsZuege(stimmeSrc?: string, stimmen?: StimmeRoh[], antwort = "Antwort"): StimmeZug[] {
  if (stimmen !== undefined) {
    return stimmen
      .map((item, index) => {
        if (typeof item === "string") return { src: item.trim(), name: zugName(index, antwort) };
        return { src: (item.src ?? "").trim(), name: item.name?.trim() || zugName(index, antwort) };
      })
      .filter((zug) => zug.src);
  }
  const eine = stimmeSrc?.trim();
  return eine ? [{ src: eine, name: zugName(0, antwort) }] : [];
}

export function stimmenListe(stimmeSrc?: string, stimmen?: StimmeRoh[]): string[] {
  return alsZuege(stimmeSrc, stimmen).map((zug) => zug.src);
}

let laufend: HTMLAudioElement | null = null;
let warteschlange: string[] = [];
let pause: number | null = null;

function loeschePause() {
  if (pause == null) return;
  window.clearTimeout(pause);
  pause = null;
}

export function stoppeStimme() {
  loeschePause();
  warteschlange = [];
  if (!laufend) return;
  laufend.onended = null;
  laufend.pause();
  laufend.src = "";
  laufend = null;
}

function naechste() {
  const pfad = warteschlange.shift();
  if (!pfad) {
    laufend = null;
    return;
  }
  const laut = leseEinstellungen().ton.stimme;
  if (laut <= 0) {
    warteschlange = [];
    laufend = null;
    return;
  }
  const audio = new Audio(pfad);
  audio.volume = laut;
  audio.preload = "auto";
  laufend = audio;
  void audio.play().catch(() => {
    if (laufend === audio) naechste();
  });
  audio.onended = () => {
    if (laufend !== audio) return;
    laufend = null;
    if (!warteschlange.length) return;
    pause = window.setTimeout(() => {
      pause = null;
      naechste();
    }, PAUSE_MS);
  };
}

export function spieleStimme(src?: string) {
  const pfad = src?.trim();
  if (!pfad) return;
  spieleStimmen([pfad]);
}

export function spieleStimmen(quellen?: string[]) {
  stoppeStimme();
  if (typeof window === "undefined") return;
  warteschlange = (quellen ?? []).map((s) => s.trim()).filter(Boolean);
  naechste();
}

export function stimmeLaeuft(): boolean {
  return Boolean((laufend && !laufend.paused) || warteschlange.length || pause != null);
}
