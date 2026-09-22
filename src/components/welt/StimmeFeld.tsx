import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronUp, Mic, Square, Upload, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blobAlsBase64, ladeSpielleiterTon } from "@/game/sl-upload";
import { merkeStimmeDatei } from "@/game/json/stimme";
import {
  alsZuege,
  spieleStimme,
  spieleStimmen,
  stoppeStimme,
  zugName,
  type StimmeRoh,
  type StimmeZug,
} from "@/game/stimme";
import { legeStimmeAb, legeTonAb } from "@/game/werkstatt.functions";

export function StimmeFeld({
  src,
  stimmen,
  antwort = "Antwort",
  syncId,
  onStimmen,
}: {
  src?: string;
  stimmen?: StimmeRoh[];
  antwort?: string;
  syncId?: string;
  onStimmen: (stimmen: StimmeZug[]) => void;
}) {
  const legeTon = useServerFn(legeTonAb);
  const legeSync = useServerFn(legeStimmeAb);
  const liste = alsZuege(src, stimmen, antwort);
  const [status, setStatus] = useState<string | null>(null);
  const [nimmt, setNimmt] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stuecke = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => haltAufnahme(), []);

  function haltAufnahme() {
    recorder.current?.state === "recording" && recorder.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorder.current = null;
    setNimmt(false);
  }

  async function sichereSync(next: StimmeZug[]) {
    if (!syncId) return;
    merkeStimmeDatei(syncId, next);
    if (next.some((zug) => zug.src.startsWith("data:"))) {
      setStatus("Ton liegt nur im Speicher. Datei fehlgeschlagen.");
      return;
    }
    try {
      const fund = await legeSync({ data: { id: syncId, inhalt: JSON.stringify({ id: syncId, stimmen: next }) } });
      if (!fund.ok) setStatus(fund.error);
    } catch (fehler) {
      setStatus(fehler instanceof Error ? fehler.message : "Sync nicht geschrieben.");
    }
  }

  function setze(next: StimmeZug[]) {
    onStimmen(next);
    void sichereSync(next);
  }

  async function nimmDatei(datei: File, davor: StimmeZug[] = liste) {
    setStatus("legt den Ton…");
    const index = davor.length;
    try {
      let pfad = "";
      if (syncId) {
        const data = await blobAlsBase64(datei);
        const fund = await legeTon({
          data: { id: syncId, index, mime: datei.type || "audio/webm", data },
        });
        if (fund.ok) pfad = fund.src;
      }
      if (!pfad) pfad = await ladeSpielleiterTon(datei, { id: syncId, index });
      const next = [...davor, { src: pfad, name: zugName(index, antwort) }];
      setze(next);
      setStatus(pfad.startsWith("data:") ? "Zug im Speicher, nicht als Datei." : `${next[next.length - 1]?.name ?? "Zug"} gespeichert.`);
      return next;
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "unlesbar");
      return davor;
    }
  }

  async function starteAufnahme() {
    setStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stuecke.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (event) => {
        if (event.data.size) stuecke.current.push(event.data);
      };
      rec.onstop = () => {
        const blob = new Blob(stuecke.current, { type: rec.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        void nimmDatei(new File([blob], `stimme-${liste.length + 1}.webm`, { type: blob.type }));
      };
      recorder.current = rec;
      rec.start();
      setNimmt(true);
      setStatus(`nimmt ${zugName(liste.length, antwort)} auf…`);
    } catch {
      setStatus("Mikrofon nicht erreichbar.");
    }
  }

  function verschiebe(index: number, richtung: -1 | 1) {
    const ziel = index + richtung;
    if (ziel < 0 || ziel >= liste.length) return;
    const next = [...liste];
    const [zug] = next.splice(index, 1);
    next.splice(ziel, 0, zug);
    setze(next);
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-fg">Stimmen</p>
      <p className="text-xs text-muted-fg">
        Jeder Zug speichert sich selbst{syncId ? ` als ${syncId}` : ""}. Name daneben — Erzähler, dann {antwort}.
      </p>
      {liste.length ? (
        <ol className="grid gap-1.5">
          {liste.map((zug, index) => (
            <li key={`${index}-${zug.src.slice(-24)}`} className="flex items-center gap-1 rounded-sm border border-border bg-surface/60 px-2 py-1.5">
              <span className="w-6 shrink-0 text-xs tabular-nums text-muted-fg">{index + 1}</span>
              <input
                className="h-9 min-w-0 flex-1 rounded-sm border border-border bg-bg px-2 text-xs text-fg"
                value={zug.name}
                aria-label={`Name Zug ${index + 1}`}
                onChange={(event) => {
                  const next = [...liste];
                  next[index] = { ...zug, name: event.target.value };
                  setze(next);
                }}
              />
              <button type="button" className="inline-flex size-9 items-center justify-center text-muted-fg" aria-label="früher" disabled={index === 0} onClick={() => verschiebe(index, -1)}>
                <ChevronUp className="size-3.5" aria-hidden />
              </button>
              <button type="button" className="inline-flex size-9 items-center justify-center text-muted-fg" aria-label="später" disabled={index === liste.length - 1} onClick={() => verschiebe(index, 1)}>
                <ChevronDown className="size-3.5" aria-hidden />
              </button>
              <button type="button" className="inline-flex size-9 items-center justify-center text-fg" aria-label={`${zug.name} hören`} onClick={() => spieleStimme(zug.src)}>
                <Volume2 className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center text-muted-fg"
                aria-label={`${zug.name} streichen`}
                onClick={() => {
                  stoppeStimme();
                  setze(liste.filter((_, i) => i !== index));
                }}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-muted-fg">Noch kein Zug. Nimm den Erzähler, dann {antwort}.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {nimmt ? (
          <Button type="button" variant="secondary" className="h-11 px-3 text-xs" onClick={haltAufnahme}>
            <Square className="size-3.5" aria-hidden />
            Stopp
          </Button>
        ) : (
          <Button type="button" variant="secondary" className="h-11 px-3 text-xs" onClick={() => void starteAufnahme()}>
            <Mic className="size-3.5" aria-hidden />
            {zugName(liste.length, antwort)}
          </Button>
        )}
        <label className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-3 text-xs text-fg">
          <Upload className="size-3.5" aria-hidden />
          Dateien
          <input
            type="file"
            accept="audio/*,.mp3,.ogg,.wav,.m4a,.webm"
            multiple
            className="sr-only"
            onChange={(event) => {
              const dateien = [...(event.target.files ?? [])];
              event.target.value = "";
              void (async () => {
                let stand = liste;
                for (const datei of dateien) stand = await nimmDatei(datei, stand);
              })();
            }}
          />
        </label>
        {liste.length ? (
          <Button type="button" variant="secondary" className="h-11 px-3 text-xs" onClick={() => spieleStimmen(liste.map((zug) => zug.src))}>
            <Volume2 className="size-3.5" aria-hidden />
            {liste.length > 1 ? "Gespräch" : "Hören"}
          </Button>
        ) : null}
      </div>
      {status ? <p className="text-xs text-muted-fg">{status}</p> : null}
    </div>
  );
}
