import { createFileRoute } from "@tanstack/react-router";
import { WeltEditor } from "@/components/welt/WeltEditor";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-fg">Weltwerkzeug</p>
        <a href="/" className="text-sm text-accent">
          Zum Spiel
        </a>
      </div>
      <WeltEditor
        szene={null}
        auflage={{}}
        schluessel=""
        held={null}
        onChange={() => undefined}
        onReset={() => undefined}
        onEffekt={() => undefined}
        onLage={() => undefined}
        onRueckgaengig={() => undefined}
        startFach="pruefen"
        seite
      />
    </div>
  );
}
