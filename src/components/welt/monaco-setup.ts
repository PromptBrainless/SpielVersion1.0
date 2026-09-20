import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";

let themaBereit = false;

export function richteLindendorfThema(monaco: Monaco) {
  if (themaBereit) return;
  themaBereit = true;
  monaco.editor.defineTheme("lindendorf", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string", foreground: "d4c4a8" },
      { token: "number", foreground: "6d7a58" },
      { token: "keyword", foreground: "b07a48" },
    ],
    colors: {
      "editor.background": "#12110e",
      "editor.foreground": "#efe6d6",
      "editor.lineHighlightBackground": "#1a1814",
      "editorCursor.foreground": "#d4c4a8",
      "editor.selectionBackground": "#221f1a",
      "editorLineNumber.foreground": "#6f685a",
      "editorLineNumber.activeForeground": "#9a917f",
      "editorWidget.background": "#1a1814",
      "editorWidget.border": "#3a342c",
    },
  });
}

if (typeof window !== "undefined") {
  loader.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
  });
}

export { Editor };
