import { z } from "zod";
import { exportiereModul } from "./export-modul";
import type { SceneView } from "./types";

const AttributeSchema = z.enum(["Stärke", "Geschicklichkeit", "Charisma"]);
const RouteSchema = z.enum(["kampf", "schleich", "ueberreden"]);

export const IntroWegSchema = z.object({
  id: z.literal("intro-weg"),
  title: z.string().min(1),
  art: z.literal("road"),
  lines: z.array(z.string().min(1)).min(3),
  choices: z.array(z.string().min(1)).length(1),
});

export const INTRO_WEG_CONTENT = IntroWegSchema.parse({
  id: "intro-weg",
  title: "Der Weg nach Lindendorf",
  art: "road",
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
  choices: ["Weiter"],
});

export const IntroArtifactContentSchema = z.object({
  id: z.literal("intro-fremder-am-weg"),
  title: z.string().min(1),
  art: z.literal("stranger"),
  lines: z.array(z.string().min(1)).min(3),
  choices: z.array(
    z.object({
      label: z.string().min(1),
      attribute: AttributeSchema.optional(),
      difficulty: z.number().int().positive().optional(),
      route: RouteSchema.optional(),
    }),
  ).length(4),
  successLines: z.array(z.string().min(1)).length(3),
  failureLines: z.array(z.string().min(1)).min(2),
  passLines: z.array(z.string().min(1)).min(2),
});

export const INTRO_ARTIFACT_CONTENT = IntroArtifactContentSchema.parse({
  id: "intro-fremder-am-weg",
  title: "Der Fremde am Weg",
  art: "stranger",
  lines: [
    "Etwa fünfzig Schritt voraus taucht eine Gestalt aus dem Regen auf.",
    "Ein Mann. Mager genug, dass der Wind an ihm zerren kann.",
    "Sein Gang ist ungleichmäßig. Nicht das Hinken eines Verletzten. Eher das Stolpern eines Menschen, der zu lange wach geblieben ist oder zu viel Blut verloren hat. Jeder Schritt wirkt, als müsse er sich erst daran erinnern, wie Gehen funktioniert.",
    "Nasses Haar klebt an seiner Stirn. Der linke Ärmel seines Mantels ist dunkel verfärbt. Das Blut darauf ist bereits getrocknet.",
    "Als er kurz ins Straucheln gerät, schlägt der Mantel auseinander.",
    "Etwas Silbernes blitzt darunter hervor.",
    "Ein Artefakt.",
    "Nicht groß. Vielleicht handtellergroß. Doch selbst auf diese Entfernung erkennst du das Zeichen: ein offenes Auge über drei eingeritzten Linien.",
    "\"Kirchensilber\"",
    "Du hast das Symbol schon einmal gesehen.",
    "Am Nordpass. Vor Jahren. Es war in einen Grenzstein geschlagen worden, halb verborgen unter Eis und Schnee. Die Händler hatten damals darüber gespuckt und sich bekreuzigt. Niemand erklärte warum.",
    "Heute gibt es keinen Schnee.",
    "Nur Regen, Schlamm und einen Fremden, der etwas bei sich trägt, das kaum ihm gehören dürfte.",
    "Der Mann hat dich noch nicht bemerkt.",
    "Hinter ihm verschluckt Nebel den Weg.",
    "Vor ihm liegt Lindendorf.",
    "Zwischen euch stehen nur einige Schritte, schlechtes Wetter und die Frage, wem das Blut auf seinem Ärmel gehört.",
  ],
  choices: [
    { label: "(Stärke – mittel) Der Mann wirkt geschwächt. Falls er Widerstand leistet, dürfte der Kampf kurz sein. Dennoch tragen auch Sterbende Messer.", attribute: "Stärke", difficulty: 12, route: "kampf" },
    { label: "(Geschick – schwer) Der Regen dämpft Geräusche. Der Nebel verbirgt Bewegungen. Doch Kirchenartefakte werden selten achtlos getragen.", attribute: "Geschicklichkeit", difficulty: 15, route: "schleich" },
    { label: "(Charisma – mittel) Vielleicht ist er verängstigt. Vielleicht verletzt. Vielleicht sucht er Hilfe mehr als Streit.", attribute: "Charisma", difficulty: 12, route: "ueberreden" },
    { label: "Vorübergehen - Manche Dinge bringen Unglück, lange bevor man sie berührt." },
  ],
  successLines: [
    "Du packst den Mann am Mantel und entreißt ihm das Artefakt. Der Stoff reißt mit einem trockenen Laut. Er stolpert zurück, greift nach dem leeren Riemen und verschwindet schließlich im Nebel.",
    "Deine Finger lösen den Riemen, ohne dass der Mann den Verlust bemerkt. Erst im Nebel tastet er vergeblich nach dem Silber. Sein Fluchen wird leiser, bis der Regen es nimmt.",
    "Du sprichst ruhig auf ihn ein. Der Mann senkt den Blick und legt dir das Artefakt in die Hand. Seine Finger bleiben einen Augenblick länger darauf liegen, als würde er sich von etwas verabschieden.",
  ],
  failureLines: [
    "Der Mann bemerkt deine Absicht. Für einen Augenblick wirkt er schwach — dann ist er schneller, als du erwartet hast. Etwas Hartes schlägt gegen deine Hand, und der Schmerz bleibt, obwohl der Mann schon zurückweicht.",
    "Er verschwindet mit dem silbernen Artefakt im Nebel. Deine erste Probe ist gescheitert, aber der Weg bleibt offen. Nur das Zeichen bleibt dir im Kopf, heller als es im grauen Licht gewesen sein dürfte.",
  ],
  passLines: [
    "Du lässt den Mann passieren. Das Silber verschwindet unter seinem Mantel, bevor der Nebel ihn schluckt. Für einen Moment dreht er den Kopf, als hätte er deine Entscheidung trotzdem gehört.",
    "Du hast nichts gewonnen. Aber du hast dich entschieden, nicht jede fremde Not zu deinem Vorteil zu machen. Später wirst du nicht wissen, ob das ein Maßstab oder nur Bequemlichkeit war.",
  ],
});

export function exportiereIntro() {
  return exportiereModul("intro-fremder.json", IntroArtifactContentSchema, INTRO_ARTIFACT_CONTENT);
}

export function exportiereIntroWeg() {
  return exportiereModul("intro-weg.json", IntroWegSchema, INTRO_WEG_CONTENT);
}

export function introAlsSzene(): SceneView {
  return {
    id: INTRO_WEG_CONTENT.id,
    title: INTRO_WEG_CONTENT.title,
    art: INTRO_WEG_CONTENT.art,
    lines: INTRO_WEG_CONTENT.lines,
    choices: INTRO_WEG_CONTENT.choices,
    textKey: INTRO_WEG_CONTENT.id,
    original: { title: INTRO_WEG_CONTENT.title, lines: INTRO_WEG_CONTENT.lines, choices: INTRO_WEG_CONTENT.choices },
  };
}
