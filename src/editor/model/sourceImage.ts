export interface SourceImage {
  readonly id: string;
  readonly name: string;
  readonly assetUrl: string;
  readonly assetFileName: string;
  readonly width: number;
  readonly height: number;
  readonly referencedBy: readonly string[];
}

export interface ImportedSourceImage {
  readonly name: string;
  readonly assetUrl: string;
  readonly width: number;
  readonly height: number;
}
