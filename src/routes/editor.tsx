import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  useEffect(() => {
    try {
      window.sessionStorage.setItem("lindendorf.leiter.wunsch", "1");
    } catch {
      /* */
    }
    window.location.replace("/");
  }, []);
  return <p className="p-6 text-sm text-muted-fg">Das Weltwerkzeug liegt im Spiel, hinter dem Passwort.</p>;
}
