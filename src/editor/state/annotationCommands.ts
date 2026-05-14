import type { Figure, GenericAnnotationObject } from "../model/figure";
import { constrainRectWithinBounds } from "../model/geometry";
import { getFigureObject } from "../model/selectors";
import {
  DEFAULT_ANNOTATION_FILL,
  DEFAULT_ANNOTATION_FONT_SIZE,
  DEFAULT_ANNOTATION_HEIGHT,
  DEFAULT_ANNOTATION_TEXT,
  DEFAULT_ANNOTATION_WIDTH,
} from "./editorDefaults";
import { createId } from "./idFactory";

const ANNOTATION_START_X = 80;
const ANNOTATION_START_Y = 80;

export function addGenericAnnotation(figure: Figure): Figure {
  const annotation = createGenericAnnotationObject(figure);
  return {
    ...figure,
    objects: [...figure.objects, annotation],
    selectedObjectId: annotation.id,
    selectedRoiId: null,
    tool: "select",
  };
}

export function updateGenericAnnotationText(
  figure: Figure,
  objectId: string,
  text: string,
): Figure {
  const object = getFigureObject(figure, objectId);
  if (object.kind !== "genericAnnotation") {
    throw new Error(`Figure object is not a Generic Annotation: ${objectId}`);
  }
  return {
    ...figure,
    objects: figure.objects.map((item) =>
      item.id === objectId ? { ...object, text } : item,
    ),
  };
}

function createGenericAnnotationObject(figure: Figure): GenericAnnotationObject {
  return {
    ...constrainRectWithinBounds(
      {
        x: ANNOTATION_START_X,
        y: ANNOTATION_START_Y,
        width: DEFAULT_ANNOTATION_WIDTH,
        height: DEFAULT_ANNOTATION_HEIGHT,
      },
      figure.canvas,
    ),
    id: createId("object"),
    kind: "genericAnnotation",
    text: DEFAULT_ANNOTATION_TEXT,
    fill: DEFAULT_ANNOTATION_FILL,
    fontSize: DEFAULT_ANNOTATION_FONT_SIZE,
  };
}
