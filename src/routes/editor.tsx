import { createFileRoute } from "@tanstack/react-router";
import { WeltEditor } from "@/components/welt/WeltEditor";
import { introAlsSzene } from "@/game/content";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  const szene = introAlsSzene();
  return (
    <WeltEditor
      szene={szene}
      auflage={{}}
      schluessel={szene.id ?? ""}
      held={null}
      onChange={() => undefined}
      onReset={() => undefined}
      onEffekt={() => undefined}
      onLage={() => undefined}
      onRueckgaengig={() => undefined}
      onClose={() => {
        window.location.href = "/";
      }}
      startFach="karte"
    />
  );
}