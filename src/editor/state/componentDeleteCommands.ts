import type { Figure } from "../model/figure";
import { getFigureObject } from "../model/selectors";
import { deleteRoi } from "./roiCommands";
import { deleteSourceImage } from "./sourceImageCommands";

export function deleteSelectedComponent(figure: Figure): Figure {
  if (figure.selectedRoiId) {
    return deleteRoi(figure, figure.selectedRoiId);
  }
  if (!figure.selectedObjectId) {
    return figure;
  }
  const object = getFigureObject(figure, figure.selectedObjectId);
  if (object.kind === "sourceImage") {
    return deleteSourceImage(figure, object.sourceImageId);
  }
  if (object.kind === "inset") {
    return deleteRoi(figure, object.roiId);
  }
  return {
    ...figure,
    objects: figure.objects.filter((item) => item.id !== object.id),
    selectedObjectId: null,
    selectedRoiId: null,
  };
}
