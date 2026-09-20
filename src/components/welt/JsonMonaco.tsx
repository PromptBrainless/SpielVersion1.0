import { useState } from "react";
import { Editor, richteLindendorfThema } from "./monaco-setup";

export function JsonMonaco({
  wert,
  onChange,
  hoehe = "22rem",
}: {
  wert: string;
  onChange: (wert: string) => void;
  hoehe?: string;
}) {
  const [feld, setFeld] = useState(false);

  if (feld) {
    return (
      <textarea
        value={wert}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="min-h-[16rem] w-full rounded-md border border-border bg-ink px-3 py-2 font-mono text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height: hoehe }}
        aria-label="JSON"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Editor
        height={hoehe}
        language="json"
        theme="lindendorf"
        value={wert}
        loading={<p className="px-3 py-2 text-xs text-muted-fg">Editor lädt…</p>}
        beforeMount={richteLindendorfThema}
        onChange={(next) => onChange(next ?? "")}
        onMount={() => undefined}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          renderLineHighlight: "line",
          padding: { top: 8, bottom: 8 },
        }}
      />
      <button type="button" className="px-2 py-1 text-xs text-muted-fg" onClick={() => setFeld(true)}>
        Einfaches Feld
      </button>
    </div>
  );
}

export default JsonMonaco;
