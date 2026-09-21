import { goldPlus, nimm, probe, schaden } from "./engine";
import { vielleichtHeiltrank } from "./heal";
import {
  dennekCharismaSchwer,
  echoDruckDennek,
  echoGasseAmBrunnen,
  echoGrovinKenntMuehle,
  echoMuehleAmBrunnen,
} from "./reihe-versorgung";
import type { Runtime } from "./runtime";
import { HEILTRANK, LEICHT, MITTEL, SCHWER, tot, type Held } from "./types";

export async function dorfTruebesWasser(rt: Runtime, held: Held) {
  if (held.loesungswegBrunnen) {
    await brunnenNachspiel(rt, held);
    return;
  }

  const schonDrin = held.truebungBestaetigt || held.spurAmBrunnen || held.grovinGenannt;
  if (!schonDrin) {
    await rt.present({
      id: "brunnen-krug",
      title: "Der bittere Krug",
      art: "well",
      portrait: "dennek",
      held,
      lines: [
        "Der Wassereimer am Dorfbrunnen steht noch halb voll von der Nacht. Niemand hat sich heute Morgen die Mühe gemacht, ihn zu leeren und neu zu füllen — nicht vor dem Brot, nicht vor dem Vieh.",
        "Das Wasser hat die falsche Farbe: ein trübes Graubraun, wie aufgewühlter Teichgrund statt klarer, kalter Tiefe ohne Geschichte.",
        "Vor der Apotheke hustet ein Kind, trocken und hart, als sitze ihm etwas Falsches in der Brust fest. Die Mutter hält es fester, als das bloße Husten verlangt — mit einem Griff, der weniger dem Kind gilt als der eigenen Angst.",
        "Am Brunnenrand steht Ratsherr Dennek und rührt mit einem Stock im Eimer. Langsam. Im Kreis. Als ließe sich vergiftetes Wasser klären wie ein Brei, dem nur noch Geduld fehlt.",
        "Er sieht dabei niemanden an — weder das Kind noch die Mutter noch die Vorübergehenden. Als hoffe er, dass die Bewegung seiner Hand auch die Fragen im Kreis hält.",
      ],
    });
  }

  while (!tot(held) && !held.loesungswegBrunnen) {
    const grabenLabel = held.spurAmBrunnen
      ? "Dem Ablaufgraben zur Zisterne folgen"
      : held.grovinGenannt
        ? "Nach Grovins altem Bau am Waldrand suchen"
        : "Den Graben am Brunnenrand verfolgen";
    const items: { id: string; label: string }[] = [
      { id: "kern", label: "Mit Witwe Kern über das Wasser sprechen" },
      { id: "dennek", label: "Mit Ratsherr Dennek sprechen" },
      { id: "brunnen", label: "Den Brunnen selbst untersuchen" },
      { id: "graben", label: grabenLabel },
      { id: "dorf", label: "Zurück zum Dorfplatz" },
    ];
    const wahl = await rt.present({
      id: "brunnen-hub",
      title: "Trübes Wasser",
      art: "well",
      portrait: "dennek",
      held,
      lines: [
        "Das Wasser im Eimer bleibt trüb bis auf den Grund, gleich wie oft man danach sieht, und es schmeckt nach Eisen, sobald der Wind vom Wald herüberzieht, als trüge er selbst einen Rest der Wahrheit mit sich, die man ihm sonst nirgendwo abringen kann.",
        held.truebungBestaetigt
          ? "Kern hat inzwischen die Kranken benannt, einen nach dem anderen, mit der Genauigkeit einer Frau, die genau weiß, wie viele Betten in ihrem Dorf zu eng geworden sind. Dennek steht noch immer am Rand, unverändert, als gehöre ihm der Brunnen selbst, als sei die Sorge um sein Wasser eine private Angelegenheit und keine, die das ganze Dorf teilt."
          : "Kerns Tür steht einen Spalt offen, als warte sie auf jemanden, der endlich hineingeht, statt nur vorbeizulaufen. Dennek trommelt derweil mit den Fingern auf die Brunnenmauer, ein unruhiges, kleines Geräusch, das nicht zum Rühren im Eimer passen will — die Hände eines Mannes, der etwas weiß, das seine Zunge noch nicht hergeben will.",
        ...echoMuehleAmBrunnen(held),
        ...echoGasseAmBrunnen(held),
      ],
      choices: items.map((item) => item.label),
    });
    const id = items[wahl]?.id;
    if (id === "kern") await kernWasser(rt, held);
    else if (id === "dennek") await dennekGespraech(rt, held);
    else if (id === "brunnen") await brunnenUntersuchen(rt, held);
    else if (id === "graben") await ablaufgraben(rt, held);
    else return;
  }
}

async function brunnenNachspiel(rt: Runtime, held: Held) {
  if (held.loesungswegBrunnen === "bestochen") {
    await rt.present({
      title: "Am Brunnen",
      art: "well",
      portrait: null,
      held,
      lines: [
        "Das Wasser ist klarer, gewiss, doch nie wirklich genug, um für alle zu reichen. Ein zweiter Eimer bleibt ungefüllt. Niemand fragt, wohin der Rest läuft.",
        ...echoMuehleAmBrunnen(held),
        ...echoGasseAmBrunnen(held),
      ],
    });
    return;
  }
  await rt.present({
    title: "Am Brunnen",
    art: "well",
    portrait: null,
    held,
    lines: [
      "Der Eimer ist wieder klar bis auf den Grund, wie man es sich schon lange nicht mehr zu hoffen getraut hatte.",
      held.dennekEntlarvt
        ? "Niemand im Dorf fragt laut nach dem Warum — nur Dennek selbst meidet den Brunnenrand. Die Finger haben nichts mehr, worauf sie trommeln könnten."
        : "Dennek steht noch da. Er rührt nicht mehr im Wasser. Er sieht auch nicht zu dir.",
      ...echoMuehleAmBrunnen(held),
      ...echoGasseAmBrunnen(held),
    ],
  });
}

export async function kernWasser(rt: Runtime, held: Held) {
  if (held.loesungswegBrunnen) {
    await rt.present({
      title: "Bei Witwe Kern",
      art: "apothecary",
      portrait: "kern",
      held,
      lines:
        held.loesungswegBrunnen === "bestochen"
          ? [
              "Kern wiegt weiterhin dieselbe Mischung ab, nur seltener nun, mit den Pausen einer Frau, die spürt, dass sich etwas geändert hat, ohne den Grund dafür zu kennen.",
              "„Es reicht länger“, sagt sie. „Es reicht nicht.“ Sie sieht dich dabei an, auf eine Weise, die zu verstehen gibt, dass sie ahnt, du wüsstest mehr, als das Dorf je erfahren wird.",
            ]
          : [
              "Kern braut zum ersten Mal seit vielen Tagen wieder etwas anderes als bloßes Fiebermittel — eine Mischung gegen Kopfschmerzen vielleicht, oder ein Balsam für aufgeschürfte Haut, kleine, fast vergessene Sorgen, die endlich wieder Raum haben.",
              "Sie fragt nicht, warum das Wasser plötzlich klar ist. Sie füllt einfach ihre Flaschen, solange niemand hustet, mit der stillen Dankbarkeit derer, die gelernt haben, gute Zeiten nicht durch Fragen zu gefährden.",
            ],
    });
    return;
  }

  const erst = !held.truebungBestaetigt;
  held.truebungBestaetigt = true;
  await rt.present({
    title: "Bei Witwe Kern",
    art: "apothecary",
    portrait: "kern",
    held,
    lines: erst
      ? [
          "Kern hat die Ärmel hochgekrempelt, wie eine Frau, die sich auf eine lange Arbeit einstellt. Auf der Waage vor ihr liegt dieselbe Kräutermischung, die sie schon seit Tagen abwiegt und die trotzdem nie zu reichen scheint, gleich wie oft sie die Schale neu füllt.",
          "„Bauchschmerzen. Fieber. Ein metallischer Geschmack im Mund, den man nicht wegspülen kann.“ Sie zählt die Symptome auf, als lese sie eine Liste, die sie längst auswendig kennt. „Die Kinder zuerst, dann die Alten. So ist es immer, wenn etwas von unten kommt und nicht von oben.“",
          "Lohn bietet sie dir nicht an, kein Wort davon, keine Geste in Richtung ihrer Geldkiste — als sei ihr die Frage danach selbst schon fremd geworden, angesichts dessen, was vor ihrer Tür wartet. „Etwas Fremdes ist im Wasser“, sagt sie stattdessen, mit der Bestimmtheit einer Frau, die sich nicht zum ersten Mal irrt, wenn sie ihrem eigenen Urteil vertraut. „Nicht Krankheit allein. Jemand hat den Brunnen angefasst.“",
          "Unter den Krankenzetteln, die an ihrer Wand hängen, in unordentlichen Reihen, festgesteckt mit Nadeln, die man auch für etwas anderes brauchen könnte, sind zwei ganz frisch, die Tinte kaum trocken. Beide nennen Häuser, die nah am Brunnen liegen — zu nah, um Zufall zu sein.",
        ]
      : [
          "Kern wiegt die Mischung von Neuem ab, doch die Schale senkt sich nicht weit genug, gleich wie viel sie hineinschüttet, als widersetze sich das Kraut ihrer Absicht.",
          held.grovinGenannt
            ? "„Grovin hat den Brunnen gebaut“, sagt sie, ohne von der Waage aufzusehen. „Wenn irgendjemand weiß, wohin das Wasser verschwindet, dann er, und niemand sonst.“"
            : "„Dennek steht am Rand und rührt“, sagt sie stattdessen, mit einer Bitterkeit, die sie nicht zu verbergen versucht, „als könnte ein Stock eine Schuld klären, die tiefer sitzt als der Eimer.“",
        ],
  });
}

async function dennekGespraech(rt: Runtime, held: Held) {
  if (held.dennekEntlarvt) {
    await rt.present({
      id: "ratsherr-dennek",
      title: "Ratsherr Dennek",
      art: "well",
      portrait: "dennek",
      held,
      lines: [
        "Dennek trommelt nicht mehr. Die Finger liegen jetzt flach auf dem kalten Stein der Brunnenmauer, ausgebreitet, fast als müssten sie sich dort festhalten, um nicht ins Wanken zu geraten.",
        "„Grovin“, sagt er, und der Name kostet ihn nun nichts mehr, keine Anstrengung, kein Zögern — als hätte das Aussprechen der Wahrheit einer Last gleichgekommen, die er endlich abgesetzt hat. „Zisterne am Waldrand. Ich habe nicht bezahlt, das ist wahr, und ich werde es auch nicht schönreden. Das Wasser hat den Rest erledigt, an meiner statt.“",
      ],
    });
    return;
  }

  const lines = [
    "Dennek rührt weiter im Eimer, mechanisch, ohne Überzeugung, und das Wasser wird dadurch um keinen Deut klarer, was ihm selbst nicht zu entgehen scheint, auch wenn er die Bewegung nicht einstellt. „Trockenes Jahr“, sagt er, mit der glatten Sicherheit eines Mannes, der diesen Satz schon oft geübt hat. „Der Brunnen gibt, was er kann. Mehr zu verlangen wäre schon Klage, und wofür sollte man klagen, wenn die Erde selbst knapp ist?“",
  ];
  if (held.truebungBestaetigt) {
    lines.push(
      "Du trägst die Liste bei dir, die Namen der Kranken, fein säuberlich notiert — und Dennek sieht auf deine Schuhe, nicht auf den Eimer, nicht auf dich, als läge in deinen Stiefeln mehr Wahrheit, als er zu ertragen bereit ist, aus deinem Gesicht zu lesen.",
    );
  }
  if (held.buergermeisterVertraut) {
    lines.push(
      "Er kennt Holms Vorschuss, jenes stille Zeichen, dass man mit einigem Gewicht im Rücken hier steht — und das macht ihn höflicher im Ton, gewiss, aber keineswegs ehrlicher in der Sache. Höflichkeit und Wahrheit, das lernt man an diesem Brunnenrand, sind zwei getrennte Münzen.",
    );
  }
  lines.push(...echoDruckDennek(held));

  const schwer = dennekCharismaSchwer(held);
  const items: { id: string; label: string }[] = [
    {
      id: "charisma",
      label: held.truebungBestaetigt
        ? "Ihn mit den Kranken stellen (Charisma, mittel)"
        : "Nach dem trockenen Jahr fragen (Charisma, schwer)",
    },
    {
      id: "staerke",
      label: held.buergermeisterVertraut
        ? "Ihn im Namen des Rats festlegen (Stärke, mittel)"
        : "Ihn an die Mauer drücken (Stärke, mittel)",
    },
    { id: "gehen", label: "Ihn am Eimer lassen" },
  ];

  const wahl = await rt.present({
    id: "ratsherr-dennek",
    title: "Ratsherr Dennek",
    art: "well",
    portrait: "dennek",
    held,
    lines,
    choices: items.map((item) => item.label),
  });
  const id = items[wahl]?.id;
  if (id === "gehen" || id == null) return;

  if (id === "charisma") {
    const ergebnis = probe(held, "Charisma", held.charisma, schwer, "Denneks Ausflucht prüfen", undefined, "reden");
    await dennekProbe(rt, held, ergebnis);
    return;
  }
  const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "Dennek festlegen", undefined, "kaempfen");
  await dennekProbe(rt, held, ergebnis);
}

async function dennekProbe(rt: Runtime, held: Held, ergebnis: ReturnType<typeof probe>) {
  if (ergebnis.erfolg) {
    held.dennekEntlarvt = true;
    held.grovinGenannt = true;
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "Dennek trommelt einmal zu oft mit den Fingern, ein letztes, nervöses Klopfen — und dann, mit einem Mal, bleiben die Finger vollkommen still, als hätten sie endlich begriffen, dass kein Rhythmus der Welt diese Wahrheit noch länger übertönen kann.",
        "„Grovin hat den Brunnen gebaut“, sagt er schließlich, mit einer Stimme, der jede Farbe entwichen ist. „Wir haben ihn nicht bezahlt, damals, vor Jahren, als das Geld für Wichtigeres gebraucht wurde, oder so hat man es sich eingeredet. Seither ist er verschwunden — und das Wasser geht mit ihm, dorthin, wo er es jetzt braucht.“",
        "Er lässt den Stock, mit dem er all die Zeit gerührt hat, in den Eimer fallen, ein kleines, endgültiges Geräusch. Dann wendet er den Blick ab, als gehöre der Brunnenrand, an dem er so lange Wache gehalten hat, nun plötzlich nicht mehr zu seinem Amt, sondern zu einer Schuld, die er lieber jemand anderem überließe.",
      ],
    });
    return;
  }
  held.grovinGenannt = true;
  await rt.present({
    held,
    probe: ergebnis,
    lines: [
      "Dennek bleibt stur, unbeirrbar in seiner Ausflucht. „Trockenes Jahr“, wiederholt er, als reiche die bloße Wiederholung, um eine Behauptung wahrer zu machen. „Mehr steht nicht im Buch, und mehr wirst du von mir nicht hören.“",
      "Doch beim dritten Satz, mitten im Fluss seiner eigenen Rede, rutscht ihm ein Name heraus — Grovin — kaum lauter als ein Atemzug, aber deutlich genug, dass man ihn nicht überhören kann. Er schluckt ihn nicht mehr ganz hinunter, dieses eine Mal, so sehr er es auch versucht.",
      "Die Finger trommeln unterdessen weiter, unverändert, im selben nervösen Takt wie zuvor. Lügen, so scheint es, haben hier ihren eigenen Rhythmus, einen, den man mit der Zeit lernt zu erkennen, auch ohne die Worte selbst zu verstehen.",
    ],
  });
}

async function brunnenUntersuchen(rt: Runtime, held: Held) {
  if (held.spurAmBrunnen) {
    await rt.present({
      title: "Brunnenschacht",
      art: "well",
      artSrc: "/art/well-depth.mp4",
      portrait: null,
      held,
      lines: [
        "Frischer Mörtel klebt an einer Steinfuge, nicht älter als ein paar Nächte, glatt und hell im Gegensatz zum verwitterten Stein ringsum. Dahinter, kaum zu erkennen, ein schmaler Ablaufgraben, der aus dem Dorf hinausführt, Richtung Wald, unauffällig genug, um von jedem, der nicht genau hinsieht, für ein Werk des Regens gehalten zu werden.",
        "Denneks Stock, das fällt einem jetzt erst auf, hat beim Rühren stets genau diese Stelle gemieden, jedes Mal, als kenne die Hand, die ihn führt, die Wahrheit besser als der Mund, der sie leugnet.",
      ],
    });
    return;
  }
  const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "den Brunnenrand prüfen", undefined, "wahrnehmung");
  if (ergebnis.erfolg) {
    held.spurAmBrunnen = true;
    await rt.present({
      title: "Brunnenschacht",
      art: "well",
      artSrc: "/art/well-depth.mp4",
      portrait: null,
      held,
      probe: ergebnis,
      lines: [
        "Frischer Mörtel klebt an einer Steinfuge, nicht älter als ein paar Nächte, glatt und hell im Gegensatz zum verwitterten Stein ringsum. Dahinter, kaum zu erkennen, ein schmaler Ablaufgraben, der aus dem Dorf hinausführt, Richtung Wald, unauffällig genug, um von jedem, der nicht genau hinsieht, für ein Werk des Regens gehalten zu werden.",
        "Denneks Stock, das fällt einem jetzt erst auf, hat beim Rühren stets genau diese Stelle gemieden, jedes Mal, als kenne die Hand, die ihn führt, die Wahrheit besser als der Mund, der sie leugnet.",
      ],
    });
    return;
  }
  await rt.present({
    title: "Brunnenschacht",
    art: "well",
    artSrc: "/art/well-depth.mp4",
    portrait: null,
    held,
    probe: ergebnis,
    lines: [
      "Der Stein am Rand ist nass, feucht wie nach einem Regen, der nicht gefallen ist, und der Eimer bleibt trüb, gleich wie tief man hineinsieht. Mehr als das gibt der Brunnenrand nicht her, jedenfalls nicht auf den ersten Blick.",
      "Wer den Graben dennoch finden will, muss ihn später im Unterholz suchen, ohne die verräterische Fuge als Zeugin, allein auf sein Gespür angewiesen.",
    ],
  });
}

async function ablaufgraben(rt: Runtime, held: Held) {
  if (!held.spurAmBrunnen) {
    const suche = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "den Ablaufgraben finden", undefined, "wahrnehmung");
    if (!suche.erfolg) {
      await rt.present({
        art: "forest",
        held,
        probe: suche,
        lines: [
          "Dornen ranken sich über feuchtes, welkes Laub, und im Unterholz zeigen sich gleich drei kleine Gräben, die alle gleichermaßen nach bloßem Regenwasser aussehen, keiner ausgezeichnet vor den anderen.",
          "Ohne die Fuge am Brunnen als Beweis bleibt jeder Weg nur eine Vermutung, eine Behauptung ohne Boden.",
        ],
      });
      return;
    }
    await rt.present({
      art: "ditch",
      held,
      probe: suche,
      lines: [
        "Man findet den richtigen Graben dort, wo das Gras merklich kürzer steht, als es der Regen allein erklären könnte — ein stiller Verrat der Natur an dem, der sie zu lesen weiß.",
        "Der Graben verläuft gerade, zu gerade, um das Werk von Wildwasser zu sein, das sich für gewöhnlich seinen eigenen, launischen Weg sucht.",
      ],
    });
  }

  await rt.present({
    title: "Ablaufgraben",
    art: "ditch",
    portrait: null,
    held,
    lines: [
      "Der Graben endet an einer halb überwucherten Zisterne, deren Mauerwerk zwar alt ist, dessen Fugen jedoch, seltsam genug, sauber und gepflegt wirken.",
      "Jemand, das wird schnell klar, hält dieses Bauwerk sorgfältig instand, während im Dorf dahinter die Kinder husten.",
    ],
  });

  const sneakSchwer = held.spurAmBrunnen ? MITTEL : SCHWER;
  const weg = await rt.present({
    title: "An der Zisterne",
    art: "ditch",
    portrait: null,
    held,
    lines: [
      "Dorniges Gestrüpp steht dicht vor dem steinernen Becken, ein natürlicher Wall. Dahinter, kaum sichtbar durch die Zweige, bewegt sich eine flache Hand über Wasser, das reiner und klarer ist als alles, was man seit Tagen im Dorf gesehen hat.",
    ],
    choices: [
      "Sich durch das Gestrüpp zwängen (Stärke, leicht)",
      held.spurAmBrunnen
        ? "Sich unbemerkt nähern (Geschick, mittel)"
        : "Sich unbemerkt nähern (Geschick, schwer)",
      "Umkehren",
    ],
  });
  if (weg === 2) return;

  let grovinBereit = false;
  if (weg === 0) {
    const ergebnis = probe(held, "Stärke", held.staerke, LEICHT, "durch das Gestrüpp", undefined, "klettern");
    if (!ergebnis.erfolg) {
      const wunde = schaden(held, 1, "Dornen");
      await rt.present({
        held,
        probe: ergebnis,
        log: [wunde],
        lines: [
          "Die Dornen nehmen sich, was ihnen zusteht — Stoff zunächst, dann Haut darunter, kleine, brennende Schnitte. Alarm jedoch geben sie keinen.",
          "Man kommt hindurch, zerrissen und leicht blutend, aber immerhin unangekündigt genug, dass niemand drüben am Becken aufschaut.",
        ],
      });
    } else {
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Das Gestrüpp gibt bereitwillig nach, an einer Stelle, wo offenbar schon öfter jemand hindurchgegangen ist — ein schmaler, kaum sichtbarer Pfad im Dornengewirr, den nur ein geübtes Auge als solchen erkennt.",
        ],
      });
    }
  } else {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, sneakSchwer, "sich der Zisterne nähern", undefined, "schleichen");
    if (!ergebnis.erfolg) {
      grovinBereit = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Ein trockener Ast bricht unter dem eigenen Fuß, viel zu laut in der Stille. Die flache Hand auf dem Wasser hält einen Moment lang inne — und bewegt sich dann nicht mehr.",
          "Grovin richtet sich auf. In seiner anderen Hand liegt eine Grabegabel, deren Zinken bedenklich blanker poliert sind, als es das bloße Werkzeug eines Mannes rechtfertigen würde, der für gewöhnlich nur den Wasserstand misst.",
        ],
      });
    } else {
      await rt.present({
        art: "sneak",
        held,
        probe: ergebnis,
        lines: [
          "Man gelangt seitlich an das Becken heran, ungesehen. Grovin prüft derweil weiterhin, unwissend, den Wasserstand mit der flachen Hand, in aller Ruhe, als gehöre ihm diese Stille ganz allein und niemand könnte sie ihm streitig machen.",
        ],
      });
    }
  }

  if (tot(held)) {
    held.todesort = "zisterne";
    return;
  }
  await grovinZisterne(rt, held, grovinBereit);
}

async function grovinZisterne(rt: Runtime, held: Held, bewaffnet: boolean) {
  const lines = [
    "Das Wasser in der Zisterne ist klar bis auf den steinigen Grund, klarer als alles, was der Brunnen im Dorf seit Tagen zu bieten hat. Grovin blickt zuerst hinunter darauf, dann erst zu dir hinüber, mit der abschätzenden Ruhe eines Mannes, der lange genug allein gelebt hat, um sich von einem unerwarteten Besuch nicht sonderlich aus der Fassung bringen zu lassen.",
    "„Ich habe dem Dorf diesen Brunnen gebaut“, sagt er, „und es hat mich dafür nicht bezahlt. Also nimmt sich das Wasser, was mir zusteht, und ich helfe ihm dabei nach.“",
  ];
  if (bewaffnet) {
    lines.push("Die Grabegabel bleibt zwischen euch stehen, eine stumme Grenze. Ihre Zinken tropfen — nicht von Regen.");
  }
  if (held.dennekEntlarvt) {
    lines.push(
      "„Dennek trommelt, wenn er lügt“, fügt Grovin trocken hinzu, fast amüsiert. „Ich habe das schon gehört, lange bevor du geboren wurdest, und ich habe es nie vergessen.“",
    );
  }
  lines.push(...echoGrovinKenntMuehle(held));

  await rt.present({
    title: "Grovins Zisterne",
    art: "ditch",
    portrait: "grovin",
    held,
    lines,
  });

  if (!held.grovinsGrund) {
    const frage = await rt.present({
      title: "Grovins Zisterne",
      art: "ditch",
      portrait: "grovin",
      held,
      lines: [
        "Grovin wartet. Die Hand bleibt auf dem Wasser, als könnte er daran ablesen, ob du fragst oder nimmst.",
        "Nicht lange. Die Zisterne hat keinen Platz für zwei Rechnungen gleichzeitig.",
      ],
      choices: [
        "Ihn nach der ausgebliebenen Entschädigung fragen",
        "Sofort handeln",
      ],
    });
    if (frage === 0) {
      held.grovinsGrund = true;
      held.grovinGenannt = true;
      await rt.present({
        title: "Grovins Zisterne",
        art: "ditch",
        portrait: "grovin",
        held,
        lines: [
          "Grovin legt die Hand erneut aufs Wasser, wie um daran zu prüfen, ob man ihm wirklich zuhört, oder nur eine weitere Frage stellt, auf die man die Antwort längst zu kennen glaubt.",
          "„Drei Jahre Arbeit“, sagt er. „Kein Lohn dafür. Dennek hat gesagt, das Amt zahle später. Später —“ er lässt das Wort einen Moment in der Luft hängen, „— später ist ein Grab ohne Stein, ohne Namen darauf, den sich zu merken lohnte.“",
          "Er will das Dorf nicht vergiften, das macht er deutlich, mit einer Bestimmtheit, die keinen Widerspruch duldet. Er will nur, dass irgendjemand, endlich, diese eine Rechnung liest, die man ihm all die Jahre verweigert hat.",
        ],
      });
    }
  }

  const kampfSchwer = bewaffnet ? SCHWER : MITTEL;
  const oeffnenSchwer = held.spurAmBrunnen ? MITTEL : SCHWER;
  const items: { id: string; label: string }[] = [
    {
      id: "zerstoeren",
      label: bewaffnet
        ? "Die Sperre gewaltsam brechen (Stärke, schwer)"
        : "Die Sperre gewaltsam brechen (Stärke, mittel)",
    },
    {
      id: "oeffnen",
      label: held.spurAmBrunnen
        ? "Die Sperre unbemerkt umlegen (Geschick, mittel)"
        : "Die Sperre unbemerkt umlegen (Geschick, schwer)",
    },
  ];
  if (held.grovinsGrund) {
    items.push({ id: "handeln", label: "Ihm Holms Entschädigung versprechen (Charisma, mittel)" });
  }
  items.push({
    id: "bestechen",
    label: held.gold >= 5 ? "Ihn mit 5 Gold ruhigstellen" : "Ihn mit Gold ruhigstellen — zu wenig Gold",
  });
  items.push({ id: "gehen", label: "Die Zisterne verlassen" });

  const wahl = await rt.present({
    title: "Grovins Zisterne",
    art: "ditch",
    portrait: "grovin",
    held,
    lines: [
      "Die Sperre sitzt im Gerinne, unscheinbar wie ein Brett, das jemand zum Trocknen hingelegt hat. Grovin sieht nicht weg.",
    ],
    choices: items.map((item) => item.label),
  });
  const id = items[wahl]?.id;
  if (id === "gehen" || id == null) return;

  if (id === "bestechen") {
    if (held.gold < 5) {
      await rt.present({
        held,
        lines: [
          "Grovin blickt in den angebotenen Beutel, ohne ihn auch nur zu berühren, mit der abschätzigen Genauigkeit eines Mannes, der solche Beutel schon zu oft gewogen hat.",
          "„Später ist schon einmal gekommen“, sagt er nur. „Es war leer.“",
        ],
      });
      return;
    }
    held.gold -= 5;
    held.loesungswegBrunnen = "bestochen";
    await rt.present({
      held,
      log: ["→ 5 Gold. Grovin behält seine Zisterne."],
      lines: [
        "Grovin nimmt das Gold entgegen, ohne es nachzuzählen — er kennt den Betrag genau, den man zahlt, damit niemand mehr fragt, auf den Cent genau, als hätte er ihn selbst schon oft genug festgelegt.",
        "Ein Teil des Wassers läuft daraufhin zurück ins Dorf, ein anderer Teil bleibt hier, bei ihm. Das Dorf wird seltener husten müssen von nun an — doch satt trinken wird es sich nie wieder wirklich können.",
      ],
    });
    await brunnenEnde(rt, held);
    return;
  }

  if (id === "handeln") {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "Grovin ein Versprechen geben", undefined, "reden");
    if (ergebnis.erfolg) {
      held.loesungswegBrunnen = "verhandelt";
      held.grovinVersprechen = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Grovin hört das Wort „Amt“, ohne dabei den Blick abzuwenden, wie er es sonst bei leeren Versprechungen zu tun pflegt.",
          "„Wenn Holm zahlt, öffne ich selbst“, sagt er. „Zahlt er nicht, kommt das Wasser nicht zurück. Das ist kein Drohen, das ich hier ausspreche. Das ist die alte Rechnung, die endlich beglichen werden will.“",
          "Er legt die Sperre eigenhändig um. Das klare Wasser läuft den Graben zurück, dem Dorf entgegen, als hätte es den alten Weg nie wirklich vergessen, nur lange genug darauf gewartet, ihn wieder gehen zu dürfen.",
        ],
      });
      await brunnenEnde(rt, held);
      return;
    }
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "Grovin schüttelt nur den Kopf, ohne Zorn, fast mit einer Art müder Belustigung.",
        "„Versprechen habe ich schon einige gehört“, sagt er. „Sie wiegen allesamt weniger als diese Hand hier auf dem Wasser.“",
      ],
    });
    return;
  }

  if (id === "oeffnen") {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, oeffnenSchwer, "die Wassersperre umlegen", undefined, "klettern");
    if (ergebnis.erfolg) {
      held.loesungswegBrunnen = "geoeffnet";
      await rt.present({
        art: "sneak",
        held,
        probe: ergebnis,
        lines: [
          "Die Sperre gibt leise nach, kaum ein Geräusch. Grovin bemerkt es erst, als der Wasserstand unter seiner eigenen Hand merklich sinkt.",
          "Er flucht, lautlos, ohne Stimme. Das Dorf wird nie erfahren, warum der Eimer am nächsten Morgen wieder klar ist bis auf den Grund.",
        ],
      });
      await brunnenEnde(rt, held);
      return;
    }
    const wunde = schaden(held, bewaffnet ? 4 : 2, "Grabegabel");
    held.todesort = tot(held) ? "zisterne" : held.todesort;
    await rt.present({
      art: tot(held) ? "death" : "combat",
      held,
      probe: ergebnis,
      log: [wunde],
      lines: tot(held)
        ? [
            "Grovin ist schneller am Hebel, als man es ihm zugetraut hätte. Die Grabegabel findet zuerst Stoff, dann darunter Haut.",
            "Die Zisterne bleibt klar und still, unbewegt von allem, was gerade geschehen ist. Das Dorf wartet derweil weiter auf einen Boten, der nicht mehr zurückkehren wird.",
          ]
        : [
            "Grovin ist schneller am Hebel, als man es ihm zugetraut hätte. Die Grabegabel findet zuerst Stoff, dann darunter Haut.",
            "Man trägt eine Wunde davon, schmerzhaft, aber nicht tödlich.",
          ],
    });
    if (tot(held)) return;
    await vielleichtHeiltrank(rt, held);
    return;
  }

  const ergebnis = probe(held, "Stärke", held.staerke, kampfSchwer, "die Umleitung zerstören", undefined, "kaempfen");
  if (ergebnis.erfolg) {
    held.loesungswegBrunnen = "zerstoert";
    held.grovinGeflohen = true;
    await rt.present({
      art: "combat",
      held,
      probe: ergebnis,
      lines: [
        "Das alte Holz der Sperre bricht mit einem trockenen Knacken. Wasser schießt sogleich den Graben zurück, zunächst braun vor aufgewühltem Grund, dann, nach und nach, wieder klarer.",
        "Grovin flieht, noch bevor man die Gabel in seiner Hand ganz zu Gesicht bekommt. Der Waldrand nimmt ihn auf, ohne eine einzige Frage zu stellen.",
      ],
    });
    await brunnenEnde(rt, held);
    return;
  }
  const wunde = schaden(held, bewaffnet ? 4 : 3, "Kampf an der Zisterne");
  held.todesort = tot(held) ? "zisterne" : held.todesort;
  await rt.present({
    art: tot(held) ? "death" : "combat",
    held,
    probe: ergebnis,
    log: [wunde],
    lines: tot(held)
      ? [
          "Man geht ins klare Wasser hinein und bleibt dort. Die Zisterne behält ihren Stand unverändert bei. Das Dorf behält seinen Husten.",
        ]
      : [
          "Man trägt eine Wunde vom Kampf an der Zisterne davon. Die Sperre hält weiterhin, Grovin ebenso. Man wird später wiederkommen müssen, oder es auf eine andere Art versuchen.",
        ],
  });
  if (tot(held)) return;
  await vielleichtHeiltrank(rt, held);
}

async function brunnenEnde(rt: Runtime, held: Held) {
  if (held.loesungswegBrunnen === "bestochen") {
    await rt.present({
      title: "Zwei Brunnen, ein Dorf",
      art: "well",
      portrait: "kern",
      held,
      lines: [
        "Das Wasser wird spürbar klarer, gewiss, doch nie wirklich genug, um für alle zu reichen. Kern braut weiterhin dieselbe Mischung wie zuvor, nur seltener nun.",
        "Man selbst trägt das Wissen um das, was wirklich geschah, fortan ganz allein, ohne es mit irgendwem teilen zu können.",
      ],
    });
    return;
  }

  if (held.loesungswegBrunnen === "zerstoert" && !held.dennekEntlarvt) {
    await rt.present({
      title: "Wasser mit einem Riss",
      art: "well",
      portrait: null,
      held,
      lines: [
        "Das Wasser fließt zwar wieder, doch Grovin ist verschwunden, nicht verschwunden genug, um die Sache endgültig zu beenden.",
        "In manchen Nächten hört man Schritte am Waldrand, die niemand im Dorf laut beim Namen nennen möchte, aus Furcht, damit etwas heraufzubeschwören, das besser dort bliebe, wo es hingehört.",
      ],
    });
    return;
  }

  const log: string[] = [];
  if (held.truebungBestaetigt && !held.inventar.includes(HEILTRANK)) {
    log.push(nimm(held, HEILTRANK));
  } else if (held.truebungBestaetigt) {
    log.push(goldPlus(held, 2, "Kerns Dank, weil die Flaschen reichen"));
  }

  await rt.present({
    title: "Klares Wasser",
    art: "well",
    portrait: "kern",
    held,
    log: log.length ? log : undefined,
    lines: [
      "Am nächsten Morgen ist der Eimer am Brunnen wieder klar bis auf den Grund, wie man es sich schon lange nicht mehr zu hoffen getraut hatte. Kern braut zum ersten Mal seit vielen Tagen wieder etwas anderes als bloßes Fiebermittel.",
      held.dennekEntlarvt
        ? "Niemand im Dorf fragt laut nach dem Warum — nur Dennek selbst meidet für eine Weile den Brunnenrand, als könne der Stein dort noch von seinen Fingern erzählen, und von dem Stock, den er in den Eimer fallen ließ. Die Kinder trinken, und das reicht dem Platz als Urteil."
        : "Niemand im Dorf fragt laut nach dem Warum. Fragen kosten hier Kraft, die man zum Trinken braucht, und ein klarer Eimer ist Antwort genug, solange niemand mehr hustet. Wer wissen will, wohin das trübe Wasser gelaufen ist, muss den Wald selbst fragen — und der Wald gibt solche Dinge nicht her.",
      held.grovinVersprechen
        ? "Holm schuldet Grovin jetzt eine Zahl, die nicht in der Kasse steht. Du hast es versprochen, an einer Zisterne, deren Wasser den Graben schon wieder kennt. Zahlt das Amt, bleibt der Brunnen ein Brunnen. Zahlt es nicht, kommt das Wasser nicht als Bitte zurück, sondern als alte Rechnung."
        : "Das Wasser schmeckt nach Stein, nicht nach Metall. Das reicht für ein Tal, das gelernt hat, gute Morgen nicht durch Fragen zu gefährden.",
    ],
  });
}
