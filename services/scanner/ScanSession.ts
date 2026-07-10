import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanPage, ScanSessionData } from '@/types';

const STORAGE_KEY_PREFIX = '@noviq/scan_session/';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function storageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

export class ScanSession {
  private data: ScanSessionData;

  private constructor(data: ScanSessionData) {
    this.data = data;
  }

  static async createSession(): Promise<ScanSession> {
    const id = generateId();
    const now = Date.now();
    const data: ScanSessionData = {
      id,
      pages: [],
      createdAt: now,
      updatedAt: now,
    };
    const session = new ScanSession(data);
    await session.persist();
    return session;
  }

  static async load(sessionId: string): Promise<ScanSession | null> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(sessionId));
      if (!raw) return null;
      const data = JSON.parse(raw) as ScanSessionData;
      return new ScanSession(data);
    } catch {
      return null;
    }
  }

  getId(): string {
    return this.data.id;
  }

  getPages(): ScanPage[] {
    return [...this.data.pages];
  }

  getPageCount(): number {
    return this.data.pages.length;
  }

  async addPage(page: Omit<ScanPage, 'id' | 'capturedAt'>): Promise<ScanPage> {
    const newPage: ScanPage = {
      ...page,
      id: generateId(),
      capturedAt: Date.now(),
    };
    this.data.pages.push(newPage);
    this.data.updatedAt = Date.now();
    await this.persist();
    return newPage;
  }

  async removePage(pageId: string): Promise<void> {
    this.data.pages = this.data.pages.filter((p) => p.id !== pageId);
    this.data.updatedAt = Date.now();
    await this.persist();
  }

  async clearSession(): Promise<void> {
    this.data.pages = [];
    this.data.updatedAt = Date.now();
    await this.persist();
  }

  async destroy(): Promise<void> {
    await AsyncStorage.removeItem(storageKey(this.data.id));
  }

  static async listAll(): Promise<ScanSessionData[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter((k) => k.startsWith(STORAGE_KEY_PREFIX));
      if (sessionKeys.length === 0) return [];
      const sessions: ScanSessionData[] = [];
      for (const key of sessionKeys) {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) continue;
        try {
          sessions.push(JSON.parse(raw) as ScanSessionData);
        } catch {
          // Skip corrupted entries
        }
      }
      return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  toJSON(): ScanSessionData {
    return { ...this.data, pages: [...this.data.pages] };
  }

  private async persist(): Promise<void> {
    await AsyncStorage.setItem(storageKey(this.data.id), JSON.stringify(this.data));
  }
}
