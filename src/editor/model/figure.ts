import type { ExportPreset } from "./exportPreset";
import type { RegionOfInterest } from "./roi";
import type { SourceImage } from "./sourceImage";

export type ToolMode = "select" | "roi";
export type InsetDockSide = "top" | "right" | "bottom" | "left";

export interface CanvasSettings {
  readonly width: number;
  readonly height: number;
  readonly background: string;
}

export type CanvasSettingsPatch = Partial<CanvasSettings>;

export interface FigureObjectBase {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface SourceImageObject extends FigureObjectBase {
  readonly kind: "sourceImage";
  readonly sourceImageId: string;
}

export interface InsetObject extends FigureObjectBase {
  readonly kind: "inset";
  readonly sourceImageId: string;
  readonly roiId: string;
}

export interface GenericAnnotationObject extends FigureObjectBase {
  readonly kind: "genericAnnotation";
  readonly text: string;
  readonly fill: string;
  readonly fontSize: number;
}

export type FigureImageObject = SourceImageObject | InsetObject;
export type FigureObject = FigureImageObject | GenericAnnotationObject;

export interface Figure {
  readonly id: string;
  readonly canvas: CanvasSettings;
  readonly sourceImages: readonly SourceImage[];
  readonly objects: readonly FigureObject[];
  readonly rois: readonly RegionOfInterest[];
  readonly exportPresets: readonly ExportPreset[];
  readonly selectedObjectId: string | null;
  readonly selectedRoiId: string | null;
  readonly tool: ToolMode;
}
