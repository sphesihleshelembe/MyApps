import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import type { ScanPage } from '@/types';

const PDF_DIR = `${FileSystem.documentDirectory}pdfs/`;
const THUMBNAIL_DIR = `${FileSystem.documentDirectory}thumbnails/`;

export interface GeneratedPdf {
  path: string;
  pageCount: number;
  thumbnailUri?: string;
}

async function ensureDir(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function timestampName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Scan_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function sanitizeFileName(name: string): string {
  const cleaned = name.trim().replace(/[/\\?%*:|"<>]/g, '_');
  return cleaned || timestampName();
}

async function imageUriToBytes(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function isJpeg(uri: string): boolean {
  const lower = uri.toLowerCase();
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg');
}

async function createThumbnail(firstPageUri: string, docId: string): Promise<string | undefined> {
  try {
    await ensureDir(THUMBNAIL_DIR);
    const thumbPath = `${THUMBNAIL_DIR}${docId}.jpg`;
    const base64 = await FileSystem.readAsStringAsync(firstPageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(thumbPath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return thumbPath;
  } catch {
    return undefined;
  }
}

/**
 * Generates a multi-page PDF from an ordered list of scan pages.
 * Preserves page order. Each image is embedded at its native aspect ratio
 * fitted to a portrait A4 page (or landscape if the image is wider than tall).
 */
export async function generatePdf(
  pages: ScanPage[],
  documentName: string
): Promise<GeneratedPdf> {
  if (pages.length === 0) {
    throw new Error('Cannot generate a PDF from zero pages.');
  }

  await ensureDir(PDF_DIR);

  const pdfDoc = await PDFDocument.create();
  const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = sanitizeFileName(documentName);
  const outputPath = `${PDF_DIR}${safeName}_${docId}.pdf`;

  for (const page of pages) {
    const imageBytes = await imageUriToBytes(page.uri);
    const jpeg = isJpeg(page.uri)
      ? await pdfDoc.embedJpg(imageBytes)
      : await pdfDoc.embedPng(imageBytes);

    const imgWidth = jpeg.width;
    const imgHeight = jpeg.height;
    const isLandscape = imgWidth > imgHeight;

    // A4 dimensions in points (1pt = 1/72 inch)
    const A4_W = 595.28;
    const A4_H = 841.89;

    const pageWidth = isLandscape ? A4_H : A4_W;
    const pageHeight = isLandscape ? A4_W : A4_H;

    // Fit image within page with a small margin
    const margin = 24;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    const scale = Math.min(maxW / imgWidth, maxH / imgHeight);
    const drawW = imgWidth * scale;
    const drawH = imgHeight * scale;
    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pdfPage.drawImage(jpeg, { x, y, width: drawW, height: drawH });
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = uint8ArrayToBase64(pdfBytes);

  await FileSystem.writeAsStringAsync(outputPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const thumbnailUri = await createThumbnail(pages[0].uri, docId);

  return {
    path: outputPath,
    pageCount: pages.length,
    thumbnailUri,
  };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export { timestampName, sanitizeFileName };
