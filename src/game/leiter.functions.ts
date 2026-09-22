import { createServerFn } from "@tanstack/react-start";

function innerOf(input: unknown): Record<string, unknown> {
  const rec = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  if (rec.data && typeof rec.data === "object" && !Array.isArray(rec.data)) {
    return rec.data as Record<string, unknown>;
  }
  return rec;
}

export const oeffneLeiterSitzung = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const inner = innerOf(input);
    return { passwort: String(inner.passwort ?? "").slice(0, 80) };
  })
  .handler(async ({ data }) => {
    const erwartet = String(process.env.LEITER_PASSWORT ?? "1234");
    if (!data.passwort || data.passwort !== erwartet) return { ok: false as const };
    return { ok: true as const };
  });
