export async function fileToStoredBlob(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return await drawBitmap(bitmap, 1600, 0.86);
  } finally {
    bitmap.close();
  }
}

export async function blobToAnalysisDataUrl(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  try {
    let quality = 0.74;
    let edge = 896;
    let dataUrl = "";
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const drawn = await drawBitmap(bitmap, edge, quality);
      dataUrl = await blobToDataUrl(drawn.blob);
      if (dataUrl.length <= 1_500_000) return dataUrl;
      quality -= 0.12;
      edge = Math.round(edge * 0.8);
    }
    if (dataUrl.length > 1_700_000) throw new Error("Image is still too large to analyze.");
    return dataUrl;
  } finally {
    bitmap.close();
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("Could not read an imported image.");
  return response.blob();
}

async function drawBitmap(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<{ blob: Blob; width: number; height: number }> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read this image.");
  context.fillStyle = "#0c0f12";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not encode this image."))), "image/jpeg", quality);
  });
  return { blob, width, height };
}
