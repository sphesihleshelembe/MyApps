import { FilterType } from "./FilterTypes";
import NoviqVision from "@/modules/noviq-vision/src";

export interface ProcessResult {
  success: boolean;
  imageUri: string;
  error?: string;
}

export default class NativeProcessor {
  static async process(
    uri: string,
    filter: FilterType
  ): Promise<ProcessResult> {
    throw new Error("Native processor not implemented.");
  }

  static async grayscale(uri: string): Promise<string> {
    console.log("NativeProcessor URI:", uri);

    const result = await NoviqVision.grayscale(uri);

    console.log("NativeProcessor Result:", result);

    return result;
  }

  static async auto(uri: string): Promise<string> {
    return uri;
  }

  static async blackWhite(uri: string): Promise<string> {
    return uri;
  }

  static async enhance(uri: string): Promise<string> {
    return uri;
  }
}