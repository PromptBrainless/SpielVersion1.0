import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  useEffect(() => {
    window.location.replace("/?welt=1");
  }, []);
  return <p className="p-6 text-sm text-muted-fg">Das Weltwerkzeug liegt im Spiel.</p>;
}
