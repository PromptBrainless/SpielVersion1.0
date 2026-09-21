import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LeiterLogin } from "@/components/game/LeiterLogin";
import { WeltEditor } from "@/components/welt/WeltEditor";
import { introAlsSzene } from "@/game/content";
import { leiterFrei } from "@/game/leiter-login";
import { auflageFuerSicht, loescheAuflage, merkeAuflage, rueckgaengigAuflage } from "@/game/welt";

export const Route = createFileRoute("/editor")({ component: EditorPage });

function EditorPage() {
  const szene = introAlsSzene();
  const schluessel = szene.id ?? szene.title;
  const [auflage, setAuflage] = useState(() => auflageFuerSicht(szene).patch);
  const [frei, setFrei] = useState(() => leiterFrei());

  if (!frei) {
    return (
      <LeiterLogin
        onOk={() => setFrei(true)}
        onClose={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  return (
    <WeltEditor
      szene={szene}
      auflage={auflage}
      schluessel={schluessel}
      held={null}
      onChange={(next) => {
        merkeAuflage(schluessel, next, szene);
        setAuflage(next);
      }}
      onReset={() => {
        loescheAuflage(schluessel);
        setAuflage({});
      }}
      onEffekt={() => undefined}
      onLage={() => undefined}
      onRueckgaengig={() => {
        const restored = rueckgaengigAuflage(schluessel);
        setAuflage(restored ?? {});
      }}
      onClose={() => {
        window.location.href = "/";
      }}
      startFach="pruefen"
    />
  );
}
