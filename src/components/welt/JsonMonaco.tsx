import { Editor } from "./monaco-setup";

export function JsonMonaco({
  wert,
  onChange,
  hoehe = "22rem",
}: {
  wert: string;
  onChange: (wert: string) => void;
  hoehe?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Editor
        height={hoehe}
        language="json"
        theme="lindendorf"
        value={wert}
        onChange={(next) => onChange(next ?? "")}
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
    </div>
  );
}

export default JsonMonaco;
