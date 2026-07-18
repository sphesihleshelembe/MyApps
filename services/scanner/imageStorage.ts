import * as FileSystem from 'expo-file-system/legacy';


const SCAN_DIR = `${FileSystem.documentDirectory}scans/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(SCAN_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(SCAN_DIR, { intermediates: true });
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Copies an image from a (possibly temporary) URI into permanent app storage.
 * Returns the new permanent file URI.
 * Throws if the copy fails or the source file cannot be read.
 */
export async function saveScanImage(uri: string): Promise<string> {
  await ensureDir();

  const ext = extractExtension(uri);
  const filename = `${generateId()}${ext}`;
  const dest = `${SCAN_DIR}${filename}`;

  const sourceInfo = await FileSystem.getInfoAsync(uri);

  console.log("SOURCE INFO:", sourceInfo);
  console.log("Copying from:", uri);
  console.log("Copying to:", dest);

  if (!sourceInfo.exists) {
    throw new Error("Source image file does not exist.");
  }

  try {
    await FileSystem.copyAsync({
      from: uri,
      to: dest,
    });

    console.log("Copy succeeded");
  } catch (e) {
    console.log("COPY ERROR:", e);
    throw e;
  }

  const destInfo = await FileSystem.getInfoAsync(dest);
  console.log("DEST INFO:", destInfo);

  if (!destInfo.exists) {
    throw new Error("Failed to copy image to permanent storage.");
  }

  return dest;
}

/**
 * Deletes a previously saved scan image. Silently ignores missing files.
 */
export async function deleteScanImage(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // File may already be gone
  }
}

function extractExtension(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return '.jpg';
  if (lower.endsWith('.png')) return '.png';
  if (lower.endsWith('.heic')) return '.heic';
  if (lower.endsWith('.webp')) return '.webp';
  return '.jpg';
}
