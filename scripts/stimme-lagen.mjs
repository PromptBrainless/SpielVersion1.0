import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SYSTEM = `Lindendorf. How to be a Hero. Du-Erzählung, Präsens.

Ton: hart, düster, körperlich. Schöne Sätze mit hässlichen Dingen. Geruch, Kälte, Gewicht. Kein Pathos, kein Schicksal, kein „In einer Welt“, kein Emoji.

Das ist eine Lage vor dem Spiel, keine Questseite. Nur dieser eine Moment. Dieselben Leute, derselbe Ort, dieselbe Entscheidung. Du erweiterst, indem du denselben Fleck genauer beschreibst — nicht indem du Welt dazu holst. Stichpunkte sind verboten. Jeder Absatz ist Prosa. Dialog in Anführungszeichen „…“, knapp.

Was im Ausgangstext geschieht, bleibt. Du kürzt nicht. Keine neuen Figuren, keine neuen Orte, keine neuen Ausgänge.

Drei Antworten bleiben drei, in derselben Reihenfolge. Jede Antwort ist Prosa: ein bis zwei Sätze, inneres Sprechen oder die Tat selbst. Keine Nummern, keine Bindestriche vor der Zeile.

Mal: nur der Relativsatz nach „jemand, der“ — ohne diese Worte, kleingeschrieben, hart.

Ausgabe nur JSON:
{"titel":"...","geschichte":["Absatz","Absatz","Absatz"],"antworten":[{"label":"...","mal":"..."},{"label":"...","mal":"..."},{"label":"...","mal":"..."}]}`;

const PFAD = "/workspace/src/game/json/lagen-stimme.json";

const lagen = [
  { id: "soldateska", titel: "Die Soldateska", text: `Die Dunkelheit liegt auf dem Dorf, als wäre sie mit den Söldnern gekommen. Hinter der Palisade halten die Leute den Atem. Kinder an Röcken. Kein Krieger, der diesen Namen verdient.\n\nIhr Anführer steigt nicht ab. Kalt, unbarmherzig. „Vorräte. Jetzt. Oder Feuer.“ Jemand Älteres als du sagt mit zittriger Stimme: „Nehmt, was ihr wollt. Lasst uns leben.“ Sie fangen an zu plündern. Die Verzweiflung in den Gesichtern wächst schneller als der Haufen auf dem Karren.\n\nDu trittst zwischen sie und das Dorf. Die letzte Habe am Gürtel. Einige lachen. Andere warten, ob du wirklich stehst. Hinter dir atmet das Dorf. Vor dir Männer, die Feuer kennen.\n\nAntwort 1: Wenn ich mein Leben gebe, kommen die anderen vielleicht durch. Mal: sein Leben vor die Vorräte stellt, damit andere atmen\nAntwort 2: Einen Plan schmieden. Schwäche vortäuschen. Einen Hinterhalt. Mal: Söldner täuscht, obwohl das Feuer alle nehmen kann\nAntwort 3: Zeit kaufen. Vielleicht findet danach jemand den Ausweg. Mal: Zeit kauft, weil das Los schon gefallen ist` },
  { id: "feind", titel: "Der verwundete Feind", text: `Er liegt im Graben vor dem Steinbruch, der Atem pfeift. Der Brustpanzer ist aufgerissen. Darunter eine Wunde, die nicht mehr geschlossen werden will. Am Umhang sitzt ein Zeichen, das nicht zu Lindendorf gehört.\n\nEr sieht dich. Die Lippen bewegen sich. „Wasser.“ Am Gürtel hängt ein voller Schlauch. Das Messer ist schon in der Hand.\n\nAntwort 1: Ihm Wasser geben und die Wunde verbinden. Mal: einem Feind Wasser reicht, bevor er stirbt\nAntwort 2: Ihm den Hals durchschneiden. Mal: im Graben zu Ende bringt, was noch nach Wasser fragt\nAntwort 3: Ihn mitnehmen. Er arbeitet, bis er umfällt. Mal: Verwundete mahlen lässt, solange sie stehen` },
  { id: "ernte", titel: "Die gestohlene Ernte", text: `Die Frau kniet im Staub hinter der Mühle. Drei Säcke, die nicht ihr gehören. Die Kinder halten sich an ihrem Rock, als könnte Stoff sättigen.\n\n„Bitte“, sagt sie, ohne dich anzusehen. „Sie hungern.“ Die Strafe für Diebstahl kennt jeder: zuerst die Peitsche, beim zweiten Mal der Strick.\n\nAntwort 1: Sie melden. Die Strafe kommt. Mal: Diebstahl anzeigt, weil das Mehl einen Herrn hat\nAntwort 2: Sie laufen lassen. Tun, als wäre der Staub leer gewesen. Mal: drei Säcke nicht gesehen hat\nAntwort 3: Sie zwingen, für dich zu arbeiten. Mal: Hunger in Arbeit umrechnet` },
  { id: "verraeter", titel: "Der Verräter", text: `Er steht am Rand des Lagers, das Gesicht im Schatten der Bäume. Du hast ihn gesehen: den Boten, den Beutel, das Gold, das nicht aus diesem Tal stammt.\n\nEr merkt dich. Die Augen werden groß. „Du verstehst das nicht. Meine Familie — sie haben sie.“ Er bricht ab. Du weißt, was folgt, wenn du den Namen laut sagst.\n\nAntwort 1: Ihn melden. Er hängt. Mal: Namen nennt, bevor das Gold ihn kauft\nAntwort 2: Ihn decken. Vielleicht ändert er sich. Mal: Verrat zudeckt, weil jemand eine Familie hat\nAntwort 3: Ihn erpressen. Fortan arbeitet er für dich. Mal: Verrat in eine zweite Rechnung verwandelt` },
  { id: "brot", titel: "Die letzte Fuhre", text: `Der Karren knarrt. Die Räder saufen im Schlamm. Darunter liegt das Brot für Lindendorf, das seit Tagen ohne Mehl kocht. Vor dir sitzen Kinder, ausgezehrt, die Augen zu groß für ihre Gesichter.\n\nEine alte Frau steht auf. „Wir haben seit Tagen nichts. Sie können nicht weiter.“ Wenn du verteilst, kommt das Dorf zu spät. Wenn du fährst, bleiben diese hier im Dreck.\n\nAntwort 1: Das Brot verteilen. Die Kinder essen. Lindendorf wartet hungrig. Mal: Brot an Kinder gibt, das einem anderen Dorf gehört\nAntwort 2: Weiterfahren. Das Dorf bekommt, was auf dem Karren steht. Mal: am Hunger vorbeifährt, weil ein Karren einen Auftrag hat\nAntwort 3: Die Kinder mitnehmen. Wer geht, arbeitet. Mal: Kinder hinter einem Karren herlaufen lässt` },
  { id: "seuche", titel: "Die Scheune", text: `Die Scheune brennt nicht. Noch nicht. Die Schreie darin werden leiser. Du stehst vor der Tür, den Riegel in der Hand.\n\nDrinnen die Kranken. Draußen die, die noch keinen Husten haben. Im Kesseljahr hat man eine Gasse so geschlossen. Das Fieber hat trotzdem den Platz geholt.\n\nAntwort 1: Die Tür öffnen und Hilfe holen. Mal: eine Seuchentür öffnet, weil drinnen noch Stimmen sind\nAntwort 2: Den Riegel lassen und gehen. Mal: eine Scheune schließt und weitergeht\nAntwort 3: Die Scheune anzünden. Mal: Kranke mit der Scheune verbrennt, damit das Dorf atmet` },
  { id: "spion", titel: "Der Gefangene", text: `Er ist an den Pfahl hinter der Schmiede gebunden. Das Gesicht ist eine Maske aus Blut und Dreck. In der Hand hast du die Laterne, nicht die Zange. Noch nicht.\n\n„Ich sage nichts“, presst er hervor. Er kennt den Weg, den sie nachts nehmen. Wenn du ihn zum Reden bringst, weißt du ihn auch. Dann bist du jemand, der das getan hat.\n\nAntwort 1: Ihn zum Reden bringen. Mal: aus einem Gefangenen holt, was der Mund nicht hergeben will\nAntwort 2: Ihn losbinden. Mal: einen Gefangenen losbindet und die Wette eingeht\nAntwort 3: Ihn töten. Mal: am Pfahl ein Ende macht, bevor Fragen teurer werden` },
  { id: "waffe", titel: "Die letzte Waffe", text: `Das Messer liegt zwischen euch im nassen Gras. Zwei Verwundete. Eine Klinge. Im Wald rufen Stimmen, die nicht zu euch gehören.\n\n„Ich kann damit umgehen“, sagt der eine. „Ich halte noch“, sagt der andere. Du weißt, dass nur einer von ihnen den Morgen sieht.\n\nAntwort 1: Dem Stärkeren geben. Mal: die letzte Klinge dem gibt, der noch stehen kann\nAntwort 2: Dem Schwereren geben. Mal: die letzte Klinge dem in die Hand legt, der schon liegt\nAntwort 3: Die Klinge zerbrechen. Mal: eine Waffe zerbricht, bevor sie einen Herrn findet` },
  { id: "burg", titel: "Vor dem Tor", text: `Die Vorräte im Rathaus reichen für zwei Wochen, wenn niemand dazukommt. Vor dem Tor stehen Leute ohne Dorf, ohne Brot, mit Kindern, die nicht mehr schreien.\n\n„Wir haben keinen Weg mehr“, sagt eine Frau. Hinter dir die Wache, müde, hungrig, aber noch in der Pflicht. Nimmst du sie auf, essen weniger von denen, die das Tor halten.\n\nAntwort 1: Alle einlassen. Mal: das Tor aufmacht, obwohl das Brot nicht reicht\nAntwort 2: Abweisen. Die Wache überlebt. Mal: ein Tor geschlossen hält, weil Brot eine Zahl ist\nAntwort 3: Nur Frauen und Kinder. Mal: Männer vor dem Tor lässt und die anderen zählt` },
  { id: "ausweg", titel: "Der letzte Ausweg", text: `Der Feind ist nah. Pferde, Rufe, der nasse Wald. Eure Gruppe ist zu langsam. Einer muss zurückbleiben, sonst bleiben alle.\n\n„Ich kann nicht mehr“, sagt der Verwundete. „Wir lassen niemanden“, sagt der, der führt. Du weißt, dass Führen hier nur eine Richtung hat: weg, oder gar nicht.\n\nAntwort 1: Selbst zurückbleiben. Mal: zurückbleibt, damit andere den Wald verlassen\nAntwort 2: Den Verwundeten lassen. Mal: den Langsamsten im Wald lässt, weil Tempo eine Waffe ist\nAntwort 3: Auslosen. Mal: das Los werfen lässt, wenn niemand sterben will` },
];

function lade() {
  if (!existsSync(PFAD)) return [];
  try {
    return JSON.parse(readFileSync(PFAD, "utf8"));
  } catch {
    return [];
  }
}

function speichere(liste) {
  writeFileSync(PFAD, JSON.stringify(liste, null, 2));
}

async function formuliere(lage) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.65,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Nur diese Lage. Nichts anderes.\n\nTitel: ${lage.titel}\n\nLänger als die Eingabe, aber auf demselben Fleck. Drei Antworten, dieselbe Reihenfolge.\n\nAusgangstext:\n\n${lage.text}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const roh = await res.text().catch(() => "");
    throw new Error(`${lage.id}: xAI ${res.status} ${roh.slice(0, 240)}`);
  }
  const body = await res.json();
  const roh = body.choices?.[0]?.message?.content ?? "";
  const start = roh.indexOf("{");
  const end = roh.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`${lage.id}: kein JSON`);
  const parsed = JSON.parse(roh.slice(start, end + 1));
  if (!Array.isArray(parsed.geschichte) || parsed.geschichte.length < 2) throw new Error(`${lage.id}: Geschichte zu dünn`);
  if (!Array.isArray(parsed.antworten) || parsed.antworten.length !== 3) throw new Error(`${lage.id}: nicht drei Antworten`);
  for (const a of parsed.antworten) {
    if (!String(a.label || "").trim()) throw new Error(`${lage.id}: leere Antwort`);
  }
  return {
    id: lage.id,
    titel: String(parsed.titel || lage.titel).trim(),
    geschichte: parsed.geschichte.map((z) => String(z).trim()).filter(Boolean),
    antworten: parsed.antworten.map((a) => ({
      label: String(a.label || "").trim(),
      mal: String(a.mal || "").trim().replace(/^jemand, der\s+/i, ""),
    })),
  };
}

const fertig = lade();
const haben = new Set(fertig.map((x) => x.id));
for (const lage of lagen) {
  if (haben.has(lage.id)) {
    process.stderr.write(`skip ${lage.id}\n`);
    continue;
  }
  process.stderr.write(`${lage.id}…\n`);
  const next = await formuliere(lage);
  fertig.push(next);
  speichere(fertig);
  haben.add(lage.id);
  process.stderr.write(`ok ${lage.id} (${next.geschichte.join(" ").length} Z.)\n`);
}
process.stderr.write("fertig\n");
