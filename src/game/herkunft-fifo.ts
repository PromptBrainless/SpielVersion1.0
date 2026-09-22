export function zustandFifo<T>(bisher: T[], ids: T[], max = 3): T[] {
  let next = [...bisher];
  for (const id of ids) {
    next = next.filter((item) => item !== id);
    next.push(id);
    while (next.length > max) next.shift();
  }
  return next;
}

export function klemme(n: number, min = 4, max = 10) {
  return Math.max(min, Math.min(max, n));
}

export function goldNieNegativ(gold: number, delta: number) {
  return Math.max(0, gold + delta);
}
