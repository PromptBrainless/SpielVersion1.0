import { HEILTRANK, createHeld, type EffektId, type Held } from "./types";

export type HerkunftArt = "gnade" | "ordnung" | "nutzen";

export type HerkunftAntwort = {
  label: string;
  art: HerkunftArt;
  lp?: number;
  gold?: number;
  inventar?: string[];
  effekte?: EffektId[];
  mal: string;
};

export type HerkunftFrage = {
  id: string;
  titel: string;
  geschichte: string[];
  antworten: HerkunftAntwort[];
};

export const HERKUNFT_FRAGEN: HerkunftFrage[] = [
  {
    id: "soldateska",
    titel: "Die Soldateska",
    geschichte: [
      "Wenn ich mein Leben opfere, könnten die anderen entkommen, doch das Gewicht dieser Entscheidung drückt wie eine eiserne Last auf meine Brust. Der kalte Atem der Nacht kriecht in meine Lungen, während die Dunkelheit um uns herum wie eine hungrige Bestie lauert. Mein Herz pocht laut in der Stille, jeder Schlag ein Schlag gegen den Tod.",
      "Einen Plan schmieden, Schwäche vortäuschen, einen Hinterhalt legen. Das Risiko frisst die Seele, doch das Schweigen der Angst ist noch furchtbarer. Flammen züngeln in den Schatten, die Dunkelheit ist mein Verbündeter, mein Feind. Nur Mut oder Wahnsinn können das Verderben bannen.",
      "Was auch immer ich tue, es wird nur Blut und Asche hinterlassen. Die Zeit ist mein Feind, die Sekunden fallen wie Blätter, und in ihrem Schatten lauert der Tod. Vielleicht gibt es eine Flucht, eine Lücke im Dunkel, die nur ich nicht sehe. Der Tod ist schon hier, und das Warten wird zum Verhängnis.",
    ],
    antworten: [
      {
        label: "Ich muss Opfer bringen",
        art: "gnade",
        lp: -1,
        effekte: ["motiviert"],
        mal: "Ich stelle meinen Körper vor das Dorf, damit die anderen entkommen können. Mein Blut wird in den Staub sinken, während ich den Blick auf den Schatten richte, der alles verschlingt.",
      },
      {
        label: "Ich plane den Hinterhalt",
        art: "nutzen",
        effekte: ["konzentriert"],
        mal: "Ich webe eine Falle aus Schatten und Feuer, auch wenn ich dafür mein Leben opfern muss. Das Risiko ist groß, doch das Dunkel verlangt Opfer.",
      },
      {
        label: "Ich akzeptiere das Schicksal",
        art: "ordnung",
        gold: 1,
        effekte: ["gelassen"],
        mal: "Ich lege das Schicksal in die kalten Hände des Unvermeidlichen. Das Ende ist unausweichlich, doch ich werde im Schatten des Todes warten, bis es mich holt.",
      },
    ],
  },
  {
    id: "feind",
    titel: "Der verwundete Feind",
    geschichte: [
      "Der Pfeifton in der Brust ist das letzte Geräusch, das er hört. Das Blut tropft schwer auf den Boden, das Metall aufgerissen, die Wunde tobt im Inneren. Sein Atem ist flach, die Augen glasig, doch er sieht mich. Sein Blick ist wie ein Messer, das in meine Seele sticht.",
      "Der Blick spricht mehr als Worte. Ein Flüstern, das kaum noch die Lippen verlässt, bittet um Wasser. Das Messer liegt in meiner Hand, kalt und schwer, wie der Tod selbst.",
      "Plötzlich schießt mir das Blut durch die Adern, und ich habe die Wahl: Das Leben nehmen oder das Sterben beenden. Die Dunkelheit in seinem Blick ist schwerer als das Gewicht der Welt.",
    ],
    antworten: [
      {
        label: "Ich gebe Wasser",
        art: "gnade",
        lp: 1,
        effekte: ["traurig"],
        mal: "Ich gieße das letzte Wasser in seine trockenen Lippen, spüre die Bitterkeit des Moments. Das Leben ist ein zartes Band, das hier zerreißt, doch ich halte es fest, solange es noch besteht.",
      },
      {
        label: "Ich durchtrenne das Herz",
        art: "ordnung",
        gold: 1,
        effekte: ["wunde"],
        mal: "Ich führe das Messer, das in meiner Hand liegt, und beende sein Leid. Es ist schwer, doch die Dunkelheit im Innern verlangt nach Erlösung, auch wenn sie blutig sein muss.",
      },
      {
        label: "Ich nehme ihn mit",
        art: "nutzen",
        effekte: ["erschoepfung"],
        mal: "Ich hebe ihn auf, trage ihn auf meinen Schultern durch den Staub. Vielleicht verschlingt ihn die Nacht, bevor das Verderben ihn erreicht.",
      },
    ],
  },
  {
    id: "ernte",
    titel: "Die gestohlene Ernte",
    geschichte: [
      "Die Frau kniet im Staub, die Hände voll mit drei Säcken. Der Schweiß läuft in dunklen Bahnen, die Augen sind leer, doch der Hunger brennt noch immer hell. Ihr Blick ist wie ein Messer, das in meine Seele schneidet.",
      "Der Blick der Kinder ist wie Messer, die in die Seele stechen. Sie halten sich an ihrem Rücken fest, als könnten sie den Verstand im Stoff verstecken. Ihre kleinen Gesichter sind von Dreck und Verzweiflung gezeichnet.",
      "Der Atem der Verzweiflung hängt schwer in der Luft. Das Mehl ist nur eine Waffe, der Hunger eine noch größere Bedrohung, und das Leben ein stummer Zeuge des Verfalls.",
    ],
    antworten: [
      {
        label: "Melde die Tat",
        art: "ordnung",
        effekte: ["konzentriert"],
        mal: "Ich kenne den Preis, doch ich spreche den Namen aus. Das Gesetz ist ein Messer, das alles zertrennt, doch die Ordnung muss sein, selbst wenn sie blutet.",
      },
      {
        label: "Lass es sein",
        art: "gnade",
        effekte: ["gelassen"],
        mal: "Ich schließe die Augen, ignoriere das Leid. Der Hunger schreit in meinen Ohren, doch ich versuche, die Fassade der Kälte aufrechtzuerhalten.",
      },
      {
        label: "Zwinge zu Arbeit",
        art: "nutzen",
        gold: 1,
        effekte: ["wunde"],
        mal: "Ich zwinge sie zur Arbeit, die Hände in den Staub. Das Leben ist nur noch ein Kampf im Schatten der Verzweiflung.",
      },
    ],
  },
  {
    id: "verraeter",
    titel: "Der Verräter",
    geschichte: [
      "Er steht im Schatten, verborgen in der Dunkelheit, das Gesicht wie eine Maske aus Blut und Dreck. Das Gold in seiner Hand leuchtet kalt im Mondlicht, doch seine Augen sind voll Angst.",
      "Er weiß, dass sein Geheimnis brennt. Die Stimme zittert, doch die Worte sind scharf wie Messer. Er spricht von Familie, doch sein Herz schlägt für den Verrat.",
      "Der Blick auf ihn ist wie ein Urteil, so schwer wie das Eisen seiner Ketten. Das Blut in den Adern gefroren, während die Dunkelheit ihn verschlingt.",
    ],
    antworten: [
      {
        label: "Melde ihn",
        art: "ordnung",
        effekte: ["motiviert"],
        mal: "Ich nenne die Namen, ziehe die Ketten ab, und lasse das Gesetz der Dunkelheit walten. Der Verräter wird gehängt.",
      },
      {
        label: "Deckung geben",
        art: "gnade",
        effekte: ["furcht"],
        mal: "Ich unterstütze ihn im Schatten, seine Flucht, während die Rache wie ein Messer in meinem Herz sitzt.",
      },
      {
        label: "Erpressen",
        art: "nutzen",
        gold: 2,
        effekte: ["erschoepfung"],
        mal: "Ich zwinge ihn, für mich zu arbeiten, seine Familie im Blick. Das Gold zerfrisst seine Seele.",
      },
    ],
  },
  {
    id: "brot",
    titel: "Die letzte Fuhre",
    geschichte: [
      "Der Karren ächzt unter der Last, die Räder versinken im Schlamm. Das Brot ist die letzte Hoffnung, doch es ist nur noch ein Hauch von Mehl, der im Staub verpufft.",
      "Die Kinder sitzen ausgemergelt, die Augen wie schwarze Löcher. Der Dreck klebt an ihren Gesichtern, als wären sie Teil des Bodens. Ihr Schweigen ist schwerer als das Gewicht der Welt.",
      "Der Atem ist schwer, der Blick leer. Das Leben hängt an einem seidenen Faden, gespannt zwischen Tod und Überleben, während das Brot im Staub zerbricht.",
    ],
    antworten: [
      {
        label: "Verteile das Brot",
        art: "gnade",
        lp: -1,
        effekte: ["hungrig"],
        mal: "Ich gebe den Kindern das letzte Brot, sehe das Leuchten in ihren Augen, während die Dämmerung naht.",
      },
      {
        label: "Weiterfahren",
        art: "ordnung",
        effekte: ["konzentriert"],
        mal: "Ich lasse das Brot im Korb, ignoriere den Hunger, und hoffe auf eine bessere Zukunft. Der Schatten des Todes wächst im Dämmerlicht.",
      },
      {
        label: "Kinder mitnehmen",
        art: "nutzen",
        effekte: ["erschoepfung"],
        mal: "Ich hebe sie auf, trage sie durch den Staub, im Hoffen, dass das Leben noch eine Chance hat.",
      },
    ],
  },
  {
    id: "seuche",
    titel: "Die Scheune",
    geschichte: [
      "Die Scheune brennt nicht, noch nicht, doch die Schreie in ihrem Innern sind wie ein Hauch aus der Hölle. Das Fieber hat das Holz durchbohrt, die Krankheit breitet sich aus wie dunkle Tinte auf vergilbtem Papier.",
      "Draußen stehen die Gesunden, die nur noch auf das Ende warten, während die Kranken im Rauch und Flammen verzweifeln. Das Fieber ist ihr König, der Tod ihr Herrscher.",
      "Der Riegel knackt, die Tür ist nur noch ein Schatten. Das Feuer wird kommen, und mit ihm die endgültige Dunkelheit.",
    ],
    antworten: [
      {
        label: "Hilfe holen",
        art: "gnade",
        lp: -1,
        effekte: ["neugierig"],
        mal: "Ich öffne die Tür, riskiere alles, um Leben zu retten. Das Fieber soll in die kalte Nacht getrieben werden.",
      },
      {
        label: "Lass sie sterben",
        art: "ordnung",
        effekte: ["gelassen"],
        mal: "Ich lasse die Tür geschlossen, ignoriere das Leid, und hoffe, dass das Feuer alles verschlingt.",
      },
      {
        label: "Brände legen",
        art: "nutzen",
        effekte: ["erschoepfung"],
        mal: "Ich zünde die Scheune an, lasse die Flammen alles verschlingen. Das Feuer bringt das Ende, und das Dorf atmet wieder auf.",
      },
    ],
  },
  {
    id: "spion",
    titel: "Der Gefangene",
    geschichte: [
      "An den Pfahl gebunden, das Gesicht wie eine Maske aus Blut und Dreck. Die Augen voller Angst, doch die Lippen verschlossen, schweigend im Schatten der Nacht.",
      "Das Messer in meiner Hand ist wie ein kalter Schatten. Er kennt den Weg, doch seine Stimme ist erstickt im Staub.",
      "Das Herz schlägt schwer, während ich zwischen Leben und Tod entscheide. Das Dunkel umgibt mich, schwerer als das Eisen, das ihn hält.",
    ],
    antworten: [
      {
        label: "Zum Reden bringen",
        art: "nutzen",
        gold: 1,
        effekte: ["erschoepfung"],
        mal: "Ich nenne die Namen, ziehe die Ketten ab, und lasse das Gesetz der Dunkelheit walten. Das Schweigen zerreiße ich, um die Wahrheit ans Licht zu bringen.",
      },
      {
        label: "Ihn freilassen",
        art: "gnade",
        effekte: ["gelassen"],
        mal: "Ich unterstütze seine Flucht im Schatten, seine Schuld im Rücken. Vielleicht verschlingt das Dunkel ihn, bevor die Rache naht.",
      },
      {
        label: "Töten",
        art: "ordnung",
        effekte: ["wunde"],
        mal: "Ich treibe das Messer in seine Brust, bringe das Ende herbei. Das Schweigen wird zum letzten Urteil.",
      },
    ],
  },
  {
    id: "waffe",
    titel: "Die letzte Waffe",
    geschichte: [
      "Zwischen euch liegt das Messer, blutverschmiert, das Gras im nassen Tau. Zwei Verwundete, das Blut läuft wie Wasser, die Klinge glänzt im Licht des fahlen Mondes.",
      "Der eine hält noch durch, der andere ist kaum noch bei Bewusstsein. Stimmen rufen im Wald, wie Geister, die zum Tod locken.",
      "Nur einer wird den Morgen sehen, das ist sicher. Das Messer in meiner Hand ist der letzte Funke, das Ende oder das Erwachen im Schatten.",
    ],
    antworten: [
      {
        label: "Dem Stärkeren geben",
        art: "ordnung",
        effekte: ["motiviert"],
        mal: "Ich gebe die letzte Klinge dem, der noch steht, im Blick das Überleben, während die Dunkelheit im Schatten lauert.",
      },
      {
        label: "Dem Schwächeren geben",
        art: "gnade",
        lp: 1,
        effekte: ["traurig"],
        mal: "Ich lege die Klinge in die Hand dessen, der schon liegt. Der Schatten verschlingt ihn im Dämmerlicht, aber die Chance bleibt seine.",
      },
      {
        label: "Zerbrechen",
        art: "nutzen",
        effekte: ["gelassen"],
        mal: "Ich zerbreche die Waffe, das letzte Streben nach Leben im Staub. Vielleicht verschwindet das Dunkel im Gras.",
      },
    ],
  },
  {
    id: "burg",
    titel: "Vor dem Tor",
    geschichte: [
      "Die Vorräte im Rathaus sind nur noch ein Hauch, das Brot fehlt, doch vor dem Tor stehen hungrige Seelen, ohne Brot, mit Kindern, die im Dreck schreien. Das Tor ist eine Grenze zwischen Leben und Tod.",
      "Die Wache steht müde, hungrig, doch in der Pflicht. Das Tor ist wie eine Klaue, die das Schicksal trennt. Wer hineinkommt, riskiert alles; wer draußen bleibt, verliert alles.",
      "Das Schicksal liegt im Zwielicht der Entscheidung. Das Tor ist der letzte Schritt ins Unbekannte, in die Dunkelheit oder ins Licht.",
    ],
    antworten: [
      {
        label: "Alle einlassen",
        art: "gnade",
        lp: -1,
        effekte: ["zuversichtlich"],
        mal: "Ich öffne das Tor, im Schatten der Barmherzigkeit. Das Leid der Hungrigen ist schwer, doch ich muss das Leben im Innern schützen, egal zu welchem Preis.",
      },
      {
        label: "Abweisen",
        art: "ordnung",
        effekte: ["konzentriert"],
        mal: "Ich verschließe das Tor, im Schatten der Pflicht. Das Leid bleibt draußen. Das Gesetz ist schwer, doch notwendig.",
      },
      {
        label: "Nur Frauen und Kinder",
        art: "nutzen",
        effekte: ["gelassen"],
        mal: "Ich lasse nur die Frauen und Kinder hinein, die Männer draußen im Schatten. Das ist Gerechtigkeit in einer Welt voller Dunkelheit.",
      },
    ],
  },
  {
    id: "ausweg",
    titel: "Der letzte Ausweg",
    geschichte: [
      "Der Feind ist nah, die Rufe im Wald, die Pferde trampeln im Schlamm. Einer bleibt zurück, um die Flucht zu sichern, damit andere entkommen.",
      "Der Verwundete sinkt auf die Knie, sein Atem ist schwer, doch er weigert sich aufzugeben. Die Dunkelheit wächst im Schatten, während die Entscheidung schwer auf den Schultern lastet.",
      "Das Los wird geworfen, das Schicksal entscheidet, wer im Nebel bleibt, während die Angst wie ein Messer in der Brust liegt.",
    ],
    antworten: [
      {
        label: "Zurückbleiben",
        art: "gnade",
        lp: -1,
        inventar: [HEILTRANK],
        effekte: ["motiviert"],
        mal: "Ich bleibe im Schatten, während die anderen fliehen. Mein Blut wird im Staub liegen, doch ich halte stand, bis das Dunkel mich verschlingt.",
      },
      {
        label: "Den Verwundeten lassen",
        art: "ordnung",
        effekte: ["furcht"],
        mal: "Ich lasse ihn auf den Knien, gebe ihm den letzten Atemzug. Der Schatten verschlingt ihn, während die Flucht im Nebel verschwindet.",
      },
      {
        label: "Auslosen",
        art: "nutzen",
        effekte: ["gelassen"],
        mal: "Das Los entscheidet, wer bleibt. Ich ziehe den Strick, während die Angst in meinen Knochen sitzt und der Schatten naht.",
      },
    ],
  },
];

export type HerkunftPatch = {
  titel?: string;
  geschichte?: string[];
  antworten?: { label?: string; mal?: string }[];
};

export function lageLeer(patch: HerkunftPatch | undefined) {
  if (!patch) return true;
  if (patch.titel?.trim()) return false;
  if (patch.geschichte?.some((z) => z.trim())) return false;
  if (patch.antworten?.some((a) => a.label?.trim() || a.mal?.trim())) return false;
  return true;
}

export function mergenFrage(kanon: HerkunftFrage, patch?: HerkunftPatch): HerkunftFrage {
  if (!patch || lageLeer(patch)) return kanon;
  return {
    ...kanon,
    titel: patch.titel?.trim() || kanon.titel,
    geschichte: patch.geschichte?.map((z) => z.trim()).filter(Boolean).length
      ? patch.geschichte.map((z) => z.trim()).filter(Boolean)
      : kanon.geschichte,
    antworten: kanon.antworten.map((antwort, index) => ({
      ...antwort,
      label: patch.antworten?.[index]?.label?.trim() || antwort.label,
      mal: patch.antworten?.[index]?.mal?.trim() || antwort.mal,
    })),
  };
}

export function mitLagen(lagen: Record<string, HerkunftPatch> | undefined): HerkunftFrage[] {
  return HERKUNFT_FRAGEN.map((frage) => mergenFrage(frage, lagen?.[frage.id]));
}

function klemme(n: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, n));
}

function urteil(arten: HerkunftArt[]): string {
  const stand = { gnade: 0, ordnung: 0, nutzen: 0 };
  for (const art of arten) stand[art] += 1;
  if (stand.gnade >= stand.ordnung && stand.gnade >= stand.nutzen) {
    return "Das Tal wird merken, dass du teilst, auch wenn es dich kostet.";
  }
  if (stand.ordnung >= stand.nutzen) {
    return "Das Tal wird merken, dass du zählst, bevor du hilfst.";
  }
  return "Das Tal wird merken, dass du nimmst, was sich nehmen lässt.";
}

export function legeHerkunftAufHeld(held: Held, antwort: HerkunftAntwort, maxMale = 3) {
  held.lp = klemme(held.lp + (antwort.lp ?? 0), 1, 10);
  held.gold = Math.max(0, held.gold + (antwort.gold ?? 0));
  if (antwort.inventar) {
    for (const ding of antwort.inventar) {
      if (!held.inventar.includes(ding)) held.inventar.push(ding);
    }
  }
  if (antwort.effekte) {
    for (const id of antwort.effekte) {
      if (!held.effekte.includes(id)) held.effekte.push(id);
    }
    while (held.effekte.length > maxMale) held.effekte.shift();
  }
}

function spiegelMal(male: string[], titel?: string) {
  if (!male.length) return "";
  const ich = male.every((mal) => /^ich\b/i.test(mal.trim()));
  const satz = ich ? male.join(" ") : `Du bist jemand, der ${male.join(", der ")}.`;
  return titel ? `Nach ${titel}: ${satz}` : satz;
}

export function wendeHerkunftAn(
  held: Held,
  frageIndex: number,
  antwortIndex: number,
  fragen: HerkunftFrage[] = HERKUNFT_FRAGEN,
): { titel: string; antwort: HerkunftAntwort } | null {
  const frage = fragen[frageIndex];
  const antwort = frage?.antworten[antwortIndex];
  if (!frage || !antwort) return null;
  legeHerkunftAufHeld(held, antwort, 3);
  held.mal = spiegelMal([antwort.mal], frage.titel);
  return { titel: frage.titel, antwort };
}

export function baueHeldAusHerkunft(name: string, gewaehlt: number[], fragen: HerkunftFrage[] = HERKUNFT_FRAGEN): Held {
  const held = createHeld(name, 10, 10, 10);
  const male: string[] = [];
  const arten: HerkunftArt[] = [];
  gewaehlt.forEach((index, frageIndex) => {
    const frage = fragen[frageIndex];
    const antwort = frage?.antworten[index];
    if (!antwort) return;
    legeHerkunftAufHeld(held, antwort, 3);
    male.push(antwort.mal);
    arten.push(antwort.art);
  });
  held.lp = klemme(held.lp, 4, 10);
  held.mal = `${urteil(arten)} ${spiegelMal(male.slice(-3))}`.trim();
  return held;
}