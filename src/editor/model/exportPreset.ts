export type ExportFormat = "png" | "jpg";

export interface ExportPreset {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly dpi: number;
  readonly format: ExportFormat;
  readonly background: string;
  readonly jpgQuality: number;
}

