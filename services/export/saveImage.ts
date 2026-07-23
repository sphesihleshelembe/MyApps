import * as FileSystem from "expo-file-system/legacy";

export async function saveImage(
  imagePath: string,
  fileName: string
) {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return false;
    }

    const imageContent =
      await FileSystem.readAsStringAsync(imagePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

    const destination =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "image/jpeg"
      );

    await FileSystem.writeAsStringAsync(
      destination,
      imageContent,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    return true;
  } catch (error) {
    console.error("Image export failed:", error);
    return false;
  }
}