import type { SzeneJson } from "./schema";

export type Volltext = Pick<SzeneJson, "lines"> & Partial<Pick<SzeneJson, "title" | "art" | "choices" | "portrait">>;

export const VOLLTEXTE: Record<string, Volltext> = {
  rathaus: {
    portrait: "holm",
    lines: [
      "Im Rathaus hängt der Geruch von nassem Tuch und altem Wachs. Holm sitzt hinter einem Tisch, der zu groß ist für die wenigen Papiere darauf, und zu klein für alles, was er nicht aufschreibt.",
      "Er sieht dich an, wie man jemanden ansieht, der eine Rechnung bringen könnte. Die Hände bleiben auf dem Holz, flach, als könne Bewegung schon ein Geständnis sein.",
      "Hinter ihm klebt an der Wand dasselbe rote Wachs wie am Hang, hier alt und unversehrt. Holm folgt deinem Blick nicht. Er weiß, was dort hängt.",
    ],
  },
  "zum-letzten-fass": {
    portrait: "mara",
    lines: [
      "In der Taverne ist die Luft dick von nassem Holz und billigem Bier. Mara wischt die Theke in einem Kreis, der schon vor deiner Ankunft begonnen hat und nicht aufhören wird, nur weil jemand eintritt.",
      "Zwei Gäste sitzen so weit auseinander, als koste Nähe extra. Eine Lampe flackert, wird kleiner gedreht, als könntest du am Licht ablesen, wie viel das Haus noch wagt.",
      "Mara nickt dir zu, knapp. In Lindendorf ist das bereits eine Auskunft: du darfst bleiben, solange du nicht fragst, bevor das Tuch trocken ist.",
    ],
  },
  "schmiede-apotheke": {
    lines: [
      "Schmiede und Apotheke teilen sich eine Mauer und sonst wenig. Auf der einen Seite schlägt Eisen auf Eisen, langsam, als spare jemand die Schläge. Auf der anderen steht die Tür einen Spalt offen, und es riecht nach Kräutern, die man nicht mehr zum Kochen verwendet.",
      "Wer hier Hilfe sucht, muss sich entscheiden, ob er blutet oder fiebert. Manche brauchen beides und gehen trotzdem zuerst zur falschen Tür.",
    ],
    choices: ["Zum Schmied", "Zu Witwe Kern", "Zurück zum Platz"],
  },
  "beim-schmied": {
    portrait: "smith",
    lines: [
      "Der Schmied hebt den Hammer nicht, nur weil du in der Tür stehst. Die Esse glimmt, nicht hell. Er hat gelernt, Feuer klein zu halten, wenn Kohle teurer ist als Stolz.",
      "„Wenn du Eisen willst, sag, was es aushalten muss“, sagt er, ohne dich anzusehen. „Wenn du reden willst, die Apotheke ist nebenan. Dort werden Sätze abgewogen.“",
      "An der Wand hängen Messer, deren Schneiden blank sind und deren Griffe dunkel vom Schweiß anderer Hände. Keins sieht aus, als warte es auf ein Fest.",
    ],
  },
  "bei-witwe-kern-dorf": {
    portrait: "kern",
    lines: [
      "Kern hat die Ärmel hochgekrempelt. Auf der Waage liegt eine Mischung, die sie schon kennt, und trotzdem prüft sie das Gewicht, als könne sich das Kraut nachts verändert haben.",
      "„Wenn du hustest, bleib unten am Brunnen nicht stehen“, sagt sie. „Wenn du nicht hustest, bleib trotzdem nicht. Das Wasser nimmt sich, wen es kriegt.“",
      "Unter den Zetteln an der Wand sind Namen, die du vom Platz her kennst. Frische Tinte. Häuser nah am Brunnen.",
    ],
  },
  "muehle-hub": {
    portrait: "miller",
    lines: [
      "Das Rad schlägt gegen das Wasser und mahlt nichts. Der Schlag ist regelmäßig wie ein Vorwurf, den niemand laut ausspricht.",
      "Bertok bleibt am Mahlwerk, die Hände mehlweiß, obwohl seit Tagen kein Stein gearbeitet hat. Aus der Kornkammer kommt das leise Klicken gezählter Säcke.",
      "Hinter dem Haus fällt der Boden zum Fluss ab. Wer lange genug hinunterhorcht, hört mehr als Wasser.",
    ],
    choices: [
      "Mit Bertok am Mahlwerk sprechen",
      "Zu Lene in die Kornkammer gehen",
      "Das Wasserrad und den Uferweg ansehen",
      "Die Mühle verlassen",
    ],
  },
  "bertok-am-mahlwerk": {
    portrait: "miller",
    lines: [
      "Bertok prüft das Mahlwerk, obwohl es längst justiert ist. Der Stein ist kalt. Er sagt das mit den Schultern, nicht mit dem Mund.",
      "„Kein Mehl heute. Kein Mehl seit zwei Wochen.“ Er sagt es, bevor du fragst, als könne eine Frage ihn zwingen, einen Namen auszusprechen.",
      "„Das Wasser steht zu niedrig. Das Korn ist schlecht. Ärger mit der Lieferung.“ Namen nennt er nicht. Der Blick geht zum Ufer, dann zur Kornkammer, als könnten beide ihn hören.",
    ],
    choices: ["Vertrauen gewinnen", "Druck machen", "Zurück in die Mühle"],
  },
  kornkammer: {
    lines: [
      "Die Kornkammer riecht nach Mehl, das älter ist als die letzte Lieferung. Säcke stehen in Reihen, zu ordentlich für ein Haus, das angeblich nichts mehr hat.",
      "Eine Frau zählt. Immer dieselben Zahlen. Die Finger bleiben an einem Sack hängen, der hohl klingt.",
      "Die hintere Wand ist dunkler als die anderen. Nicht vom Schimmel. Vom Schatten, den jemand braucht.",
    ],
  },
  "lene-in-der-kornkammer": {
    portrait: "lene",
    lines: [
      "Lene zählt, als könnte Zählen eine Tür verschließen. Am Brunnen nennt man sie die Müllerin. Hier ist sie jemand, der nicht will, dass du die hintere Wand ansiehst.",
      "Ihre Finger bleiben an einem Sack hängen, der hohl klingt. Sie hat Bertoks Stimme gehört, oder sie tut so. Seither redet sie, als läge in jedem Satz ein Preis.",
      "„Nicht heute“, sagt sie, ohne dich anzusehen, und das Zählen geht weiter, leiser, als wolle es sich vor dir verstecken.",
    ],
    choices: ["Warten und zuhören", "Die Kammer durchsuchen", "Zurück zum Mahlwerk"],
  },
  "hinter-der-nische": {
    lines: [
      "Hinter der Nische atmet es. Nicht Mehl. Menschen, die gelernt haben, nicht zu husten, wenn draußen gezählt wird.",
      "Ein Kind hält die Hand auf den Mund eines kleineren Kindes. Lenes Schwester sieht dich an, als wäge sie, ob du eine Tür bist oder eine Wache.",
      "Der Hohlraum riecht nach Angst und nassem Tuch. Wer das dem Rat trägt, trägt Blut, auch wenn niemand schlägt.",
    ],
  },
  wasserrad: {
    lines: [
      "Das Wasserrad dreht sich, weil das Wasser muss, nicht weil jemand mahlen will. Schaum steht in den Schaufeln, grau, mit Mehl, das nicht mehr Mehl ist.",
      "Am Holz sind frische Schleifspuren, nass, als hätte jemand nachts ein Fass oder einen Sack die Böschung hinuntergezogen.",
      "Der Fluss nimmt die Spuren ein paar Schritte mit und lässt sie dann im Schlamm liegen, damit der Nächste sie findet, der nicht wegsehen will.",
    ],
  },
  uferpfad: {
    lines: [
      "Der Uferpfad ist schmal und aufgeweicht. Wer hier oft geht, geht nicht zum Angeln. Die Fußstapfen sind tief, beschwert.",
      "Im Schilf hängt ein Fetzen Leinwand, der nach Mehl staubt, obwohl der Regen ihn schon dreimal gewaschen haben müsste.",
      "Weiter unten steht ein Lagerhaus, das dem Dorf nicht gehört und trotzdem vom Dorf lebt.",
    ],
  },
  "morscher-steg": {
    lines: [
      "Der Steg ist morsch. Die Bretter geben nach, nicht auf einmal, sondern in dem Maß, in dem du Gewicht darauf lässt.",
      "Darunter steht das Wasser dunkel. Ein Pfahl trägt eine Kerbe, frisch, als hätte jemand abgezählt, wie viel das Holz noch trägt, bevor es jemanden verrät.",
      "Wer hier stürzt, stürzt nicht weit. Weit genug, dass das Dorf es als Unfall verkaufen kann.",
    ],
  },
  "lagerhaus-am-fluss": {
    lines: [
      "Das Lagerhaus am Fluss hat ein Schloss, das neuer ist als die Tür. Durch eine Spalte siehst du Säcke, die die Mühle angeblich nicht mehr füllen kann.",
      "Ein Wächter sitzt im Schatten, nicht schlafend. Er wartet auf Geräusche, nicht auf Gründe.",
      "An der Schwelle klebt Matsch in einem Muster, das zum Uferpfad passt. Jemand trägt hierher, was unten fehlen soll.",
    ],
  },
  "renniks-kontor": {
    portrait: "rennik",
    lines: [
      "Im Kontor riecht es nach nassem Papier und Kupfer. Rennik wiegt nichts, während du da bist. Die Waage steht trotzdem bereit, als sei das Gespräch selbst eine Lieferung.",
      "„Getreide hat einen Preis“, sagt er. „Leute, die ihn nicht zahlen, sollen nicht so tun, als gehöre ihnen das Tal.“",
      "Hinter ihm an der Wand hängen Zettel mit Mengen, die das Dorf nicht mehr gesehen hat, seit das Rad nur noch schlägt.",
    ],
  },
  "sicheres-mehl-leere-blicke": {
    portrait: "holm",
    lines: [
      "Die Mühle hat ihren Schutzbrief. Mehl liegt wieder in den Säcken, und niemand auf dem Platz fragt laut, wohin die Leute aus der Nische gekommen sind.",
      "Bertoks Blick ist leer. Holm nickt dir zu, wie man jemandem nickt, der eine unangenehme Arbeit erledigt hat und sie nicht wiederholen soll.",
      "Sicheres Mehl. Leere Blicke. Das Tal nennt das Ordnung.",
    ],
  },
  "mehl-mit-rauen-haenden": {
    portrait: "miller",
    lines: [
      "Mehlstaub steht wieder in der Luft. Bertok bedankt sich knapp und schließt die Tür einen Spalt früher als nötig.",
      "Am Steg klebt noch etwas Dunkles am Holz. Der Regen holt es nicht ganz runter.",
      "Das Rad mahlt. Die Hände, die das durchgesetzt haben, bleiben rau, auch wenn das Dorf wieder Brot hat.",
    ],
  },
  "stilles-mehl": {
    portrait: "miller",
    lines: [
      "Das Rad dreht sich lauter als sonst. Bertok reicht dir nichts mehr. Lene zählt keine Säcke. Sie steht in der Tür, als wäre Zählen eine Art, nicht zu reden.",
      "Manche Schulden werden nicht bezahlt. Sie werden nur nicht mehr eingetrieben.",
      "Das Mehl ist still, obwohl es fällt. Still heißt hier: niemand schuldet dir einen Satz darüber, warum es wieder fällt.",
    ],
  },
  "gasse-kirche": {
    portrait: "beggar",
    lines: [
      "Die Kirche von Lindendorf steht einen Schritt tiefer als der Platz davor, als hätte sie sich langsam in die Erde gesenkt, müde von allem, was ihr je gebeichtet wurde.",
      "An der Schwelle hat der Stein eine flache Mulde geschliffen, in der das Regenwasser steht wie ein kleiner Spiegel. Niemand hat in zehn Jahren einen Abfluss geschlagen.",
      "Im Schatten der Kirchmauer sitzt Fenn. Die nackten Füße im Wasser der Dachrinne, als sei Kälte ein alter Bekannter. Er hebt den Blick, noch bevor du an ihm vorbeigehst.",
    ],
  },
  "gasse-hub": {
    portrait: "beggar",
    lines: [
      "Hinter der Gerberei liegt eine Gasse, die niemand mehr als Weg benutzt. Die Bretter an den Fenstern sind älter als die Ausreden, warum niemand dort wohnt.",
      "Fenn bleibt an der Mauer. Vahl sitzt irgendwo im Rathaus und rechnet mit Baumannschaft. Die Kirche hält die Schwelle nass.",
      "In einer Woche kommen Bretter, sagt man. Bretter über eine Gasse sind keine Reparatur. Sie sind ein Beschluss.",
    ],
    choices: [
      "Bei Fenn an der Kirchmauer bleiben",
      "Ratsherr Vahl im Rathaus aufsuchen",
      "Die Gasse hinter der Gerberei ansehen",
      "Zurück zum Dorfplatz",
    ],
  },
  fenn: {
    portrait: "beggar",
    lines: [
      "Fenn ist Teil der Mauer, ein Schatten unter Schatten, den man grüßt, ohne ihn anzuschauen. Heute nicht. Heute sieht er zuerst.",
      "In der Tasche des geflickten Mantels hält er ein morsches Stück Lattenzaun. Zehn Winter haben das Holz glattgeschliffen. Die Nagellöcher sind Dellen, aber wer hinsieht, erkennt noch den rechten Winkel.",
      "Er wartet nicht auf eine Antwort. Die Hand in der Tasche bleibt in Bewegung, als zähle sie etwas, das niemand mehr zählen will.",
    ],
  },
  "fenn-an-der-kirchmauer": {
    portrait: null,
    lines: [
      "„In einer Woche kommt die Baumannschaft. Vahl hat im Rat verkündet, hinter der Gerberei stehe ein Lagerhaus. Als wäre da nie etwas gewesen.“",
      "Fenn sagt es ohne Klage. Klage wäre schon Politik. Er hält das Holz, als sei es der letzte Zeuge, der noch keinen Sitz im Rat braucht.",
      "„Trotzdem muss einer zuhören, bevor sie Bretter über die Gasse legen.“ Die Füße bleiben im Wasser. Das Wasser bleibt in der Mulde.",
    ],
  },
  "vahls-stube": {
    portrait: "vahl",
    lines: [
      "Vahls Stube im Rathaus ist wärmer als der Platz. Die Wärme kommt von einem Ofen, der mehr Holz verbraucht, als ein Ratsherr zugeben würde.",
      "Auf dem Tisch liegen Pläne, sauber, ohne die Gasse, als sei sie schon wegradiert. Ein Lineal liegt quer über Namen, die nicht mehr in der Tusche stehen.",
      "Die Luft riecht nach Siegellack. Nicht nach dem Wachs vom Hang. Nach dem, das Beschlüsse hält, bis niemand mehr widerspricht.",
    ],
  },
  "ratsherr-vahl": {
    portrait: "vahl",
    lines: [
      "Vahl lächelt, wie man lächelt, wenn man den Satz schon fertig hat. „Hinter der Gerberei liegt Ödland. Ödland wird nützlich, oder es bleibt eine offene Rechnung.“",
      "Er bietet dir keinen Stuhl. Stühle sind für Leute, die bleiben sollen. Du sollst verstehen und gehen.",
      "„Das Kesseljahr ist vorbei“, sagt er. „Wer es ausgräbt, gräbt für sich, nicht fürs Dorf.“ Die Hände bleiben ruhig. Ruhige Hände haben hier oft mehr getan als laute.",
    ],
  },
  gerbereigasse: {
    lines: [
      "Die Gerbereigasse ist eng genug, dass zwei Leute sich entschuldigen müssten, wenn noch jemand wohnte. Es wohnt niemand.",
      "An den Türstöcken sind Kratzer in Höhe von Kinderschultern. Die Fensterbretter tragen Ringe, wo Töpfe standen. Der Geruch von Gerberlohe ist alt und trotzdem der jüngste, der hier geblieben ist.",
      "Am Ende der Gasse liegt eine Kate, deren Türangel nicht rostet, als ginge noch jemand ein und aus, der nicht gesehen werden will.",
    ],
  },
  "gretes-kate": {
    lines: [
      "Gretes Kate steht, wo die Gasse aufhört, ein Weg zu sein. Innen ist es dunkler als der Abend draußen, und es riecht nach kalter Asche und altem Tuch.",
      "Die Schwelle ist abgetreten von Füßen, die nicht mehr kommen. An der Wand hängt ein Strick, rot, verblasst, zu kurz für ein Seil und zu lang für eine Erinnerung, die man wegwerfen könnte.",
      "Jemand hat hier gewartet. Das Warten hat Möbel hinterlassen und eine Stille, die nicht leer ist.",
    ],
  },
  grete: {
    portrait: "grete",
    lines: [
      "Grete sieht dich nicht mit den Augen. Sie sieht dich an der Art, wie du die Schwelle nimmst, ob du sie abtrittst oder darüber nachdenkst.",
      "„Die Gasse hat Namen gehabt“, sagt sie. „Ilse hat sie aufgeschrieben, bevor der Rat beschlossen hat, dass Namen Unordnung sind.“",
      "Ihre Hände suchen den roten Strick an der Wand und finden ihn, ohne zu tasten. Blinde Frauen in diesem Tal verlieren nicht, was sie einmal gehalten haben.",
    ],
  },
  kirchengewoelbe: {
    lines: [
      "Unter der Kirche führt ein Gang, den man nicht von der Kanzel aus erklärt. Die Stufen sind abgetreten von Leuten, die keine Messe suchten.",
      "Feuchte Luft, Stein, der nach altem Wasser schmeckt. An der Wand rußige Striche, wo jemand Licht gespart und trotzdem gesehen hat, was er tun musste.",
      "Grete hat den Weg genannt, ohne ihn zu beschreiben. Der Stein beschreibt ihn selbst: hierhin trägt man, was oben nicht bleiben darf.",
    ],
  },
  "unter-der-kirche": {
    lines: [
      "Unter der Kirche ist es nicht heilig. Es ist trocken genug für Papier und nass genug, dass niemand lange bleibt, der nicht muss.",
      "Ein Gewölbebogen trägt Kerben, abgezählt, nicht verziert. Ilse Brandtner hat hier gearbeitet, und Arbeit dieser Art braucht keine Kerzenweihe.",
      "Irgendwo tropft es. Der Tropfen hält den Takt für ein Dorf, das oben so tut, als gäbe es diesen Takt nicht.",
    ],
  },
  "im-gewoelbe": {
    lines: [
      "Im Gewölbe stehen Kisten, die keine Schätze halten. Tuch, Bindfaden, eine Schachtel mit Kohle, zum Schreiben, nicht zum Heizen.",
      "An einer Stelle ist der Boden weniger staubig. Dort hat jemand gekniet, oft, lange genug, dass der Stein sich daran erinnert.",
      "Du hörst die Kirche über dir, gedämpft, als sei das Gebet eine Decke, unter der man Namen verstecken kann.",
    ],
  },
  "hinter-dem-stein": {
    lines: [
      "Hinter einem Stein, der nicht tragend ist und trotzdem schwer, liegt ein Paket in Wachstuch. Die Schnur ist fest, die Knoten von einer Hebamme, die weiß, wann etwas halten muss.",
      "Darin Namen. Daten. Häuser. Das Kesseljahr, in einer Schrift, die sich nicht entschuldigt.",
      "Ilse hat die Toten nicht unter der Kirche versteckt. Sie hat verhindert, dass der Rat sie ein zweites Mal sterben lässt, indem er sie streicht.",
    ],
  },
  "vahls-stube-abend": {
    portrait: "vahl",
    lines: [
      "Abends ist Vahls Stube dunkler, und der Ofen zu warm für einen Mann, der behauptet, das Dorf habe kein Holz zu verschenken.",
      "Die Pläne liegen noch da. Das Lineal hat sich verschoben. Darunter kommt ein Name zum Vorschein, den die Tusche nicht ganz getilgt hat.",
      "Vahl erwartet dich nicht als Gast. Er erwartet dich als Problem, das vor der Baufreigabe noch leise bleiben soll.",
    ],
  },
  "was-die-liste-wiegt": {
    portrait: "vahl",
    lines: [
      "Die Liste wiegt wenig in der Hand und viel, sobald sie den Tisch berührt. Vahl sieht sie an, als könne Papier brennen, wenn man lange genug nicht blinzelt.",
      "„Das ist Unordnung“, sagt er. Unordnung heißt in diesem Mund: Zeugen.",
      "Du kannst sie ihm lassen, dem Rat tragen, Holm geben oder dem Feuer. Jede dieser Hände hat schon einmal Namen gehalten und sie nicht zurückgegeben.",
    ],
  },
  "ein-zweites-schweigen": {
    portrait: "beggar",
    lines: [
      "Die Gasse bleibt leer, und die Bretter kommen trotzdem nicht. Holm hat den Bauplatz ruhen lassen. Die Liste liegt in einer Schublade, die nur er aufzieht.",
      "Ein zweites Schweigen ist nicht dasselbe wie das erste. Das erste war Angst. Das zweite ist eine Vereinbarung zwischen Leuten, die wissen, was in der Schublade liegt.",
      "Fenn sitzt noch an der Mauer. Die Füße im Wasser. Er hat zugehört. Mehr schuldet ihm das Dorf nicht, sagt das Dorf.",
    ],
  },
  "was-ausgegraben-bleibt": {
    portrait: "vahl",
    lines: [
      "Was ausgegraben bleibt, bleibt nicht in der Erde. Der Rat hat Ilse Brandtners Liste gehört. Vahl hat seinen Sitz verloren, nicht seine Freunde.",
      "Die Gasse hat wieder einen Namen, den man nicht laut sagt, und trotzdem kennt ihn jetzt, wer Ohren hat.",
      "Unter der Kirche tropft es weiter. Der Tropfen ändert sich nicht, nur wer ihn hört.",
    ],
  },
  "ein-name-unter-vielen": {
    lines: [
      "Ein Name unter vielen ist trotzdem ein Name. Die Liste ist Asche, oder sie ist in einer Hand, die sie nicht zeigt, und die Gasse wird bebaut, als sei Asche Dünger.",
      "Die Kinder, die hier Kratzer in Türstöcke gemacht haben, bekommen keine Tafel. Sie bekommen ein Lagerhaus und die Lüge, dass Ödland niemandem gehört hat.",
      "Du gehst über den Platz und merkst, dass Lindendorf dich nicht fragt. Fragen wären schon ein Name.",
    ],
  },
  "stille-rechnung": {
    portrait: "beggar",
    lines: [
      "Vahl hat die Baumannschaft abbestellt. Die Wahrheit bleibt zwischen euch, und zwischen euch ist ein Preis, der nicht in Holms Kasse steht.",
      "Stille Rechnung: die Gasse bleibt leer, Vahl bleibt sitzen, und du trägst etwas, das wie ein Siegel wirkt, nur ohne Wachs.",
      "Fenn rührt das Holz in der Tasche. Er weiß, dass Stille hier nie umsonst ist. Er sagt es nicht. Deshalb bleibt er an der Mauer.",
    ],
  },
  "jorren-im-geroell": {
    portrait: "jorren",
    lines: [
      "Jorren liegt im Geröll, als habe der Hang ihn ausgespuckt und es sich anders überlegt. Der Atem geht, flach. Salzstaub klebt an seinem Mund.",
      "Neben ihm eine Ledertasche, leer, der Riemen gerissen. Wer hier Salz trägt, trägt es nicht für die Küche. Er trägt es für Leute, die zahlen, ohne zu fragen, woher der weiße Staub kommt.",
      "Die Glocke über euch bewegt sich nicht. Trotzdem wirkt es, als warte etwas auf den nächsten Schritt, der zu laut sein könnte.",
    ],
  },
  "die-kapellenglocke": {
    lines: [
      "Die Kapellenglocke ist klein und trotzdem das lauteste, was dieser Hang besitzt, wenn jemand sie bewegt.",
      "Das Seil ist neuer als das Holz. Jemand pflegt das Zeichen, nicht die Kapelle. Unten im Steinbruch wartet man auf genau dieses Zeichen, oder man fürchtet es.",
      "Wer die Glocke stillhält, stiehlt niemandem Silber. Er stiehlt einer Warnung die Stimme.",
    ],
  },
  wald: {
    lines: [
      "Der Wald nimmt den Weg zurück, sobald das letzte Dach hinter dir bleibt. Die Stämme stehen eng, und der Pfad ist nur dort ein Pfad, wo andere vor dir zu müde waren, vom Weg abzuweichen.",
      "Rauch im Osten, näher jetzt. Kein Herd. Ein Lager, das nicht mahlt und nicht sät.",
      "Hinter dir liegt Lindendorf mit seinen Türen. Vor dir liegen Leute, die das Tal in einer anderen Währung rechnen. Du gehst weiter, weil Stehenbleiben hier auch eine Entscheidung wäre.",
    ],
  },
  ende: {
    lines: [
      "Das Tal gibt dir den Weg zurück, denselben, nur dass du ihn kennst. Die Zäune sind noch unrepariert. Der Rauch im Osten ist ein anderer, oder er ist derselbe, und nur du hast dich geändert.",
      "Lindendorf bleibt hinter den Hängen. Es wird dich nicht rufen. Es wird sich erinnern, in dem Maß, in dem Erinnern hier nichts kostet.",
      "Was du getan hast, trägt das Dorf in Türen, in Pausen und in den Dingen, die niemand mehr zu reparieren versucht. Du trägst den Rest.",
    ],
  },
};
