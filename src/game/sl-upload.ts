export async function bildAlsJpeg(file: File, kante = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, kante / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kein Bildkontext.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Bild ließ sich nicht speichern.");
  return blob;
}

function blobAlsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const comma = text.indexOf(",");
      resolve(comma >= 0 ? text.slice(comma + 1) : text);
    };
    reader.onerror = () => reject(new Error("Datei unlesbar."));
    reader.readAsDataURL(blob);
  });
}

export async function ladeSpielleiterBild(file: File): Promise<string> {
  const jpeg = await bildAlsJpeg(file);
  const data = await blobAlsBase64(jpeg);
  try {
    const res = await fetch("/__lindendorf/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mime: "image/jpeg", data }),
    });
    const json = (await res.json()) as { ok?: boolean; src?: string };
    if (res.ok && json.ok && json.src) return json.src;
  } catch {
    /* Preview ohne Speicherweg: Data-URL */
  }
  return `data:image/jpeg;base64,${data}`;
}

export async function ladeSpielleiterTon(file: File): Promise<string> {
  if (!file.type.startsWith("audio/") && !/\.(webm|mp3|ogg|wav|m4a)$/i.test(file.name)) {
    throw new Error("Das ist kein Ton.");
  }
  if (file.size > 8_000_000) throw new Error("Ton zu groß. Unter acht Megabyte bleiben.");
  const data = await blobAlsBase64(file);
  const mime = file.type || "audio/webm";
  try {
    const res = await fetch("/__lindendorf/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mime, data }),
    });
    const json = (await res.json()) as { ok?: boolean; src?: string };
    if (res.ok && json.ok && json.src) return json.src;
  } catch {
    /* Preview ohne Speicherweg: Data-URL */
  }
  return `data:${mime};base64,${data}`;
}
