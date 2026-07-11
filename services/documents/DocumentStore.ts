import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import type { StoredDocument } from '@/types';

const STORAGE_KEY = '@noviq/documents';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveDocument(
  doc: Omit<StoredDocument, 'id' | 'createdAt'>
): Promise<StoredDocument> {
  const fullDoc: StoredDocument = {
    id: generateId(),
    createdAt: Date.now(),
    ...doc,
  };

  const existing = await listDocuments();
  existing.push(fullDoc);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return fullDoc;
}

export async function listDocuments(): Promise<StoredDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const docs = JSON.parse(raw) as StoredDocument[];
    return docs.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteDocument(id: string): Promise<void> {
  const docs = await listDocuments();
  const target = docs.find((d) => d.id === id);
  if (target) {
    try {
      await FileSystem.deleteAsync(target.path, { idempotent: true });
      if (target.thumbnailUri) {
        await FileSystem.deleteAsync(target.thumbnailUri, { idempotent: true });
      }
    } catch {
      // File may already be gone
    }
  }
  const filtered = docs.filter((d) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
