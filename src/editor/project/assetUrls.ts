import type { Figure } from "../model/figure";
import type { HistoryState } from "../state/historyStore";

const OBJECT_URL_PREFIX = "blob:";

export function revokeFigureAssetUrls(figure: Figure): void {
  for (const sourceImage of figure.sourceImages) {
    if (sourceImage.assetUrl.startsWith(OBJECT_URL_PREFIX)) {
      URL.revokeObjectURL(sourceImage.assetUrl);
    }
  }
}

export function revokeHistoryAssetUrls(history: HistoryState): void {
  for (const figure of [history.present, ...history.past, ...history.future]) {
    revokeFigureAssetUrls(figure);
  }
}

