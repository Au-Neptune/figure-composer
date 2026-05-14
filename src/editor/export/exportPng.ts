import type Konva from "konva";

interface ExportPngOptions {
  readonly fileName: string;
  readonly pixelRatio: number;
}

export function exportStageAsPng(
  stage: Konva.Stage,
  options: ExportPngOptions,
): void {
  const dataUrl = stage.toDataURL({
    mimeType: "image/png",
    pixelRatio: options.pixelRatio,
  });
  downloadDataUrl(dataUrl, options.fileName);
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

