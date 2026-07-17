import { FilterType } from "./FilterTypes";
import NoviqVision from "@/modules/noviq-vision/src";
import { saveScanImage } from "../imageStorage";

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

    try {

      let result = uri;

     switch (filter) {

  case FilterType.Grayscale:
    result = await this.grayscale(uri);
    break;

  case FilterType.BlackWhite:
    result = await this.blackWhite(uri);
    break;

  case FilterType.Original:
    result = uri;
    break;

  case FilterType.Auto:
    result = await this.auto(uri);
    break;

  case FilterType.Enhance:
    result = await this.enhance(uri);
    break;

  case FilterType.MagicColor:
    result = await this.magicColor(uri);
    break;
}

return {
  success: true,
  imageUri: result
};
     
      
    } catch (error: any) {

      console.error(
        "Filter error:",
        error
      );

      return {
        success: false,
        imageUri: uri,
        error: error.message
      };
    }
  }


 static async grayscale(uri: string): Promise<string> {

  console.log("NativeProcessor URI:", uri);

  const tempUri = await NoviqVision.grayscale(uri);

  const savedUri = await saveScanImage(tempUri);

  console.log("Saved URI:", savedUri);

  return savedUri;
}

static async blackWhite(uri: string): Promise<string> {
  const tempUri = await NoviqVision.blackWhite(uri);

  const savedUri = await saveScanImage(tempUri);

  console.log("Saved URI:", savedUri);

  return savedUri;
}


static async auto(uri: string): Promise<string> {
  const tempUri = await NoviqVision.autoEnhance(uri);

  const savedUri = await saveScanImage(tempUri);

  console.log("Saved URI:", savedUri);

  return savedUri;
}

static async enhance(uri: string): Promise<string> {
  const tempUri = await NoviqVision.autoEnhance(uri);

  const savedUri = await saveScanImage(tempUri);

  console.log("Saved URI:", savedUri);

  return savedUri;
}

static async magicColor(uri: string): Promise<string> {
  const tempUri = await NoviqVision.magicColor(uri);

  const savedUri = await saveScanImage(tempUri);

  console.log("Saved URI:", savedUri);

  return savedUri;
}
}