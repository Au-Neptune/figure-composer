import type { Rect } from "./geometry";

export type SourceImageLineage =
  | ImportedSourceImageLineage
  | DerivedSourceImageLineage;

export interface ImportedSourceImageLineage {
  readonly kind: "imported";
}

export interface DerivedSourceImageLineage {
  readonly kind: "derived";
  readonly parentSourceImageId: string;
  readonly roiId: string;
  readonly cropRect: Rect;
}

export interface SourceImage {
  readonly id: string;
  readonly name: string;
  readonly assetUrl: string;
  readonly assetFileName: string;
  readonly width: number;
  readonly height: number;
  readonly referencedBy: readonly string[];
  readonly lineage: SourceImageLineage;
}

export interface ImportedSourceImage {
  readonly name: string;
  readonly assetUrl: string;
  readonly width: number;
  readonly height: number;
}

export interface DerivedSourceImageInput extends ImportedSourceImage {
  readonly lineage: DerivedSourceImageLineage;
}
