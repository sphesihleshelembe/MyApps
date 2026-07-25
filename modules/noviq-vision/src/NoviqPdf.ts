import { requireNativeModule } from "expo-modules-core";

export type CompressResult = {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  outputSize?: number;
  pageCount?: number;
  percentSaved?: number;
  error?: string;
};

export type MergeResult = {
  success: boolean;
  outputPath?: string;
  error?: string;
};

type NoviqPdfModule = {
  compress(
    inputPath: string,
    mode: "LOW" | "BALANCED" | "HIGH"
  ): Promise<CompressResult>;

  merge(
    inputPaths: string[]
  ): Promise<MergeResult>;
};

export default requireNativeModule<NoviqPdfModule>("NoviqPdf");