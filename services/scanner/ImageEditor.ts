import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { saveScanImage } from "./imageStorage";


export interface CropOptions {
  uri: string;
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export default class ImageEditor {

  private static running = false;

  static async cropImage({
    uri,
    originX,
    originY,
    width,
    height,
  }: CropOptions): Promise<string> {

    if (this.running) {
      console.log("Crop already running");
      return uri;
    }

    this.running = true;

    try {
 const result = await ImageManipulator.manipulateAsync(
  uri,
  [
    {
      crop: {
        originX: Math.round(originX),
        originY: Math.round(originY),
        width: Math.round(width),
        height: Math.round(height),
      },
    },
  ],
  {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  }
);

const permanentUri = await saveScanImage(result.uri);

return permanentUri;

    } finally {
      this.running = false;
    }
  }
}