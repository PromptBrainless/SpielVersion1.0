import { KNOWLEDGE_META, deriveKnowledge, knowledgeLabels, type KnowledgeKey } from "./knowledge";
import type { ArtKey, Held } from "./types";

export type WissenTafel = {
  id: string;
  title: string;
  art: ArtKey;
  offen: boolean;
  lines: string[];
};

const ART_FUER = {
  material: "evidence",
  sozial: "townhall",
  ort: "village",
  übernatürlich: "chapel",
} as const satisfies Record<string, ArtKey>;

const INNERES: Record<KnowledgeKey, string[]> = {
  dorf_ankunft: [
    "Du bist angekommen. Der Platz ist klein genug, dass jedes Gespräch einen Zeugen findet, und groß genug, dass niemand zugeben muss, hingehört zu haben.",
    "Die Dächer tropfen noch. Das Wasser sucht sich die Rillen zwischen den Steinen und nimmt Stroh, Asche und etwas Dunkles mit, das niemand benennt.",
  ],
  artefakt_gesehen: [
    "Am Weg lag Silber. Kein Schmuck, kein Lohn. Ein Kirchenzeichen, kalt, als hätte es lange in einem Schatten gelegen, den die Sonne nicht erreicht.",
    "Du weißt noch nicht, wem es gehört. Du weißt nur, dass Lindendorf solche Dinge nicht verliert, ohne dass jemand die Lücke spürt.",
  ],
  artefakt_erhalten: [
    "Das Silber liegt bei dir. Es wärmt sich nicht an der Hand. Es bleibt bei der Temperatur des Steins, aus dem es genommen wurde.",
    "In Lindendorf wird jemand wissen, woher es stammt. Du trägst die Frage, bevor du sie stellen kannst.",
  ],
  holm_besucht: [
    "Im Rathaus riecht es nach nassem Tuch und altem Wachs. Holm spricht, als zähle jedes Wort, das den Raum verlässt, gegen ihn.",
    "Du warst dort. Der Auftrag, wenn er kommt, kommt nicht als Bitte. Er kommt als Gewicht, das er dir in die Hand legt, damit es nicht in seiner bleibt.",
  ],
  auftrag_erhalten: [
    "Holm hat dir den Auftrag gegeben. Banditen im Steinbruch. Rauch im Osten. Das Dorf soll schlafen können, ohne an die Glocke zu denken.",
    "Er hat nicht gesagt, was er selbst schuldet. Aufträge dieser Art enthalten immer eine zweite Rechnung.",
  ],
  banditen_bekannt: [
    "Im Steinbruch sitzen Leute, die nicht mahlen und nicht säen. Der Rauch dort ist kein Herdfeuer.",
    "Du kannst so tun, als wüsstest du es nicht. Der Osten tut das nicht.",
  ],
  rotes_siegel_gesehen: [
    "Rotes Wachs, gebrochen. Nicht das Siegel, das Holm auf Briefe drückt, wenn er höflich sein will.",
    "Unter dem Bruch liegt eine zweite Schicht, älter, dunkler. Jemand hat ein Siegel auf ein Siegel gesetzt und gehofft, dass niemand darunter greift.",
  ],
  hang_hinweis: [
    "Der Hang über dem Dorf trägt eine Spur. Nicht eine, die man einem Kind erklärt. Eine, die man mit den Augen verfolgt, bis der Atem kürzer wird.",
    "Oben hängt eine Glocke. Unten tun die Leute, als gehöre sie zum Wetter.",
  ],
  glockenweg_bekannt: [
    "Der alte Glockenweg ist kein Gerücht mehr. Die Stufen sind aus verschiedenen Steinen gesetzt. Einige tragen Meißelspuren, andere Flecken, die der Regen nicht aus dem porösen Gestein bekommt.",
    "Du weißt jetzt, wohin man steigt, wenn man etwas tragen will, das unten nicht gesehen werden soll.",
  ],
  glocke_vorteil: [
    "Die Glocke am Hang bleibt still. Wer im Steinbruch auf ein Zeichen wartet, wartet umsonst.",
    "Stille ist hier keine Gnade. Sie ist ein Vorsprung, den du bezahlt hast, bevor der erste Schlag fällt.",
  ],
  banditen_gewarnt: [
    "Sie wissen, dass jemand kommt. Nicht wer. Nur dass der Weg nicht mehr leer ist.",
    "Eine Vorwarnung spart Blut auf einer Seite und kostet es auf der anderen. Du hast die Seite gewählt, ohne den Preis aufzuschreiben.",
  ],
  muehle_stillstand: [
    "Das Rad schlägt gegen das Wasser und mahlt nichts. Mehlstaub fehlt in der Luft, obwohl die Hände der Müller weiß sind.",
    "Mühlen stehen nicht still, weil das Wasser fehlt. Sie stehen still, weil jemand das Mehl woanders haben will.",
  ],
  renniks_druck: [
    "Am Ufer steht ein Mann, der Getreide wiegt, das nicht seines ist. Er hat einen Wächter, der auf Geräusche wartet, nicht auf Gründe.",
    "Bertok nennt den Namen nicht. Der Blick zum Fluss genügt. Schulden haben Hände.",
  ],
  fluechtlinge_muehle: [
    "Hinter der Nische in der Kornkammer atmet es. Nicht Mehl. Menschen. Lenes Schwester. Kinder, die gelernt haben, nicht zu husten, wenn draußen gezählt wird.",
    "Du kannst so tun, als hättest du Säcke gesehen. Die Wand klingt hohl, und du bist kein Narr.",
  ],
  wasser_truebung: [
    "Der Eimer am Brunnen hat die falsche Farbe. Graubraun, wie aufgewühlter Teichgrund. Die Kinder husten zuerst, dann die Alten.",
    "Kern sagt, jemand habe den Brunnen angefasst. Dennek rührt im Kreis, als ließe sich die Frage glattstreichen.",
  ],
  grovin_zisterne: [
    "Außerhalb des Dorfes, wo der Graben im Gestrüpp endet, hält jemand Wasser fest, das klarer ist als alles, was der Platz noch zu bieten hat.",
    "Grovin hat den Brunnen gebaut. Das Dorf hat ihn nicht bezahlt. Das Wasser nimmt sich, was ihm zusteht, und er hilft nach.",
  ],
  dennek_schuld: [
    "Dennek hat Grovin nie bezahlt. Der Stock im Eimer meidet immer dieselbe Fuge. Frischer Mörtel, ein Ablauf, ein Mann, der das Dorf vor der Wahrheit rührt.",
    "Du kannst ihn an die Mauer drücken. Die Schuld bleibt, wo sie war: zwischen Rat und Brunnenbauer.",
  ],
  versorgung_muster: [
    "Mehl und Wasser. Zwei Türen, dieselbe Handschrift. Einer nimmt, was das Tal braucht, und lässt genug übrig, dass niemand laut wird, bevor es zu spät ist.",
    "Du siehst das Muster erst, wenn du beide Schulden in derselben Tasche trägst.",
  ],
  gasse_leer: [
    "Hinter der Gerberei liegt eine Gasse, die niemand mehr als Weg benutzt. Die Bretter an den Fenstern sind älter als die Ausreden, warum niemand dort wohnt.",
    "Fenn hält ein Stück Lattenzaun in der Tasche, glatt wie ein Kiesel. Er wartet nicht auf eine Antwort.",
  ],
  kesseljahr: [
    "Im Kesseljahr wurde die Gasse abgeriegelt. Nicht wegen einer Seuche, die einen Namen verdient hätte. Wegen einer Rechnung, die der Rat nicht in der Kasse stehen lassen wollte.",
    "Vahl will bauen, als wäre da nie etwas gewesen. Die Mauer unter der Kirche erinnert sich genauer.",
  ],
  ilses_liste: [
    "Ilse Brandtner hat die Toten des Kesseljahrs unter der Kirche versteckt. Nicht die Körper. Die Namen. Damit jemand, der später kommt, nicht so tun kann, als hätte das Tal niemanden verloren.",
    "Die Liste wiegt wenig in der Hand und viel, sobald sie den Raum verlässt.",
  ],
};

export function wissenTafeln(held: Held): WissenTafel[] {
  const wissen = deriveKnowledge(held);
  const labels = knowledgeLabels(held);
  const tafeln: WissenTafel[] = [];
  for (const key of wissen) {
    const meta = KNOWLEDGE_META[key];
    tafeln.push({
      id: key,
      title: meta.label,
      art: ART_FUER[meta.typ],
      offen: false,
      lines: INNERES[key],
    });
  }
  labels.offen.forEach((frage, index) => {
    tafeln.push({
      id: `offen-${index}`,
      title: "Was offen bleibt",
      art: "evidence",
      offen: true,
      lines: [
        frage,
        "Du hast darauf noch keine Antwort, die vor einem Zeugen bestehen würde. Die Frage selbst bleibt. Sie legt sich an den Rand des nächsten Gesprächs und wartet, bis jemand den Satz zu Ende spricht.",
      ],
    });
  });
  return tafeln;
}
