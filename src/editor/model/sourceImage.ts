import type { Rect } from "./geometry";
import type { Size } from "./geometry";

export type SourceImageLineage =
  | ImportedSourceImageLineage
  | DerivedSourceImageLineage;

export interface ImportedSourceImageLineage {
  readonly kind: "imported";
}

export interface DerivedSourceImageLineage {
  readonly kind: "derived";
  readonly parentSourceImageId: string;
  readonly operation: DerivedSourceImageOperation;
  readonly roiId?: string;
  readonly cropRect?: Rect;
}

export type DerivedSourceImageOperation =
  | {
      readonly kind: "crop";
      readonly roiId: string;
      readonly cropRect: Rect;
    }
  | {
      readonly kind: "resize";
      readonly sourceSize: Size;
      readonly outputSize: Size;
    }
  | {
      readonly kind: "rotate";
      readonly degrees: 90 | 180 | 270;
      readonly sourceSize: Size;
    };

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
