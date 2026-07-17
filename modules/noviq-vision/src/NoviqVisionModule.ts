import { requireNativeModule } from "expo";

type NoviqVisionModule = {
  grayscale(path: string): Promise<string>;
};

export default requireNativeModule<NoviqVisionModule>("NoviqVision");