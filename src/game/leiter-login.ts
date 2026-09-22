const KEY = "lindendorf.leiter.frei";

export function leiterFrei(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}

export function merkeLeiterFrei() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, "1");
}

export function schliesseLeiterSitzung() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
