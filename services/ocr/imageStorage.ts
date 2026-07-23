import * as FileSystem from "expo-file-system/legacy";

export async function saveOCRImage(uri: string): Promise<string> {
  const destination =
    `${FileSystem.documentDirectory}ocr_${Date.now()}.jpg`;

  await FileSystem.copyAsync({
    from: uri,
    to: destination,
  });

  return destination;
}