import type { Figure } from "../model/figure";

const OBJECT_URL_PREFIX = "blob:";

export function revokeFigureAssetUrls(figure: Figure): void {
  for (const sourceImage of figure.sourceImages) {
    if (sourceImage.assetUrl.startsWith(OBJECT_URL_PREFIX)) {
      URL.revokeObjectURL(sourceImage.assetUrl);
    }
  }
}

