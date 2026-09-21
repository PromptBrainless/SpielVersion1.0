import { type ReactNode, useEffect, useRef, useState } from "react";
import { adresseZuText, type AnfassAdresse } from "@/game/anfassen";

export function Anfassbar({
  adresse,
  aktiv,
  children,
  editor,
  className,
}: {
  adresse: AnfassAdresse;
  aktiv: boolean;
  children: ReactNode;
  editor: (schliessen: () => void) => ReactNode;
  className?: string;
}) {
  const [offen, setOffen] = useState(false);
  const [hover, setHover] = useState(false);
  const kasten = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!offen) return;
    function aussen(ev: MouseEvent) {
      if (kasten.current && !kasten.current.contains(ev.target as Node)) setOffen(false);
    }
    function taste(ev: KeyboardEvent) {
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      setOffen(false);
    }
    window.addEventListener("mousedown", aussen);
    window.addEventListener("keydown", taste, true);
    return () => {
      window.removeEventListener("mousedown", aussen);
      window.removeEventListener("keydown", taste, true);
    };
  }, [offen]);

  if (!aktiv) return <>{children}</>;

  return (
    <span
      ref={kasten}
      className={`cursor-pointer rounded-sm outline outline-2 transition-colors ${
        offen ? "outline-accent" : hover ? "outline-accent/40" : "outline-transparent"
      } ${className ?? "relative inline-block"}`}
      title={adresseZuText(adresse)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(ev) => {
        ev.stopPropagation();
        setOffen((v) => !v);
      }}
    >
      {children}
      {offen ? (
        <span
          className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-sm border border-border bg-ink p-2 shadow-sm"
          onClick={(ev) => ev.stopPropagation()}
        >
          {editor(() => setOffen(false))}
        </span>
      ) : null}
    </span>
  );
}
