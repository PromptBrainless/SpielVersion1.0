import { probe } from "./engine";
import type { Runtime } from "./runtime";
import { MITTEL, SCHWER, type Held } from "./types";

export async function gasseKonflikt(rt: Runtime, held: Held) {
  await rt.present({
    title: "Vahls Stube, Abend",
    art: "townhall",
    portrait: null,
    held,
    lines: [
      "Vahl sitzt allein. Die Karte an der Wand wirft einen schmalen Schatten über die Umrandung der Gasse.",
      "Der Siegelring dreht sich, bevor du sprichst. Auf dem Tisch die Baufreigabe. Wachs, noch weich. Die Feder daneben unbenutzt.",
    ],
  });
  await rt.present({
    held,
    lines: [
      "Draußen im Flur geht eine Magd vorbei und bleibt nicht stehen.",
      held.vahlGrossvater
        ? "Er hat den Großvater schon einmal genannt. Heute liegt Papier auf dem Tisch, das mehr wiegt als der Ring."
        : "Er sieht dich an wie eine Lieferung, die zu spät kommt.",
    ],
  });

  const items: { id: string; label: string }[] = [
    { id: "rat", label: "Die Liste vor dem Rat lesen (Charisma, schwer)" },
    { id: "holm", label: "Die Liste Holm zustecken (Geschick, mittel)" },
    { id: "zwang", label: "Vahl unter vier Augen zwingen (Stärke, mittel)" },
    { id: "brand", label: "Die Liste für Fenn verbrennen" },
    { id: "gehen", label: "Mit der Liste gehen" },
  ];

  const wahl = await rt.present({
    title: "Was die Liste wiegt",
    art: "evidence",
    portrait: null,
    held,
    lines: [
      "Ilse Brandtners Wachstuch liegt zwischen euch, auch wenn es noch unter dem Hemd ist. Das Wachs hat deine Haut angenommen.",
      "Vahl wartet. Der Ring auch.",
    ],
    choices: items.map((item) => item.label),
  });
  const id = items[wahl]?.id;
  if (id === "gehen" || id == null) return;

  if (id === "brand") {
    held.loesungswegGasse = "vernichtet";
    await rt.present({
      title: "Ein zweites Schweigen",
      art: "chapel",
      portrait: null,
      held,
      lines: [
        "Du gehst mit der Liste zur Kirchmauer. Fenn sieht das Wachstuch und wendet den Blick nicht ab.",
        "Das Papier brennt schneller, als du erwartet hast. Die Namen werden zuerst schwarz, dann Asche.",
      ],
    });
    await rt.present({
      held,
      lines: [
        "Der Rauch bleibt in der Rinne, wo Fenns nackte Füße stehen.",
        "Fenn sagt nichts. Die Hand um das Zaunbrett wird einen Moment lang ruhig.",
        "Die Gasse wird bebaut. In zehn Jahren wird niemand mehr wissen, wonach sie benannt war. Du weißt es. Fenn auch.",
      ],
    });
    return;
  }

  if (id === "holm") {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "die Liste Holm zustecken", undefined, "schleichen");
    if (ergebnis.erfolg) {
      held.loesungswegGasse = "weitergegeben";
      await rt.present({
        art: "sneak",
        portrait: "holm",
        held,
        probe: ergebnis,
        lines: [
          "Holms Tür steht einen Spalt. Die Magd im Flur sieht das Wachstuch und sieht sofort wieder weg.",
          "Holm nimmt das Tuch, ohne den Namen auf dem Siegelring zu lesen. Die Hand ist trocken. Die Kasse darunter auch.",
        ],
      });
      await rt.present({
        portrait: "holm",
        held,
        lines: ["„Ich handle. Du warst nicht hier.“ Er schiebt es unter die leere Kasse."],
      });
      await gasseEnde(rt, held);
      return;
    }
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "Holms Tür ist bewacht. Die Magd hebt den Blick rechtzeitig, um das Wachstuch zu sehen, und senkt ihn nicht schnell genug.",
        "Zustecken ist vorbei für heute. Die Liste bleibt bei dir. Vahl im Nebenzimmer hat nichts gehört. Noch nicht.",
      ],
    });
    return;
  }

  if (id === "zwang") {
    const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "Vahl unter vier Augen festlegen", undefined, "kaempfen");
    if (ergebnis.erfolg) {
      held.loesungswegGasse = "erpresst";
      held.vahlKonfrontiert = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Du legst die Liste auf die Baufreigabe. Das weiche Wachs nimmt die Kante des Wachstuchs an.",
          "Vahl hört auf, den Ring zu drehen. Die Hand bleibt in der Luft, ohne Arbeit.",
        ],
      });
      await rt.present({
        held,
        lines: [
          "„Die Baumannschaft wird abbestellt. Offiziell: neue Bedenken.“ Er sagt es leise genug, dass der Flur es nicht verdient.",
          "Er sieht dich an, als hättest du etwas unterschrieben, das nicht auf Papier steht. Die Wahrheit bleibt vergraben. Jetzt weißt du, wo.",
        ],
      });
      await gasseEnde(rt, held);
      return;
    }
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "Vahl steht auf. Der Stuhl schabt über Stein. Im Flur bleibt eine Magd stehen und sieht sofort wieder weg.",
        "„Du kommst in meine Stube und zählst meine Toten?“ Der Ring dreht sich wieder, schneller als zuvor.",
        "Heute nicht. Die Liste bleibt bei dir. Die Baufreigabe bei ihm.",
      ],
    });
    return;
  }

  const ergebnis = probe(held, "Charisma", held.charisma, SCHWER, "Vahl vor dem Rat stellen", undefined, "reden");
  if (ergebnis.erfolg) {
    held.loesungswegGasse = "veroeffentlicht";
    held.vahlKonfrontiert = true;
    await rt.present({
      art: "townhall",
      portrait: "holm",
      held,
      probe: ergebnis,
      lines: [
        "Du liest hier, laut genug, dass der Flur und die Kammer daneben mithören müssen.",
        "Die Namen kommen, wie Ilse sie geschrieben hat. Der Rat hört sie, weil niemand rechtzeitig die Tür schließt.",
      ],
    });
    await rt.present({
      held,
      lines: [
        "Vahl verliert die Farbe unter dem Siegelring. Die Baufreigabe bleibt liegen.",
        "Draußen bleibt Fenn sitzen. Er hat die Stimmen gehört. Mehr braucht er nicht.",
      ],
    });
    await gasseEnde(rt, held);
    return;
  }
  await rt.present({
    held,
    probe: ergebnis,
    lines: [
      "Vahl lacht einmal, kurz und trocken.",
      "„Eine Hebamme. Ein Wachstuch. Der Rat hat wichtigere Listen, und ich habe ein Lagerhaus, das in einer Woche steht.“",
      "Die Magd im Flur hat trotzdem den ersten Namen gehört. Reden allein reicht heute nicht. Die Liste bleibt bei dir.",
    ],
  });
}

async function gasseEnde(rt: Runtime, held: Held) {
  if (held.loesungswegGasse === "veroeffentlicht") {
    await rt.present({
      title: "Was ausgegraben bleibt",
      art: "townhall",
      portrait: "holm",
      held,
      lines: [
        "Der Rat tagt drei Nächte hintereinander. Man hört die Stimmen bis auf den Platz, auch wenn niemand die Fenster öffnet.",
        "Vahl verliert seinen Sitz, nicht sein Land — das gehört inzwischen niemandem mehr, den man noch belangen könnte. Der Siegelring bleibt an seinem Finger. Das Amt nicht.",
      ],
    });
    await rt.present({
      art: "chapel",
      portrait: null,
      held,
      lines: [
        "Fenn sitzt weiter vor der Kirche, aber die Leute grüßen ihn jetzt, bevor sie vorbeigehen.",
        "Holm schreibt etwas in das Gemeindebuch, auf eine Seite, die man sonst für Abgaben behält. Er liest es dir nicht vor.",
      ],
    });
    return;
  }
  if (held.loesungswegGasse === "weitergegeben") {
    await rt.present({
      title: "Ein Name unter vielen",
      art: "townhall",
      portrait: "holm",
      held,
      lines: [
        "Holm lässt den Bauplatz ruhen, ohne einen Namen zu nennen. Im Rat klingt das nach Ordnung. In der Gasse klingt es nach nichts.",
        "Die Gasse bleibt leer, aber niemand fragt mehr, warum.",
      ],
    });
    await rt.present({
      portrait: "holm",
      held,
      lines: [
        "Ilse Brandtners Liste liegt in einer Schublade, die niemand außer Holm und dir kennt. Das Wachs daran wird hart und bleibt hart.",
        held.greteBedraengt
          ? "Gretes Kate bleibt zu. Holm kennt die Namen. Ihren Mund bekommt er nicht."
          : "Grete sitzt am Herd. Das Medaillon liegt still. Sie fragt nicht, wohin das Papier gegangen ist.",
      ],
    });
    return;
  }
  await rt.present({
    title: "Stille Rechnung",
    art: "townhall",
    portrait: null,
    held,
    lines: [
      "Die Baumannschaft wird abbestellt, offiziell wegen neuer Bedenken. Zwei Männer stehen einen Morgen lang mit Brettern am Eingang und gehen wieder, ohne sie abzuladen.",
      "Vahl grüßt dich seither mit einer Höflichkeit, die mehr Angst als Respekt ist. Der Ring dreht sich nur, wenn du nicht hinsiehst.",
    ],
  });
  await rt.present({
    art: "village",
    held,
    lines: [
      "Die Wahrheit bleibt vergraben. Mindestens einer weiß, wo. Das reicht, damit die Gasse leer bleibt.",
      "Fenn betastet das Zaunbrett weiter. Er hat kein Papier gesehen. Er merkt trotzdem, dass niemand mehr hämmert.",
    ],
  });
}
