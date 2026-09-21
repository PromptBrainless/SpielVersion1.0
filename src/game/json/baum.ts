import { LAGER_CONTENT, LAGER_WEGE } from "../lager-content";
import { ANKUNFT_TEILE } from "./ankunft";
import kiAuflagen from "./ki-auflagen.json";
import { karte, QuestSchema, TeilSchema, type QuestJson, type SzeneJson, type TeilJson } from "./schema";
import { VOLLTEXTE, type Volltext } from "./volltexte";

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

export const QUESTS_ROH: QuestJson[] = [
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
        "Der Wassereimer am Dorfbrunnen steht noch halb voll von der Nacht. Niemand hat sich heute Morgen die Mühe gemacht, ihn zu leeren und neu zu füllen — nicht vor dem Brot, nicht vor dem Vieh.",
        "Das Wasser hat die falsche Farbe: ein trübes Graubraun, wie aufgewühlter Teichgrund statt klarer, kalter Tiefe ohne Geschichte.",
        "Vor der Apotheke hustet ein Kind, trocken und hart, als sitze ihm etwas Falsches in der Brust fest. Die Mutter hält es fester, als das bloße Husten verlangt — mit einem Griff, der weniger dem Kind gilt als der eigenen Angst.",
        "Am Brunnenrand steht Ratsherr Dennek und rührt mit einem Stock im Eimer. Langsam. Im Kreis. Als ließe sich vergiftetes Wasser klären wie ein Brei, dem nur noch Geduld fehlt.",
        "Er sieht dabei niemanden an — weder das Kind noch die Mutter noch die Vorübergehenden. Als hoffe er, dass die Bewegung seiner Hand auch die Fragen im Kreis hält.",
      ]),
      karte(
        "brunnen-hub",
        "Trübes Wasser",
        "well",
        [
          "Das Wasser im Eimer bleibt trüb bis auf den Grund. Sobald der Wind vom Wald herüberzieht, schmeckt es nach Eisen.",
          "Kerns Tür steht einen Spalt offen, als warte sie auf jemanden, der endlich hineingeht, statt nur vorbeizulaufen. Dennek trommelt derweil mit den Fingern auf die Brunnenmauer, ein unruhiges, kleines Geräusch, das nicht zum Rühren im Eimer passen will — die Hände eines Mannes, der etwas weiß, das seine Zunge noch nicht hergeben will.",
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
    teil("brunnen", "kern", "Witwe Kern", [
      karte(
        "bei-witwe-kern",
        "Bei Witwe Kern",
        "apothecary",
        [
          "Kern hat die Ärmel hochgekrempelt, wie eine Frau, die sich auf eine lange Arbeit einstellt. Auf der Waage vor ihr liegt dieselbe Kräutermischung, die sie schon seit Tagen abwiegt und die trotzdem nie zu reichen scheint, gleich wie oft sie die Schale neu füllt.",
          "„Bauchschmerzen. Fieber. Ein metallischer Geschmack im Mund, den man nicht wegspülen kann.“ Sie zählt die Symptome auf, als lese sie eine Liste, die sie längst auswendig kennt. „Die Kinder zuerst, dann die Alten. So ist es immer, wenn etwas von unten kommt und nicht von oben.“",
          "Lohn bietet sie dir nicht an. „Etwas Fremdes ist im Wasser“, sagt sie, mit der Bestimmtheit einer Frau, die sich nicht zum ersten Mal irrt, wenn sie ihrem eigenen Urteil vertraut. „Nicht Krankheit allein. Jemand hat den Brunnen angefasst.“",
          "Unter den Krankenzetteln an ihrer Wand sind zwei ganz frisch, die Tinte kaum trocken. Beide nennen Häuser, die nah am Brunnen liegen — zu nah, um Zufall zu sein.",
        ],
        ["Weiter"],
        "kern",
      ),
    ]),
    teil("brunnen", "dennek", "Ratsherr Dennek", [
      karte(
        "ratsherr-dennek",
        "Ratsherr Dennek",
        "well",
        [
          "Dennek rührt weiter im Eimer, mechanisch, ohne Überzeugung, und das Wasser wird dadurch um keinen Deut klarer. „Trockenes Jahr“, sagt er, mit der glatten Sicherheit eines Mannes, der diesen Satz schon oft geübt hat. „Der Brunnen gibt, was er kann. Mehr zu verlangen wäre schon Klage.“",
        ],
        [
          "Nach dem trockenen Jahr fragen (Charisma, schwer)",
          "Ihn an die Mauer drücken (Stärke, mittel)",
          "Ihn am Eimer lassen",
        ],
      ),
    ]),
    teil("brunnen", "schacht", "Schacht und Graben", [
      karte("brunnenschacht", "Brunnenschacht", "well", [
        "Frischer Mörtel klebt an einer Steinfuge, nicht älter als ein paar Nächte, glatt und hell im Gegensatz zum verwitterten Stein ringsum. Dahinter, kaum zu erkennen, ein schmaler Ablaufgraben, der aus dem Dorf hinausführt, Richtung Wald.",
        "Denneks Stock hat beim Rühren stets genau diese Stelle gemieden, jedes Mal, als kenne die Hand, die ihn führt, die Wahrheit besser als der Mund, der sie leugnet.",
      ]),
      karte("ablaufgraben", "Ablaufgraben", "ditch", [
        "Der Graben endet an einer halb überwucherten Zisterne, deren Mauerwerk zwar alt ist, dessen Fugen jedoch sauber und gepflegt wirken.",
        "Jemand hält dieses Bauwerk sorgfältig instand, während im Dorf dahinter die Kinder husten.",
      ]),
    ]),
    teil("brunnen", "zisterne", "Grovins Zisterne", [
      karte(
        "an-der-zisterne",
        "An der Zisterne",
        "ditch",
        [
          "Dorniges Gestrüpp steht dicht vor dem steinernen Becken, ein natürlicher Wall. Dahinter, kaum sichtbar durch die Zweige, bewegt sich eine flache Hand über Wasser, das reiner und klarer ist als alles, was man seit Tagen im Dorf gesehen hat.",
        ],
        [
          "Sich durch das Gestrüpp zwängen (Stärke, leicht)",
          "Sich unbemerkt nähern (Geschick, mittel)",
          "Umkehren",
        ],
      ),
      karte(
        "grovins-zisterne",
        "Grovins Zisterne",
        "ditch",
        [
          "Das Wasser in der Zisterne ist klar bis auf den steinigen Grund. Grovin blickt zuerst hinunter darauf, dann erst zu dir hinüber.",
          "„Ich habe dem Dorf diesen Brunnen gebaut“, sagt er, „und es hat mich dafür nicht bezahlt. Also nimmt sich das Wasser, was mir zusteht, und ich helfe ihm dabei nach.“",
        ],
        [
          "Die Sperre gewaltsam brechen (Stärke, mittel)",
          "Die Sperre unbemerkt umlegen (Geschick, schwer)",
          "Die Zisterne verlassen",
        ],
        "grovin",
      ),
    ]),
    teil("brunnen", "ende", "Ausgänge", [
      karte(
        "zwei-brunnen-ein-dorf",
        "Zwei Brunnen, ein Dorf",
        "well",
        [
          "Das Wasser wird spürbar klarer, gewiss, doch nie wirklich genug, um für alle zu reichen. Kern braut weiterhin dieselbe Mischung wie zuvor, nur seltener nun.",
          "Man selbst trägt das Wissen um das, was wirklich geschah, fortan ganz allein, ohne es mit irgendwem teilen zu können.",
        ],
        ["Weiter"],
        "kern",
      ),
      karte("wasser-mit-einem-riss", "Wasser mit einem Riss", "well", [
        "Das Wasser fließt zwar wieder, doch Grovin ist verschwunden, nicht verschwunden genug, um die Sache endgültig zu beenden.",
        "In manchen Nächten hört man Schritte am Waldrand, die niemand im Dorf laut beim Namen nennen möchte.",
      ]),
      karte(
        "klares-wasser",
        "Klares Wasser",
        "well",
        [
          "Am nächsten Morgen ist der Eimer am Brunnen wieder klar bis auf den Grund. Kern braut zum ersten Mal seit vielen Tagen wieder etwas anderes als bloßes Fiebermittel.",
          "Niemand im Dorf fragt laut nach dem Warum. Fragen kosten hier Kraft, die man zum Trinken braucht.",
        ],
        ["Weiter"],
        "kern",
      ),
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
      karte("gasse-kirche", "Vor der Kirche", "chapel", [], ["Weiter"], "beggar"),
      karte(
        "gasse-hub",
        "Die leere Gasse",
        "gate",
        [],
        ["Bei Fenn an der Kirchmauer bleiben", "Ratsherr Vahl im Rathaus aufsuchen", "Die Gasse hinter der Gerberei ansehen", "Zurück zum Dorfplatz"],
      ),
      karte("fenn", "Fenn", "chapel", [], ["Weiter"], "beggar"),
      karte("fenn-an-der-kirchmauer", "Fenn an der Kirchmauer", "chapel", [], ["Weiter"], "beggar"),
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
      karte("im-gewoelbe", "Im Gewölbe", "evidence"),
      karte("hinter-dem-stein", "Hinter dem Stein", "evidence"),
    ]),
    teil("gasse", "schluss", "Ausgänge", [
      karte("vahls-stube-abend", "Vahls Stube, Abend", "townhall"),
      karte("was-die-liste-wiegt", "Was die Liste wiegt", "evidence"),
      karte("ein-zweites-schweigen", "Ein zweites Schweigen", "gate"),
      karte("was-ausgegraben-bleibt", "Was ausgegraben bleibt", "chapel"),
      karte("ein-name-unter-vielen", "Ein Name unter vielen", "village"),
      karte("stille-rechnung", "Stille Rechnung", "village"),
    ]),
  ]),
  quest("wald", "Hang und Wald", "Hauptfluss", [
    teil("wald", "glockenweg", "Alter Glockenweg", [
      karte("glockenweg", "Alter Glockenweg", "chapel", [
        "Der alte Glockenweg steigt hinter den letzten Häusern an.",
        "Nasser Stein. Salzstaub im Gras. Oben hängt eine kleine Kapellenglocke im Wind.",
        "Die Stufen sind aus verschiedenen Steinen gesetzt. Einige tragen noch Meißelspuren, andere dunkle Flecken, die der Regen nicht aus dem porösen Gestein bekommt.",
        "Auf halber Höhe steht eine verwitterte Figur ohne Gesicht. Jemand hat ihr einen Mantel umgelegt. Der Mantel ist neuer als die Kapelle.",
      ]),
      karte(
        "sanna-die-botin",
        "Sanna, die Botin",
        "chapel",
        [
          "Sanna trägt eine Ledertasche ohne Brief.",
          "„Er ist mir im Geröll aus der Hand gerutscht. Wenn ich leer zurückkomme, glaubt man mir weniger als dem Regen.“",
          "Sie versucht zu lächeln und scheitert an der Kälte. Unter ihrer Zunge klebt noch Staub vom Hang.",
          "„Der Brief war versiegelt“, sagt sie. „Nicht mit dem Wachs des Bürgermeisters. Mit etwas, das darunter war.“",
        ],
        ["Weiter"],
        "sanna",
      ),
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

function extraFuer(id: string): Volltext | undefined {
  const ki = (kiAuflagen as Record<string, Volltext>)[id];
  if (ki?.lines?.length) return ki;
  return VOLLTEXTE[id];
}

function anreichern(szene: SzeneJson): SzeneJson {
  const extra = extraFuer(szene.id);
  if (!extra) return szene;
  const ki = Boolean((kiAuflagen as Record<string, Volltext>)[szene.id]?.lines?.length);
  const chars = (szene.lines ?? []).join(" ").trim().length;
  if (!ki && chars >= 160) {
    if (extra.portrait !== undefined) return { ...szene, portrait: extra.portrait };
    return szene;
  }
  return {
    ...szene,
    title: extra.title ?? szene.title,
    art: extra.art ?? szene.art,
    lines: extra.lines,
    choices: extra.choices?.length ? extra.choices : szene.choices,
    portrait: extra.portrait !== undefined ? extra.portrait : szene.portrait,
  };
}

export const QUESTS: QuestJson[] = QUESTS_ROH.map((quest) =>
  QuestSchema.parse({
    ...quest,
    teile: quest.teile.map((teil) =>
      TeilSchema.parse({
        ...teil,
        szenen: teil.szenen.map(anreichern),
      }),
    ),
  }),
);

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
