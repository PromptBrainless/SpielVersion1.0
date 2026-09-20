import { LAGER_CONTENT, LAGER_WEGE } from "../lager-content";
import { ANKUNFT_TEILE } from "./ankunft";
import { karte, QuestSchema, TeilSchema, type QuestJson, type SzeneJson, type TeilJson } from "./schema";

function teil(quest: string, id: string, titel: string, szenen: SzeneJson[]): TeilJson {
  return TeilSchema.parse({ id, titel, quest, datei: `${quest}/${id}.json`, szenen });
}

function quest(id: string, titel: string, reihe: string, teile: TeilJson[]): QuestJson {
  return QuestSchema.parse({ id, titel, reihe, datei: `${id}.json`, teile });
}

const lagerHub: SzeneJson = {
  id: "lager-hub",
  title: LAGER_CONTENT.title,
  art: LAGER_CONTENT.art,
  portrait: "kess",
  lines: LAGER_CONTENT.lines,
  choices: [...LAGER_CONTENT.choices, LAGER_CONTENT.choiceTor],
};

export const QUESTS: QuestJson[] = [
  quest("ankunft", "Ankunft", "Hauptfluss", ANKUNFT_TEILE),
  quest("dorf", "Lindendorf", "Hauptfluss", [
    teil("dorf", "platz", "Dorfplatz", [
      karte("dorf-platz", "Dorfplatz", "village", [
        "Du stehst jetzt mitten in Lindendorf. Der Platz ist klein genug, dass jedes Gespräch einen Zeugen findet.",
        "Vor dir liegen Rathaus, Taverne, Brunnen, die Mühle und der Weg zum Hang.",
        "Aus dem Osten steigt Rauch. Dort liegt der alte Steinbruch.",
      ]),
    ]),
    teil("dorf", "rathaus", "Rathaus", [karte("rathaus", "Rathaus", "townhall", [], ["Weiter"], "holm")]),
    teil("dorf", "taverne", "Taverne", [karte("zum-letzten-fass", "Zum letzten Fass", "tavern", [], ["Weiter"], "mara")]),
    teil("dorf", "handwerk", "Schmiede und Apotheke", [
      karte("schmiede-apotheke", "Schmiede und Apotheke", "village"),
      karte("beim-schmied", "Beim Schmied", "smithy", [], ["Weiter"], "smith"),
      karte("bei-witwe-kern-dorf", "Bei Witwe Kern", "apothecary", [], ["Weiter"], "kern"),
    ]),
  ]),
  quest("brunnen", "Trübes Wasser", "Versorgung", [
    teil("brunnen", "platz", "Brunnenplatz", [
      karte("brunnen-krug", "Der bittere Krug", "well", [
        "Der Wassereimer am Dorfbrunnen steht halb voll, so wie ihn die Nacht zurückgelassen hat, denn niemand hat sich heute Morgen die Mühe gemacht, ihn zu leeren und neu zu füllen, wie es sonst die erste Pflicht des Tages ist, noch vor dem Brot, noch vor dem Vieh. Das Wasser darin hat die falsche Farbe angenommen, ein trübes Graubraun, das eher an aufgewühlten Teichgrund erinnert als an das, was aus der Tiefe der Erde kommen sollte, klar und kalt und ohne Geschichte.",
        "Vor der Apotheke hustet ein Kind, ein trockenes, hartes Husten, das sich anhört, als sitze ihm etwas Falsches in der Brust fest. Die Mutter hält es fester an sich, fester, als das bloße Husten es eigentlich verlangte, mit jener Art von Griff, die weniger dem Kind gilt als der eigenen Angst, die man damit niederhalten will.",
        "Am Brunnenrand steht Ratsherr Dennek und rührt mit einem Stock im Eimer, langsam, im Kreis, immer wieder, als könnte man ein vergiftetes Wasser durch bloßes Rühren wieder klären, so wie man einen Brei glattstreicht, dem nichts mehr fehlt als ein wenig Geduld. Er sieht dabei nicht auf, weder zum Kind noch zur Mutter noch zu irgendwem, der vorbeigeht — als hoffe er, dass die Bewegung seiner Hand genüge, um auch die Fragen im Kreis zu halten, die man ihm sonst stellen würde.",
      ]),
      karte(
        "brunnen-hub",
        "Trübes Wasser",
        "well",
        [
          "Das Wasser im Eimer bleibt trüb bis auf den Grund, gleich wie oft man danach sieht, und es schmeckt nach Eisen, sobald der Wind vom Wald herüberzieht, als trüge er selbst einen Rest der Wahrheit mit sich, die man ihm sonst nirgendwo abringen kann.",
        ],
        [
          "Mit Witwe Kern über das Wasser sprechen",
          "Mit Ratsherr Dennek sprechen",
          "Den Brunnen selbst untersuchen",
          "Den Graben am Brunnenrand verfolgen",
          "Zurück zum Dorfplatz",
        ],
      ),
    ]),
    teil("brunnen", "kern", "Witwe Kern", [karte("bei-witwe-kern", "Bei Witwe Kern", "apothecary", [], ["Weiter"], "kern")]),
    teil("brunnen", "dennek", "Ratsherr Dennek", [karte("ratsherr-dennek", "Ratsherr Dennek", "well")]),
    teil("brunnen", "schacht", "Schacht und Graben", [
      karte("brunnenschacht", "Brunnenschacht", "well"),
      karte("ablaufgraben", "Ablaufgraben", "ditch"),
    ]),
    teil("brunnen", "zisterne", "Grovins Zisterne", [
      karte("an-der-zisterne", "An der Zisterne", "well"),
      karte("grovins-zisterne", "Grovins Zisterne", "well", [], ["Weiter"], "grovin"),
    ]),
    teil("brunnen", "ende", "Ausgänge", [
      karte("zwei-brunnen-ein-dorf", "Zwei Brunnen, ein Dorf", "well", [], ["Weiter"], "kern"),
      karte("wasser-mit-einem-riss", "Wasser mit einem Riss", "well"),
      karte("klares-wasser", "Klares Wasser", "well", [], ["Weiter"], "kern"),
    ]),
  ]),
  quest("muehle", "Die stumme Mühle", "Versorgung", [
    teil("muehle", "mahlwerk", "Mahlwerk", [
      karte("muehle-stumm", "Die stumme Mühle", "mill", [
        "Kein Mehlstaub in der Luft, obwohl das Rad sich dreht.",
        "Vor der Tür lehnt ein leerer Karren, dessen Deichsel schon Moos angesetzt hat.",
        "Bertok steht im Eingang, bevor du klopfen kannst. Seine Hände sind mehlweiß, obwohl seit Tagen nichts gemahlen wurde.",
        "Hinter ihm bewegt sich etwas zwischen den Säcken — zu schnell für eine Ratte.",
      ]),
      karte(
        "muehle-hub",
        "Mühle",
        "mill",
        ["Das Rad schlägt gegen das Wasser und mahlt nichts."],
        [
          "Mit Bertok am Mahlwerk sprechen",
          "Zu Lene in die Kornkammer gehen",
          "Das Wasserrad und den Uferweg ansehen",
          "Die Mühle verlassen",
        ],
        "miller",
      ),
      karte("bertok-am-mahlwerk", "Bertok am Mahlwerk", "mill", [], ["Weiter"], "miller"),
    ]),
    teil("muehle", "kammer", "Kornkammer", [
      karte("kornkammer", "Kornkammer", "mill"),
      karte("lene-in-der-kornkammer", "Lene in der Kornkammer", "mill"),
      karte("hinter-der-nische", "Hinter der Nische", "mill"),
    ]),
    teil("muehle", "ufer", "Ufer und Kontor", [
      karte("wasserrad", "Wasserrad", "mill"),
      karte("uferpfad", "Uferpfad", "ditch"),
      karte("morscher-steg", "Morscher Steg", "ditch"),
      karte("lagerhaus-am-fluss", "Lagerhaus am Fluss", "mill"),
      karte("renniks-kontor", "Renniks Kontor", "mill"),
    ]),
    teil("muehle", "ende", "Ausgänge", [
      karte("sicheres-mehl-leere-blicke", "Sicheres Mehl, leere Blicke", "mill", [], ["Weiter"], "holm"),
      karte("mehl-mit-rauen-haenden", "Mehl mit rauen Händen", "mill"),
      karte("stilles-mehl", "Stilles Mehl", "mill", [], ["Weiter"], "miller"),
    ]),
  ]),
  quest("gasse", "Das Kesseljahr", "Erinnerung", [
    teil("gasse", "kirche", "Kirche und Fenn", [
      karte("gasse-kirche", "Vor der Kirche", "chapel"),
      karte(
        "gasse-hub",
        "Die leere Gasse",
        "gate",
        [],
        ["Bei Fenn an der Kirchmauer bleiben", "Ratsherr Vahl im Rathaus aufsuchen", "Die Gasse hinter der Gerberei ansehen", "Zurück zum Dorfplatz"],
      ),
      karte("fenn", "Fenn", "chapel"),
      karte("fenn-an-der-kirchmauer", "Fenn an der Kirchmauer", "chapel"),
      karte("vahls-stube", "Vahls Stube", "townhall"),
      karte("ratsherr-vahl", "Ratsherr Vahl", "townhall"),
    ]),
    teil("gasse", "ort", "Gerbereigasse", [karte("gerbereigasse", "Gerbereigasse", "gate")]),
    teil("gasse", "grete", "Grete", [
      karte("gretes-kate", "Gretes Kate", "village"),
      karte("grete", "Grete", "village"),
    ]),
    teil("gasse", "gewoelbe", "Gewölbe", [
      karte("kirchengewoelbe", "Kirchengewölbe", "chapel"),
      karte("unter-der-kirche", "Unter der Kirche", "chapel"),
      karte("im-gewoelbe", "Im Gewölbe", "chapel"),
      karte("hinter-dem-stein", "Hinter dem Stein", "chapel"),
    ]),
    teil("gasse", "schluss", "Ausgänge", [
      karte("vahls-stube-abend", "Vahls Stube, Abend", "townhall"),
      karte("was-die-liste-wiegt", "Was die Liste wiegt", "townhall"),
      karte("ein-zweites-schweigen", "Ein zweites Schweigen", "gate"),
      karte("was-ausgegraben-bleibt", "Was ausgegraben bleibt", "chapel"),
      karte("ein-name-unter-vielen", "Ein Name unter vielen", "village"),
      karte("stille-rechnung", "Stille Rechnung", "village"),
    ]),
  ]),
  quest("wald", "Hang und Wald", "Hauptfluss", [
    teil("wald", "glockenweg", "Alter Glockenweg", [
      karte("glockenweg", "Alter Glockenweg", "chapel"),
      karte("sanna-die-botin", "Sanna, die Botin", "chapel", [], ["Weiter"], "sanna"),
      karte("jorren-im-geroell", "Jorren im Geröll", "chapel"),
      karte("die-kapellenglocke", "Die Kapellenglocke", "chapel"),
    ]),
    teil("wald", "wald", "Wald", [karte("wald", "Wald", "forest")]),
  ]),
  quest("lager", "Banditenlager", "Hauptfluss", [
    teil("lager", "hub", "Steinbruch", [lagerHub]),
    teil("lager", "schleich", "Schleichen", [
      karte("lager-schleich", "Schleichen", "sneak", LAGER_WEGE.schleich.erfolg, [...LAGER_WEGE.schleich.choicesWeiter]),
    ]),
    teil("lager", "reden", "Reden", [
      karte("lager-reden", LAGER_WEGE.reden.title, "camp", LAGER_WEGE.reden.lines, [...LAGER_WEGE.reden.choices], "kess"),
    ]),
    teil("lager", "kampf", "Kampf", [
      karte("lager-kampf", LAGER_WEGE.kampf.title, "combat", LAGER_WEGE.kampf.auf),
    ]),
    teil("lager", "tor", "Seitentor", [
      karte("lager-tor", LAGER_WEGE.tor.title, "gate", LAGER_WEGE.tor.lines, [...LAGER_WEGE.tor.choices]),
    ]),
  ]),
  quest("ende", "Ende", "Hauptfluss", [
    teil("ende", "ende", "Ende", [karte("ende", "Ende", "return")]),
  ]),
];

const SZENE_INDEX = new Map<string, { szene: SzeneJson; teil: TeilJson; quest: QuestJson }>();
const TITEL_INDEX = new Map<string, { szene: SzeneJson; teil: TeilJson; quest: QuestJson }>();

for (const questItem of QUESTS) {
  for (const teilItem of questItem.teile) {
    for (const szene of teilItem.szenen) {
      SZENE_INDEX.set(szene.id, { szene, teil: teilItem, quest: questItem });
      TITEL_INDEX.set(szene.title, { szene, teil: teilItem, quest: questItem });
    }
  }
}

export function fundFuerSzene(id?: string, titel?: string) {
  if (id && SZENE_INDEX.has(id)) return SZENE_INDEX.get(id)!;
  if (titel && TITEL_INDEX.has(titel)) return TITEL_INDEX.get(titel)!;
  return null;
}

export function jsonDerSzene(id?: string, titel?: string) {
  const fund = fundFuerSzene(id, titel);
  return fund ? JSON.stringify(fund.szene, null, 2) : null;
}

export function jsonDesTeils(id?: string, titel?: string) {
  const fund = fundFuerSzene(id, titel);
  return fund ? JSON.stringify(fund.teil, null, 2) : null;
}

export function jsonDerQuest(id?: string, titel?: string) {
  const fund = fundFuerSzene(id, titel);
  return fund ? JSON.stringify(fund.quest, null, 2) : null;
}

export function exportiereAlleQuests() {
  return QUESTS.map((item) => ({
    datei: item.datei,
    inhalt: JSON.stringify(item, null, 2),
    teile: item.teile.map((teilItem) => ({ datei: teilItem.datei, inhalt: JSON.stringify(teilItem, null, 2) })),
  }));
}
