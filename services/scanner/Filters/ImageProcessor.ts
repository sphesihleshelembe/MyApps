import { FilterType } from "./FilterTypes";
import NativeProcessor from "./NativeProcessor";  




export default class ImageProcessor {

  static async process(
    imageUri: string,
    filter: FilterType
  ): Promise<string> {
    switch (filter) {
      case "Original":
        return this.original(imageUri);

      case "Auto":
        return this.auto(imageUri);

      case "Grayscale":
        return this.grayscale(imageUri);

      case "BlackWhite":
        return this.blackWhite(imageUri);

      case "Enhance":
        return this.enhance(imageUri);

      default:
        return imageUri;
    }
  }
  private static async original(uri: string): Promise<string> {
  return uri;
}
  private static async auto(uri: string): Promise<string> {
  return NativeProcessor.auto(uri);
}

private static async grayscale(uri: string): Promise<string> {
  return NativeProcessor.grayscale(uri);
}

private static async blackWhite(uri: string): Promise<string> {
  return NativeProcessor.blackWhite(uri);
}

private static async enhance(uri: string): Promise<string> {
  return NativeProcessor.enhance(uri);
}
}