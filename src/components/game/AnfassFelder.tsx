import { Button } from "@/components/ui/button";
import { ART, PORTRAITS } from "@/game/art";
import type { ArtKey, PortraitKey } from "@/game/types";

export function TextFeld({
  wert,
  mehrzeilig,
  aufSpeichern,
  aufAbbrechen,
}: {
  wert: string;
  mehrzeilig?: boolean;
  aufSpeichern: (neu: string) => void;
  aufAbbrechen: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        aufSpeichern(String(data.get("text") ?? wert));
      }}
    >
      {mehrzeilig ? (
        <textarea
          name="text"
          defaultValue={wert}
          className="min-h-24 w-72 max-w-[80vw] rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        />
      ) : (
        <input
          name="text"
          defaultValue={wert}
          className="w-72 max-w-[80vw] rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-fg"
        />
      )}
      <div className="mt-1 flex gap-1">
        <Button type="submit" className="h-8 px-2 text-xs">
          Merken
        </Button>
        <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={aufAbbrechen}>
          Weg
        </Button>
      </div>
    </form>
  );
}

export function BildRaster({
  art,
  portrait,
  aktuell,
  aufArt,
  aufPortrait,
}: {
  art?: ArtKey;
  portrait?: boolean;
  aktuell?: string;
  aufArt?: (key: ArtKey) => void;
  aufPortrait?: (key: PortraitKey | null) => void;
}) {
  const eintraege = portrait ? Object.entries(PORTRAITS) : Object.entries(ART);
  const marke = aktuell ?? art;
  return (
    <div className="grid max-h-56 w-72 max-w-[80vw] grid-cols-4 gap-1 overflow-y-auto">
      {portrait ? (
        <button type="button" className="h-12 border border-border text-xs text-muted-fg" onClick={() => aufPortrait?.(null)}>
          keins
        </button>
      ) : null}
      {eintraege.map(([key, src]) => (
        <button
          key={key}
          type="button"
          className={`h-12 overflow-hidden border ${key === marke ? "border-accent" : "border-border"}`}
          onClick={() => (portrait ? aufPortrait?.(key as PortraitKey) : aufArt?.(key as ArtKey))}
        >
          <img src={src} alt={key} className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}
