import * as FileSystem from "expo-file-system/legacy";

export async function saveText(
  text: string,
  fileName: string
) {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return false;
    }

    const fileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "text/plain"
      );

    await FileSystem.writeAsStringAsync(
      fileUri,
      text
    );

    return true;
  } catch (error) {
    console.error("Text export failed:", error);
    return false;
  }
}