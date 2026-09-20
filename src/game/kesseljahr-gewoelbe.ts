import { probe } from "./engine";
import type { Runtime } from "./runtime";
import { erzwingePhase, leseTageszeit } from "./tageszeit";
import { LEICHT, MITTEL, SCHWER, type Held } from "./types";

export async function gasseGewoelbe(rt: Runtime, held: Held) {
  if (held.ilsesAufzeichnungenGefunden) {
    await rt.present({
      title: "Kirchengewölbe",
      art: "sneak",
      portrait: null,
      held,
      lines: [
        "Die Treppe ist dir bekannt. Unten bleibt die Kälte liegen.",
        "Die Nische ist leer. Ilse Brandtners Wachstuch liegt unter deinem Hemd.",
        "Die Steine ohne Namen sagen nichts. Das Wachs an deiner Haut sagt genug.",
      ],
    });
    return;
  }

  const sneakSchwer = held.kuesterGewarnt || held.greteBedraengt ? SCHWER : MITTEL;
  const priesterSchwierigkeit = held.greteBedraengt ? SCHWER : held.artefaktErhalten ? LEICHT : MITTEL;
  const sucheSchwierigkeit = held.greteBedraengt || !held.greteGespraech ? SCHWER : MITTEL;
  const items: { id: string; label: string }[] = [
    {
      id: "pfarrer",
      label:
        priesterSchwierigkeit === LEICHT
          ? "Den Pfarrer um Zutritt bitten (Charisma, leicht)"
          : priesterSchwierigkeit === SCHWER
            ? "Den Pfarrer um Zutritt bitten (Charisma, schwer — Gretes Haus hat geredet)"
            : "Den Pfarrer um Zutritt bitten (Charisma, mittel)",
    },
    {
      id: "schleich",
      label:
        sneakSchwer === SCHWER
          ? held.kuesterGewarnt
            ? "Nachts hineinschleichen (Geschick, schwer — der Küster achtet)"
            : "Nachts hineinschleichen (Geschick, schwer — das Dorf hört an Türen)"
          : "Nachts hineinschleichen (Geschick, mittel)",
    },
    { id: "gehen", label: "Die Kirche lassen" },
  ];

  const wahl = await rt.present({
    title: "Unter der Kirche",
    art: "chapel",
    portrait: null,
    held,
    lines: [
      "Die Kirche steht kälter als der Platz. Kerzenwachs ist an den Bänken heruntergelaufen und wieder hart geworden.",
      "Die Treppe zum Gewölbe liegt hinter einem Vorhang, den niemand zur Seite schiebt. Der Stoff ist dunkel genug, dass man ihn für eine Wand halten kann.",
      held.greteBedraengt
        ? "Unten am Platz hat jemand Gretes Stimme gehört. Oben steht der Pfarrer steifer als sonst."
        : held.kuesterGewarnt
          ? "Der Küster hat dich einmal gesehen. Die Tür quietscht, und der Riegel sitzt einen Fingerbreit fester."
          : "Unten liegen die, die man ohne Namen begräbt. Oben redet niemand davon.",
      held.artefaktErhalten
        ? "Der Pfarrer hat das Silber gesehen, das du trägst. Er sieht dich anders an als die, die nur fragen."
        : "Der Pfarrer steht am Altar und tut, als gehörte die Treppe nicht zu seiner Kirche.",
    ],
    choices: items.map((item) => item.label),
  });
  const id = items[wahl]?.id;
  if (id === "gehen" || id == null) return;

  let drin = false;
  if (id === "pfarrer") {
    const ergebnis = probe(held, "Charisma", held.charisma, priesterSchwierigkeit, "den Pfarrer um das Gewölbe bitten", undefined, "reden");
    if (ergebnis.erfolg) {
      drin = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Der Pfarrer sieht an dir vorbei, zur Stelle an der Wand, wo eine Glocke hängen könnte und nicht hängt.",
          "„Geh allein hinunter. Frag mich hinterher nichts, das ich selbst nicht beantworten will.“",
          "Er schiebt den Vorhang nicht zur Seite. Er dreht sich nur so, dass er nicht sehen muss, wie du es tust.",
        ],
      });
    } else {
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Der Pfarrer schüttelt den Kopf. Die Hand am Vorhang bleibt liegen.",
          "„Das Gewölbe ist für die Toten. Nicht für Fragen, die oben bleiben sollen.“",
          held.greteBedraengt
            ? "„Heute hat das Dorf schon genug gehört. Nachts ist die Tür nur ein Riegel.“"
            : "Die Tür bleibt zu. Nachts ist sie nur ein Riegel.",
        ],
      });
    }
  } else {
    const warNacht = leseTageszeit(held) === "nacht";
    if (!warNacht) erzwingePhase(held, "nacht");
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, sneakSchwer, "ins Gewölbe schleichen", undefined, "schleichen");
    if (ergebnis.erfolg) {
      drin = true;
      await rt.present({
        art: "sneak",
        held,
        probe: ergebnis,
        lines: [
          warNacht
            ? "Der Vorhang gibt nach, wo das Holz nicht knarrt. Du gehst seitlich, nicht geradeaus."
            : "Du wartest, bis das Tal die Läden schließt. Dann gibt der Vorhang nach, wo das Holz nicht knarrt.",
          "Unten riecht es nach Kalk und nassem Tuch. Niemand folgt.",
        ],
      });
    } else {
      held.kuesterGewarnt = true;
      await rt.present({
        art: "sneak",
        held,
        probe: ergebnis,
        lines: [
          "Der Küster erwischt dich an der obersten Stufe. Die Laterne trifft dein Gesicht, nicht den Vorhang.",
          "„Manche Türen soll man besser nicht bewachen“, sagt er und sieht weg. Er meldet es nicht. Er merkt es sich.",
          "Beim nächsten Mal wird der Riegel enger sitzen.",
        ],
      });
    }
  }

  if (!drin) return;

  await rt.present({
    title: "Im Gewölbe",
    art: "sneak",
    portrait: null,
    held,
    lines: [
      "Die Nischen tragen keine Namen. Ein Stein sitzt lockerer, als das Gewicht es erklärt.",
      "Wasser steht in einer Rinne entlang der Wand. Wenn der Wind falsch steht, schmeckt es ein wenig nach dem Brunnen oben.",
    ],
  });
  await rt.present({
    held,
    lines: [
      held.greteGespraech && !held.greteBedraengt
        ? "Der dritte Stein von links, Rücken zur Treppe. Dahinter ein Geruch nach alter Lohe, schwach, aber nicht nach Kalk."
        : "Ilse hat geschrieben, man begrabe hier niemanden, den man vergessen will. Die Steine widersprechen ihr nicht.",
      "Die Finger finden Fugen. Nicht jede Fuge ist eine Tür.",
    ],
  });

  const suche = probe(held, "Geschicklichkeit", held.geschick, sucheSchwierigkeit, "Ilse Brandtners Liste finden", undefined, "wahrnehmung");
  if (suche.erfolg) {
    held.ilsesAufzeichnungenGefunden = true;
    await rt.present({
      title: "Hinter dem Stein",
      art: "evidence",
      portrait: null,
      held,
      probe: suche,
      lines: [
        "Der lockere Stein gibt nach. Dahinter liegt Wachstuch, trocken gegen die Feuchte, festgewickelt.",
        "Ilse Brandtners Hand: Namen, Daten, drei Ratsherren, die Aufteilung des Landes. Die Schrift ist klein und gleichmäßig, als hätte das Papier nicht reichen sollen.",
      ],
    });
    await rt.present({
      held,
      lines: [
        "Vahls Großvater steht zuerst. Daneben Stücke, die heute zur Mühle, zum Rathausplatz und zur Gerberei gehören. Die Häuser der Gasse stehen nur noch als Fläche da.",
        "Die letzte Zeile ist kurz: „Wer das liest, soll nicht so tun, als wäre niemand gezählt worden.“",
      ],
    });
    return;
  }
  await rt.present({
    held,
    probe: suche,
    lines: [
      "Die Steine sind alle gleich tot. Deine Finger finden Fugen, keinen Hohlraum. Der Kalk bröckelt.",
      held.greteBedraengt
        ? "Grete hat den Stein nicht genannt. Ilse hat besser versteckt, als ein gehetzter Satz verdient. Du kannst wiederkommen."
        : "Ilse hat besser versteckt, als ein erster Gang verdient. Du kannst wiederkommen.",
    ],
  });
}
