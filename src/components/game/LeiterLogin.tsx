import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFokusFang } from "@/game/fokus-fang";
import { merkeLeiterFrei } from "@/game/leiter-login";
import { oeffneLeiterSitzung } from "@/game/leiter.functions";

export function LeiterLogin({
  onOk,
  onClose,
}: {
  onOk: () => void;
  onClose: () => void;
}) {
  const pruefe = useServerFn(oeffneLeiterSitzung);
  const fang = useFokusFang(true);
  const [wort, setWort] = useState("");
  const [fehler, setFehler] = useState(false);
  const [busy, setBusy] = useState(false);

  async function senden() {
    setBusy(true);
    setFehler(false);
    try {
      const fund = await pruefe({ data: { passwort: wort } });
      if (!fund.ok) {
        setFehler(true);
        return;
      }
      merkeLeiterFrei();
      onOk();
    } catch {
      setFehler(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={fang} className="fixed inset-0 z-50 grid place-items-center bg-ink/80 px-4" role="dialog" aria-modal="true" aria-labelledby="leiter-login-titel">
      <form
        className="w-full max-w-sm rounded-xl border border-border bg-bg p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void senden();
        }}
      >
        <p id="leiter-login-titel" className="font-display text-xl">Spielleiter</p>
        <p className="mt-1 text-sm text-muted-fg">Das Werkzeug bleibt hinter der Tür.</p>
        <label className="mt-4 block text-sm text-muted-fg" htmlFor="leiter-pass">
          Passwort
        </label>
        <Input
          id="leiter-pass"
          type="password"
          autoFocus
          autoComplete="off"
          value={wort}
          onChange={(event) => {
            setWort(event.target.value);
            setFehler(false);
          }}
          className="mt-1.5"
        />
        {fehler ? (
          <p className="mt-2 text-sm font-semibold text-hp" role="alert">
            Das war es nicht.
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="submit" size="lg" disabled={busy}>
            Eintreten
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={onClose}>
            Zurück
          </Button>
        </div>
      </form>
    </div>
  );
}
