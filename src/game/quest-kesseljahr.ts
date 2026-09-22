import { probe } from "./engine";
import type { Runtime } from "./runtime";
import { LEICHT, MITTEL, SCHWER, tot, type Held } from "./types";
import { gasseGrete } from "./kesseljahr-grete";
import { gasseGewoelbe } from "./kesseljahr-gewoelbe";
import { gasseKonflikt } from "./kesseljahr-schluss";

export async function dorfGasse(rt: Runtime, held: Held) {
  if (held.loesungswegGasse) {
    await gasseNachspiel(rt, held);
    return;
  }

  if (!held.gasseBesucht) {
    held.gasseBesucht = true;
    await rt.present({
      id: "gasse-kirche",
      title: "Vor der Kirche",
      art: "chapel",
      portrait: null,
      held,
      lines: [
        "Die Kirche von Lindendorf steht einen Schritt tiefer als der Platz davor, als hätte sie sich in all den Jahrhunderten langsam in die Erde gesenkt, müde von allem, was ihr je gebeichtet wurde. An der Schwelle hat der Stein selbst über die Zeit eine flache Mulde geschliffen, in der sich das Regenwasser sammelt; es läuft nicht ab, sondern steht dort wie ein kleiner, geduldiger Spiegel, in dem sich ein grauer Himmel bricht, und keiner hat in zehn Jahren daran gedacht, einen Abfluss zu schlagen. Vielleicht, weil niemand die Schwelle mehr lange genug betrachtet, um den Mangel zu bemerken.",
        "Im Schatten der Kirchmauer, dort, wohin selbst im Hochsommer nur für eine Handvoll Stunden am Tag die Sonne findet, sitzt Fenn. Seine nackten Füße liegen im kalten Wasser der Dachrinne, ohne dass er es zu spüren scheint — als sei die Kälte längst ein alter Bekannter, mit dem man keine Umstände mehr macht. Er hebt den Blick, noch bevor du an ihm vorbeigehst, und das allein ist mehr als gewöhnlich: Niemand im Dorf erinnert sich, Fenn je zuerst habe aufsehen sehen. Für gewöhnlich ist er Teil der Mauer, ein Schatten unter Schatten, den man grüßt, ohne ihn wirklich anzuschauen — heute nicht.",
        "In der Tasche seines vielfach geflickten Mantels, dessen ursprüngliche Farbe niemand mehr benennen könnte, hält er ein morsches Stück Lattenzaun. Zehn Winter haben das Holz glattgeschliffen wie einen Kiesel im Flussbett; die alten Nagellöcher sind zu bloßen Dellen verwittert, doch wer genau hinsieht, erkennt noch, wo einst zwei Bretter im rechten Winkel zusammengeschlagen waren.",
      ],
    });
    await rt.present({
      held,
      lines: [
        held.loesungswegMuehle === "verraten"
          ? "„Die Wache holt Leute, wenn jemand redet. Trotzdem muss einer zuhören, bevor sie Bretter über die Gasse legen.“"
          : "„In einer Woche kommt die Baumannschaft. Vahl hat im Rat verkündet, hinter der Gerberei stehe ein Lagerhaus. Als wäre da nie etwas gewesen.“",
        "Er wartet nicht auf eine Antwort. Die Hand in der Tasche bleibt in Bewegung.",
      ],
    });
  }

  while (!tot(held) && !held.loesungswegGasse) {
    const items: { id: string; label: string }[] = [
      { id: "fenn", label: "Bei Fenn an der Kirchmauer bleiben" },
      { id: "vahl", label: "Ratsherr Vahl im Rathaus aufsuchen" },
      { id: "gasse", label: "Die Gasse hinter der Gerberei ansehen" },
    ];
    if (held.gasseGeschichteGehoert || held.gasseSpielzeugGefunden || held.gasseOrtGesehen || held.greteGespraech) {
      items.push({
        id: "grete",
        label: held.greteGespraech ? "Noch einmal zu Grete gehen" : "Die blinde Frau am Gassenrand aufsuchen",
      });
    }
    if (held.greteGespraech) {
      items.push({
        id: "gewoelbe",
        label: held.ilsesAufzeichnungenGefunden
          ? "Das Gewölbe unter der Kirche noch einmal betreten"
          : "Das Gewölbe unter der Kirche suchen",
      });
    }
    if (held.ilsesAufzeichnungenGefunden) {
      items.push({ id: "konflikt", label: "Vahl am Abend vor der Baufreigabe stellen" });
    }
    items.push({ id: "dorf", label: "Zurück zum Dorfplatz" });

    const wahl = await rt.present({
      id: "gasse-hub",
      title: "Die leere Gasse",
      art: "gate",
      portrait: null,
      held,
      lines: hubZeilen(held),
      choices: items.map((item) => item.label),
    });
    const id = items[wahl]?.id;
    if (id === "fenn") await gasseFenn(rt, held);
    else if (id === "vahl") await gasseVahl(rt, held);
    else if (id === "gasse") await gasseOrt(rt, held);
    else if (id === "grete") await gasseGrete(rt, held);
    else if (id === "gewoelbe") await gasseGewoelbe(rt, held);
    else if (id === "konflikt") await gasseKonflikt(rt, held);
    else return;
  }
}

function hubZeilen(held: Held): string[] {
  const zeilen = [
    "Hinter der Gerberei liegt die Gasse, die niemand mehr betritt. Dabei wäre sie der kürzeste Weg zum Fluss.",
  ];
  if (held.gasseOrtGesehen) {
    zeilen.push(
      "Zwei frische Bretter lehnen an der Gerberei, noch ohne Nägel. Die Woche, die Fenn genannt hat, ist kürzer geworden.",
    );
  } else {
    zeilen.push("Unkraut reicht einem Kind bis zur Brust. An einer Hauswand laufen Striche in Reihen, zu gleichmäßig für Zufall.");
  }
  if (held.ilsesAufzeichnungenGefunden) {
    zeilen.push("Ilse Brandtners Liste liegt unter deinem Hemd. Das Wachs riecht, sobald du dich bückst. Heute Abend liegt Wachs auch auf Vahls Tisch.");
  } else if (held.gasseGeschichteGehoert) {
    zeilen.push("Fenn hat gefragt, warum dort niemand mehr geht. Die Hand in seiner Tasche hält still, solange du noch da bist.");
  } else {
    zeilen.push("Fenn wartet an der Kirchmauer. Im Rathaus redet Vahl von einem Lagerhaus.");
  }
  return zeilen;
}

async function gasseNachspiel(rt: Runtime, held: Held) {
  if (held.loesungswegGasse === "vernichtet") {
    await rt.present({
      title: "Gerbereigasse",
      art: "village",
      portrait: null,
      held,
      lines: [
        "Neue Bretter liegen harzig im Gras. Der erste Pfosten steht dort, wo der Ziehbrunnen zugewachsen war.",
        "Ein Kind fragt, wohin der Weg früher geführt hat. Die Mutter zieht es weiter, ohne zu antworten.",
      ],
    });
    await rt.present({
      art: "chapel",
      held,
      lines: [
        "Fenn sitzt an der Kirchmauer. Die Hand um das Zaunbrett ist still. Er sieht nicht zur Gasse.",
        "Die Gasse hat wieder einen Zweck. Den alten Namen wird bald niemand mehr kennen.",
      ],
    });
    return;
  }
  if (held.loesungswegGasse === "veroeffentlicht") {
    await rt.present({
      title: "Gerbereigasse",
      art: "village",
      portrait: null,
      held,
      lines: [
        "Die Gasse bleibt leer. Niemand bringt Bretter. An Vahls Fenster hängt ein Tuch.",
        held.greteBedraengt
          ? "Gretes Kate bleibt zu. Das Dorf kennt die Geschichte. Ihren Mund bekommt es nicht."
          : "Die Kratzspuren an der Hauswand sind noch da. Niemand macht sie weg.",
      ],
    });
    await rt.present({
      art: "chapel",
      held,
      lines: [
        "Die Leute grüßen Fenn, bevor sie vorbeigehen, nicht erst danach.",
        "Er hebt das Zaunbrett nicht mehr aus der Tasche. Eine Hand reicht, wenn man gesehen wird.",
      ],
    });
    return;
  }
  if (held.loesungswegGasse === "erpresst") {
    await rt.present({
      title: "Gerbereigasse",
      art: "village",
      portrait: null,
      held,
      lines: [
        "Die Gasse bleibt leer. Offiziell aus Gründen, die niemand vorliest.",
        "Zwei Männer stehen einen Morgen lang mit Brettern am Eingang und gehen wieder, ohne sie abzuladen.",
      ],
    });
    await rt.present({
      art: "townhall",
      held,
      lines: [
        "Vahl grüßt dich vom Rathausfenster, zu höflich für ein Amt. Der Siegelring bleibt diesmal still.",
        "Das Unkraut hat Zeit. Niemand nimmt sie ihm. Die Rechnung liegt zwischen euch, nicht im Gemeindebuch.",
      ],
    });
    return;
  }
  await rt.present({
    title: "Gerbereigasse",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Die Gasse bleibt leer. Holm hat den Bauplatz ruhen lassen, ohne einen Namen zu nennen.",
      "Vahl weiß nicht genau, wer ihn stoppte, und fragt nicht. Die frische Tinte an der Karte ist matt geworden.",
    ],
  });
  await rt.present({
    art: "townhall",
    portrait: "holm",
    held,
    lines: [
      "Im Rathaus liegt unter der leeren Kasse etwas, das nicht in die Abgaben gehört.",
      "Holm sieht dich an und sieht sofort wieder auf das Siegel. Die Gasse bleibt eine leere Stelle auf der Karte.",
    ],
  });
}

async function gasseFenn(rt: Runtime, held: Held) {
  if (held.gasseGeschichteGehoert) {
    await rt.present({
      id: "fenn",
      title: "Fenn",
      art: "chapel",
      portrait: null,
      held,
      lines: [
        "Fenn betastet das Zaunbrett in der Tasche, ohne es herauszuziehen. Die Kante hat sich seiner Hand angepasst.",
        held.fennGedraengt
          ? "„Du hast zuerst gedrängt. Ich habe trotzdem geredet. Mehr kann ich nicht tragen.“"
          : "„Du hast gehört. Mehr kann ich nicht tragen. Die Gasse trägt den Rest.“",
      ],
    });
    await rt.present({
      held,
      lines: [
        held.ilsesAufzeichnungenGefunden
          ? "Er sieht auf deine Brust, wo das Wachs durchschlägt. „Ilse hat geschrieben. Ich habe nur gewartet.“"
          : held.greteBedraengt
            ? "„Du hast Grete gedrängt. Sie redet nicht zweimal. Die Gasse trägt trotzdem den Rest.“"
            : "Er stellt keine zweite Frage. Eine hat gereicht.",
      ],
    });
    return;
  }

  const lines = [
    "Fenn hat seinen Platz so gewählt, dass die Kirchentür ihn nicht trifft, wenn sie aufschlägt — eine Berechnung, die nur ein Mensch anstellt, der diesen Platz nicht zum ersten Mal einnimmt. Der Stein unter ihm ist abgewetzt zu einer sanften Mulde, genau von der Form, die ein Körper über viele, viele Winter hinterlässt. Wer hier sitzt, sitzt nicht zum ersten Mal, und er sitzt auch nicht zum zehnten.",
    "„Weißt du, warum dort niemand mehr geht?“ Er stellt die Frage, ohne eine Antwort zu erwarten, als wäre die Frage selbst schon die halbe Last, die er abzugeben hatte.",
  ];
  if (held.fennGedraengt) {
    lines.push(
      "Beim letzten Mal hast du ihn unterbrochen. Die Hand um das Holz ist enger. Er gibt dir trotzdem eine zweite Chance.",
    );
  }

  const wahl = await rt.present({
    id: "fenn-an-der-kirchmauer",
    title: "Fenn an der Kirchmauer",
    art: "chapel",
    portrait: null,
    held,
    lines,
    choices: ["Warten und zuhören", "Ihn drängen", "Gehen"],
  });
  if (wahl === 2 || wahl == null) return;

  if (wahl === 1) {
    held.fennGedraengt = true;
    await rt.present({
      held,
      lines: [
        "Fenn schüttelt den Kopf, bevor der Satz zu Ende ist. In der Tasche knackt das Holz einmal.",
        "„Schlechte Ernte. Dann die Gasse zu. Mehr steht nicht im Mund eines Mannes, den niemand fragt.“",
      ],
    });
    await rt.present({
      held,
      lines: [
        "Er sieht zur Gerberei, nicht zu dir. „Wer drängt, bekommt das Jahr ohne Namen.“",
        "Die Hand bleibt im Taschenfutter. Das Wort Kesseljahr gibt er heute nicht her.",
      ],
    });
    return;
  }

  await rt.present({
    held,
    lines: [
      "„Die Gasse wurde zugenagelt. Bretter vor jede Tür, kreuzweise, wie man es sonst nur mit Häusern der Pest macht. Wache davor, Tag und Nacht, zwei Männer, die man kannte, die aber nicht mehr grüßten, sobald sie den Posten bezogen hatten. Drei Männer aus dem Rat hielten den Schlüssel zu der einen Tür, die man offen ließ, für das Korn, das kommen sollte.“",
      "Seine Hand schließt sich fester um das Stück Lattenzaun in seiner Tasche, ein Reflex, den er selbst vielleicht nicht bemerkt.",
      "„Das Korn kam nicht. Nicht genug, nicht rechtzeitig, manche Wochen gar nicht. Das Fieber kam dafür pünktlich, wie es das immer tut, wenn der Hunger ihm die Tür schon aufgehalten hat. Als man die Bretter im Frühjahr wieder abriss, war von denen, die im Herbst dort eingeschlossen wurden, kaum noch jemand übrig, der sein eigenes Haus noch hätte beanspruchen können. Und das Land — das Land wurde aufgeteilt, noch bevor die Toten kalt genug waren, um sie ordentlich zu betrauern. Vahls Großvater hat als Erster gezeichnet. Die anderen beiden folgten, wie man einer Spur folgt, die schon jemand anderes gelegt hat, damit man selbst nicht der Erste sein muss, der sie tritt.“",
    ],
  });

  held.gasseGeschichteGehoert = true;
  await rt.present({
    held,
    lines: [
      "Er sieht nicht dich an, sondern hinüber zur Gasse, als läge dort noch immer etwas, das seine Aufmerksamkeit verdient, auch nach zehn Jahren.",
      "„Grete lebt noch. Am Rand der Gasse, in dem Haus, das keiner haben wollte, weil es zu nah an den anderen steht. Sie sieht fast nichts mehr, ihre Augen sind trüb geworden wie Brunnenwasser im Winter — aber sie hört gut, und sie hört vor allem, ob du mit Zeit zu ihr kommst oder nur mit einer Frage, auf die du die Antwort schon im Kopf trägst und nur noch bestätigt haben willst. Für Letzteres hat sie kein Gehör übrig. Das hat sie sich in zehn Jahren abgewöhnt.“",
    ],
  });
}

async function gasseVahl(rt: Runtime, held: Held) {
  if (held.vahlKonfrontiert) {
    await rt.present({
      title: "Vahls Stube",
      art: "townhall",
      portrait: null,
      held,
      lines: [
        "Vahl dreht den Siegelring, ohne ihn abzustreifen. Das Wappen darin ist älter als er.",
        "Die Baufreigabe liegt nicht mehr auf dem Tisch. Nur der Ring und ein Klecks Wachs, der nicht mehr weich ist.",
        "Er nickt dir zu und sagt nichts.",
      ],
    });
    return;
  }

  await rt.present({
    title: "Ratsherr Vahl",
    art: "townhall",
    portrait: null,
    held,
    lines: [
      "Ratsherr Vahl hat eine Stube hinter Holms Kammer. Der Tisch ist zu leer für ein Amt, das so viel Land kennt.",
      "An der Wand hängt eine Karte des Dorfs. Die Gerbereigasse ist mit frischer Tinte als Baugrund umrandet. Der Rest der Karte ist es nicht.",
      "Er dreht den Siegelring am Finger, bevor du sprichst. Das Wappen gehört einem Mann, der nicht mehr da ist.",
    ],
  });

  const lines = ["„Zehn Jahre brach. Das Dorf braucht ein Lagerhaus. Ordnung ist kein Verbrechen.“"];
  if (held.gasseGeschichteGehoert) {
    lines.push("Du hast Fenns Jahr. Vahl sieht auf den Ring, nicht auf dich.");
  }
  if (held.ilsesAufzeichnungenGefunden) {
    lines.push("Unter deinem Hemd liegt Wachs, das nicht zu seinem Siegel gehört. Er riecht es nicht. Noch nicht.");
  }

  const items: { id: string; label: string }[] = [
    { id: "baugrund", label: "Nach dem geplanten Lagerhaus fragen" },
  ];
  if (held.gasseGeschichteGehoert && !held.vahlGrossvater) {
    items.push({ id: "quarant", label: "Nach der geschlossenen Gasse fragen (Charisma, mittel)" });
  } else if (held.vahlGrossvater) {
    items.push({ id: "grossvater", label: "Noch einmal nach dem Großvater fragen" });
  }
  items.push({ id: "gehen", label: "Die Stube verlassen" });

  const wahl = await rt.present({
    held,
    lines,
    choices: items.map((item) => item.label),
  });
  const id = items[wahl]?.id;
  if (id === "gehen" || id == null) return;

  if (id === "baugrund") {
    await rt.present({
      art: "evidence",
      held,
      lines: [
        "Vahl schiebt die Karte näher, als gehörte die Gasse schon dem Amt.",
        "„Ungenutztes Land. Ein zugewachsener Brunnen, den niemand braucht. Die Gerberei ist tot. Ein Weg zum Fluss nützt niemandem, wenn ihn keiner geht.“",
      ],
    });
    await rt.present({
      held,
      lines: [
        "„Das Lagerhaus steht in einer Woche. Wer dann noch fragt, warum die Gasse leer war, fragt zu spät.“",
        "Der Siegelring dreht sich weiter. Die Sätze hat er geübt. An der Umrandung ist die Tinte noch nicht trocken.",
      ],
    });
    return;
  }

  if (id === "grossvater") {
    await rt.present({
      held,
      lines: [
        "„Mein Großvater hat Verantwortung getragen. Das Amt auch. Mehr steht nicht in diesem Zimmer.“",
        "Er legt die Hand flach auf die Umrandung. Die Tinte klebt nicht. Die Hand bleibt trotzdem liegen.",
        "Der Ring bleibt in Bewegung. Das Wappen darin dreht sich, als suchte es einen anderen Finger.",
      ],
    });
    return;
  }

  const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "Vahl nach der geschlossenen Gasse fragen", undefined, "reden");
  if (ergebnis.erfolg) {
    held.vahlGrossvater = true;
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        "Vahl wird kurz starr. Der Ring bleibt einmal liegen.",
        "„Mein Großvater hat damals Verantwortung getragen. Die Gasse war krank. Man hat sie geschlossen, damit das Fieber nicht den Platz holt.“",
      ],
    });
    await rt.present({
      held,
      lines: [
        "„Das Land danach…“ Er bricht ab. Die Karte unter seiner Hand knittert leise.",
        "Mehr gibt er nicht. Den Satz über das Land hat er zu weit angefangen.",
      ],
    });
    return;
  }
  await rt.present({
    held,
    probe: ergebnis,
    lines: [
      "Vahl lächelt routiniert. Der Ring dreht sich ohne Pause.",
      "„Falls es dort noch alte Bücher gibt, liegt das bei der Kirche. Nicht bei mir. Ich verwalte Baugrund, keine Toten.“",
      "Er hält das für eine Abwehr. Es klingt nach einer Tür, die er selbst nicht bewachen will.",
    ],
  });
}

async function gasseOrt(rt: Runtime, held: Held) {
  held.gasseBesucht = true;
  held.gasseOrtGesehen = true;
  await rt.present({
    title: "Gerbereigasse",
    art: "ditch",
    portrait: null,
    held,
    lines: [
      "Die Gasse beginnt hinter der Gerberei. In den Balken hängt noch der Geruch alter Lohe, obwohl hier seit Jahren nichts mehr gegerbt wird.",
      "Verwitterte Bretter lehnen an den Türstöcken. In der Mitte steht ein zugewachsener Ziehbrunnen, der Kranz voller Disteln.",
    ],
  });
  await rt.present({
    art: "gate",
    held,
    lines: [
      "An einer Hauswand laufen Kratzspuren in Reihen. Keine Krallen. Jemand hat gezählt.",
      held.gasseSpielzeugGefunden
        ? "Unter dem losen Stein an der Gerberei liegt das Holzspielzeug noch. Ein Pferd ohne Beine. Mehr gibt die Gasse nicht her."
        : "Am Rand steht eine Kate, deren Klinke blanker ist als der Rest. Dort wohnt jemand, der die Gasse nicht als Weg benutzt.",
    ],
  });

  if (held.gasseSpielzeugGefunden) return;

  const suche = await rt.present({
    held,
    lines: [
      "Ein Stein an der Gerberei sitzt lockerer als die anderen.",
      "Die Erde darunter ist dunkler, als der Regen es erklärt.",
    ],
    choices: ["Den losen Stein prüfen (Geschick, leicht)", "Die Gasse lassen"],
  });
  if (suche !== 0) return;

  const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "unter dem Stein suchen", undefined, "wahrnehmung");
  if (ergebnis.erfolg) {
    held.gasseSpielzeugGefunden = true;
    await rt.present({
      title: "Unter dem Stein",
      art: "evidence",
      portrait: null,
      held,
      probe: ergebnis,
      lines: [
        "Unter dem Stein liegt ein verwittertes Holzspielzeug. Ein Pferd ohne Beine, die Mähne nur noch Kerben.",
        "Die Kratzspuren an der Wand sind Striche in Fünfergruppen. Die letzte Reihe bricht ab, mitten im fünften Strich.",
      ],
    });
    await rt.present({
      held,
      lines: [
        "Du legst das Pferd zurück. Es gehört hierher, auch wenn hier niemand mehr spielt.",
        "An der Kate glänzt die Klinke. Sie hat mehr Gebrauch als jede andere Tür in dieser Gasse.",
      ],
    });
    return;
  }
  await rt.present({
    held,
    probe: ergebnis,
    lines: [
      "Der Stein bleibt. Unter den Fingernägeln bleibt Erde, sonst nichts.",
      "Vahl nennt das ungenutztes Land. Das Unkraut steht in der Höhe eines Kindes. Die Striche an der Wand bleiben.",
    ],
  });
}
