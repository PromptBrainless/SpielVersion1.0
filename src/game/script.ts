import {
  canOfferHeal,
  chance,
  goldPlus,
  hat,
  heilen,
  nimm,
  pick,
  probe,
  schaden,
} from "./engine";
import type { Runtime } from "./runtime";
import { INTRO_ARTIFACT_CONTENT } from "./content";
import { LAGER_CONTENT, LAGER_WEGE, mitPreis } from "./lager-content";
import { schliesseLager } from "./taten";
import { rueckeZeitVor, leseTageszeit, wendeNaechstePhaseAn } from "./tageszeit";
import { rufAus } from "./reputation";
import { dorfMuehle } from "./quest-muehle";
import { dorfTruebesWasser, kernWasser } from "./quest-brunnen";
import { dorfGasse } from "./quest-kesseljahr";
import {
  echoEpilogVersorgung,
  echoHolmVersorgung,
  echoMaraVersorgung,
  echoPlatzVersorgung,
} from "./reihe-versorgung";
import {
  HEILTRANK,
  LEICHT,
  MAX_LP,
  MITTEL,
  SCHLUESSEL,
  SCHWER,
  tot,
  type Held,
} from "./types";

const GOLD = "Gold";

async function vielleichtHeiltrank(rt: Runtime, held: Held) {
  if (!canOfferHeal(held)) return;
  const wahl = await rt.present({
    held,
    lines: [`Du hast einen ${HEILTRANK} und ${held.lp}/${MAX_LP} LP.`],
    choices: [`${HEILTRANK} trinken`, "Aufheben für später"],
  });
  if (wahl === 0) {
    held.inventar = held.inventar.filter((item) => item !== HEILTRANK);
    const text = heilen(held, 6);
    await rt.present({
      held,
      lines: [text, "Die bittere Flüssigkeit wärmt dich von innen."],
    });
  }
}

export async function spielen(rt: Runtime, held: Held, resume = false) {
  if (!resume) await szeneIntro(rt, held);
  await szeneDorf(rt, held);
  if (!tot(held)) await szeneWald(rt, held);
  if (!tot(held)) await szeneLager(rt, held);
  await szeneEnde(rt, held);
}

async function szeneIntro(rt: Runtime, held: Held) {
  await rt.present({
    id: "intro-weg",
    title: "Der Weg nach Lindendorf",
    art: "road",
    portrait: null,
    held,
    lines: [
      "Der Weg ins Tal ist kaum breit genug für zwei Wagen. Wo sich Räder begegnen, muss einer zurücksetzen. Meistens der Schwächere.",
      "Du gehst allein.",
      "Der Regen hat in der Nacht aufgehört, aber er hängt noch immer in der Luft. Jeder Schritt drückt Wasser aus dem Leder deiner Stiefel. Kälte kriecht durch die Nähte und setzt sich in den Knochen fest.",
      "Hinter dir liegt nichts, das auf dich wartet.",
      "Vor dir liegt Lindendorf.",
      "Auf der Karte war es kaum mehr als ein Fleck Tinte am Rand des Tals. Ein Name, zwischen Hügel und Wald gequetscht, als hätte selbst der Kartenschreiber gehofft, niemand müsse jemals dorthin.",
      "In der Dämmerung wirkt es größer.",
      "Oder näher.",
      "Unter deinen Sohlen lockern sich die Steine des Weges. Wasser läuft zwischen ihnen hindurch. Schwarzes Gras wächst aus den Fugen, niedergetreten von Rädern und Hufen. Die Spuren sind alt. Zu alt für die Jahreszeit.",
      "Seit Tagen scheint niemand diesen Weg benutzt zu haben.",
      "Kein Händler.",
      "Kein Bauer.",
      "Nicht einmal ein Bettler.",
      "Nur der Wind zieht durch das Tal. Er streicht über die Hänge und bringt den Geruch von nassem Holz mit sich. Darunter liegt etwas anderes. Schwächer. Süßlich.",
      "Der Geruch von Verwesung reist weit, wenn die Luft feucht genug ist.",
      "Du bleibst nicht stehen.",
      "Umkehren ist keine Richtung. Es ist nur die Entscheidung, dieselbe Strecke noch einmal zu gehen.",
      "Also setzt du einen Fuß vor den anderen.",
      "Manchmal besteht der einzige Unterschied zwischen Mut und Gewohnheit darin, dass niemand mehr weiß, warum er überhaupt weiterläuft.",
    ],
  });

  await introArtefakt(rt, held);

  await rt.present({
    title: "Das Tal",
    art: "forest",
    portrait: null,
    held,
    lines: [
      "Der Wald steht dicht an den Hängen. Zwischen den Stämmen hängen Fetzen von Nebel.",
      "Weiter unten siehst du Rauch, der senkrecht steigt. Kein Wind. Kein gutes Zeichen, wenn Rauch so gerade steht.",
      "Jemand hat die Felder abgeerntet. Jemand anderes hat vergessen, die Zäune zu reparieren.",
      "Am Waldrand liegen Bündel aus nassem Reisig, sorgfältig aufgeschichtet und doch unberührt. Daneben steckt ein Kinderschuh im Schlamm.",
      "Kein Vogel ruft. Ein Ast bricht, weit oberhalb des Weges, und danach wartet das Tal wieder auf ein Geräusch von dir.",
      "Du verstehst noch nicht, was hier geschehen ist. Aber du erkennst die Spur einer Gegend, in der Menschen gelernt haben, ihre Fragen leise zu stellen.",
    ],
  });

  await rt.present({
    title: "Am Hang",
    art: "chapel",
    portrait: null,
    held,
    lines: [
      "Oberhalb des Dorfes schneidet ein alter Weg den Hang. Dort steht eine Kapelle, deren Dach dunkler ist als der Himmel.",
      "Eine kleine Glocke bewegt sich einmal über dem Geröll.",
      "Du kennst den Weg noch nicht. Du merkst dir nur den Ton.",
      "Unterhalb der Kapelle klafft ein trockener Graben im Hang. Früher muss dort Wasser gelaufen sein. Jetzt liegen darin Knochen von Tieren, ausgebleicht und ordentlich nebeneinander.",
      "Am Türsturz der Kapelle hängt ein Streifen rotes Wachs. Er ist gebrochen, aber nicht alt genug, um von selbst gebrochen zu sein.",
      "Die Glocke schweigt wieder. Trotzdem hast du das Gefühl, dass etwas im Tal nun weiß, dass du angekommen bist.",
    ],
  });

  await rt.present({
    title: "Lindendorf",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Häuser drücken sich aneinander, als könnten sie so wärmer bleiben.",
      "Am Brunnen stehen Frauen mit verschränkten Armen. In der Taverne löscht jemand eine Lampe, obwohl es noch nicht ganz dunkel ist.",
      "Das Rathaus hat eine Tür, die zu oft geflickt wurde. Über dem Türsturz klebt altes rotes Wachs.",
      "Ein Gerber zieht eine Plane über seine Ware. Die Plane ist zu klein. Ein Teil des Leders bleibt im Regen liegen, und niemand macht sich die Mühe, es zu retten.",
      "Aus einem offenen Fenster dringt das Husten eines alten Mannes. Eine Stimme zählt dahinter Münzen. Sie kommt immer nur bis vier.",
      "Lindendorf wirkt nicht verlassen. Es wirkt schlimmer: bewohnt von Menschen, die sich daran gewöhnt haben, dass niemand kommt.",
    ],
  });

  await rt.present({
    title: "Ankunft",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Du bleibst am Rand des Platzes stehen. Niemand fragt, wer du bist.",
      "Das ist zunächst höflich. Dann merkst du, dass es Vorsicht ist.",
      "Du könntest weitergehen. Aber der Weg nach Osten führt am Steinbruch vorbei, und aus dem Steinbruch steigt Rauch.",
      "In Lindendorf wartet niemand auf einen Helden. Trotzdem beginnt hier dein Weg.",
      "Hinter dir schließt sich das Tal wie ein nasser Kragen. Vor dir liegen Türen, hinter denen jeder etwas verloren hat und nicht jeder bereit ist, es beim Namen zu nennen.",
      "Du spürst die Blicke erst, als sie aufhören. Die Leute hier sehen Fremde nicht lange an. Sie wissen, dass man von Gesichtern allein nicht satt wird.",
      "Am Brunnen schlägt ein Tropfen auf Stein. Dann noch einer. So beginnt in diesem Dorf vieles: nicht mit einem Ruf, sondern mit etwas, das nicht aufhört.",
    ],
  });
}

async function introArtefakt(rt: Runtime, held: Held) {
  const wahl = await rt.present({
    title: INTRO_ARTIFACT_CONTENT.title,
    art: INTRO_ARTIFACT_CONTENT.art,
    portrait: null,
    held,
    lines: INTRO_ARTIFACT_CONTENT.lines,
    choices: INTRO_ARTIFACT_CONTENT.choices.map((choice) => choice.label),
  });

  if (wahl === 3) {
    held.artefaktVerloren = true;
    await rt.present({
      held,
      lines: INTRO_ARTIFACT_CONTENT.passLines,
    });
    return;
  }

  const contentChoice = INTRO_ARTIFACT_CONTENT.choices[wahl];
  const wege: Array<"kampf" | "schleich" | "ueberreden"> = ["kampf", "schleich", "ueberreden"];
  const attribut = contentChoice.attribute ?? "Stärke";
  const wert = [held.staerke, held.geschick, held.charisma][wahl] ?? held.staerke;
  const schwierigkeit = contentChoice.difficulty ?? MITTEL;
  const ergebnis = probe(held, attribut, wert, schwierigkeit, "das silberne Artefakt", "nebel", wege[wahl] === "kampf" ? "kaempfen" : wege[wahl] === "schleich" ? "schleichen" : "reden");
  held.artefaktWeg = wege[wahl] ?? "kampf";

  if (ergebnis.erfolg) {
    held.artefaktErhalten = true;
    await rt.present({
      held,
      probe: ergebnis,
      lines: [
        INTRO_ARTIFACT_CONTENT.successLines[wahl],
        "Das Silber ist kalt. In Lindendorf wird jemand wissen, woher es stammt.",
      ],
    });
  } else {
    held.artefaktVerloren = true;
    await rt.present({
      held,
      probe: ergebnis,
        lines: INTRO_ARTIFACT_CONTENT.failureLines,
    });
  }
}

async function szeneDorf(rt: Runtime, held: Held) {
  await rt.present({
    id: "dorf-platz",
    title: "Dorfplatz",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Du stehst jetzt mitten in Lindendorf. Der Platz ist klein genug, dass jedes Gespräch einen Zeugen findet.",
      "Vor dir liegen Rathaus, Taverne, Brunnen, die Mühle und der Weg zum Hang.",
      "Aus dem Osten steigt Rauch. Dort liegt der alte Steinbruch.",
      "Noch weißt du nicht, wem du glauben kannst. Du weißt nur, wo du anfangen kannst.",
      "Der Regen hat aufgehört, aber das Wasser läuft weiter von den Dächern. Es sammelt sich in den Rillen des Platzes und trägt Stroh, Asche und etwas Dunkles zum Abfluss.",
      held.loesungswegMuehle
        ? "Vor der Mühle steht kein leerer Sack mehr. Das Rad schlägt nasser als zuvor."
        : "Ein Mann mit einem leeren Sack wartet vor der Mühle. Eine Frau zieht ihr Kind aus dem Weg, als du an ihm vorbeisiehst.",
      ...(held.loesungswegBrunnen
        ? []
        : ["Am Brunnen steht ein Eimer, den heute morgen niemand geleert hat. Das Wasser darin ist trüb."]),
      ...echoPlatzVersorgung(held),
      ...(held.loesungswegGasse === "vernichtet"
        ? ["Hinter der Gerberei stehen neue Bretter. Die Gasse hat wieder einen Zweck und keinen Namen."]
        : held.loesungswegGasse
          ? ["Hinter der Gerberei bleibt die Gasse leer. Niemand fragt mehr, warum."]
          : held.gasseBesucht
            ? ["Hinter der Gerberei liegt eine Gasse, die niemand mehr als Weg benutzt."]
            : []),
      "Das Tal erzählt seine Geschichte nicht auf einmal. Es gibt sie in Türen, in Pausen und in den Dingen, die niemand mehr zu reparieren versucht.",
    ],
  });

  let rumorenGehoert = false;
  let lautAngekundigt = false;
  let bettlerRueckkehrGesehen = false;

  while (!tot(held)) {
    const glockenwegLabel = held.sannaGeholfen || held.holmSiegelGefunden || held.mehlsackGefunden || held.artefaktErhalten
      ? "Zum alten Glockenweg aufsteigen"
      : "Den Weg zum Hang erkunden";
    const dorfChoices = [
      "Mit dem Bürgermeister sprechen",
      "Die Taverne besuchen",
      "Brunnen und Dorfplatz",
      "Zur Mühle gehen",
      "Zur Gerbereigasse gehen",
      "Schmiede und Apotheke",
      ...(held.holmBesucht ? ["Nach dem roten Wachs fragen"] : []),
      glockenwegLabel,
      "Richtung Wald aufbrechen",
      "Warten, bis die Zeit sich wendet",
    ];
    const wahl = await rt.present({
      title: "Lindendorf",
      art: "village",
      portrait: null,
      held,
      lines: ["Was tust du?"],
      choices: dorfChoices,
    });
    const gewaehlt = dorfChoices[wahl] ?? "";

    if (gewaehlt === "Mit dem Bürgermeister sprechen") {
      await dorfBuergermeister(rt, held);
    } else if (gewaehlt === "Die Taverne besuchen") {
      lautAngekundigt =
        (await dorfTaverne(rt, held, rumorenGehoert, lautAngekundigt)) || lautAngekundigt;
    } else if (gewaehlt === "Brunnen und Dorfplatz") {
      rumorenGehoert = (await dorfPlatz(rt, held, rumorenGehoert)) || rumorenGehoert;
    } else if (gewaehlt === "Zur Mühle gehen") {
      rueckeZeitVor(held);
      await dorfMuehle(rt, held);
    } else if (gewaehlt === "Zur Gerbereigasse gehen") {
      rueckeZeitVor(held);
      await dorfGasse(rt, held);
    } else if (gewaehlt === "Schmiede und Apotheke") {
      await dorfSchmiedeApotheke(rt, held);
    } else if (gewaehlt === "Nach dem roten Wachs fragen") {
      await dorfHolmSiegel(rt, held);
    } else if (gewaehlt === "Warten, bis die Zeit sich wendet") {
      const vorher = leseTageszeit(held);
      const welt = wendeNaechstePhaseAn(held);
      await rt.present({
        art: "village",
        held,
        lines: [
          vorher === "nacht"
            ? "Du bleibst. Die Nacht geht, ohne dass jemand sie begräbt. Der nächste Tag kommt ohne Versprechen."
            : welt.zeitphase === "nacht"
              ? "Du bleibst. Die Läden gehen zu. Was nachts kommt, trägt keinen Namen."
              : "Du bleibst. Das Licht ändert sich, die Fragen nicht.",
        ],
      });
    } else if (gewaehlt === glockenwegLabel) {
      rueckeZeitVor(held);
      await szeneGlockenweg(rt, held);
    } else {
      if (!held.holmBesucht) {
        const go = await rt.present({
          art: "village",
          held,
          lines: [
            "Du hast noch mit niemandem im Rathaus gesprochen.",
            "In den Wald zu gehen ist möglich. Du kennst dann aber weder den Auftrag noch die Gründe der Banditen.",
          ],
          choices: ["Trotzdem in den Wald gehen", "Noch im Dorf bleiben"],
        });
        if (go === 1) continue;
      }
      if (!bettlerRueckkehrGesehen && (held.bettlerGeholfen || held.bettlerAbgewiesen)) {
        await dorfBettlerRueckkehr(rt, held);
        bettlerRueckkehrGesehen = true;
      }
      if (held.holmBesucht) {
        const wissen = [
          held.auftragErhalten
            ? "Du weißt jetzt: Die Banditen sitzen im alten Steinbruch und haben Kirchensilber genommen."
            : "Du weißt jetzt: Banditen sitzen im alten Steinbruch und haben das Dorf bestohlen. Du hast Holms Auftrag nicht angenommen.",
          "Der Wald führt dorthin. Der Hauptweg ist nicht der einzige Weg.",
          ...(held.artefaktErhalten ? ["Das silberne Artefakt gehört zur Kirche. Holm wird wissen, warum es im Tal unterwegs war."] : []),
          ...(held.glockeGestoppt ? ["Die Glocke am Hang bleibt still."] : []),
          ...(held.banditenGewarnt ? ["Die Banditen wissen bereits, dass jemand kommt."] : []),
          ...(held.loesungswegMuehle
            ? held.loesungswegMuehle === "verraten"
              ? ["Die Mühle mahlt wieder. Die Familie aus der Kornkammer ist im Rathausbuch."]
              : ["Die Mühle mahlt wieder. Bertok sagt nicht, warum."]
            : held.muehleBesucht
              ? ["Die Mühle steht still, obwohl das Rad sich dreht."]
              : []),
          ...(held.loesungswegBrunnen
            ? held.loesungswegBrunnen === "bestochen"
              ? ["Das Brunnenwasser reicht wieder. Es reicht nicht für alle."]
              : ["Das Brunnenwasser ist wieder klar."]
            : held.truebungBestaetigt
              ? ["Das Brunnenwasser macht krank. Jemand hat den Schacht angefasst."]
              : []),
          ...(held.loesungswegGasse === "veroeffentlicht"
            ? ["Der Rat hat Ilse Brandtners Liste gehört. Vahl hat seinen Sitz verloren."]
            : held.loesungswegGasse === "vernichtet"
              ? ["Die Gerbereigasse wird bebaut. Das Papier ist Asche."]
              : held.loesungswegGasse
                ? ["Die Gerbereigasse bleibt leer. Offiziell aus Gründen, die niemand vorliest."]
                : held.gasseGeschichteGehoert
                  ? ["Im Kesseljahr wurde eine Gasse abgeriegelt. Vahl will sie jetzt bebauen."]
                  : []),
          ...echoPlatzVersorgung(held),
        ];
        const aufbruch = await rt.present({
          title: "Was du weißt",
          art: "road",
          portrait: null,
          held,
          lines: wissen,
          choices: ["In den Wald gehen", "Noch im Dorf bleiben"],
        });
        if (aufbruch === 1) continue;
      }
      await rt.present({
        art: "road",
        held,
        lines: [
          "Du lässt Lindendorf hinter dir.",
          "Der Weg wird zum Pfad, der Pfad zur Spur zwischen Farnen.",
        ],
      });
      rueckeZeitVor(held);
      return;
    }
  }
}

async function dorfBuergermeister(rt: Runtime, held: Held) {
  held.holmBesucht = true;
  await rt.present({
    title: "Rathaus",
    art: "townhall",
    portrait: "holm",
    held,
    lines: [
      "Bürgermeister Holm hat Augen wie nasse Kiesel.",
      "Auf dem Tisch: eine leere Kasse, ein Siegel, ein Brief mit gebrochenem Wachs.",
      "„Banditen kommen nachts. Drei Mal schon. Getreide, zwei Ziegen, das Silbergerät der Kirche.“",
      "„Seit zwei Wochen kommt kein Mehl. Bertok schließt die Mühle, bevor jemand fragen kann. Er sagt, das Wasser stehe zu niedrig. Ich glaube ihm das nicht.“",
      ...echoHolmVersorgung(held),
      ...(held.grovinVersprechen
        ? ["„Grovin wartet auf eine Zahl. Du hast sie in meinem Namen genannt. Die Kasse kennt sie noch nicht.“"]
        : []),
      ...(held.loesungswegGasse === "weitergegeben"
        ? ["Holm legt die Hand auf die Kasse, als läge darunter noch etwas anderes als nichts."]
        : held.loesungswegGasse === "veroeffentlicht"
          ? ["„Vahl hat seinen Sitz verloren. Das Land nicht. Manche Rechnungen sind älter als dieses Amt.“"]
          : held.vahlKonfrontiert
            ? ["„Vahl grüßt dich im Flur zu höflich. Ich frage nicht, was zwischen euch liegt.“"]
            : held.vahlGrossvater
              ? ["„Vahl dreht den Ring seines Großvaters, wenn er von Baugrund spricht. Das habe ich gesehen.“"]
              : []),
      "„Ich brauche jemanden, der zum alten Steinbruch geht. Dort lagern sie.“",
      ...(held.artefaktErhalten
        ? ["Als Holm das silberne Artefakt sieht, verliert sein Gesicht für einen Moment jede Farbe. Es gehört zur Kirche."]
        : []),
      "Hinter Holm hängt eine Karte des Tals. Mehrere Stellen sind mit Kreide umrandet, andere mit einem Messer aus dem Papier geschnitten.",
      "Er legt eine Hand auf den Brief, ohne ihn zu öffnen. Unter seinem Daumen ist rotes Wachs kleben geblieben. Es sieht aus wie Blut, bis man lange genug hinsieht.",
      "„Ich kann dir keine Wache geben“, sagt er. „Keine Pferde. Kein ordentliches Gold. Ich kann dir nur sagen, dass der nächste Überfall nicht bei den Banditen anfangen wird.“",
    ],
  });

  if (held.auftragErhalten && held.buergermeisterVertraut) {
    await rt.present({
      held,
      lines: [
        "„Du hast mein Wort und meinen Vorschuss. Geh, bevor sie merken,",
        "dass Lindendorf diesmal nicht nur jammert.“",
        ...echoHolmVersorgung(held),
      ],
    });
    return;
  }

  if (held.auftragErhalten) {
    await rt.present({
      held,
      lines: [
        "Holm sieht zuerst auf das Siegel, dann auf dich.",
        "„Der Auftrag steht. Die Kasse ist trotzdem leer.“",
        "Er sagt nicht, dass er dir vertraut. Dafür hat er beim ersten Mal schon zu viel gesagt.",
      ],
    });
  }

  const wahl = await rt.present({
    held,
      lines: [
        held.auftragErhalten
          ? "Der Auftrag steht. Du kannst jetzt noch entscheiden, wie du ihn trägst. Holm braucht deine Hand, aber er hat noch nicht entschieden, ob er dir auch seinen Rücken zeigt."
          : "Du kannst den Auftrag einfach annehmen — oder ihn dir verdienen. Hinter Holm tickt eine Uhr, obwohl du keine siehst. Jeder Schlag klingt wie ein weiterer Sack Mehl, der im Steinbruch verschwindet.",
    ],
    choices: [
      held.auftragErhalten ? "Beim Auftrag bleiben" : "Auftrag nüchtern annehmen",
      "Vertrauen gewinnen (Charisma, mittel)",
      "Druck machen und Gold fordern (Charisma, schwer)",
      "Wieder gehen",
    ],
  });

  if (wahl === 0) {
    held.auftragErhalten = true;
    await rt.present({
      held,
      lines: [
        "„Gut. Bring zurück, was sie genommen haben. Oder sorge, dass sie nicht wiederkommen.“",
        "Holm nickt knapp. Mehr Wärme hat dieses Amt nicht übrig.",
        "Er schiebt den Brief zur Seite und nimmt eine kleine Messingmarke aus der Schublade. Darauf ist das Wappen des Tals so flach geprägt, dass man es nur im Streiflicht erkennt.",
        "„Zeig das am alten Weg, wenn dich jemand anhält. Wenn es noch jemand gibt, der sich davon beeindrucken lässt.“",
      ],
    });
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "Vertrauen des Bürgermeisters", undefined, "reden");
    if (ergebnis.erfolg) {
      held.auftragErhalten = true;
      held.buergermeisterVertraut = true;
      const gold = goldPlus(held, 5, "Vorschuss");
      const item = nimm(held, HEILTRANK);
      await rt.present({
        held,
        probe: ergebnis,
        log: [gold, item],
        lines: [
          "„Nimm das. Aus der Apotheke der Witwe Kern. Und fünf Taler, mehr ist nicht da.“",
          "Holm sieht dich an, als hättest du etwas unterschrieben, das nicht auf Papier steht.",
          "Er zieht die Münzen einzeln aus der Kasse. Jede schlägt auf das Holz, als müsste sie erst beweisen, dass sie echt ist.",
          "„Wenn du zurückkommst, erzähl mir nicht zuerst, ob du gewonnen hast. Sag mir, wer gefehlt hat.“",
        ],
      });
    } else {
      held.auftragErhalten = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Holm bleibt kühl.",
          "„Worte habe ich genug gehört. Tu die Arbeit. Belohnung nach Ergebnis.“",
          "Seine Stimme wird nicht lauter. Das macht sie schlimmer. Hinter ihm knackt das Holz der leeren Kasse, als würde auch sie zuhören.",
          "Du verlässt das Rathaus mit einem Auftrag, aber ohne das Gefühl, dass er dir gehört.",
        ],
      });
    }
  } else if (wahl === 2) {
    const ergebnis = probe(held, "Charisma", held.charisma, SCHWER, "Gold erpressen", undefined, "reden");
    if (ergebnis.erfolg) {
      held.auftragErhalten = true;
      const gold = goldPlus(held, 8, "erpresster Vorschuss");
      await rt.present({
        held,
        probe: ergebnis,
        log: [gold],
        lines: [
          "Holm zahlt, aber sein Blick sagt: Das vergisst ein Dorf nicht so schnell.",
          "Vertrauen ist das nicht. Nur Notwendigkeit.",
          "Er zählt das Gold nicht nach. Er weiß, dass du es tun wirst. Zwischen euch liegt nun eine Rechnung, die nicht auf Papier passt.",
          "Draußen wartet das Dorf. Es wird merken, ob du leichter gehst als vorher.",
        ],
      });
    } else {
      held.auftragErhalten = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "„Du kommst in mein Haus und zählst meine Münzen?“",
          "Holm steht auf. Der Auftrag steht. Freundschaft nicht.",
          "Sein Stuhl schabt über den Steinboden. Im Flur bleibt eine Magd stehen und sieht sofort wieder weg.",
          "Du hast das Gold nicht bekommen. Aber du weißt jetzt, wie Holm klingt, wenn Angst wie Ordnung aussehen soll.",
        ],
      });
    }
  } else {
    await rt.present({
      held,
      lines: [
        "Du lässt Holm mit seiner leeren Kasse.",
        "Hinter dir raschelt der Brief, obwohl kein Wind durch das Rathaus geht. Vielleicht ist es nur das Papier. Vielleicht ist es das, was darin fehlt.",
        "Auf dem Platz wartet niemand auf deine Entscheidung. Das Dorf wird sie trotzdem erfahren.",
      ],
    });
  }
}

async function dorfTaverne(
  rt: Runtime,
  held: Held,
  rumorenGehoert: boolean,
  lautAngekundigt: boolean,
): Promise<boolean> {
  await rt.present({
    title: "Zum letzten Fass",
    art: "tavern",
    portrait: "mara",
    held,
    lines: [
      "In der Taverne riecht es nach Gerste, nassem Tuch und Angst, die man wegzutrinken versucht.",
      "Wirtin Mara wischt dieselbe Stelle auf der Theke zum dritten Mal.",
      ...(lautAngekundigt
        ? ["Als du eintrittst, wird an einem Tisch ein Satz nicht zu Ende gesprochen."]
        : []),
      ...(held.loesungswegMuehle === "verraten"
        ? ["Auf der Theke liegt wieder Brot. Mara schneidet es und sieht dich an, als hätte das Mehl einen Preis, den sie nicht nennen will."]
        : held.loesungswegMuehle
          ? ["Auf der Theke steht zum ersten Mal seit Tagen wieder Brot. Mara schneidet es, ohne zu fragen, woher das Mehl kommt."]
          : ["Das Brotfach ist leer. Mara stellt Gerstenbrei hin, als wäre das eine Entscheidung und kein Mangel."]),
      ...echoMaraVersorgung(held),
      ...(held.loesungswegGasse === "veroeffentlicht"
        ? ["An einem Tisch redet man über Vahl, zu laut für ein Amt, das noch gestern galt."]
        : held.loesungswegGasse === "vernichtet"
          ? ["Zwei Männer von der Baumannschaft trinken auf die Gasse, als wäre sie schon ein Lagerhaus."]
          : []),
      "Über dem Ausschank hängt ein Bündel Kräuter, längst trocken genug, um bei der kleinsten Berührung zu zerfallen. Darunter steht ein Becher mit drei Rissen.",
      "Die Taverne ist warm, aber nicht freundlich. Wärme kostet Holz, und Holz kostet im Tal inzwischen mehr als Bier.",
      "Mara sieht dich an, als müsste sie in deinem Gesicht entscheiden, ob du ein weiterer Gast oder eine weitere Rechnung bist.",
    ],
  });

  const wahl = await rt.present({
    held,
    lines: ["Was tust du?"],
    choices: [
      "Gerüchte hören",
      "Laut ankündigen, dass du die Banditen jagst",
      held.gold >= 5 ? "Heiltrank kaufen (5 Gold)" : "Heiltrank kaufen — zu wenig Gold",
      "Mara nach der Hintertür fragen",
      "Nach Maras letztem Gast fragen",
      "Wieder hinaus",
    ],
  });

  if (wahl === 0) {
    const lines = [
      "Ein Holzfäller murmelt:",
      "„Die nehmen nicht den Hauptweg. Östlicher Wildpfad, wo die alte Eiche vom Blitz gespalten ist.“",
      "Mara ergänzt leise: „Einer von ihnen trinkt hier manchmal. Nennt sich Kess. Hört gerne zu.“",
      "Der Holzfäller fährt mit dem Daumen über die Kerbe in seinem Becher. „Wenn die Glocke dreimal geht, bleiben die Hunde drin. Wenn sie einmal geht, fehlt jemand.“",
      "Mara stellt einen zweiten Becher auf den Tisch, obwohl niemand darum gebeten hat. Darin ist nur Wasser.",
    ];
    if (rumorenGehoert) {
      lines.push(
        "Mara nickt zum Brunnen hinüber. „Die Müllerin hat mehr gesehen, als sie sagen will.“",
        "Seit drei Nächten schläft dort keiner durch. Nicht wegen der Trommeln.",
      );
    }
    if (lautAngekundigt) {
      lines.push(
        "Mara hört bis zum Ende zu. Dann stellt sie das Tuch beiseite.",
        "„Kess hört gerne zu. Heute vielleicht genauer als sonst.“",
        "Sie sagt deinen Namen nicht. Sie muss ihn nicht kennen. In einem kleinen Tal reicht es, wenn man weiß, wer mit geradem Rücken hinausgegangen ist.",
      );
    }
    await rt.present({ held, lines });
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "den Raum für dich gewinnen", undefined, "reden");
    if (ergebnis.erfolg) {
      const gold = goldPlus(held, 1, "Biergeld eines Betrunkenen, der an dich glaubt");
      await rt.present({
        held,
        probe: ergebnis,
        log: [gold],
        lines: [
          "Du stellst dich hin und sagst den Raum, was du vorhast.",
          "Zwei Gäste klatschen unsicher. Ein Dritter steht auf und geht, ohne zu zahlen.",
          "Mara stellt dir ein Bier hin, das niemand bestellt hat.",
          "„Pass auf Kess auf. Und auf den Graben vor dem Lager. Den haben sie neu gezogen.“",
        ],
      });
    } else {
      held.banditenGewarnt = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Du stellst dich hin und sagst den Raum, was du vorhast.",
          "Zu viele Ohren. Zu viele offene Münder.",
          "Mara hört auf zu wischen. Irgendwo zwischen Theke und Tür ist dein Plan schon weitergereist.",
          "Die Banditen werden wissen, dass jemand kommt.",
        ],
      });
    }
  } else if (wahl === 2) {
    if (held.gold >= 5) {
      if (hat(held, HEILTRANK)) {
        await rt.present({
          held,
          lines: ["Mara zuckt mit den Schultern. „Einen zweiten habe ich nicht.“"],
        });
      } else {
        held.gold -= 5;
        const item = nimm(held, HEILTRANK);
        await rt.present({
          held,
          log: [item],
          lines: ["Mara schiebt dir ein kleines Fläschchen zu. „Witwe Kerns Restbestand.“"],
        });
      }
    } else {
      await rt.present({
        held,
        lines: ["Fünf Gold. Du hast weniger. Mara hebt nicht einmal den Deckel."],
      });
    }
  } else if (wahl === 3) {
    await dorfMaraHintertuer(rt, held);
  } else if (wahl === 4) {
    await dorfMarasLetzterGast(rt, held);
  } else {
    await rt.present({
      held,
      lines: ["Die Tür fällt ins Schloss. Draußen ist die Luft ehrlicher."],
    });
  }

  return wahl === 1;
}

async function dorfMarasLetzterGast(rt: Runtime, held: Held) {
  if (held.letzterGastGefunden || held.letzterGastAbgewiesen) {
    await rt.present({
      held,
      lines: ["Mara schiebt das leere Glas beiseite. „Über den letzten Gast ist alles gesagt.“"],
    });
    return;
  }

  const wahl = await rt.present({
    title: "Zum letzten Fass",
    art: "tavern",
    portrait: "mara",
    held,
    lines: [
      "Mara stellt ein leeres Glas unter die Theke.",
      "„Der Mann, der gestern hier saß, hat nicht bezahlt. Er hat nur einen Satz dagelassen.“",
      "Sie sagt den Satz nicht sofort. Das ist der Preis fürs Fragen.",
      "Am Glasrand klebt ein dunkler Halbmond. Blut oder Beerenwein. Mara hat beides gesehen und gelernt, nicht jedes Mal nach dem Unterschied zu fragen.",
      "Draußen streicht der Wind durch die Ritzen der Wand. Für einen Augenblick riecht die Taverne nach nassem Fels statt nach Gerste.",
    ],
    choices: [
      "Mara zum Reden bringen (Charisma, mittel)",
      "Das Glas und den Tisch untersuchen (Geschick, leicht)",
      "Die Schuld nicht zu deiner machen",
    ],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "Maras letzten Gast verstehen", undefined, "reden");
    if (ergebnis.erfolg) {
      held.letzterGastGefunden = true;
      await rt.present({
        title: "Zum letzten Fass",
        art: "tavern",
        portrait: "mara",
        held,
        probe: ergebnis,
        lines: [
          "Mara sagt den Satz leise: „Kess würfelt nur, wenn er glaubt, Zeit zu haben.“",
          "Der letzte Gast hat ihn in der Tür gehört. Danach ging er nach Osten.",
          "Mara wischt den Rand des Glases. „Sag nicht, dass du das von mir hast.“",
          "Sie öffnet die Hand. Darin liegt ein schwarzer Würfel, an einer Ecke abgeschabt.",
          "„Er hat ihn dagelassen“, sagt sie. „Oder vergessen. Bei Kess ist das fast dasselbe.“",
        ],
      });
    } else {
      held.letzterGastAbgewiesen = true;
      await rt.present({
        title: "Zum letzten Fass",
        art: "tavern",
        portrait: "mara",
        held,
        probe: ergebnis,
        lines: [
          "Mara hält deinen Blick aus. Dann nimmt sie das Glas wieder an sich.",
          "„Nicht jeder, der schweigt, hat etwas zu verkaufen.“",
        ],
      });
    }
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "den letzten Gast zurückverfolgen", undefined, "wahrnehmung");
    if (ergebnis.erfolg) {
      held.letzterGastGefunden = true;
      await rt.present({
        title: "Zum letzten Fass",
        art: "tavern",
        portrait: null,
        held,
        probe: ergebnis,
        lines: [
          "Unter dem Glas klebt ein Streifen Papier. Darauf steht nur: Osten. Keine Unterschrift.",
          "Mara sieht das Papier an. „Dann ist er nicht zum Hauptweg gegangen.“",
          "Mehr gibt es nicht. Aber weniger ist es auch nicht.",
          "Auf der Rückseite ist ein Kreis gezeichnet, durch den eine Linie führt. Das Zeichen ähnelt dem Wachs am Rathaus, nur dass hier jemand mit Kohle nachgearbeitet hat.",
        ],
      });
    } else {
      held.letzterGastAbgewiesen = true;
      await rt.present({
        title: "Zum letzten Fass",
        art: "tavern",
        portrait: null,
        held,
        probe: ergebnis,
        lines: ["Das Glas kippt. Das Papier darunter ist nur altes Fettpapier.", "Mara nimmt es wortlos weg."],
      });
    }
  } else {
    held.letzterGastAbgewiesen = true;
    await rt.present({ held, lines: ["Du lässt das leere Glas stehen. Mara dankt dir nicht. Sie muss es auch nicht."] });
  }
}

async function dorfMaraHintertuer(rt: Runtime, held: Held) {
  if (held.maraGeholfen || held.maraAbgewiesen) {
    await rt.present({
      held,
      lines: ["Mara sieht zur Hintertür. „Das ist erledigt. Mehrmals muss man dieselbe Tür nicht retten.“"],
    });
    return;
  }

  const wahl = await rt.present({
    title: "Zum letzten Fass",
    art: "tavern",
    portrait: "mara",
    held,
    lines: [
      "Mara wartet, bis der Holzfäller wieder auf sein Bier schaut.",
      "„Hinter der Küche ist eine Tür, die nicht mehr richtig schließt. Jemand hat sie von außen markiert.“",
      "Sie legt den Lappen beiseite. Das tut sie selten.",
    ],
    choices: [
      "Die Hintertür prüfen (Geschick, leicht)",
      "Mara nicht weiter fragen",
    ],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "die markierte Hintertür prüfen", undefined, "wahrnehmung");
    if (ergebnis.erfolg) {
      held.maraGeholfen = true;
      await rt.present({
        title: "Hinter der Taverne",
        art: "tavern",
        portrait: null,
        held,
        probe: ergebnis,
        lines: [
          "Die Markierung ist kein Zeichen. Sie ist eine Kerbe im Holz, frisch und tief genug für einen Daumennagel.",
          "Unter dem losen Türstein findest du eine zusammengerollte Schnur und den Abdruck eines Stiefels.",
          "Mara nimmt beides an sich. „Dann wissen sie wenigstens, dass ich hinschaue.“",
          "Sie zeigt dir den schmalen Pfad hinter dem Haus. Er führt später näher an den Steinbruch, als dir lieb ist.",
          "Im Lehm erkennst du eine zweite Spur, kleiner und älter. Jemand hat versucht, sie mit Asche zu verwischen.",
          "Mara sieht nicht auf den Pfad, sondern auf deine Hand. „Wenn du dort hinausgehst, geh nicht nach dem ersten Geräusch. Das erste Geräusch will, dass du ihm folgst.“",
        ],
      });
    } else {
      held.maraAbgewiesen = true;
      await rt.present({
        title: "Hinter der Taverne",
        art: "tavern",
        portrait: null,
        held,
        probe: ergebnis,
        lines: [
          "Du findest die Kerbe. Mehr nicht. Der lose Stein rutscht dir aus der Hand und schlägt gegen die Tür.",
          "Auf der anderen Seite wird es still.",
          "Mara schließt die Tür selbst. „Heute nicht mehr“, sagt sie.",
          "Hinter dem Holz scharrt etwas. Vielleicht ein Fass, das sich setzt. Vielleicht ein Fuß, der nicht weitergeht.",
        ],
      });
    }
  } else {
    held.maraAbgewiesen = true;
    await rt.present({
      held,
      lines: [
        "Du hast bereits genug Türen geöffnet, die dir nicht gehören.",
        "Mara nimmt den Lappen wieder auf. Die Stelle auf der Theke ist noch immer sauber.",
      ],
    });
  }
}

async function dorfPlatz(rt: Runtime, held: Held, rumorenGehoert: boolean): Promise<boolean> {
  const choices = [
    "Am Brunnen lauschen",
    held.loesungswegBrunnen ? "Den Brunnen noch einmal ansehen" : "Den trüben Eimer prüfen",
    "Dem Jungen mit der roten Schnur folgen",
    "Zurück zum Dorf",
  ];
  const wahl = await rt.present({
    title: "Brunnen und Dorfplatz",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Der Dorfplatz ist klein genug, dass jedes Gespräch einen Zeugen findet.",
      "Am Brunnen tropft Wasser auf den Stein. Hinter dem Trog wartet ein Junge mit einer roten Schnur.",
      held.loesungswegBrunnen
        ? "Der Eimer am Brunnen ist nicht mehr der, den man stehen lässt."
        : "Der Eimer am Brunnen steht halb voll. Das Wasser darin ist trüb und leicht bitter.",
      "Neben der Mauer stehen drei leere Körbe. Auf jedem ist mit Kreide ein Familienname geschrieben. Der Regen hat zwei davon fast ausgelöscht.",
      "Ein Schwein wühlt zwischen den Rinnen des Platzes. Niemand scheucht es fort. Was es findet, muss später niemand wegtragen.",
    ],
    choices,
  });
  const gewaehlt = choices[wahl];
  if (gewaehlt === "Am Brunnen lauschen") await dorfBrunnen(rt, held);
  else if (gewaehlt === "Den trüben Eimer prüfen" || gewaehlt === "Den Brunnen noch einmal ansehen") {
    await dorfTruebesWasser(rt, held);
  } else if (gewaehlt === "Dem Jungen mit der roten Schnur folgen") await dorfRoteSchnur(rt, held);
  else if (rumorenGehoert) await rt.present({ held, lines: ["Du bleibst auf dem Platz. Die Stimmen kommen und gehen."] });
  return gewaehlt === "Am Brunnen lauschen";
}

async function dorfSchmiedeApotheke(rt: Runtime, held: Held) {
  const wahl = await rt.present({
    title: "Schmiede und Apotheke",
    art: "village",
    portrait: null,
    held,
    lines: [
      "Zwei Türen nebeneinander. Hinter der einen riecht es nach Eisen, hinter der anderen nach Alkohol und getrockneten Blättern.",
      "Zwischen den Häusern läuft eine schmale Abflussrinne. Darin schwimmen Kohlenstaub, welke Blätter und ein Stück blutiger Wolle.",
      "Über der Schmiede hängt ein Hufeisen mit gebrochenem Nagel. Über Kerns Tür hängt nichts. Wer sie braucht, weiß ohnehin, wo sie wohnt.",
    ],
    choices: ["Zum Schmied", "Zu Witwe Kern", "Zurück zum Dorf"],
  });
  if (wahl === 0) await dorfSchmied(rt, held);
  else if (wahl === 1) await dorfWitweKern(rt, held);
}

async function dorfWitweKern(rt: Runtime, held: Held) {
  if (held.kernGeholfen || held.kernAbgewiesen) {
    if (!held.loesungswegBrunnen) {
      await kernWasser(rt, held);
      return;
    }
    await rt.present({
      title: "Bei Witwe Kern",
      art: "apothecary",
      portrait: "kern",
      held,
      lines: ["Witwe Kern hält die Schublade geschlossen. „Was leer ist, bleibt wenigstens ordentlich.“"],
    });
    return;
  }

  const wahl = await rt.present({
    title: "Bei Witwe Kern",
    art: "apothecary",
    portrait: "kern",
    held,
    lines: [
      "Witwe Kern hat ihre Apotheke geöffnet, obwohl niemand hereinkommt.",
      "Eine Schublade klemmt. Darauf liegt ein sauber gefaltetes Tuch.",
      "„Der Restbestand ist kleiner geworden“, sagt sie. „Nicht durch Verkauf.“",
      "An den Wänden hängen Bündel aus Schafgarbe, Wacholder und dunklen Blättern, deren Namen du nicht kennst. Unter jedem Bündel steht mit Kohle ein Datum.",
      "Kern trägt die Ärmel hochgekrempelt. Auf ihren Unterarmen liegen alte Brandnarben. Ihre Hände riechen nach Alkohol und Eisen.",
      "„Verband verschwindet nicht allein“, sagt sie. „Und wer ihn stiehlt, rechnet mit Wunden.“",
    ],
    choices: [
      "Die Schublade lösen (Stärke, leicht)",
      "Das Schloss untersuchen (Geschick, mittel)",
      "Kern nach dem fehlenden Bestand fragen (Charisma, mittel)",
      "Nicht weiter fragen",
    ],
  });

  if (wahl === 3) {
    held.kernAbgewiesen = true;
    await rt.present({ held, lines: ["Witwe Kern nickt. „Dann bleibt es eben meine leere Schublade.“"] });
    return;
  }
  const attribut = wahl === 0 ? "Stärke" : wahl === 1 ? "Geschicklichkeit" : "Charisma";
  const wert = wahl === 0 ? held.staerke : wahl === 1 ? held.geschick : held.charisma;
  const schwierigkeit = wahl === 0 ? LEICHT : MITTEL;
  const ergebnis = probe(held, attribut, wert, schwierigkeit, "Kerns leere Schublade prüfen", undefined, "wahrnehmung");
  if (ergebnis.erfolg) {
    held.kernGeholfen = true;
    await rt.present({
      title: "Bei Witwe Kern",
      art: "apothecary",
      portrait: "kern",
      held,
      probe: ergebnis,
      lines: [
        "Hinter der Schublade klebt ein Streifen Verbandstoff. Frisch abgerissen.",
        "Kern nimmt ihn an sich. „Jemand hat sich bedient, ohne krank zu sein.“",
        "Sie legt dir einen sauberen Verband hin. „Für den Fall, dass du doch noch krank wirst.“",
        "Am Stoff klebt grauer Staub. Kern verreibt ihn zwischen zwei Fingern und blickt zur Ostwand, als könne sie durch sie hindurch bis zum Steinbruch sehen.",
        "„Die nehmen nicht nur Essen“, sagt sie. „Sie bereiten sich darauf vor, dass jemand es zurückhaben will.“",
        ...(held.loesungswegBrunnen ? [] : ["Draußen hustet ein Kind. Kern sieht zum Brunnen, nicht zur Schublade. „Das Wasser ist schuld. Nicht diese Schublade.“"]),
      ],
    });
  } else {
    held.kernAbgewiesen = true;
    await rt.present({
      title: "Bei Witwe Kern",
      art: "apothecary",
      portrait: "kern",
      held,
      probe: ergebnis,
      lines: [
        "Das Holz gibt nicht nach. Kern schiebt deine Hand weg.",
        "„Nicht alles muss mit Gewalt aufgehen.“",
        "Sie legt das saubere Tuch wieder auf die Schublade und streicht es glatt. Die Geste ist behutsamer als ihre Stimme.",
        "Aus dem hinteren Raum kommt ein Husten. Kern sieht kurz zur Tür und macht die Apotheke kleiner, indem sie schweigt.",
      ],
    });
  }
}

async function dorfHolmSiegel(rt: Runtime, held: Held) {
  if (held.holmSiegelGefunden || held.holmSiegelVerschwiegen) {
    await rt.present({
      title: "Rathaus",
      art: "townhall",
      portrait: "holm",
      held,
      lines: ["Das gebrochene Wachs liegt noch auf Holms Tisch. Keiner spricht darüber."],
    });
    return;
  }

  const wahl = await rt.present({
    title: "Rathaus",
    art: "townhall",
    portrait: "holm",
    held,
    lines: [
      "Neben Holms Brief liegt ein Stück rotes Wachs.",
      "Das Siegel trägt den Abdruck der Gemeinde — aber jemand hat es gebrochen, bevor der Brief ankam.",
      "Holm hält die Hand darüber. Zu spät.",
      "Im Wachs steckt ein einzelner schwarzer Faden. Er ist zu fein für einen Sack und zu grob für Holms Kleidung.",
      "Der Brief riecht nach Rauch, obwohl im Rathaus kein Feuer brennt. An einer Ecke hat das Papier Wasser gezogen und sich dunkel verfärbt.",
      "„Man kann einen Brief lesen“, sagt Holm. „Oder man kann ihn so lange tragen, bis jeder weiß, dass es ihn gibt.“",
    ],
    choices: [
      "Den Abdruck vergleichen (Geschick, mittel)",
      "Holm offen darauf ansprechen (Charisma, leicht)",
      "So tun, als hättest du nichts gesehen",
    ],
  });

  if (wahl === 0 || wahl === 1) {
    const attribut = wahl === 0 ? "Geschicklichkeit" : "Charisma";
    const wert = wahl === 0 ? held.geschick : held.charisma;
    const schwierigkeit = wahl === 0 ? MITTEL : LEICHT;
    const ergebnis = probe(held, attribut, wert, schwierigkeit, "das gebrochene Siegel verstehen", undefined, "wahrnehmung");
    if (ergebnis.erfolg) {
      held.holmSiegelGefunden = true;
      await rt.present({
        title: "Rathaus",
        art: "townhall",
        portrait: "holm",
        held,
        probe: ergebnis,
        lines: [
          "Das Wachs ist älter als der Brief. Jemand hat Holms Siegel benutzt, um sich Zeit zu kaufen.",
          "Holm nimmt den Brief zurück. „Jetzt weißt du, warum ich niemandem gern Papier gebe.“",
          "Der Abdruck ist an einer Stelle doppelt. Das Siegel wurde nicht nur gebrochen, sondern ein zweites Mal auf weicheres Wachs gedrückt.",
          "Holm hält den Brief gegen das Fenster. „Jemand schreibt in meinem Namen“, sagt er. „Oder sorgt dafür, dass ich für sein Schweigen bezahle.“",
        ],
      });
    } else {
      held.holmSiegelVerschwiegen = true;
      await rt.present({ held, probe: ergebnis, lines: ["Holm faltet den Brief. Die Sache bleibt zwischen Tür und Tisch."] });
    }
  } else {
    held.holmSiegelVerschwiegen = true;
    await rt.present({ held, lines: ["Du siehst auf das Wachs und dann auf Holm. Er dankt dir nicht. Das ist Antwort genug."] });
  }
}

async function dorfRoteSchnur(rt: Runtime, held: Held) {
  if (held.schnurGeholfen || held.schnurAbgewiesen) {
    await rt.present({ held, lines: ["Der Junge mit der roten Schnur ist nicht mehr am Brunnen."] });
    return;
  }

  const wahl = await rt.present({
    title: "Hinter dem Brunnen",
    art: "well",
    portrait: null,
    held,
    lines: [
      "Ein Junge wartet hinter dem Brunnen. Um sein Handgelenk liegt eine rote Schnur.",
      "„Ich weiß, wo sie nachts langgehen“, sagt er. „Aber ich zeige es nur jemandem, der nicht laut ist.“",
      "Seine Knie sind aufgeschlagen, und an einem Ärmel klebt Farn. Er ist den Weg bereits gegangen, vermutlich öfter, als irgendjemand wissen soll.",
      "Die Schnur ist mit drei kleinen Knoten um sein Handgelenk gelegt. Bei jedem Glockenschlag, sagt er, löst er einen.",
    ],
    choices: [
      "Ihm zuhören und ihm folgen (Geschick, leicht)",
      "Ihn nach Hause schicken",
    ],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "dem roten Faden folgen", undefined, "wahrnehmung");
    if (ergebnis.erfolg) {
      held.schnurGeholfen = true;
      await rt.present({
        title: "Hinter dem Brunnen",
        art: "well",
        portrait: null,
        held,
        probe: ergebnis,
        lines: [
          "Die rote Schnur führt nur bis zu einem Zaunpfahl.",
          "Dort beginnt ein schmaler Weg nach Osten. Der Junge hatte recht.",
          "Zwischen den Halmen entdeckst du grauen Steinmehlstaub und den Abdruck eines schmalen Stiefels. Der Pfad wird benutzt, aber nie bei Tageslicht.",
          "Er nimmt die Schnur ab. „Jetzt findest du ihn auch ohne mich.“",
          "Den letzten Knoten löst er nicht. Er steckt die Schnur ein und läuft zurück, bevor du fragen kannst, für wen er ihn aufbewahrt.",
        ],
      });
    } else {
      held.schnurAbgewiesen = true;
      await rt.present({ held, probe: ergebnis, lines: ["Du verlierst die Schnur im Farn. Der Junge zieht sie zurück.", "„Dann nicht“, sagt er und läuft heim."] });
    }
  } else {
    held.schnurAbgewiesen = true;
    await rt.present({ held, lines: ["Du schickst ihn nach Hause. Er gehorcht erst, als du dich umdrehst."] });
  }
}

async function dorfSchmied(rt: Runtime, held: Held) {
  if (held.schmiedGeholfen || held.schmiedAbgewiesen) {
    await rt.present({
      title: "Beim Schmied",
      art: "smithy",
      portrait: "smith",
      held,
      lines: ["Der Schmied hebt das stumpfe Eisen hoch. „Das Werkzeug tut wieder, was es soll.“"],
    });
    return;
  }

  const wahl = await rt.present({
    title: "Beim Schmied",
    art: "smithy",
    portrait: "smith",
    held,
    lines: [
      "Hinter dem Haus schlägt jemand auf Eisen, das den Schlag nicht mehr verdient.",
      "Der Schmied hält eine stumpfe Hacke gegen das Licht.",
      "„Damit gräbt man keinen Steinbruch frei. Damit macht man nur Lärm.“",
      "Die Esse glimmt schwach. Auf dem Kohlehaufen liegt eine Decke, damit der Regen nicht nimmt, was das Dorf noch wärmen kann.",
      "An der Wand hängen drei unbeschlagene Hufeisen. Im Stall nebenan steht kein Pferd.",
      "Der Schmied trägt eine Lederschürze voller heller Schnitte. „Eisen ist nicht knapp“, sagt er. „Zeit ist knapp. Kohle ist knapp. Hände sind knapp.“",
    ],
    choices: [
      "Beim Schleifen helfen (Stärke, mittel)",
      "Die Schneide sauber ausrichten (Geschick, leicht)",
      "Nach dem Preis fragen (Charisma, mittel)",
      "Weitergehen",
    ],
  });

  if (wahl === 3) {
    held.schmiedAbgewiesen = true;
    await rt.present({ held, lines: ["Der Schmied nickt einmal. Das Eisen bleibt stumpf. Du gehst weiter."] });
    return;
  }

  const attribut = wahl === 0 ? "Stärke" : wahl === 1 ? "Geschicklichkeit" : "Charisma";
  const wert = wahl === 0 ? held.staerke : wahl === 1 ? held.geschick : held.charisma;
  const schwierigkeit = wahl === 1 ? LEICHT : MITTEL;
  const ergebnis = probe(held, attribut, wert, schwierigkeit, "das stumpfe Eisen richten", undefined, "klettern");
  if (ergebnis.erfolg) {
    held.schmiedGeholfen = true;
    await rt.present({
      title: "Beim Schmied",
      art: "smithy",
      portrait: "smith",
      held,
      probe: ergebnis,
      lines: [
        "Der Funke springt nur einmal. Das reicht.",
        "Die Schneide wird nicht neu. Aber sie wird wieder brauchbar.",
        "„Im Steinbruch ist Werkzeug wichtiger als Mut“, sagt der Schmied. „Merk dir das.“",
        "Er prüft die Hacke mit dem Daumen und wickelt ein Stück Leder um den Griff. Die Bewegung sitzt, obwohl seine linke Hand zittert.",
        "„Kess war einmal hier“, sagt er, ohne dich anzusehen. „Er wusste damals schon, welche Werkzeuge man braucht, um eine Tür von innen zu öffnen.“",
      ],
    });
  } else {
    held.schmiedAbgewiesen = true;
    await rt.present({
      title: "Beim Schmied",
      art: "smithy",
      portrait: "smith",
      held,
      probe: ergebnis,
      lines: [
        "Der Stein rutscht. Die Schneide bleibt, wie sie war.",
        "„Kein Schaden“, sagt der Schmied. Er meint die Hacke.",
        "Er nimmt dir das Werkzeug aus der Hand und legt es auf den Amboss. Die stumpfe Schneide wirft kein Licht zurück.",
        "„Manchmal ist es besser, etwas stumpf zu lassen“, sagt er. Dann schlägt er weiter, bis du draußen bist.",
      ],
    });
  }
}

async function dorfBrunnen(rt: Runtime, held: Held) {
  const ergebnis = probe(held, "Charisma", held.charisma, LEICHT, "die Leute zum Reden bringen", undefined, "reden");
  if (ergebnis.erfolg) {
    const gold = goldPlus(held, 2, "Almosen der Müllerin");
    await rt.present({
      title: "Am Brunnen",
      art: "well",
      portrait: "miller",
      held,
      probe: ergebnis,
      log: [gold],
      lines: [
        "Am Brunnen redet man, als wäre Flüstern eine Form von Gebet.",
        "Die Müllerin sagt, die Banditen hätten einen Schlüssel zum alten Steinbruchtor.",
        "Ein Junge schwört, nachts Trommeln gehört zu haben — oder nur den Wind.",
        "Eine Frau zählt ihre Eimer, obwohl alle vor ihr stehen. Ein alter Mann hält den Becher unter das Wasser und trinkt erst, nachdem die Müllerin genickt hat.",
        "Die Müllerin zieht dich beiseite.",
        "„Wenn du gehst, geh nicht stolz. Die haben Posten auf dem Felsen.“",
        "Ihre Hand bleibt noch einen Moment an deinem Ärmel. Dann tut sie, als wäre es wegen des Mehls.",
        "Sie drückt dir zwei abgewetzte Münzen in die Hand.",
        "„Das ist kein Lohn“, sagt sie. „Ein Lohn wäre mehr. Das ist nur, damit du unterwegs nicht so tun musst, als hättest du nichts gebraucht.“",
      ],
    });
  } else {
    await rt.present({
      title: "Am Brunnen",
      art: "well",
      portrait: "miller",
      held,
      probe: ergebnis,
      lines: [
        "Am Brunnen redet man, als wäre Flüstern eine Form von Gebet.",
        "Die Müllerin sagt, die Banditen hätten einen Schlüssel zum alten Steinbruchtor.",
        "Ein Junge schwört, nachts Trommeln gehört zu haben — oder nur den Wind.",
        "Man sieht dich an und verstummt.",
        "Die Müllerin schiebt den Eimer zwischen dich und die anderen.",
        "Fremde mit Fragen sind in Lindendorf eine eigene Wetterlage.",
        "Das Seil knarrt über der Rolle. Tief unten schlägt der Eimer gegen Stein, und alle warten, bis das Geräusch vorbei ist.",
        "„Du willst Antworten“, sagt die Müllerin. „Wir wollen wissen, wer morgen noch am Brunnen steht.“",
      ],
    });
  }

  if (!held.mehlsackGefunden && !held.mehlsackGemeldet) {
    await dorfFalscherMehlsack(rt, held);
  }
  if (!held.bettlerGeholfen && !held.bettlerAbgewiesen) {
    await dorfBettler(rt, held);
  }
}

async function dorfFalscherMehlsack(rt: Runtime, held: Held) {
  const wahl = await rt.present({
    title: "Am Brunnen",
    art: "mill",
    portrait: "miller",
    held,
    lines: [
      "Hinter dem Mühlstein steht ein Mehlsack, der nicht nach Mehl riecht.",
      "Das Tuch ist grob. Die Naht wurde mit schwarzem Garn geschlossen.",
      "Die Müllerin sieht dich an. „Der war gestern noch nicht da.“",
      "Der Sack steht dort, wo am Morgen die erste Ration für die Backstube liegen sollte. Seine Unterseite ist trocken, obwohl der Boden nass ist.",
      "Auf dem Tuch wurde das Mühlenzeichen nachgemalt. Der Kreis ist richtig, aber die drei Kerben darin zeigen in die falsche Richtung.",
      "„Jemand will, dass wir ihn öffnen“, sagt die Müllerin. „Die Frage ist nur, wer danach zusieht.“",
    ],
    choices: [
      "Die Naht untersuchen (Geschick, mittel)",
      "Den Sack zum Bürgermeister bringen (Charisma, leicht)",
      "Die Müllerin nicht hineinziehen",
    ],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "die fremde Mehlsacknaht prüfen", undefined, "wahrnehmung");
    if (ergebnis.erfolg) {
      held.mehlsackGefunden = true;
      await rt.present({
        title: "Am Brunnen",
        art: "mill",
        portrait: "miller",
        held,
        probe: ergebnis,
        lines: [
          "Im Saum steckt feiner grauer Staub. Steinmehl.",
          "Die Müllerin kennt den Geruch. „Aus dem alten Bruch.“",
          "Du weißt jetzt, dass die Banditen ihren Weg nicht nur durch den Wald nehmen.",
          "Zwischen zwei Stofflagen findest du einen dünnen Span aus schwarzem Holz und ein Haar, lang und weiß. Beides riecht nach kalter Asche.",
          "Die Müllerin verbrennt den Span im Ofen. Die Flamme wird für einen Atemzug grün. Niemand kommentiert es.",
        ],
      });
    } else {
      held.mehlsackGemeldet = true;
      await rt.present({
        title: "Am Brunnen",
        art: "mill",
        portrait: "miller",
        held,
        probe: ergebnis,
        lines: [
          "Die Naht gibt nicht nach. Der Sack fällt um.",
          "Die Müllerin schickt einen Jungen zum Rathaus. Mehr Hände will sie hier nicht sehen.",
        ],
      });
    }
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Charisma", held.charisma, LEICHT, "die Müllerin zum Melden bewegen", undefined, "reden");
    held.mehlsackGemeldet = true;
    await rt.present({
      title: "Am Brunnen",
      art: "mill",
      portrait: "miller",
      held,
      probe: ergebnis,
      lines: ergebnis.erfolg
        ? [
            "Die Müllerin nickt. „Holm soll wissen, dass sie bis hierher kommen.“",
            "Der Sack bleibt unter ihrem Fuß, bis der Junge zurück ist.",
            "Sie stellt einen Eimer Wasser neben die Tür und legt ein Küchenmesser auf den Mühlstein. Es ist kein Schutz. Es ist eine Erklärung.",
          ]
        : [
            "Die Müllerin hört dich an. Dann schiebt sie den Sack selbst zum Rathaus.",
            "„Wenn du schon Lärm machst, dann wenigstens am richtigen Haus.“",
            "Die Leute auf dem Platz treten beiseite. Niemand fragt, was in dem Sack ist. In Lindendorf kennt man die Form einer schlechten Nachricht.",
          ],
    });
  } else {
    held.mehlsackGefunden = true;
    await rt.present({
      title: "Am Brunnen",
      art: "mill",
      portrait: "miller",
      held,
      lines: [
        "Die Müllerin zieht den Sack zurück in den Schatten.",
        "„Nicht alles, was fremd ist, muss sofort vor Holm liegen.“",
        "Sie schneidet das falsche Zeichen aus dem Tuch und wirft es ins Mühlfeuer. Der Rest bleibt verschnürt.",
        "„Wenn jemand fragt, war hier nur Mehl“, sagt sie. Der Satz klingt, als hätte sie ihn schon vor deiner Ankunft geübt.",
      ],
    });
  }
}

async function dorfBettler(rt: Runtime, held: Held) {
  const wahl = await rt.present({
    title: "Am Brunnen",
    art: "well",
    portrait: "beggar",
    held,
    lines: [
      "Am Brunnenrand sitzt ein alter Mann mit einem Groschen zwischen den Fingern.",
      "Der Brunnen riecht nach Eisen und Regen.",
      "„Ein Groschen“, sagt er. Nicht bittend. Eher, als würde er eine offene Rechnung nennen.",
      "Sein Mantel ist an den Schultern mit einem Stück Mehlsack geflickt. Unter dem Saum stehen nackte Füße im kalten Wasser der Rinne.",
      "Der Groschen ist schwarz angelaufen. Auf einer Seite trägt er das Profil eines längst toten Fürsten, auf der anderen drei Kratzer.",
      "Die Menschen am Brunnen sehen nicht zu ihm. Das ist die einzige Form von Privatsphäre, die sie ihm lassen.",
    ],
    choices: [
      held.gold > 0 ? "Einen Groschen geben" : "Einen Groschen versprechen, den du nicht hast",
      "Nach dem Grund fragen (Charisma, mittel)",
      "Weitergehen",
    ],
  });

  if (wahl === 0 && held.gold > 0) {
    held.gold -= 1;
    held.bettlerGeholfen = true;
    await rt.present({
      title: "Am Brunnen",
      art: "well",
      portrait: "beggar",
      held,
      log: ["→ 1 Groschen. Der Beutel ist leichter."],
      lines: [
        "Du gibst ihm die Münze.",
        "Der Bettler zählt sie nicht. Er steckt sie ein, als wäre sie schwerer als sie aussieht.",
        "„Du hast gefragt, was es kostet“, sagt er. „Das tun hier nicht viele.“",
        "Er legt seinen alten Groschen auf den Brunnenrand. Erst jetzt erkennst du, dass er an einer Seite flach geschliffen wurde, als hätte er lange unter einer Tür gelegen.",
        "„Eine Münze öffnet nichts“, sagt er. „Aber manchmal zeigt sie, welche Hand noch nicht geschlossen ist.“",
      ],
    });
    return;
  }

  if (wahl === 0) {
    held.bettlerAbgewiesen = true;
    await rt.present({
      title: "Am Brunnen",
      art: "well",
      portrait: "beggar",
      held,
      lines: [
        "Du tastest in den Beutel. Nichts, was man teilen könnte.",
        "Der Bettler nickt, als hätte er genau das erwartet.",
      ],
    });
    return;
  }

  if (wahl === 1) {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "den Bettler ernst nehmen", undefined, "reden");
    if (ergebnis.erfolg) {
      held.bettlerGeholfen = true;
      await rt.present({
        title: "Am Brunnen",
        art: "well",
        portrait: "beggar",
        held,
        probe: ergebnis,
        lines: [
          "Der Bettler sieht zum Wasser. Unten treibt ein Blatt im Kreis.",
          "„Ich brauche den Groschen nicht. Ich brauche, dass einer zuhört, bevor er urteilt.“",
          "Er nennt dir keinen Namen. Aber er merkt sich deinen.",
          "Er erzählt von einem Sohn, der im Steinbruch gearbeitet hat, bevor der Bruch geschlossen wurde. Der Sohn kam an einem Glockentag nicht zurück.",
          "„Seitdem läutet sie für Menschen, die nicht wissen, dass sie gemeint sind.“ Er schließt die Finger um den Groschen und schweigt.",
        ],
      });
    } else {
      held.bettlerAbgewiesen = true;
      await rt.present({
        title: "Am Brunnen",
        art: "well",
        portrait: "beggar",
        held,
        probe: ergebnis,
        lines: [
          "Der Mann hört dir zu. Das ist nicht dasselbe wie dir zu glauben.",
          "„Schon gut“, sagt er. Der Groschen bleibt zwischen seinen Fingern.",
          "Er geht, ohne dich anzusehen. Der Brunnen wirkt plötzlich kälter.",
        ],
      });
    }
    return;
  }

  held.bettlerAbgewiesen = true;
  await rt.present({
    title: "Am Brunnen",
    art: "well",
    portrait: "beggar",
    held,
    lines: [
      "Du gehst weiter. Es ist nur ein Groschen.",
      "Hinter dir hört das Rascheln der Hand nicht auf.",
      "Als du dich nach einigen Schritten umdrehst, ist der Brunnenrand leer. Nur die schwarze Münze liegt noch dort, wo seine Hand gewesen ist.",
    ],
  });
}

async function dorfBettlerRueckkehr(rt: Runtime, held: Held) {
  await rt.present({
    title: "Am Schmied",
    art: "smithy",
    portrait: "beggar",
    held,
    lines: held.bettlerGeholfen
      ? [
          "Beim Schmied steht der alte Mann neben dem Amboss.",
          "Der Schmied sieht dich an, dann auf die Münze in der Hand des Bettlers.",
          "„Für heute geht die Reparatur aufs Haus“, sagt er. „Morgen kostet sie wieder.“",
          "Auf dem Amboss liegt ein verbogener Riegel vom alten Steinbruchtor. Der Bettler hält ihn fest, während der Schmied den letzten Schlag setzt.",
          "„Mein Sohn hat ihn geschmiedet“, sagt der Alte. „Bevor man den Bruch geschlossen hat. Bevor andere ihn wieder öffneten.“",
          "Der Bettler ist fort, bevor du dich bedanken kannst.",
          "Zurück bleibt sein alter Groschen. Der Schmied schlägt ein Loch hinein und hängt ihn über die Esse.",
        ]
      : [
          "Beim Schmied sitzt der alte Mann auf einem umgedrehten Eimer.",
          "Er sieht dich kommen und sieht dann weg. Der Schmied tut, als hätte er nichts bemerkt.",
          "Zwischen ihnen liegt ein verbogener Riegel. Keiner von beiden hat genug Kohle, um ihn heute zu richten.",
          "Etwas Kleines kann man ablehnen. Die Erinnerung daran wird dadurch nicht kleiner.",
          "Als du gehst, beginnt der Schmied trotzdem zu arbeiten. Jeder Schlag klingt im ganzen Hof gleich teuer.",
        ],
  });
}

async function szeneGlockenweg(rt: Runtime, held: Held) {
  const lines = [
    "Der alte Glockenweg steigt hinter den letzten Häusern an.",
    "Nasser Stein. Salzstaub im Gras. Oben hängt eine kleine Kapellenglocke im Wind.",
    "Die Stufen sind aus verschiedenen Steinen gesetzt. Einige tragen noch Meißelspuren, andere dunkle Flecken, die der Regen nicht aus dem porösen Gestein bekommt.",
    "Auf halber Höhe steht eine verwitterte Figur ohne Gesicht. Jemand hat ihr einen Mantel umgelegt. Der Mantel ist neuer als die Kapelle.",
  ];
  if (held.glockeGescheitert) lines.push("Das Seil schwingt noch. Unten im Tal hat man es gehört.");
  await rt.present({ id: "glockenweg", title: "Alter Glockenweg", art: "chapel", portrait: null, held, lines });

  const wahl = await rt.present({
    title: "Alter Glockenweg",
    art: "chapel",
    portrait: null,
    held,
    lines: [
      "Neben der Kapelle wartet eine Botin. Unterhalb des Pfads liegt ein umgestürzter Sack.",
      "Sanna hält sich mit einer Hand am Mauerwerk fest. Ihre Stiefel sind voller Geröll, und an ihrer Tasche fehlt die Schnalle, die den Brief halten sollte.",
      "Weiter oben endet der Weg an schwarzem Fels. Dahinter liegt der Steinbruch. Die Luft riecht dort nicht nach Erde, sondern nach altem Feuer.",
    ],
    choices: [
      held.sannaGeholfen || held.sannaAbgewiesen ? "Sanna erneut ansprechen" : "Der Botin Sanna helfen",
      held.salzGerettet || held.salzLiegenGelassen ? "Jorren erneut ansprechen" : "Den Salzsack im Geröll bergen",
      held.glockeGestoppt || held.glockeGescheitert ? "Die Kapellenglocke prüfen" : "Die Glocke zum Schweigen bringen",
      "Nach Lindendorf zurückkehren",
    ],
  });

  if (wahl === 0) await glockenwegSanna(rt, held);
  else if (wahl === 1) await glockenwegSalz(rt, held);
  else if (wahl === 2) await glockenwegGlocke(rt, held);
}

async function glockenwegSanna(rt: Runtime, held: Held) {
  if (held.sannaGeholfen || held.sannaAbgewiesen) {
    await rt.present({ title: "Sanna, die Botin", art: "chapel", portrait: "sanna", held, lines: ["Sanna zählt die Schnallen ihrer Tasche. Der fehlende Brief fehlt noch immer."] });
    return;
  }
  const wahl = await rt.present({
    title: "Sanna, die Botin",
    art: "chapel",
    portrait: "sanna",
    held,
    lines: [
      "Sanna trägt eine Ledertasche ohne Brief.",
      "„Er ist mir im Geröll aus der Hand gerutscht. Wenn ich leer zurückkomme, glaubt man mir weniger als dem Regen.“",
      "Sie versucht zu lächeln und scheitert an der Kälte. Unter ihrer Zunge klebt noch Staub vom Hang.",
      "„Der Brief war versiegelt“, sagt sie. „Nicht mit dem Wachs des Bürgermeisters. Mit etwas, das darunter war.“",
    ],
    choices: [
      "Die Spur im Geröll lesen (Geschick, leicht)",
      "Sanna beruhigen und den Inhalt rekonstruieren (Charisma, mittel)",
      "Weitergehen",
    ],
  });
  if (wahl === 2) {
    held.sannaAbgewiesen = true;
    await rt.present({ held, lines: ["Sanna zählt die Schnallen noch einmal. Du steigst allein weiter."] });
    return;
  }
  const attribut = wahl === 0 ? "Geschicklichkeit" : "Charisma";
  const wert = wahl === 0 ? held.geschick : held.charisma;
  const schwierigkeit = wahl === 0 ? LEICHT : MITTEL;
  const ergebnis = probe(held, attribut, wert, schwierigkeit, "Sannas verlorenen Brief finden", undefined, "wahrnehmung");
  if (ergebnis.erfolg) {
    held.sannaGeholfen = true;
    await rt.present({
      title: "Sanna, die Botin",
      art: "chapel",
      portrait: "sanna",
      held,
      probe: ergebnis,
      lines: [
        "Das Papier steckt unter einem nassen Stein. Die Schrift ist verschmiert, aber lesbar.",
        "„Die Glocke nicht läuten“, steht dort. Mehr Warnung als Nachricht.",
        "Sanna faltet den Brief. Ihre Hände zittern erst, als sie ihn wieder hat.",
        "Unter der Warnung findet sich eine zweite Zeile, beinahe vollständig ausgewaschen: Wenn sie dich beim Namen rufen, antworte nicht.",
        "Sanna liest sie zweimal. Dann zerreißt sie den unteren Teil des Briefes und steckt ihn ein, als könne Papier ein Geräusch behalten.",
      ],
    });
  } else {
    held.sannaAbgewiesen = true;
    await rt.present({ held, probe: ergebnis, lines: ["Das Geröll gibt keinen Brief her. Sanna nimmt die leere Tasche.", "„Dann war es wohl meiner“, sagt sie."] });
  }
}

async function glockenwegSalz(rt: Runtime, held: Held) {
  if (held.salzGerettet || held.salzLiegenGelassen) {
    await rt.present({ held, lines: ["Jorren prüft den Knoten am Salzsack. Er hält. Diesmal."] });
    return;
  }
  const wahl = await rt.present({
    title: "Jorren im Geröll",
    art: "ditch",
    portrait: null,
    held,
    lines: [
      "Jorren kniet neben einem aufgerissenen Sack.",
      "„Salz für drei Wochen“, sagt er. „Wenn der Berg es frisst, zahlen am Ende wieder die Falschen.“",
      "Seine Hände sind weiß bis zu den Handgelenken. In den Rissen der Haut sitzt Salz wie Frost.",
      "Im Geröll liegt ein Stück schwarzes Holz. Es stammt nicht vom Wagen und nicht von der Kapelle. Jorren sieht es an, als wäre es ein weiterer Verlust, den er nicht erklären will.",
    ],
    choices: [
      "Den Stein heben (Stärke, mittel)",
      "Die Last neu sichern (Geschick, leicht)",
      "Den Sack liegen lassen",
    ],
  });
  if (wahl === 2) {
    held.salzLiegenGelassen = true;
    await rt.present({ held, lines: ["Der Salzstaub bleibt im Regen. Jorren bindet seinen leeren Sack zu."] });
    return;
  }
  const attribut = wahl === 0 ? "Stärke" : "Geschicklichkeit";
  const wert = wahl === 0 ? held.staerke : held.geschick;
  const schwierigkeit = wahl === 0 ? MITTEL : LEICHT;
  const ergebnis = probe(held, attribut, wert, schwierigkeit, "den Salzsack bergen", undefined, "klettern");
  if (ergebnis.erfolg) {
    held.salzGerettet = true;
    const gold = goldPlus(held, 2, "Jorrens Dank");
    await rt.present({ held, probe: ergebnis, log: [gold], lines: ["Der Sack hält. Jorren zählt zwei Münzen ab.", "„Mehr habe ich nicht. Mehr wäre gelogen.“"] });
  } else {
    held.salzLiegenGelassen = true;
    await rt.present({ held, probe: ergebnis, lines: ["Der Stein rutscht zurück. Das Salz verschwindet im nassen Gras."] });
  }
}

async function glockenwegGlocke(rt: Runtime, held: Held) {
  if (held.glockeGestoppt || held.glockeGescheitert) {
    await rt.present({ held, lines: [held.glockeGestoppt ? "Das Glockenseil liegt sauber aufgerollt. Kein Wind bringt es mehr zum Sprechen." : "Das Glockenseil schwingt noch. Unten im Tal wartet man vielleicht schon."] });
    return;
  }
  const wahl = await rt.present({
    title: "Die Kapellenglocke",
    art: "chapel",
    portrait: null,
    held,
    lines: [
      "Die Glocke ist klein. Ihr Ton wäre es nicht.",
      "Das Seil wurde an einer Stelle neu geknotet. Jemand benutzt sie regelmäßig.",
      "Der Knoten besteht aus drei verschiedenen Fasern: Hanf, roter Wolle und etwas, das unter deinen Fingern kalt bleibt, obwohl es trocken ist.",
      "Auf der Innenseite der Glocke sind Namen eingeritzt. Einige wurden abgeschabt. Der letzte ist noch lesbar: kein Name, nur ein Datum.",
    ],
    choices: ["Das Seil lösen (Geschick, mittel)", "Die Glocke in Ruhe lassen"],
  });
  if (wahl === 1) {
    held.glockeGescheitert = true;
    await rt.present({ held, lines: ["Du lässt das Seil hängen. Der Wind erledigt den Rest."] });
    return;
  }
  const ergebnis = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "das Glockenseil lösen", undefined, "klettern");
  if (ergebnis.erfolg) {
    held.glockeGestoppt = true;
    await rt.present({ held, probe: ergebnis, lines: ["Der Knoten gibt nach. Die Glocke bleibt still.", "Stille ist hier keine Ruhe. Sie ist ein Vorteil."] });
  } else {
    held.glockeGescheitert = true;
    held.banditenGewarnt = true;
    await rt.present({ held, probe: ergebnis, lines: ["Das Seil reißt. Die Glocke schlägt einmal an.", "Unten im Tal antwortet kein Mensch. Das ist schlimmer."] });
  }
}

async function szeneWald(rt: Runtime, held: Held) {
  const ankunftszeilen = [
    "Der Wald von Lindendorf ist kein Märchenwald.",
    "Nasses Laub. Krähen. Ein Pfad, der sich entscheidet, kein Pfad mehr zu sein.",
    "Irgendwo voraus liegt der Steinbruch. Dazwischen: Spuren, ein Hindernis, vielleicht Beute.",
    "Die Bäume wachsen eng genug, dass ihre Kronen den Himmel in schmale Streifen teilen. Zwischen diesen Streifen hängt ein fahles Licht, das weder Tag noch Abend sein will.",
    "Im Unterholz liegen zerbrochene Pfeile, ein Kinderlöffel und die Hälfte eines Wagenschilds. Der Wald sammelt alles, was Menschen zurücklassen, aber nichts davon wird leichter.",
  ];
  if (held.mehlsackGefunden) {
    ankunftszeilen.push("An einem Farn klebt grauer Staub. Der falsche Mehlsack hat nicht gelogen.");
  } else if (held.mehlsackGemeldet) {
    ankunftszeilen.push("Im Dorf wird man den Sack melden. Ob das schnell genug ist, weiß niemand.");
  }
  if (held.schnurGeholfen) {
    ankunftszeilen.push("Ein roter Faden hängt am Zaunpfahl. Dahinter führt ein schmaler Weg nach Osten.");
  }
  if (held.sannaGeholfen) {
    ankunftszeilen.push("Die Warnung aus Sannas Brief sitzt noch im Kopf: Die Glocke nicht läuten.");
  }
  if (held.salzGerettet) {
    ankunftszeilen.push("Zwischen den Steinen liegt Salzstaub. Jorren hat nicht übertrieben.");
  }
  if (held.loesungswegMuehle === "kampf") {
    ankunftszeilen.push("Hinter dir redet man am Steg von Männern mit blutiger Nase.");
  } else if (held.loesungswegMuehle === "verraten") {
    ankunftszeilen.push("Im Dorf sagt man, die Mühle habe ihren Schutzbrief. Niemand sagt, wen die Wache mitgenommen hat.");
  } else if (held.loesungswegMuehle) {
    ankunftszeilen.push("Hinter dir mahlt die Mühle wieder. Das Dorf fragt nicht, warum.");
  }
  if (held.loesungswegBrunnen === "bestochen") {
    ankunftszeilen.push("Das Wasser im Beutel schmeckt klarer. Es bleibt knapp.");
  } else if (held.loesungswegBrunnen === "zerstoert" && held.grovinGeflohen) {
    ankunftszeilen.push("Am Waldrand sind frische Schritte. Sie gehören nicht zum Dorf.");
  } else if (held.loesungswegBrunnen) {
    ankunftszeilen.push("Das Wasser im Beutel schmeckt nach Stein, nicht nach Metall.");
  }
  if (held.loesungswegGasse === "veroeffentlicht") {
    ankunftszeilen.push("Hinter dir spaltet sich das Dorf in Sätze über eine Gasse, die zehn Jahre niemand betreten hat.");
  } else if (held.loesungswegGasse === "vernichtet") {
    ankunftszeilen.push("Hinter dir hämmert jemand an der Gerberei. Das Holz ist neu. Der Grund nicht.");
  } else if (held.loesungswegGasse) {
    ankunftszeilen.push("Die Gerbereigasse bleibt leer. Offiziell aus Gründen, die das Dorf nicht vorliest.");
  }
  await rt.present({
    id: "wald",
    title: "Wald",
    art: "forest",
    portrait: null,
    held,
    lines: ankunftszeilen,
  });

  const wahl = await rt.present({
    held,
    lines: [
      "Du findest Abdrücke im Matsch. Zu groß für Ziegen. Zu viele für Wanderer.",
      "Einige Spuren stammen von Stiefeln. Andere sind barfuß. Bei einer Ferse klebt grauer Staub, derselbe, der am falschen Mehlsack hing.",
      "Du kniest dich hin und hörst den Boden ab. Unter dem Regen arbeitet irgendwo Holz gegen Holz.",
    ],
    choices: [
      "Die Spuren behutsam lesen (Geschick, leicht)",
      "Geradeaus durch das Unterholz (Stärke, mittel)",
      "In den Wald rufen, ob jemand hilft (Charisma, mittel)",
    ],
  });

  let spurenGefunden = false;

  if (wahl === 0) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "Spuren lesen", "nebel", "wahrnehmung");
    if (ergebnis.erfolg) {
      spurenGefunden = true;
      const stochern = await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Ostwärts. Gespaltene Eiche. Danach ein Wildpfad, den Wagen nicht nutzen.",
          "Zwischen den Wurzeln blinkt etwas.",
          "Die Spuren kreuzen sich dort mit einer schmalen Schleifspur. Etwas Schweres wurde in Richtung Steinbruch gezogen. Am Rand klebt ein Fetzen blauer Wolle.",
        ],
        choices: ["Im Wurzelwerk stochern", "Weitergehen"],
      });
      if (stochern === 0) await waldBeute(rt, held);
    } else {
      const lines = [
        "Die Abdrücke verlieren sich. Du folgst einem Wildwechsel und gewinnst eine Stunde Nässe.",
      ];
      if (chance(2)) lines.push(schaden(held, 1, "Dornen und Stolpern"));
      await rt.present({ held, probe: ergebnis, lines });
    }
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "Unterholz durchbrechen", "nebel", "klettern");
    if (ergebnis.erfolg) {
      const lines = [
        "Du machst dir einen Weg. Laut, aber schnell.",
        "Laut ist im Banditenwald eine Entscheidung.",
        "Äste schlagen dir ins Gesicht. Hinter dir bleibt ein Pfad aus gebrochenem Grün. Du hörst nicht, ob jemand ihn benutzt.",
      ];
      if (chance(3)) {
        held.banditenGewarnt = true;
        lines.push("Irgendwo knackt Antwort. Nicht von dir.");
      }
      await rt.present({ held, probe: ergebnis, lines });
    } else {
      const dmg = schaden(held, 2, "Peitschenhiebe der Zweige, ein böser Sturz");
      await rt.present({
        held,
        probe: ergebnis,
        lines: [dmg, "Du kommst durch. Der Wald behält eine Gebühr."],
      });
    }
  } else {
    const ergebnis = probe(held, "Charisma", held.charisma, MITTEL, "Hilfe im Wald", "nebel", "reden");
    if (ergebnis.erfolg) {
      const item = nimm(held, HEILTRANK);
      spurenGefunden = true;
      await rt.present({
        held,
        probe: ergebnis,
        log: [item],
        lines: [
          "Ein Köhler tritt zwischen die Stämme, als hätte der Rauch ihn ausgespuckt.",
          "„Steinbruch. Östlicher Pfad. Und nimm das, bevor du stirbst und hier liegend stinkst.“",
          "Sein Gesicht ist schwarz vom Ruß bis auf die Augen. In einer Hand hält er die Reste eines kleinen Gebetsbandes.",
          "„Wenn du die Glocke hörst, bist du zu spät“, sagt er. Dann tritt er zurück in den Rauch, ohne zu erklären, ob das ein Rat oder eine Feststellung war.",
        ],
      });
    } else {
      held.banditenGewarnt = true;
      await rt.present({
        held,
        probe: ergebnis,
        lines: [
          "Dein Ruf hängt im Geäst und kommt nicht zurück.",
          "Dafür antwortet etwas anderes: ein Pfiff, kurz, von weit vorn.",
        ],
      });
    }
  }

  if (tot(held)) return;
  await vielleichtHeiltrank(rt, held);
  if (tot(held)) return;

  const graben = await rt.present({
    title: "Graben",
    art: "ditch",
    portrait: null,
    held,
    lines: [
      "Der Pfad endet an einem Graben. Frisch ausgehoben, mit Pfählen gespickt.",
      "Dahinter ein gestürzter Stamm, nass und glatt. Das ist Absicht, kein Sturm.",
      "An einem Pfahl hängt ein Streifen Stoff. Darauf ist mit Kreide ein Kreis gemalt, durch den eine Linie führt. Das Zeichen aus der Taverne.",
      "Jemand hat den Graben nicht gebaut, um dich aufzuhalten. Er hat ihn gebaut, damit du genau dort hinübergehst, wo man dich sehen kann.",
    ],
    choices: [
      "Hinüberspringen (Geschick, mittel)",
      "Den Stamm zur Seite wuchten (Stärke, mittel)",
      "Entlang des Grabens einen Übergang suchen (Zeit, aber sicherer)",
    ],
  });

  if (graben === 0) {
    const schwierigkeit = held.verwundet ? SCHWER : MITTEL;
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, schwierigkeit, "Sprung über den Graben", "nebel", "klettern");
    if (ergebnis.erfolg) {
      await rt.present({
        held,
        probe: ergebnis,
        lines: ["Du landest hart, aber auf der richtigen Seite."],
      });
    } else {
      const dmg = schaden(held, 3, "Pfahl und Fall");
      await rt.present({
        held,
        probe: ergebnis,
        lines: [dmg, "Schlamm im Mund. Ein Riss im Ärmel. Der Graben hat sich genommen, was er wollte."],
      });
    }
  } else if (graben === 1) {
    const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "Stamm bewegen", "nebel", "klettern");
    if (ergebnis.erfolg) {
      await rt.present({
        held,
        probe: ergebnis,
        lines: ["Der Stamm gibt nach. Der Graben bleibt, aber du hast eine Brücke aus Totholz."],
      });
    } else {
      const dmg = schaden(held, 2, "der Stamm rollt zurück");
      await rt.present({
        held,
        probe: ergebnis,
        lines: [dmg, "Du kommst trotzdem rüber — auf allen vieren, fluchend."],
      });
    }
  } else {
    const lines = [
      "Du verlierst Zeit. Der Wald wird dunkler.",
      "Dafür findest du eine Stelle, an der der Graben seicht ist.",
    ];
    const log: string[] = [];
    if (!spurenGefunden && chance(2)) {
      lines.push("Im seichten Wasser liegt ein verlorener Ringbund — und daran ein eiserner Schlüssel.");
      log.push(nimm(held, SCHLUESSEL));
    }
    await rt.present({ held, lines, log: log.length ? log : undefined });
  }

  if (tot(held)) return;
  await vielleichtHeiltrank(rt, held);

  if (held.banditenGewarnt) {
    await rt.present({
      art: "camp",
      held,
      lines: [
        "Vor dir wird der Wald dünner. Stimmen. Metall auf Metall.",
        "Sie klingen nicht überrascht. Jemand hat ihnen gesagt, dass ein Gast kommt.",
      ],
    });
  } else {
    await rt.present({
      art: "camp",
      held,
      lines: [
        "Vor dir wird der Wald dünner. Rauch. Leise Stimmen.",
        "Das Lager weiß noch nicht, dass der Wald heute Besuch hat.",
      ],
    });
  }
  if (held.holmSiegelGefunden) {
    await rt.present({
      art: "evidence",
      portrait: null,
      held,
      lines: [
        "Am Rand des Lagers liegt ein Brief mit rotem Wachs. Holms gebrochenes Siegel war kein Einzelfall.",
        "Der Brief trägt seine Unterschrift, aber nicht seine Hand. Darin werden Lieferungen aus der Mühle und Salz vom Glockenweg als Abgabe für eine Wache verlangt, die nie im Tal war.",
        "Am unteren Rand stehen drei Glockenzeichen: ein Schlag für einen Boten, zwei für Ware, drei für Gefahr. Jemand hat aus der Kapelle ein Buchhaltungssystem gemacht.",
        "Das Wachs hat Lindendorf nicht nur getäuscht. Es hat dem Dorf befohlen, seine eigenen Vorräte an den Steinbruch zu tragen.",
      ],
    });
  }
  if (held.glockeGestoppt) {
    await rt.present({
      art: "camp",
      portrait: null,
      held,
      lines: ["Kein Glockenton kommt vom Hang. Im Lager merkt man die Stille erst, als jemand zu spät aufsteht."],
    });
  }
  if (held.artefaktErhalten) {
    await rt.present({
      art: "evidence",
      portrait: null,
      held,
      lines: [
        "Das silberne Artefakt wird in deiner Tasche kalt. Nicht wie Metall im Winter, sondern wie Wasser aus einem tiefen Brunnen.",
        "Auf einer Kiste im Lager ist dasselbe Auge über drei Linien eingeritzt. Hier wurde es verkehrt herum gezeichnet.",
        "Du verstehst nicht, was das Zeichen ursprünglich bedeutete. Du verstehst nur, dass jemand seinen Schutz in eine Drohung verwandelt hat.",
      ],
    });
  }
}

async function waldBeute(rt: Runtime, held: Held) {
  const fund = pick([GOLD, HEILTRANK, SCHLUESSEL]);
  if (fund === GOLD) {
    const gold = goldPlus(held, 4, "vergrabene Münzen unter der Wurzel");
    await rt.present({
      held,
      log: [gold],
      lines: [
        "Zwischen den Wurzeln blinkt Metall.",
        "Vier Münzen liegen in einem Stück Leinen, zusammen mit einem Milchzahn und einer eingerosteten Nadel. Jemand hat hier nicht Beute, sondern einen kleinen Besitz versteckt.",
        "Du nimmst das Gold. Das Leinen legst du zurück. Es ist eine dünne Höflichkeit, aber der Wald verlangt keine Erklärung.",
      ],
    });
  } else if (fund === HEILTRANK) {
    if (hat(held, HEILTRANK)) {
      const gold = goldPlus(held, 3, "statt eines zweiten Tranks: Münzen im Moos");
      await rt.present({ held, log: [gold], lines: ["Kein zweites Fläschchen. Nur Münzen im Moos.", "Das Leder darum ist von Zähnen durchlöchert. Was es getragen hat, lebt nicht mehr hier."] });
    } else {
      const item = nimm(held, HEILTRANK);
      await rt.present({
        held,
        log: [item],
        lines: [
          "Ein Fläschchen, in Leder gewickelt. Jemand hat es nicht mehr gebraucht.",
          "Das Wachs am Korken trägt Kerns Zeichen. Das Leder darunter ist dunkel von altem Blut.",
          "Du steckst es ein. Im Wald ist Nutzen oft nur die andere Seite eines Verlustes.",
        ],
      });
    }
  } else {
    const item = nimm(held, SCHLUESSEL);
    await rt.present({
      held,
      log: [item],
      lines: [
        "Ein eiserner Schlüssel, grün vor Feuchtigkeit. Passt zu keinem Dorfschloss.",
        "Am Bart klebt grauer Steinmehlstaub. Der Ring ist mit schwarzem Garn umwickelt, damit er beim Gehen nicht klirrt.",
        "Jemand hat ihn hier verloren oder absichtlich für einen anderen zurückgelassen. Beides führt nach Osten.",
      ],
    });
  }
}

async function szeneLager(rt: Runtime, held: Held) {
  const lager = LAGER_CONTENT;
  const lines = [...lager.lines];
  if (hat(held, SCHLUESSEL)) lines.push(lager.schluessel);
  lines.push(held.banditenGewarnt ? lager.gewarnt : lager.unbemerkt);

  const choices = [...lager.choices];
  if (hat(held, SCHLUESSEL)) choices.push(lager.choiceTor);

  const wahl = await rt.present({
    id: "lager-hub",
    title: lager.title,
    art: lager.art,
    portrait: "kess",
    held,
    lines,
    choices,
  });

  if (wahl === 0) await lagerSchleichen(rt, held);
  else if (wahl === 1) await lagerReden(rt, held);
  else if (wahl === 2) await lagerKampf(rt, held);
  else await lagerSeitetor(rt, held);

  if (!tot(held) && held.lagerGeloest) {
    await rt.present({
      art: "camp",
      portrait: null,
      held,
      lines: lager.nachspiel,
    });
  }
}

async function lagerSchleichen(rt: Runtime, held: Held) {
  const weg = LAGER_WEGE.schleich;
  let schwierigkeit = held.banditenGewarnt ? SCHWER : MITTEL;
  const extra: string[] = [];
  if (held.maraGeholfen) {
    schwierigkeit = Math.max(LEICHT, schwierigkeit - 2);
    extra.push(weg.extraMara);
  }
  if (held.glockeGestoppt) {
    schwierigkeit = Math.max(LEICHT, schwierigkeit - 1);
    extra.push(weg.extraGlocke);
  }
  if (held.verwundet) {
    schwierigkeit = Math.min(18, schwierigkeit + 2);
    extra.push(weg.extraWunde);
  }

  const ergebnis = probe(held, "Geschicklichkeit", held.geschick, schwierigkeit, "Anschleichen", "nebel", "schleichen");
  if (ergebnis.erfolg) {
    schliesseLager(held, "schleich", true, "lager-schleich");
    const log = [goldPlus(held, 6, "aus der unbewachten Kiste")];
    if (chance(2) && !hat(held, HEILTRANK)) log.push(nimm(held, HEILTRANK));
    await rt.present({
      id: "lager-schleich",
      art: "sneak",
      portrait: null,
      held,
      probe: ergebnis,
      log,
      lines: [...extra, ...weg.erfolg],
    });
  } else {
    const dmg = schaden(held, 2, "ein geworfener Becher, dann eine Klinge, die nur streift");
    await rt.present({
      art: "sneak",
      held,
      probe: ergebnis,
      lines: [...extra, weg.fehlschlag[0]!, weg.fehlschlag[1]!, dmg, weg.fehlschlag[2]!],
    });
    if (tot(held)) return;
    const next = await rt.present({
      held,
      lines: [weg.weiter],
      choices: [...weg.choicesWeiter],
    });
    if (next === 0) await lagerReden(rt, held, true);
    else await lagerKampf(rt, held, false);
  }
}

async function lagerReden(rt: Runtime, held: Held, erwischt = false) {
  const weg = LAGER_WEGE.reden;
  let schwierigkeit = held.banditenGewarnt || erwischt ? SCHWER : MITTEL;
  if (held.letzterGastGefunden) schwierigkeit = Math.max(LEICHT, schwierigkeit - 2);
  const lines = [...weg.lines];
  if (held.letzterGastGefunden) lines.splice(2, 0, weg.gast);
  const wahl = await rt.present({
    id: "lager-reden",
    title: weg.title,
    art: "camp",
    portrait: "kess",
    held,
    lines,
    choices: [...weg.choices],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Charisma", held.charisma, schwierigkeit, "Drohung", undefined, "reden");
    if (ergebnis.erfolg) {
      schliesseLager(held, "ueberreden", true, "lager-drohen");
      await rt.present({ held, probe: ergebnis, lines: weg.drohenErfolg });
    } else {
      await rt.present({ held, probe: ergebnis, lines: weg.drohenFail });
      await lagerKampf(rt, held, false);
    }
  } else if (wahl === 1) {
    const preis = held.buergermeisterVertraut ? 5 : 8;
    if (held.gold >= preis) {
      const pay = await rt.present({
        held,
        lines: [mitPreis(weg.handelFrage, preis)],
        choices: [mitPreis(weg.handelZahlen, preis), weg.handelNicht],
      });
      if (pay === 0) {
        held.gold -= preis;
        schliesseLager(held, "ueberreden", false, "lager-handel");
        await rt.present({
          held,
          lines: weg.handelErfolg.map((zeile) => mitPreis(zeile, preis)),
        });
        return;
      }
    } else {
      await rt.present({
        held,
        lines: [mitPreis(weg.handelFrage, preis), weg.handelKeinGold],
      });
    }
    await rt.present({ held, lines: [weg.handelTheater] });
    await lagerKampf(rt, held, false);
  } else {
    const luegeSchwer = held.banditenGewarnt ? SCHWER : MITTEL;
    const ergebnis = probe(held, "Charisma", held.charisma, luegeSchwer, "Lüge von der Wache", undefined, "reden");
    if (ergebnis.erfolg) {
      schliesseLager(held, "ueberreden", true, "lager-luege");
      await rt.present({ held, probe: ergebnis, lines: weg.luegeErfolg });
    } else {
      held.banditenGewarnt = true;
      await rt.present({ held, probe: ergebnis, lines: [weg.luegeFail] });
      await lagerKampf(rt, held, false);
    }
  }
}

async function lagerKampf(rt: Runtime, held: Held, ueberrascht = true) {
  const weg = LAGER_WEGE.kampf;
  await rt.present({
    id: "lager-kampf",
    title: weg.title,
    art: "combat",
    portrait: "kess",
    held,
    lines: weg.auf,
  });

  let s1 = ueberrascht && !held.banditenGewarnt ? MITTEL : SCHWER;
  if (held.schmiedGeholfen) s1 = Math.max(LEICHT, s1 - 1);
  if (held.verwundet) s1 = Math.min(18, s1 + 1);

  const erster = probe(held, "Stärke", held.staerke, s1, "erster Schlag", undefined, "kaempfen");
  let s2 = MITTEL;
  if (erster.erfolg) {
    await rt.present({ held, probe: erster, lines: [weg.ersterErfolg] });
  } else {
    const dmg = schaden(held, 4, "Kess' Messer findet Stoff und Haut");
    await rt.present({ held, probe: erster, lines: [dmg, weg.ersterFail] });
    if (tot(held)) return;
    s2 = SCHWER;
  }

  await vielleichtHeiltrank(rt, held);
  if (tot(held)) return;

  const zweiter = probe(held, "Stärke", held.staerke, s2, "den Steinbruch halten", undefined, "kaempfen");
  if (zweiter.erfolg) {
    schliesseLager(held, "kampf", true, "lager-kampf");
    const gold = goldPlus(held, 5, "von den Gürteln der Fliehenden");
    await rt.present({ held, probe: zweiter, log: [gold], lines: weg.sieg });
  } else {
    const dmg = schaden(held, 5, "zu viele Klingen, zu wenig Platz");
    await rt.present({ held, probe: zweiter, lines: [dmg, weg.taumeln] });
    if (tot(held)) return;
    const flucht = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "mit der Beute entkommen", "nebel", "schleichen");
    schliesseLager(held, "kampf", flucht.erfolg, "lager-flucht");
    await rt.present({
      art: "forest",
      portrait: null,
      held,
      probe: flucht,
      lines: flucht.erfolg ? weg.fluchtErfolg : weg.fluchtFail,
    });
  }
}

async function lagerSeitetor(rt: Runtime, held: Held) {
  const weg = LAGER_WEGE.tor;
  const wahl = await rt.present({
    id: "lager-tor",
    title: weg.title,
    art: "gate",
    portrait: null,
    held,
    lines: weg.lines,
    choices: [...weg.choices],
  });

  if (wahl === 0) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, LEICHT, "Beute am Seitentor", undefined, "schleichen");
    if (ergebnis.erfolg) {
      schliesseLager(held, "seitentor", true, "lager-seitentor");
      const gold = goldPlus(held, 6, "Kirchensilber");
      await rt.present({ art: "sneak", held, probe: ergebnis, log: [gold], lines: weg.beuteErfolg });
    } else {
      await rt.present({ held, probe: ergebnis, lines: [weg.beuteFail] });
      await lagerKampf(rt, held, false);
    }
  } else if (wahl === 1) {
    const ergebnis = probe(held, "Geschicklichkeit", held.geschick, MITTEL, "Zelte sabotieren", undefined, "verstecken");
    if (ergebnis.erfolg) {
      schliesseLager(held, "schleich_ablenkung", true, "lager-zelte");
      const gold = goldPlus(held, 4, "in der Verwirrung");
      await rt.present({ art: "combat", held, probe: ergebnis, log: [gold], lines: weg.zelteErfolg });
    } else {
      const dmg = schaden(held, 2, "ein Wachposten sieht dich am Tau");
      await rt.present({ held, probe: ergebnis, lines: [dmg] });
      if (!tot(held)) await lagerKampf(rt, held, false);
    }
  } else {
    const ergebnis = probe(held, "Stärke", held.staerke, MITTEL, "Kess stellen", undefined, "kaempfen");
    if (ergebnis.erfolg) {
      schliesseLager(held, "kampf", true, "lager-kess-hinten");
      const gold = goldPlus(held, 5, "Kess' Beutel");
      await rt.present({
        art: "combat",
        portrait: "kess",
        held,
        probe: ergebnis,
        log: [gold],
        lines: weg.kessErfolg,
      });
    } else {
      const dmg = schaden(held, 3, "Kess ist schneller als sein Mund");
      await rt.present({ art: "combat", portrait: "kess", held, probe: ergebnis, lines: [dmg] });
      if (!tot(held)) await lagerKampf(rt, held, false);
    }
  }
}

async function szeneEnde(rt: Runtime, held: Held) {
  if (tot(held) || held.lp <= 0) {
    const death =
      held.todesort === "steg"
        ? {
            ending: "Der Fluss nimmt, was er bekommt.",
            lines: [
              `${held.name} bleibt unter dem morschen Steg.`,
              "Der Fluss nimmt, was er bekommt. In der Mühle dreht sich das Rad weiter, für niemanden im Besonderen.",
              "Bertok findet am nächsten Morgen den leeren Karren noch immer vor der Tür. Er stellt ihn nicht weg.",
            ],
          }
        : held.todesort === "rennik"
          ? {
              ending: "Gewicht auf fremder Waage.",
              lines: [
                `${held.name} bleibt im Lagerhaus am Fluss.`,
                "Rennik wiegt weiter. Das Getreide ändert sein Gewicht nicht.",
                "Im Dorf sagt man später, jemand sei den Uferweg hinabgegangen und nicht zurückgekommen. Mehr braucht ein Tal nicht für ein Ende.",
              ],
            }
          : held.todesort === "zisterne"
            ? {
                ending: "Klares Wasser, stille Frage.",
                lines: [
                  `${held.name} bleibt an der Zisterne.`,
                  "Die Zisterne bleibt klar und still. Das Dorf wartet weiter auf einen Boten, der nicht zurückkommt.",
                  "Kern wiegt die Mischung ab, bis sie nicht mehr reicht. Dennek rührt im Eimer, als könnte das etwas ändern.",
                ],
              }
            : {
                ending: "Der Wald behält dich.",
                lines: [
                  `${held.name} bleibt zwischen Lindendorf und dem Steinbruch.`,
                  "Der Wald nimmt das Geräusch, das Dorf behält die Angst.",
                  "Man erzählt später von jemandem, der gegangen ist. Nicht von jemandem, der zurückkam.",
                  "Am nächsten Morgen findet der Köhler eine Spur im nassen Laub. Er folgt ihr nicht bis zum Ende. Im Tal kennt man den Unterschied zwischen Feigheit und Erfahrung.",
                  "Holm lässt deinen Namen in das Buch der Gemeinde schreiben, auf eine Seite zwischen unbezahlten Abgaben und zwei Kindern, die im Winter starben.",
                  "Die Glocke am Hang schlägt einmal. Niemand weiß, wer am Seil stand.",
                ],
              };
    await rt.present({
      title: "Ende",
      art: "death",
      portrait: null,
      held,
      ending: death.ending,
      lines: death.lines,
      choices: ["Zurück ins Menü"],
    });
    return;
  }

  await rt.present({
    title: "Ende",
    art: "return",
    portrait: "holm",
    held,
    lines: [
      "Lindendorf sieht dich früher als Holm. Dann sieht dich Holm.",
      "Die Nachricht läuft nicht durch Rufe über den Platz. Sie läuft durch Türen, die sich öffnen, durch einen Eimer, der am Brunnen stehen bleibt, und durch Maras Hand, die mitten in einer Bewegung ruht.",
      "Du bringst den Geruch des Steinbruchs mit: Rauch, Blut, nassen Kalk. Niemand fragt zuerst, ob du gesiegt hast.",
      "Holm tritt aus dem Rathaus. Hinter ihm bleibt die Tür offen, als hätte selbst das Amt vergessen, vorsichtig zu sein.",
    ],
  });

  if (!held.lagerGeloest) {
    await rt.present({
      held,
      ending: "Unerledigt.",
      log: epilog(held),
      lines: [
        "Du bringst keine Lösung mit. Nur Dreck und eine Geschichte ohne Schluss.",
        "Holm nickt, als hätte er das erwartet. Die nächste Nacht kommt trotzdem.",
        "Er hört bis zum Ende zu. Danach schließt er die leere Kasse und legt den Schlüssel darauf, als würde das irgendetwas sichern.",
        "Am Brunnen beginnen die Leute wieder zu reden, leiser als zuvor. Ein Mann trägt Bretter zum Fenster seines Hauses. Eine Frau holt ihre Kinder herein, obwohl es noch hell ist.",
        "Du hast das Tal nicht gerettet. Aber du hast gesehen, wo seine Angst wohnt. Dieses Wissen ist kein Trost und lässt sich nicht zurückgeben.",
      ],
      choices: ["Zurück ins Menü"],
    });
    return;
  }

  if (held.loesungsweg === "ueberreden" && held.beuteGerettet && held.buergermeisterVertraut) {
    const gold = goldPlus(held, 6, "Belohnung des Bürgermeisters");
    await rt.present({
      held,
      ending: "Das Wort war die Waffe.",
      log: [gold, ...epilog(held)],
      lines: [
        "Du hast gesprochen, wo andere schlagen wollten.",
        "Das Silber der Kirche liegt wieder auf Holms Tisch. Holm atmet zum ersten Mal heute.",
        "„Bleib, wenn du willst. Lindendorf zahlt schlecht. Aber es vergisst nicht.“",
        "Er öffnet die Kiste nicht sofort. Zuerst legt er beide Hände auf den Deckel, als müsste er prüfen, ob das Gewicht wirklich zurückgekehrt ist.",
        "Mara stellt am Abend einen Becher auf den Tisch, den niemand bezahlt. Der Holzfäller sagt nichts über Kess. Das Schweigen ist diesmal kein Misstrauen, sondern eine Entscheidung.",
        "Oben am Hang bleibt die Glocke still oder schlägt weiter, je nachdem, was du dort getan hast. Im Dorf hört man jetzt auf den Unterschied.",
        "Du hast keine Männer besiegt. Du hast ihnen einen Ausweg gegeben, der teuer genug war, um glaubwürdig zu sein. Das Tal wird erst später erfahren, ob er hält.",
      ],
      choices: ["Zurück ins Menü"],
    });
  } else if (held.loesungsweg === "ueberreden" && !held.beuteGerettet) {
    const lines = [
      "Die Banditen sind weg. Die Kiste auch nicht voller.",
      "Holm hört zu, ohne Dank. Ein Dorf, das zahlt, damit man es in Ruhe lässt,",
      "hat das schon einmal getan.",
      "Er nimmt die verbleibenden Münzen aus der Kasse und stellt sie neben deinen Bericht. Beides zusammen reicht nicht für den Winter.",
      "Draußen wird die Nachricht dennoch als Frieden weitererzählt. Menschen brauchen ein Wort für Nächte, in denen niemand die Tür eintritt.",
      "Mara schenkt weniger aus. Die Müllerin zählt die Säcke zweimal. Jeder weiß, dass gekaufte Ruhe einen nächsten Preis hat.",
    ];
    if (held.buergermeisterVertraut) {
      lines.push("Trotzdem sieht er dich nicht als Feind. Nur als teure Lektion.");
    }
    await rt.present({
      held,
      ending: "Gekaufter Frieden.",
      log: epilog(held),
      lines,
      choices: ["Zurück ins Menü"],
    });
  } else if (
    (held.loesungsweg === "schleich" ||
      held.loesungsweg === "seitentor" ||
      held.loesungsweg === "schleich_ablenkung") &&
    held.beuteGerettet
  ) {
    const log: string[] = [];
    const lines = [
      "Kein Blut auf dem Marktplatz. Nur eine Kiste, die wieder da ist.",
      "Manche nennen das Feigheit. Holm nennt es Ergebnis.",
      "Die Leute stehen um das Kirchensilber, ohne es zu berühren. Sein Glanz passt nicht mehr in ihre Gesichter.",
      "Im Steinbruch brennt vielleicht noch das Feuer. Kess lebt vielleicht noch. Deine Arbeit besteht aus Dingen, die nicht geschehen sind, und lässt sich deshalb schlecht erzählen.",
    ];
    if (held.buergermeisterVertraut) {
      log.push(goldPlus(held, 5, "stille Belohnung"));
      lines.push("„Die besten Boten sind die, von denen niemand ein Lied singt.“");
    } else {
      log.push(goldPlus(held, 2, "knappe Anerkennung"));
    }
    if (held.glockeGestoppt) lines.push("Über dem Weg bleibt die Kapelle still. Das hat dir Zeit gekauft.");
    if (held.sannaGeholfen) lines.push("Sannas Warnung war richtig: Du wurdest erst spät bemerkt.");
    lines.push(
      "In der Nacht schläft Lindendorf nicht besser, aber länger. Keine Schritte kommen aus dem Osten.",
      "Du weißt, dass Schattenarbeit selten ein Ende hat. Sie verschiebt nur den Augenblick, in dem jemand eine Fackel anzündet.",
    );
    await rt.present({
      held,
      ending: "Schattenarbeit.",
      log: [...log, ...epilog(held)],
      lines,
      choices: ["Zurück ins Menü"],
    });
  } else if (held.loesungsweg === "kampf" && held.beuteGerettet && !held.verwundet) {
    const gold = goldPlus(held, held.buergermeisterVertraut ? 8 : 4, "Siegeslohn");
    await rt.present({
      held,
      ending: "Der kurze Ruhm.",
      log: [gold, ...epilog(held)],
      lines: [
        "Du kommst aufrecht zurück. Das Dorf versteht Stahl besser als Feinheiten.",
        "Ein Junge am Brunnen ahmt deinen Gang nach, bis seine Mutter ihn zieht.",
        "Die Kirchenkiste wird geöffnet, und für einen Moment spiegelt das Silber jedes Gesicht auf dem Platz. Keines davon sieht siegreich aus.",
        "Holm zählt die zurückgebrachten Stücke. Dann zählt er die Namen, die du vom Steinbruch mitgebracht hast. Bei der zweiten Zahl wird seine Stimme leiser.",
        "Am Abend erzählt man in der Taverne von deinen Schlägen. Niemand erzählt von dem Mann, der im Schlamm nach seinem Messer suchte und es nicht mehr fand.",
        "Ruhm hält in Lindendorf bis zum nächsten leeren Sack. Das ist länger, als manche Menschen bekommen.",
      ],
      choices: ["Zurück ins Menü"],
    });
  } else if (held.loesungsweg === "kampf" && held.verwundet) {
    if (held.beuteGerettet) {
      const gold = goldPlus(held, held.buergermeisterVertraut ? 4 : 2, "Lohn trotz Wunde");
      await rt.present({
        art: "apothecary",
        portrait: "kern",
        held,
        ending: "Teurer Sieg.",
        log: [gold, ...epilog(held)],
        lines: [
          "Du kommst zurück. Das reicht dem Dorf. Es reicht dir fast.",
          "Witwe Kern verbindet, ohne zu fragen, wer angefangen hat.",
          ...(held.kernGeholfen ? ["Sie erkennt den Verbandstoff. „Dann war die Schublade nicht umsonst.“"] : []),
          "Sie schneidet den Stoff mit einer Schere, deren Spitzen nicht mehr aufeinanderpassen. Jeder Zug schmerzt anders.",
          "Draußen tragen zwei Männer die Kirchenkiste zum Rathaus. Sie heben sie zu hoch, als wäre Gewicht etwas, das man vor anderen verbergen kann.",
          "Holm legt den Lohn auf den Tisch neben dein Blut. Beides wirkt dort kleiner als erwartet.",
          "Du hast gewonnen. Dein Körper wird eine Weile brauchen, um den Satz zu glauben.",
        ],
        choices: ["Zurück ins Menü"],
      });
    } else {
      await rt.present({
        art: "apothecary",
        portrait: "kern",
        held,
        ending: "Überlebt, nicht erledigt.",
        log: epilog(held),
        lines: [
          "Du kommst zurück. Das reicht dem Dorf. Es reicht dir fast.",
          "Witwe Kern verbindet, ohne zu fragen, wer angefangen hat.",
          ...(held.kernGeholfen ? ["Sie erkennt den Verbandstoff. „Dann war die Schublade nicht umsonst.“"] : []),
          "Die Beute fehlt. Holm zahlt in Blicken, nicht in Münzen.",
          "Er fragt einmal, wo die Kiste liegt. Du antwortest. Danach fragt er nicht mehr.",
          "Am Brunnen sagen die Leute, du hättest die Banditen vertrieben. In der Mühle sagt man, sie kämen zurück. Beides kann wahr sein.",
          "Kern bindet den letzten Knoten fest. „Überleben ist kein Abschluss“, sagt sie. „Nur Arbeit für morgen.“",
          "In der Nacht träumst du vom Klang einer Kiste, die durch Farn gezogen wird. Als du erwachst, läutet die Glocke am Hang oder der Wind schlägt gegen das Fenster. Du kannst den Unterschied nicht mehr sicher hören.",
        ],
        choices: ["Zurück ins Menü"],
      });
    }
  } else {
    await rt.present({
      held,
      ending: "Genug für ein Tal.",
      log: epilog(held),
      lines: [
        "Das Lager ist kein Lager mehr. Was genau passiert ist, erzählst du unvollständig.",
        "Lindendorf nimmt, was es bekommen kann: eine ruhigere Woche.",
        "Holm schreibt deinen Bericht in sein Buch und lässt zwischen zwei Sätzen eine leere Zeile. Vielleicht für das, was du verschwiegen hast.",
        "Die Mühle läuft wieder. Die Taverne löscht die Lampe eine Stunde später. Am Brunnen hängt jemand einen frischen Eimer an das alte Seil.",
        "Es ist nicht genug für ein Königreich und nicht genug für ein Lied. Für ein Tal, das bis gestern nur auf den nächsten Verlust wartete, ist es genug.",
      ],
      choices: ["Zurück ins Menü"],
    });
  }
}

function epilog(held: Held): string[] {
  const bits: string[] = [];
  if (held.artefaktErhalten) bits.push("Das silberne Artefakt liegt wieder bei der Kirche. Sein Zeichen wirkt im Kerzenlicht tiefer als zuvor.");
  else if (held.artefaktVerloren) bits.push("Der Fremde vom Weg und das silberne Artefakt bleiben eine offene Spur im Nebel.");
  if (held.holmBesucht && !held.auftragErhalten) bits.push("Du hast ohne Holms Auftrag gehandelt. Das Dorf wird sich daran anders erinnern als sein Bürgermeister.");
  if (held.banditenGewarnt) bits.push("Die Banditen wussten von dir, bevor du sie sahst.");
  if (held.buergermeisterVertraut) bits.push("Holm schuldet dir etwas, das nicht in der Kasse steht.");
  if (held.kernGeholfen) bits.push("Witwe Kern hat wieder Verbandstoff. Woher, fragt sie nicht.");
  if (held.holmSiegelGefunden) bits.push("Das gebrochene Siegel liegt noch auf Holms Tisch.");
  if (held.schnurGeholfen) bits.push("Am östlichen Zaun hängt kein roter Faden mehr.");
  if (held.bettlerGeholfen) bits.push("Über der Esse des Schmieds hängt ein durchbohrter Groschen.");
  if (held.sannaGeholfen) bits.push("Sanna trägt wieder einen Brief. Diesmal hält sie ihn fest.");
  if (held.salzGerettet) bits.push("Jorren zählt das Salz nach, obwohl er weiß, dass es nicht mehr wird.");
  if (held.glockeGestoppt) bits.push("Die Kapelle schweigt über dem Weg.");
  else if (held.glockeGescheitert) bits.push("Die Glocke am Hang hat gesprochen. Niemand weiß sicher, wer alles geantwortet hat.");
  if (held.loesungswegMuehle === "schleich" || held.loesungswegMuehle === "verhandelt") {
    bits.push("Die Mühle mahlt wieder. Bertok reicht Säcke, ohne die Nacht zu nennen.");
  } else if (held.loesungswegMuehle === "kampf") {
    bits.push("Die Mühle mahlt wieder. Am Steg redet man von blutigen Nasen.");
  } else if (held.loesungswegMuehle === "verraten") {
    bits.push("Die Mühle hat ihren Schutzbrief. Bertok grüßt mit dem Kopf, nicht mit der Hand.");
  }
  if (held.loesungswegBrunnen === "bestochen") {
    bits.push("Das Brunnenwasser reicht. Es reicht nicht für alle. Du weißt, wohin der Rest läuft.");
  } else if (held.loesungswegBrunnen === "zerstoert" && held.grovinGeflohen) {
    bits.push("Das Wasser ist klar. Grovin ist nur verschwunden genug für den Tag.");
  } else if (held.loesungswegBrunnen === "verhandelt") {
    bits.push("Grovin hat die Sperre selbst geöffnet. Holm schuldet eine alte Rechnung.");
  } else if (held.loesungswegBrunnen) {
    bits.push("Der Eimer am Brunnen ist wieder klar bis auf den Grund.");
  }
  bits.push(...echoEpilogVersorgung(held));
  if (held.loesungswegGasse === "veroeffentlicht") {
    bits.push("Vahl hat seinen Ratssitz verloren. Fenn wird gegrüßt, bevor man vorbeigeht.");
  } else if (held.loesungswegGasse === "weitergegeben") {
    bits.push("Holm hat den Bauplatz ruhen lassen. Ilse Brandtners Liste liegt in einer Schublade.");
  } else if (held.loesungswegGasse === "erpresst") {
    bits.push("Vahl grüßt dich zu höflich. Die Gasse bleibt leer, die Wahrheit auch.");
  } else if (held.loesungswegGasse === "vernichtet") {
    bits.push("Die Gerbereigasse wird bebaut. Fenns Hand um das Zaunbrett ist still.");
  }
  if (held.verwundet) bits.push("Die Wunde bleibt eine Weile. Narben sind in Lindendorf eine Art Ausweis.");
  if (hat(held, SCHLUESSEL)) bits.push("Der Schlüssel zum Seitentor ist noch da. Türen bleiben eine Versuchung.");
  if (rufAus(held, "holm") >= 15) bits.push("Holm sieht dich länger an als das Amt verlangt.");
  if (rufAus(held, "mara") >= 8) bits.push("Mara stellt den Becher hin, bevor du sitzt.");
  if (rufAus(held, "kess") <= -10) bits.push("Kess wird deinen Namen nicht vergessen. Das ist kein Ruhm.");
  if (!bits.length) bits.push("Du gehst leichter, als du gekommen bist. Das ist selten.");
  return bits.map((b) => `— ${b}`);
}
