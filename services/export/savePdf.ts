import * as FileSystem from "expo-file-system/legacy";

export async function savePdf(
  directoryUri: string,
  pdfPath: string,
  fileName: string
) {
  try {
    const uri = pdfPath.startsWith("file://")
      ? pdfPath
      : `file://${pdfPath}`;

    const pdfContent = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "application/pdf"
      );

    await FileSystem.writeAsStringAsync(destinationUri, pdfContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return true;
  } catch (error) {
    console.error("PDF export failed:", error);
    return false;
  }
}