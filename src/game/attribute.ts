export const ATTRIBUT = {
  staerke: { id: "staerke", name: "Stärke", kurz: "ST" },
  geschick: { id: "geschick", name: "Geschicklichkeit", kurz: "GE" },
  charisma: { id: "charisma", name: "Charisma", kurz: "CH" },
} as const;

export type AttributId = keyof typeof ATTRIBUT;
export type AttributKurz = (typeof ATTRIBUT)[AttributId]["kurz"];

export function attributId(name: string): AttributId {
  const n = name.trim().toLowerCase();
  if (n.startsWith("stär") || n === "st" || n === "staerke") return "staerke";
  if (n.startsWith("gesch") || n === "ge" || n === "geschicklichkeit") return "geschick";
  return "charisma";
}

export function attributName(name: string): string {
  return ATTRIBUT[attributId(name)].name;
}

export function attributKurz(name: string): AttributKurz {
  return ATTRIBUT[attributId(name)].kurz;
}
