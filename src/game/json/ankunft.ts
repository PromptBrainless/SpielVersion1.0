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
  "Unterhalb der Kapelle klafft ein trockener Graben im Hang. Früher muss dort Wasser gelaufen sein. Jetzt liegen darin Knochen von Tieren, ausgebleicht und ordentlich nebeneinander.",
  "Am Türsturz der Kapelle hängt ein Streifen rotes Wachs. Er ist gebrochen, aber nicht alt genug, um von selbst gebrochen zu sein.",
  "Die Glocke schweigt wieder. Trotzdem hast du das Gefühl, dass etwas im Tal nun weiß, dass du angekommen bist.",
]);

export const INTRO_LINDENDORF = karte("intro-lindendorf", "Lindendorf", "village", [
  "Häuser drücken sich aneinander, als könnten sie so wärmer bleiben.",
  "Am Brunnen stehen Frauen mit verschränkten Armen. In der Taverne löscht jemand eine Lampe, obwohl es noch nicht ganz dunkel ist.",
  "Das Rathaus hat eine Tür, die zu oft geflickt wurde. Über dem Türsturz klebt altes rotes Wachs.",
  "Ein Gerber zieht eine Plane über seine Ware. Die Plane ist zu klein. Ein Teil des Leders bleibt im Regen liegen, und niemand macht sich die Mühe, es zu retten.",
  "Aus einem offenen Fenster dringt das Husten eines alten Mannes. Eine Stimme zählt dahinter Münzen. Sie kommt immer nur bis vier.",
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
