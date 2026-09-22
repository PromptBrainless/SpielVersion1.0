export type HerkunftArt = "gnade" | "ordnung" | "nutzen";

export const SPIEGEL: Record<HerkunftArt, string> = {
  gnade: "Du bist tapfer und opferbereit. Selbst unter größter Not stellst du das Wohl anderer über das eigene Überleben.",
  ordnung: "Du triffst ernsthafte, unnachgiebige Entscheidungen. Struktur und Regeln sind für dich der einzige Anker im Chaos.",
  nutzen: "Du agierst rein pragmatisch und zielgerichtet. Jeder Schritt wird rational abgewogen und Verluste werden kalt kalkuliert.",
};

export const AUSRICHTUNG_NAME: Record<HerkunftArt, string> = {
  gnade: "Gnade",
  ordnung: "Ordnung",
  nutzen: "Nutzen",
};

function zaehle(arten: HerkunftArt[]) {
  const stand = { gnade: 0, ordnung: 0, nutzen: 0 };
  for (const art of arten) stand[art] += 1;
  return stand;
}

function fuehrende(stand: Record<HerkunftArt, number>): HerkunftArt[] {
  const max = Math.max(stand.gnade, stand.ordnung, stand.nutzen);
  return (["gnade", "ordnung", "nutzen"] as HerkunftArt[]).filter((art) => stand[art] === max);
}

export function urteilAusrichtung(arten: HerkunftArt[]): {
  art: HerkunftArt;
  satz: string;
  name: string;
  zwiespalt: boolean;
  stand: Record<HerkunftArt, string>;
} {
  const gesamt = zaehle(arten);
  let fuehrer = fuehrende(gesamt);
  if (fuehrer.length > 1 && arten[9] && fuehrer.includes(arten[9])) {
    fuehrer = [arten[9]];
  }
  if (fuehrer.length > 1) {
    const spaet = zaehle(arten.slice(6, 10));
    const spaetFuehrer = fuehrende(spaet).filter((art) => fuehrer.includes(art));
    if (spaetFuehrer.length === 1) fuehrer = spaetFuehrer;
  }
  if (fuehrer.length === 1) {
    const art = fuehrer[0]!;
    return {
      art,
      satz: SPIEGEL[art],
      name: AUSRICHTUNG_NAME[art],
      zwiespalt: false,
      stand: {
        gnade: `Gnade ${gesamt.gnade}`,
        ordnung: `Ordnung ${gesamt.ordnung}`,
        nutzen: `Nutzen ${gesamt.nutzen}`,
      },
    };
  }
  const erst = fuehrer[0]!;
  const zwei = fuehrer[1]!;
  return {
    art: erst,
    satz: `${SPIEGEL[erst]} Und doch bricht ${AUSRICHTUNG_NAME[zwei]} dagegen: du zählst, wo du hättest teilen sollen, oder teilst, wo du hättest zählen müssen.`,
    name: `Zwiespalt ${AUSRICHTUNG_NAME[erst]}/${AUSRICHTUNG_NAME[zwei]}`,
    zwiespalt: true,
    stand: {
      gnade: `Gnade ${gesamt.gnade}`,
      ordnung: `Ordnung ${gesamt.ordnung}`,
      nutzen: `Nutzen ${gesamt.nutzen}`,
    },
  };
}
