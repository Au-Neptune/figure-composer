import type { FigureComposerPlatform } from "./appPlatform";
import { browserPlatform } from "./browser/browserPlatform";
import { tauriPlatform } from "./tauri/tauriPlatform";

type TauriWindow = Window & {
  readonly __TAURI_INTERNALS__?: unknown;
};

export function getRuntimePlatform(): FigureComposerPlatform {
  return isTauriRuntime() ? tauriPlatform : browserPlatform;
}

function isTauriRuntime(): boolean {
  return Boolean((window as TauriWindow).__TAURI_INTERNALS__);
}
