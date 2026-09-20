import { z } from "zod";
import { exportiereModul } from "./export-modul";

const Lines = z.array(z.string().min(1)).min(1);

export const LagerHubSchema = z.object({
  id: z.literal("lager-steinbruch"),
  title: z.string(),
  art: z.literal("camp"),
  lines: Lines,
  gewarnt: z.string(),
  unbemerkt: z.string(),
  schluessel: z.string(),
  nachspiel: Lines,
  choices: z.tuple([z.string(), z.string(), z.string()]),
  choiceTor: z.string(),
});

export const LagerWegeSchema = z.object({
  schleich: z.object({
    extraMara: z.string(),
    extraGlocke: z.string(),
    extraWunde: z.string(),
    erfolg: Lines,
    fehlschlag: Lines,
    weiter: z.string(),
    choicesWeiter: z.tuple([z.string(), z.string()]),
  }),
  reden: z.object({
    title: z.string(),
    lines: Lines,
    gast: z.string(),
    choices: z.tuple([z.string(), z.string(), z.string()]),
    drohenErfolg: Lines,
    drohenFail: Lines,
    handelFrage: z.string(),
    handelZahlen: z.string(),
    handelNicht: z.string(),
    handelErfolg: Lines,
    handelKeinGold: z.string(),
    handelTheater: z.string(),
    luegeErfolg: Lines,
    luegeFail: z.string(),
  }),
  kampf: z.object({
    title: z.string(),
    auf: Lines,
    ersterErfolg: z.string(),
    ersterFail: z.string(),
    sieg: Lines,
    taumeln: z.string(),
    fluchtErfolg: Lines,
    fluchtFail: Lines,
  }),
  tor: z.object({
    title: z.string(),
    lines: Lines,
    choices: z.tuple([z.string(), z.string(), z.string()]),
    beuteErfolg: Lines,
    beuteFail: z.string(),
    zelteErfolg: Lines,
    kessErfolg: Lines,
  }),
});

export const LAGER_CONTENT = LagerHubSchema.parse({
  id: "lager-steinbruch",
  title: "Banditenlager",
  art: "camp",
  lines: [
    "Der Steinbruch ist eine Wunde im Hügel.",
    "Drei Zelte. Ein Feuer. Eine Kiste mit dem Siegel der Kirche von Lindendorf.",
    "Ein Mann mit einer Narbe über der Lippe — das wird Kess sein — würfelt mit zwei anderen.",
    "Ein vierter steht oben auf dem Felsen und schaut den Weg entlang, den du gekommen bist.",
    "Die Felswand trägt noch die schwarzen Streifen der alten Sprengungen. Zwischen ihnen wachsen dünne weiße Pilze, die im Feuerlicht wie Zähne aussehen.",
    "Neben der Kiste liegt ein Kinderumhang. Er ist zu klein für jeden Menschen hier. Niemand tritt darauf. Niemand hebt ihn auf.",
    "Kess würfelt mit zwei stumpfen Knochen. Einer der Männer lacht zu laut. Der andere hält die Hand auf der Tasche, in der vermutlich das Geld liegt, das dem Dorf fehlt.",
  ],
  gewarnt: "Die Würfelpause ist zu kurz. Kess hebt den Kopf. „Na. Der Gast aus der Taverne.“",
  unbemerkt: "Noch sitzen sie. Noch ist der Posten oben gelangweilt.",
  schluessel: "An der Felsschräge sitzt ein altes Gittertor. Dein Schlüssel juckt im Beutel.",
  nachspiel: [
    "Das Feuer brennt noch. Die Kiste der Kirche ist leichter, als sie aussieht.",
    "Unter dem Silber liegen Listen mit Namen, Mengen und Tagen. Manche Namen kennst du aus dem Dorf. Neben anderen steht nur ein Kreuz.",
    "Im letzten Zelt findest du keine Schätze. Nur feuchte Decken, Salzkrusten an einem Topf und vier Paar Stiefel, die länger halten sollen als ihre Besitzer.",
    "Der Steinbruch wird still. Nicht friedlich. Nur leer genug, dass du dein eigenes Atmen wieder hörst.",
  ],
  choices: ["Anschleichen (Geschick)", "Heraustreten und reden (Charisma)", "Angreifen (Stärke)"],
  choiceTor: "Mit dem Schlüssel das Seitentor nutzen",
});

export const LAGER_WEGE = LagerWegeSchema.parse({
  schleich: {
    extraMara: "Mara hat dir den schmalen Pfad hinter der Taverne gezeigt. Der Umweg kostet weniger als ein Fehler.",
    extraGlocke: "Die Kapelle bleibt still. Ein Warnsignal fehlt.",
    extraWunde: "Die Wunde zerrt. Schleichen mit einem Hinken ist ein Widerspruch.",
    erfolg: [
      "Du nimmst das Kirchensilber, zwei Säcke Getreide markierst du dir nur im Kopf.",
      "Kess würfelt eine Acht und flucht über das Glück, das nicht seines ist.",
      "Du bist schon im Gestrüpp, als der Posten endlich blinzelt.",
      "Die Kiste ist schwerer, sobald du sie trägst. Nicht wegen des Silbers, sondern wegen der Namen, die in Lindendorf daran hängen.",
      "Hinter dir lacht einer der Männer über einen schlechten Wurf. Er weiß noch nicht, dass der Einsatz bereits verschwunden ist.",
    ],
    fehlschlag: [
      "Ein Stein. Ein Fluch. Drei Köpfe drehen sich.",
      "Der Posten reißt den Speer hoch. Kess stößt den Würfel mit dem Handrücken vom Tisch, und die Männer bewegen sich, bevor er einen Befehl gibt.",
      "Du bist nicht mehr Teil des Schattens. Du bist der Grund, warum er jetzt voller Klingen ist.",
    ],
    weiter: "Jetzt bleibt Reden oder Schlagen.",
    choicesWeiter: ["Jetzt reden", "Jetzt kämpfen"],
  },
  reden: {
    title: "Banditenlager",
    lines: [
      "Kess hat eine Stimme wie ein stumpfer Säbel.",
      "„Lindendorf schickt keine Wache. Lindendorf schickt... dich.“",
      "Er spricht deinen Namen nicht aus. Er hat ihn vielleicht nie gehört. Trotzdem liegt in seiner Pause die Art von Sicherheit, die Menschen nur zeigen, wenn sie vorbereitet sind.",
      "Hinter ihm brennt das Feuer niedrig. Im Rauch hängt der Geruch von nassem Leder und gekochtem Knochen.",
    ],
    gast: "Du erinnerst dich an den Satz aus der Taverne. Kess würfelt nicht. Noch nicht.",
    choices: [
      "Drohen: Das Dorf hat genug (Charisma)",
      "Handel: Abzug gegen Gold und eine Nacht Vorsprung",
      "Lügen: Hinter dir kommt die Stadtwache",
    ],
    drohenErfolg: [
      "Kess sieht deine Augen länger an als dein Schwert.",
      "„Packen. Bevor ich es mir anders überlege.“",
      "Sie lassen die Kirchenkiste. Mehr Großmut steckt nicht in diesem Steinbruch.",
      "Kess nimmt den stumpfen Würfel vom Boden und schiebt ihn mit dem Stiefel ins Feuer. „Das Dorf hat euch geschickt“, sagt er. „Aber das, was hier passiert, hat längst angefangen.“",
      "Die Männer lösen ihre Hände von den Waffen. Nicht aus Vertrauen. Aus Müdigkeit und weil du ihnen einen Moment gegeben hast, in dem niemand zuerst schlagen musste.",
    ],
    drohenFail: ["Lachen. Kurzes Lachen. Dann Stahl."],
    handelFrage: "Kess will {preis} Gold, sofort, und dass du den Mund hältst.",
    handelZahlen: "{preis} Gold zahlen",
    handelNicht: "Nicht zahlen",
    handelErfolg: [
      "Du zahlst {preis} Gold. Die Kiste bleibt — leer genug, voll genug.",
      "Kess nickt. Das ist kein Frieden. Das ist eine Pause mit Preis.",
      "Er zählt die Münzen nicht. Er beißt nur in eine, legt sie auf die Zunge und spuckt sie wieder aus. „Münzen halten länger als Männer“, sagt er.",
      "Als du gehst, hörst du hinter dir das Scharren von Stiefeln. Niemand folgt dir. Noch nicht.",
    ],
    handelKeinGold: "Ohne Münzen ist Handel nur Theater.",
    handelTheater: "Ohne Münzen ist Handel nur Theater. Theater endet hier mit Messern.",
    luegeErfolg: [
      "Kess glaubt nicht an Helden. Er glaubt an Galgen.",
      "In zehn Atemzügen ist das Lager halb leer. Die Kiste bleibt, weil sie schwer ist.",
      "Er hebt die Hand, und die Männer sehen zuerst zu ihm, dann zum Grat. Einer flucht. Einer rennt. Kess bleibt stehen, bis du weit genug weg bist, um nicht mehr zurückzuschlagen.",
      "Du weißt nicht, ob er dir geglaubt hat. Du weißt nur, dass er die Angst besser kennt als du.",
    ],
    luegeFail: "„Die Wache. Natürlich. Und ich bin der Bischof.“",
  },
  kampf: {
    title: "Steinbruch",
    auf: [
      "Kein Duell. Ein Gedränge aus Stahl, Feuerlicht und schlechtem Boden.",
      "Der erste Schlag trifft nicht dort, wo du ihn erwartest. Jemand rutscht im Schlamm aus, ein Zelt kippt, und plötzlich kämpfen alle in einem Raum, der für keinen von euch groß genug ist.",
      "Kess trägt kein Wappen. Er trägt eine Narbe, einen stumpfen Säbel und die Gewissheit, dass derjenige gewinnt, der nach dem Lärm noch zählen kann.",
      "Hinter dir steht die Kirchenkiste. Vor dir stehen Männer, die wissen, dass sie ohne sie nichts mehr haben, was ein Dorf zurückkaufen würde.",
    ],
    ersterErfolg: "Der erste geht zu Boden. Die anderen zögern — das ist mehr wert als Blut.",
    ersterFail: "Du bleibst stehen, weil Hinfallen hier das Ende wäre.",
    sieg: [
      "Kess flieht nicht wie ein Anführer, sondern wie ein Mann, der zählen kann.",
      "Zwei bleiben liegen. Einer stöhnt. Das Lager gehört dem Rauch und dir.",
      "Du siehst Kess am Rand des Steinbruchs verschwinden. Er blickt nicht zurück. Auf dem Boden bleibt sein Würfel liegen, die abgeschabte Acht nach oben.",
      "Der Sieg riecht nach Eisen, nassem Holz und etwas Süßlichem, das du nicht benennen willst.",
      "Als der Lärm endet, hörst du Wasser von der Felswand tropfen. Der Steinbruch hat schon vor euch Geräusche verschluckt. Er wird auch diese behalten.",
    ],
    taumeln: "Du reißt dir die Kirchenkiste unter den Arm und taumelst in den Wald.",
    fluchtErfolg: [
      "Sie folgen nicht weit. Verwundete Jäger sind schlechte Jäger.",
      "Die Kiste schlägt bei jedem Schritt gegen deine Hüfte. Im Inneren klirrt das Silber der Kirche, unversehrt und gleichgültig.",
      "Hinter dir ruft Kess einen Namen. Du weißt nicht, ob er einen seiner Männer meint oder dich.",
    ],
    fluchtFail: [
      "Die Kiste bleibt im Farn. Du behältst dein Leben, nicht den Auftrag.",
      "Hinter dir lacht jemand, dem das reicht.",
    ],
  },
  tor: {
    title: "Seitentor",
    lines: [
      "Der Schlüssel dreht sich schwer. Rost redet mit, gibt aber nach.",
      "Du kommst hinter dem Holzstapel raus — näher an der Kiste als am Feuer.",
      "Der Gang hinter dem Tor ist niedrig und riecht nach Moder. An der Wand stehen Zahlen, mit Kreide geschrieben und immer wieder durchgestrichen.",
      "Unter deinen Stiefeln liegen alte Lederriemen und ein verrosteter Meißel. Der Steinbruch war einmal ein Arbeitsplatz. Das Lager hat nur gelernt, seine Knochen zu benutzen.",
      "Durch die Spalten des Holzstapels siehst du Kess am Feuer. Er würfelt nicht mehr. Er wartet.",
    ],
    choices: [
      "Nur die Beute nehmen und verschwinden (Geschick, leicht)",
      "Die Seile der Zelte kappen und Chaos nutzen (Geschick, mittel)",
      "Kess von hinten stellen (Stärke, mittel)",
    ],
    beuteErfolg: [
      "Kein Heldenepos. Eine offene Tür und ein geschlossener Mund.",
      "Du schiebst die Kiste durch den niedrigen Gang. Das Holz kratzt über Stein, doch das Feuer knackt im selben Augenblick laut genug.",
      "Als du das Tor wieder schließt, bleibt der Schlüssel innen stecken. Manche Wege benutzt man nur einmal.",
    ],
    beuteFail: "Die Kiste schabt über Stein. Kess hört das.",
    zelteErfolg: [
      "Stoff stürzt, Glut springt, Männer fluchen auf das Wetter und auf dich.",
      "Ein Zelt fällt über den Vorratstisch. Die Knochenwürfel verschwinden im Schlamm, und für einen Atemzug weiß niemand mehr, wo die Gefahr steht.",
      "Du nutzt diesen Atemzug. Im Steinbruch ist Zeit das einzige Gut, das niemand zurückfordern kann.",
    ],
    kessErfolg: [
      "Kess ist ein Schwätzer. Schwätzer drehen sich zu langsam um.",
      "Die anderen rennen, als ihr Anführer kniet.",
      "Sein Säbel fällt in den Staub. Kess hebt beide Hände, aber sein Blick sucht noch immer nach einer Rechnung, die dich lebend aus diesem Lager bringt.",
      "„Wenn du mich tötest, wird Lindendorf nicht voller“, sagt er. Du weißt, dass das stimmt. Es macht die Entscheidung nicht leichter.",
    ],
  },
});

export function mitPreis(text: string, preis: number): string {
  return text.replaceAll("{preis}", String(preis));
}

export function exportiereLager() {
  return exportiereModul("lager-steinbruch.json", LagerHubSchema, LAGER_CONTENT);
}

export function exportiereLagerWege() {
  return exportiereModul("lager-wege.json", LagerWegeSchema, LAGER_WEGE);
}
