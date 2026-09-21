const KEY = "lindendorf.leiter.frei";
const PASSWORT = "1234";

export function leiterFrei(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}

export function merkeLeiterFrei() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, "1");
}

export function pruefeLeiterPasswort(eingabe: string): boolean {
  if (eingabe.trim() !== PASSWORT) return false;
  merkeLeiterFrei();
  return true;
}
