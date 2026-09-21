/** Was auf den Kartenbildern wirklich zu sehen ist — nur für diese eine Karte, nicht als Weltkatalog. */
export const ART_SICHT: Record<string, string> = {
  title: "Nebelwald, nasse Stämme.",
  road: "Schmaler Waldweg, hängendes Moos, nasser Stein.",
  stranger: "Ein magerer Mann auf dem Pfad, nasser Mantel.",
  village: "Siedlung am Wasser in der Dämmerung: Fachwerk, Mühlrad.",
  townhall: "Holzvertäfeltes Kontor, Kerzen, Papiere.",
  tavern: "Innenraum mit Fässern, Feuer, nassem Holz.",
  well: "Steinbrunnen, holzerner Eimer mit trübem Wasser, Frau und Kind im Hintergrund.",
  mill: "Steinmühle am Fluss, großes Wasserrad.",
  apothecary: "Kräuterstube, Gläser, Mörser, getrocknete Bündel.",
  smithy: "Esse, Glut, Amboss, Rauch.",
  forest: "Dichter Waldweg, Stämme, Nebel.",
  ditch: "Bemooster Waldweg, nasse Erde.",
  chapel: "Steinkapelle im Wald, Dämmerung, nasses Dach.",
  camp: "Lager in einem Steinbruch, Feuer, Zelte.",
  evidence: "Alte Bücher, lose Blätter, Kerzenlicht.",
  sneak: "Gestalt im Waldmantel zwischen Stämmen.",
  combat: "Gestalt im Wald.",
  gate: "Steinerner Torbogen, nasser Durchgang.",
  death: "Einsame Gestalt im Nebelwald.",
  return: "Gestalt im Nebelwald, der Weg führt fort.",
};

const STIMME = `Lindendorf. How to be a Hero. Du-Erzählung, Präsens.

Ton: hart, düster, körperlich. Schöne Sätze mit hässlichen Dingen. Geruch, Kälte, Gewicht. Kein Pathos, kein Schicksal, kein „In einer Welt“, kein Emoji.

Nur diese eine Seite. Nur dieser eine Moment. Keine Nachbarszenen. Keine anderen Orte, keine anderen Figuren, keine Quest-Handlung, die nicht im Ausgangstext steht. Keine Namen, die nicht im Ausgangstext vorkommen.

Du erweiterst, indem du denselben Ort, dieselben Leute, dieselben Gegenstände genauer beschreibst — nicht indem du Welt dazu holst. Stichpunkte sind verboten. Jeder Absatz ist Prosa. Dialog in Anführungszeichen „…“, knapp.

Was im Ausgangstext geschieht, bleibt. Du kürzt nicht. Du trägst nichts aus Rathaus, Taverne, Mühle, Brunnen, Lager, Gasse oder Wald nach, wenn es hier nicht schon steht.`;

export const GROK_STIMME = `${STIMME}

Auftrag: nur den vorgelegten Text dieser Seite in voller Form zurückgeben. Mehr Dichte auf demselben Fleck. Kein Beispiel aus einer anderen Szene nachahmen.

Ausgabe nur JSON:
{"text":"der erweiterte Text, Absätze mit Leerzeile getrennt"}`;

export const GROK_HILFE = GROK_STIMME;

export const GROK_SZENE = `${STIMME}

Auftrag: nur die offene Szene als JSON. lines erweitern auf diesem Ort. Gleiche Handlung, gleiche Wahlen. Keine neuen Felder. Keine Nachbarn einarbeiten.

Ausgabe nur das Szenen-JSON.`;
