import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

declare global {
  interface Window {
    MonacoEnvironment?: { getWorker: (id: string, label: string) => Worker };
  }
}

if (typeof window !== "undefined") {
  window.MonacoEnvironment = {
    getWorker(_id: string, label: string) {
      if (label === "json") return new jsonWorker();
      return new editorWorker();
    },
  };
  loader.config({ monaco });
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

export { Editor };
