import { INTRO_ARTIFACT_CONTENT, INTRO_WEG_CONTENT } from "../content";
import { karte, type SzeneJson, type TeilJson } from "./schema";

export const INTRO_TAL = karte("intro-tal", "Das Tal", "forest", [
  "Der Wald steht dicht an den Hängen. Zwischen den Stämmen hängen Fetzen von Nebel.",
  "Weiter unten siehst du Rauch, der senkrecht steigt. Kein Wind. Kein gutes Zeichen, wenn Rauch so gerade steht.",
  "Jemand hat die Felder abgeerntet. Jemand anderes hat vergessen, die Zäune zu reparieren.",
  "Am Waldrand liegen Bündel aus nassem Reisig, sorgfältig aufgeschichtet und doch unberührt. Daneben steckt ein Kinderschuh im Schlamm.",
  "Kein Vogel ruft. Ein Ast bricht, weit oberhalb des Weges, und danach wartet das Tal wieder auf ein Geräusch von dir.",
  "Du verstehst noch nicht, was hier geschehen ist. Aber du erkennst die Spur einer Gegend, in der Menschen gelernt haben, ihre Fragen leise zu stellen.",
]);

export const INTRO_HANG = karte("intro-hang", "Am Hang", "chapel", [
  "Oberhalb des Dorfes schneidet ein alter Weg den Hang. Dort steht eine Kapelle, deren Dach dunkler ist als der Himmel.",
  "Eine kleine Glocke bewegt sich einmal über dem Geröll.",
  "Du kennst den Weg noch nicht. Du merkst dir nur den Ton.",
  "Unterhalb der Kapelle klafft ein trockener Graben im Hang. Früher muss dort Wasser gelaufen sein. Jetzt liegen darin die Knochen von Tieren, ausgebleicht und ordentlich nebeneinander, als hätte sie jemand dort abgelegt statt sie verwesen zu lassen.",
  "Über dem Türsturz klebt ein Streifen rotes Wachs, frisch gebrochen. Es ist dasselbe Zeichen, das du unten im Dorf wiederfinden wirst — jemand markiert in dieser Gegend Türen, die niemand öffnen soll.",
  "Die Glocke schweigt wieder. Trotzdem hast du das Gefühl, dass etwas im Tal nun weiß, dass du angekommen bist.",
]);

export const INTRO_LINDENDORF = karte("intro-lindendorf", "Lindendorf", "village", [
  "Häuser drücken sich aneinander, als könnten sie so wärmer bleiben.",
  "Am Brunnen halten Frauen die Arme vor der Brust verschränkt und sehen dir nach, bis du vorbei bist. In der Taverne bläst jemand hastig eine Lampe aus, als koste jede Flamme mehr, als sie wert ist.",
  "Auch über der Rathaustür klebt ein Zeichen aus rotem Wachs, wie du es schon am Hang gesehen hast. Hier ist es alt und unversehrt.",
  "Ein Gerber deckt seine Ware mit einer zu kleinen Plane ab. Ein Teil des Leders bleibt im Regen liegen. Er sieht kurz hin und wendet sich ab: Es lohnt sich längst nicht mehr, es zu retten.",
  "Hinter einem offenen Fenster hustet ein alter Mann. Eine Stimme zählt dahinter Münzen, so leise, als könnte lautes Zählen sie kosten.",
  "Lindendorf wirkt nicht verlassen. Es wirkt schlimmer: bewohnt von Menschen, die sich daran gewöhnt haben, dass niemand kommt.",
]);

export const INTRO_ANKUNFT = karte("intro-ankunft", "Ankunft", "village", [
  "Du bleibst am Rand des Platzes stehen. Niemand fragt, wer du bist.",
  "Das ist zunächst höflich. Dann merkst du, dass es Vorsicht ist.",
  "Du könntest weitergehen. Aber der Weg nach Osten führt am Steinbruch vorbei, und aus dem Steinbruch steigt Rauch.",
  "In Lindendorf wartet niemand auf einen Helden. Trotzdem beginnt hier dein Weg.",
  "Hinter dir schließt sich das Tal wie ein nasser Kragen. Vor dir liegen Türen, hinter denen jeder etwas verloren hat und nicht jeder bereit ist, es beim Namen zu nennen.",
  "Du spürst die Blicke erst, als sie aufhören. Die Leute hier sehen Fremde nicht lange an. Sie wissen, dass man von Gesichtern allein nicht satt wird.",
  "Am Brunnen schlägt ein Tropfen auf Stein. Dann noch einer. So beginnt in diesem Dorf vieles: nicht mit einem Ruf, sondern mit etwas, das nicht aufhört.",
]);

const weg: SzeneJson = {
  id: INTRO_WEG_CONTENT.id,
  title: INTRO_WEG_CONTENT.title,
  art: INTRO_WEG_CONTENT.art,
  portrait: null,
  lines: INTRO_WEG_CONTENT.lines,
  choices: INTRO_WEG_CONTENT.choices,
};

const fremder: SzeneJson = {
  id: INTRO_ARTIFACT_CONTENT.id,
  title: INTRO_ARTIFACT_CONTENT.title,
  art: INTRO_ARTIFACT_CONTENT.art,
  portrait: null,
  lines: INTRO_ARTIFACT_CONTENT.lines,
  choices: INTRO_ARTIFACT_CONTENT.choices.map((item) => item.label),
  successLines: INTRO_ARTIFACT_CONTENT.successLines,
  failureLines: INTRO_ARTIFACT_CONTENT.failureLines,
  passLines: INTRO_ARTIFACT_CONTENT.passLines,
};

function teil(id: string, titel: string, szenen: SzeneJson[]): TeilJson {
  return { id, titel, quest: "ankunft", datei: `ankunft/${id}.json`, szenen };
}

export const ANKUNFT_TEILE: TeilJson[] = [
  teil("weg", "Der Weg", [weg]),
  teil("fremder", "Der Fremde", [fremder]),
  teil("tal", "Tal und Dorf", [INTRO_TAL, INTRO_HANG, INTRO_LINDENDORF, INTRO_ANKUNFT]),
];
