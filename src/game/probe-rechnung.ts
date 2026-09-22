export function probeSumme(wurf: number, attribut: number, zeit: number, nebel: number): number {
  return wurf + attribut + zeit + nebel;
}

export function probeErfolg(summe: number, schwierigkeit: number): boolean {
  return summe >= schwierigkeit;
}
