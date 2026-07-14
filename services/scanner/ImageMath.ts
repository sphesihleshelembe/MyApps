
export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface CalculateCropRectParams {
  imageWidth: number;
  imageHeight: number;
  displayWidth: number;
  displayHeight: number;
  cropLeft: number;
  cropTop: number;
  cropWidth: number;
  cropHeight: number;
}

export function calculateCropRect({
  imageWidth,
  imageHeight,
  displayWidth,
  displayHeight,
  cropLeft,
  cropTop,
  cropWidth,
  cropHeight,
}: CalculateCropRectParams): CropRect {
  const scaleX = imageWidth / displayWidth;
  const scaleY = imageHeight / displayHeight;

  return {
    originX: cropLeft * scaleX,
    originY: cropTop * scaleY,
    width: cropWidth * scaleX,
    height: cropHeight * scaleY,
  };
}