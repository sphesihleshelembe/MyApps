import { requireNativeModule } from "expo-modules-core";

type CompressResult = {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  outputSize?: number;
  pageCount?: number;
  error?: string;
};

type NoviqPdfModule = {
  compress(
  inputPath: string,
  mode: "LOW" | "BALANCED" | "HIGH"
): Promise<CompressResult>;
};

export default requireNativeModule<NoviqPdfModule>("NoviqPdf");