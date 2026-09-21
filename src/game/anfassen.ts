export type AnfassAdresse =
  | { feld: "titel" }
  | { feld: "zeile"; index: number }
  | { feld: "wahl"; index: number }
  | { feld: "hintergrund" }
  | { feld: "portrait" };

export function adresseZuText(a: AnfassAdresse): string {
  switch (a.feld) {
    case "titel":
      return "Titel";
    case "zeile":
      return `Zeile ${a.index + 1}`;
    case "wahl":
      return `Wahl ${a.index + 1}`;
    case "hintergrund":
      return "Hintergrund";
    case "portrait":
      return "Porträt";
  }
}
