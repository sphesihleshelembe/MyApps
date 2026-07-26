import * as FileSystem from "expo-file-system/legacy";

export async function saveQr(
  directoryUri: string,
  imageUri: string,
  fileName: string
) {
  try {
    const imageContent = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "image/png"
      );

    await FileSystem.writeAsStringAsync(
      destinationUri,
      imageContent,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    return true;
  } catch (error) {
    console.error("QR export failed:", error);
    return false;
  }
}