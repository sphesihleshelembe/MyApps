export interface Tool {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: ToolCategory;
  isNew?: boolean;
  isPremium?: boolean;
}

export type ToolCategory =
  | 'scan'
  | 'pdf'
  | 'image'
  | 'qr'
  | 'ocr'
  | 'convert'
  | 'organize';

export interface RecentFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'docx';
  size: string;
  createdAt: string;
  thumbnailUri?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

export interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
}

export interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export interface ScanPage {
  id: string;
  uri: string;
  width: number;
  height: number;
  capturedAt: number;
}

export interface ScanSessionData {
  id: string;
  pages: ScanPage[];
  createdAt: number;
  updatedAt: number;
}
