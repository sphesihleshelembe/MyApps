import { requireNativeModule } from "expo";

type DocumentDetectionResult = {
  found: boolean;
  corners: {
    x: number;
    y: number;
  }[];
};

type NoviqVisionModule = {
  grayscale(path: string): Promise<string>;
  blackWhite(path: string): Promise<string>;
  autoEnhance(path: string): Promise<string>;
  magicColor(path: string): Promise<string>;

  detectDocument(path: string): Promise<DocumentDetectionResult>;
};

export default requireNativeModule<NoviqVisionModule>("NoviqVision");