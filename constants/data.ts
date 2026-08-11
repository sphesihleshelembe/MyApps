import type { Tool, QuickAction, RecentFile, SettingsSection } from '@/types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'scan',
    label: 'Scan',
    icon: 'scan',
    color: '#2563EB',
    route: '/documents',
  },

  {
    id: 'qr',
    label: 'QR Code',
    icon: 'qr-code',
    color: '#0891B2',
    route: '/qr',
  },
{
  id: 'merge',
  label: 'Merge PDF',
  icon: 'layers',
  color: '#059669',
  route: '/merge',
},
];

export const POPULAR_TOOLS: Tool[] = [
  {
    id: 'scan-doc',
    label: 'Scan Document',
    description: 'Capture and enhance documents',
    icon: 'scan',
    category: 'scan',
  },
  {
    id: 'ocr',
    label: 'OCR — Extract Text',
    description: 'Pull text from any document',
    icon: 'type',
    category: 'ocr',
    isNew: true,
  },
  {
    id: 'merge-pdf',
    label: 'Merge PDF',
    description: 'Combine multiple PDFs',
    icon: 'layers',
    category: 'pdf',
  },
  {
    id: 'compress-pdf',
    label: 'Compress PDF',
    description: 'Reduce file size',
    icon: 'minimize-2',
    category: 'pdf',
  },
  {
    id: 'qr-gen',
    label: 'QR Generator',
    description: 'Create QR codes instantly',
    icon: 'qr-code',
    category: 'qr',
  },
];

export const DOCUMENT_TOOLS: Tool[] = [
  {
    id: 'scan-doc',
    label: 'Scan Document',
    description: 'Capture and auto-enhance any document',
    icon: 'scan',
    category: 'scan',
  },

  {
    id: 'ocr',
    label: 'OCR — Extract Text',
    description: 'Recognise and extract text from scans',
    icon: 'type',
    category: 'ocr',
    isNew: true,
  },
  {
    id: 'merge-pdf',
    label: 'Merge PDF',
    description: 'Combine multiple PDF files into one',
    icon: 'layers',
    category: 'pdf',
  },
  {
    id: 'compress-pdf',
    label: 'Compress PDF',
    description: 'Shrink PDF size without quality loss',
    icon: 'minimize-2',
    category: 'pdf',
  },
  {
    id: 'split-pdf',
    label: 'Split PDF',
    description: 'Extract pages from a PDF',
    icon: 'scissors',
    category: 'pdf',
  },



];

export const RECENT_FILES_PLACEHOLDER: RecentFile[] = [
  {
    id: '1',
    name: 'Invoice_March_2025.pdf',
    type: 'pdf',
    size: '1.2 MB',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Contract_NDA.pdf',
    type: 'pdf',
    size: '856 KB',
    createdAt: 'Yesterday',
  },
  {
    id: '3',
    name: 'Receipt_Scan.pdf',
    type: 'pdf',
    size: '320 KB',
    createdAt: '3 days ago',
  },
];




export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Preferences',
    items: [
      {
        id: 'theme',
        label: 'App Theme',
        description: 'Light, Dark, or System default',
        icon: 'sun',
        type: 'navigate',
      },
      {
        id: 'language',
        label: 'Language',
        description: 'English',
        icon: 'globe',
        type: 'navigate',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'rate',
        label: 'Rate Noviq',
        description: 'Leave a review on Google Play',
        icon: 'star',
        type: 'action',
      },
      {
        id: 'share',
        label: 'Share App',
        description: 'Recommend to friends',
        icon: 'share-2',
        type: 'action',
      },
      {
        id: 'website',
        label: 'Visit Website',
        description: 'Learn more about Noviq',
        icon: 'globe',
        type: 'action',
      },
      {
        id: 'support',
        label: 'Contact Support',
        description: 'Get help or report a problem',
        icon: 'mail',
        type: 'action',
      },
    ],
  },
  {
    title: 'Legal',
    items: [
      {
        id: 'privacy',
        label: 'Privacy Policy',
        icon: 'shield',
        type: 'navigate',
      },
    ],
  },
  {
    title: 'About',
    items: [
      {
        id: 'about',
        label: 'About Noviq',
        description: 'Version 1.0.0 — Shelembe Studios',
        icon: 'info',
        type: 'navigate',
      },
    ],
  },
];

export const TOOL_ICON_COLORS: Record<string, string> = {
  scan: '#2563EB',
  'img-to-pdf': '#7C3AED',
  ocr: '#0891B2',
  'merge-pdf': '#059669',
  'compress-pdf': '#EA580C',
  'split-pdf': '#DC2626',
  'pdf-to-img': '#D97706',
  'rotate-pdf': '#4F46E5',
  'scan-doc': '#2563EB',
  'qr-gen': '#0891B2',
};
