import * as FileSystem from "expo-file-system/legacy";

export async function savePdf(
  pdfPath: string,
  fileName: string
) {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return false;
    }

    const pdfContent = await FileSystem.readAsStringAsync(
      pdfPath,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/pdf"
      );

    await FileSystem.writeAsStringAsync(
      destinationUri,
      pdfContent,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    return true;

  } catch (error) {
    console.error("PDF export failed:", error);
    return false;
  }
}