import { requireNativeModule } from "expo";

type NoviqVisionModule = {
  grayscale(path: string): Promise<string>;
  blackWhite(path: string): Promise<string>;
  autoEnhance(path: string): Promise<string>;
  magicColor(path: string): Promise<string>;

  detectDocument(path: string): Promise<DocumentDetectionResult>;

  cropDocument(
    path: string,
    corners: { x: number; y: number }[]
  ): Promise<string>;
};

export default requireNativeModule<NoviqVisionModule>("NoviqVision");