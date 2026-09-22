import { probe } from "./engine";
import { fadenAnzahl, schliesseFaden } from "./faden";
import type { Runtime } from "./runtime";
import { LEICHT, MITTEL, SCHWER, type Held } from "./types";

export { fadenAnzahl, schliesseFaden } from "./faden";

export async function rinneUntersuchen(rt: Runtime, held: Held): Promise<void> {
  const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "die Rinne untersuchen", undefined, "wahrnehmung");
  if (ergebnis.erfolg) {
    held.fadenRinne = true;
    await rt.present({
      title: "Schmiede und Apotheke",
      art: "village",
      portrait: null,
      held,
      probe: ergebnis,
      lines: [
        "Die blutige Wolle ist an drei Stellen abgeschnitten, nicht gerissen. Jemand hat sie absichtlich hier zurückgelassen — oder absichtlich verloren.",
      ],
    });
    return;
  }
  await rt.present({
    title: "Schmiede und Apotheke",
    art: "village",
    portrait: null,
    held,
    probe: ergebnis,
    lines: ["Die Rinne gibt nasse Wolle her und weiter nichts. Der Kohlenstaub setzt sich wieder."],
  });
}

export async function jungerLetzterKnoten(rt: Runtime, held: Held): Promise<void> {
  const wahl = await rt.present({
    title: "Hinter dem Brunnen",
    art: "well",
    portrait: null,
    held,
    lines: [
      "Der Junge ist wieder da. Die Schnur um sein Handgelenk hat nur noch einen Knoten.",
      "Er sieht dich an, als hätte er gewartet, ob du genug andere Dinge gesehen hast, bevor du fragst.",
    ],
    choices: ["Ihn nach dem letzten Knoten fragen (Charisma, mittel)", "Ihn in Ruhe lassen"],
  });
  if (wahl !== 0) return;
  const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "nach dem letzten Knoten fragen", undefined, "reden");
  if (!ergebnis.erfolg) {
    await rt.present({
      held,
      probe: ergebnis,
      lines: ["Er schüttelt den Kopf. Den Knoten löst er nicht. Heute nicht."],
    });
    return;
  }
  held.schnurLetzterKnoten = true;
  await rt.present({
    title: "Hinter dem Brunnen",
    art: "well",
    portrait: null,
    held,
    probe: ergebnis,
    lines: [
      "Der Junge löst den letzten Knoten nicht vor dir. Aber er sagt: „Für den, der am Brunnen fehlt. Bevor du fragst — nein, ich weiß seinen Namen nicht mehr. Ich weiß nur, dass ihn jemand gerufen hat, bevor er ging.“",
    ],
  });
}

export async function koehlerFaden(rt: Runtime, held: Held): Promise<void> {
  if (held.ungerufenerNameGeloest) return;
  const choices = [
    "Das Gebetsband verlangen (Stärke, mittel)",
    held.glockeNamenGelesen
      ? "Der Schleifspur allein nachgehen (Geschick, mittel)"
      : "Der Schleifspur allein nachgehen (Geschick, schwer)",
  ];
  if (held.schnurLetzterKnoten) choices.push("Nach dem Gebetsband fragen (Charisma, mittel)");
  choices.push("Ihn ziehen lassen");

  const wahl = await rt.present({
    title: "Wald",
    art: "forest",
    portrait: null,
    held,
    lines: [
      "Der Köhler hält das Gebetsband noch, als wäre es wärmer als sein Feuer.",
      "Drei Wege führen an dem Band vorbei. Einer reißt es. Einer folgt der Spur, ohne zu fragen. Einer gibt ihm etwas zurück, das nicht ihm gehört.",
    ],
    choices,
  });
  const gewaehlt = choices[wahl];
  if (gewaehlt === "Ihn ziehen lassen") return;

  if (gewaehlt.startsWith("Das Gebetsband verlangen")) {
    const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "das Gebetsband verlangen", "nebel", "kaempfen");
    if (ergebnis.erfolg) {
      held.koehlerBefragt = true;
      schliesseFaden(held, "erzwungen");
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Der Name kommt heraus, aber hart, wie ausgerissen. Der Köhler zieht sich zurück in den Rauch und spricht danach mit niemandem mehr darüber — auch nicht mit dir.",
        ],
      });
    } else {
      await rt.present({
        held,
        probe: ergebnis,
        lines: ["Er tritt einen Schritt zurück in den Rauch. Das Band bleibt bei ihm."],
      });
    }
    return;
  }

  if (gewaehlt.startsWith("Der Schleifspur allein")) {
    const schwer = held.glockeNamenGelesen ? MITTEL : SCHWER;
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, schwer, "der Schleifspur folgen", "nebel", "wahrnehmung");
    if (ergebnis.erfolg) {
      held.koehlerBefragt = true;
      schliesseFaden(held, "gefolgt");
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Du weißt am Ende mehr, als irgendjemand im Dorf zugeben würde. Manche Fäden reißen nicht, weil niemand sie anfasst. Der Köhler merkt es erst, als du schon weißt.",
        ],
      });
    } else {
      await rt.present({
        held,
        probe: ergebnis,
        lines: ["Die Schleifspur verliert sich im nassen Farn. Der Köhler ist schon fort."],
      });
    }
    return;
  }

  const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "nach dem Gebetsband fragen", "nebel", "reden");
  if (ergebnis.erfolg) {
    held.koehlerBefragt = true;
    schliesseFaden(held, "anvertraut");
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "„Es gehört niemandem mehr, den ich nennen will“, sagt der Köhler. „Aber wenn du am Ende der Kiste die Namen liest, dann halt inne, bevor du das letzte Kreuz überliest.“",
        "Er löst den letzten Knoten selbst, zum ersten Mal seit Wochen. Er sagt einen Namen, leise, als könnte ihn noch jemand hören.",
      ],
    });
    return;
  }
  await rt.present({
    held,
    probe: ergebnis,
    lines: ["Er schüttelt den Kopf. „Nicht dir. Noch nicht.“ Dann ist nur noch Rauch da."],
  });
}

export function waldFadenZeilen(held: Held): string[] {
  const lines: string[] = [];
  if (held.fadenRinne) {
    lines.push("Zwischen den Farnen klebt ein Fetzen Wolle. Dieselbe Schnittkante wie in der Rinne bei der Schmiede.");
  }
  if (held.fadenHolm) {
    lines.push("Der Rauch hier hat denselben Geruch wie Holms Brief, obwohl kein Siegel brennt.");
  }
  if (held.fadenMehlsackSpan && (held.salzGerettet || held.salzLiegenGelassen)) {
    lines.push("Am Weg liegt schwarzes Holz. Du hast denselben Span schon im falschen Mehlsack gehalten.");
  }
  return lines;
}

export function nachspielFadenZeile(): string {
  return "Neben dem Kreuz, das bei einem der Namen steht, liegt eine Locke aus weißem Haar, verknotet mit rotem Garn — derselben Farbe wie der Knoten an der Kapellenglocke. Du hebst den Kinderumhang auf, den bisher niemand berührt hat, und liest den Namen daneben zum ersten Mal laut. Er ist kein Fremder mehr.";
}

export function schliesseFadenAmLager(held: Held): string[] {
  if (fadenAnzahl(held) < 5) return [];
  if (!held.ungerufenerNameGeloest) schliesseFaden(held, "gefolgt");
  else held.fadenGeschlossen = true;
  return [nachspielFadenZeile()];
}

export function epilogFadenBits(held: Held): string[] {
  const bits: string[] = [];
  if (held.fadenGeschlossen && held.bettlerGeholfen) {
    bits.push("Der Bettler am Brunnen hört den Namen seines Sohnes nicht von dir. Aber er sieht, dass du ihn kennst. Das reicht ihm, um endlich den Groschen wegzulegen.");
  } else if (held.fadenGeschlossen) {
    bits.push("Du kennst jetzt einen Namen, den in Lindendorf niemand mehr ausspricht. Du bist der Einzige.");
  }
  if (held.ungerufenerNameGeloest === "anvertraut") {
    bits.push("Der Junge am Brunnen trägt keine Schnur mehr — nur noch die Erinnerung daran, dass sie jemand ernst genommen hat.");
  } else if (held.ungerufenerNameGeloest === "erzwungen") {
    bits.push("Der Köhler spricht mit niemandem mehr über den Namen. Auch nicht mit dir.");
  } else if (held.ungerufenerNameGeloest === "gefolgt") {
    bits.push("Die Spur, die niemand suchte, bleibt bei dir. Das Dorf hat sie gesehen und beschlossen, sie nicht zu lesen.");
  }
  return bits;
}
