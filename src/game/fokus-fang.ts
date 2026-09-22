import { useEffect, useRef } from "react";

const WAHL = "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])";

export function useFokusFang(an: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!an) return;
    const wurzel = ref.current;
    if (!wurzel) return;
    const vorher = document.activeElement as HTMLElement | null;
    const liste = () =>
      [...wurzel.querySelectorAll<HTMLElement>(WAHL)].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    const erst = liste()[0];
    if (erst && !wurzel.contains(document.activeElement)) erst.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const felder = liste();
      if (!felder.length) return;
      const start = felder[0]!;
      const ende = felder[felder.length - 1]!;
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        ende.focus();
      } else if (!event.shiftKey && document.activeElement === ende) {
        event.preventDefault();
        start.focus();
      }
    }
    wurzel.addEventListener("keydown", onKey);
    return () => {
      wurzel.removeEventListener("keydown", onKey);
      vorher?.focus?.();
    };
  }, [an]);
  return ref;
}
