import { useEffect, useState } from "react";

interface ImageAssetState {
  readonly image: HTMLImageElement | null;
  readonly error: Error | null;
}

export function useImageAsset(assetUrl: string): HTMLImageElement | null {
  const [state, setState] = useState<ImageAssetState>({
    image: null,
    error: null,
  });

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setState({ image, error: null });
    image.onerror = () =>
      setState({
        image: null,
        error: new Error(`Failed to load Source Image asset: ${assetUrl}`),
      });
    image.src = assetUrl;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [assetUrl]);

  if (state.error) {
    throw state.error;
  }
  return state.image;
}

