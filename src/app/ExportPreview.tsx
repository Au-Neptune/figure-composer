import type { CSSProperties, ReactElement } from "react";
import type { ExportPreviewMetrics } from "../editor/export/exportPreview";
import type {
  Figure,
  FigureObject,
  InsetObject,
  SourceImageObject,
} from "../editor/model/figure";
import type { Rect, Size } from "../editor/model/geometry";
import type { RegionOfInterest } from "../editor/model/roi";
import {
  getFigureObject,
  getRoi,
  getSourceImage,
  mapSourceRectToStageRect,
} from "../editor/model/selectors";

const MIN_PREVIEW_STROKE_PX = 1;

interface ExportPreviewProps {
  readonly figure: Figure;
  readonly metrics: ExportPreviewMetrics;
}

interface ObjectPreviewProps {
  readonly figure: Figure;
  readonly metrics: ExportPreviewMetrics;
  readonly object: FigureObject;
}

export function ExportPreview({
  figure,
  metrics,
}: ExportPreviewProps): ReactElement {
  return (
    <div className="export-preview-shell">
      <div
        className="export-preview-stage"
        style={createPreviewStageStyle(figure, metrics)}
      >
        {figure.objects.map((object) => (
          <ObjectPreview
            key={object.id}
            figure={figure}
            metrics={metrics}
            object={object}
          />
        ))}
        {figure.rois.map((roi) => (
          <RoiFramePreview
            key={roi.id}
            figure={figure}
            metrics={metrics}
            roi={roi}
          />
        ))}
      </div>
    </div>
  );
}

function ObjectPreview({
  figure,
  metrics,
  object,
}: ObjectPreviewProps): ReactElement {
  if (object.kind === "sourceImage") {
    return (
      <SourceImageObjectPreview figure={figure} metrics={metrics} object={object} />
    );
  }
  return <InsetObjectPreview figure={figure} metrics={metrics} object={object} />;
}

function SourceImageObjectPreview({
  figure,
  metrics,
  object,
}: {
  readonly figure: Figure;
  readonly metrics: ExportPreviewMetrics;
  readonly object: SourceImageObject;
}): ReactElement {
  const sourceImage = getSourceImage(figure, object.sourceImageId);
  return (
    <img
      className="export-preview-image"
      src={sourceImage.assetUrl}
      alt=""
      style={createObjectStyle(object, metrics)}
    />
  );
}

function InsetObjectPreview({
  figure,
  metrics,
  object,
}: {
  readonly figure: Figure;
  readonly metrics: ExportPreviewMetrics;
  readonly object: InsetObject;
}): ReactElement {
  const sourceImage = getSourceImage(figure, object.sourceImageId);
  const roi = getRoi(figure, object.roiId);
  return (
    <div className="export-preview-inset" style={createObjectStyle(object, metrics)}>
      <img
        className="export-preview-inset-image"
        src={sourceImage.assetUrl}
        alt=""
        style={createInsetImageStyle(sourceImage, roi, object, metrics)}
      />
    </div>
  );
}

function RoiFramePreview({
  figure,
  metrics,
  roi,
}: {
  readonly figure: Figure;
  readonly metrics: ExportPreviewMetrics;
  readonly roi: RegionOfInterest;
}): ReactElement | null {
  if (!roi.frame.visible) {
    return null;
  }
  const sourceObject = getFigureObject(figure, roi.sourceObjectId);
  const stageRect = mapSourceRectToStageRect(roi.rect, figure, sourceObject);
  return <div className="export-preview-roi" style={createRoiStyle(stageRect, roi, metrics)} />;
}

function createPreviewStageStyle(
  figure: Figure,
  metrics: ExportPreviewMetrics,
): CSSProperties {
  return {
    width: metrics.previewSize.width,
    height: metrics.previewSize.height,
    background: figure.canvas.background,
  };
}

function createObjectStyle(
  object: FigureObject,
  metrics: ExportPreviewMetrics,
): CSSProperties {
  return {
    left: object.x * metrics.previewScaleX,
    top: object.y * metrics.previewScaleY,
    width: object.width * metrics.previewScaleX,
    height: object.height * metrics.previewScaleY,
  };
}

function createInsetImageStyle(
  sourceImage: Size,
  roi: RegionOfInterest,
  object: InsetObject,
  metrics: ExportPreviewMetrics,
): CSSProperties {
  const scaleX = (object.width * metrics.previewScaleX) / roi.rect.width;
  const scaleY = (object.height * metrics.previewScaleY) / roi.rect.height;
  return {
    left: -roi.rect.x * scaleX,
    top: -roi.rect.y * scaleY,
    width: sourceImage.width * scaleX,
    height: sourceImage.height * scaleY,
  };
}

function createRoiStyle(
  stageRect: Rect,
  roi: RegionOfInterest,
  metrics: ExportPreviewMetrics,
): CSSProperties {
  const strokeWidth = Math.max(
    MIN_PREVIEW_STROKE_PX,
    roi.frame.strokeWidth * Math.min(metrics.previewScaleX, metrics.previewScaleY),
  );
  return {
    left: stageRect.x * metrics.previewScaleX,
    top: stageRect.y * metrics.previewScaleY,
    width: stageRect.width * metrics.previewScaleX,
    height: stageRect.height * metrics.previewScaleY,
    borderColor: roi.frame.stroke,
    borderWidth: strokeWidth,
  };
}
