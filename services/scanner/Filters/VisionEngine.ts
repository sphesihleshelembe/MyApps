import ImageProcessor from "./ImageProcessor";
import { FilterType } from "./FilterTypes";

class VisionEngine {
  async applyFilter(
    imageUri: string,
    filter: FilterType
  ): Promise<string> {
    return ImageProcessor.process(imageUri, filter);
  }
}

export default new VisionEngine(); 