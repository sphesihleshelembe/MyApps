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

export function timestampName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Scan_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function sanitizeFileName(name: string): string {
  const cleaned = name.trim().replace(/[/\\?%*:|"<>]/g, '_');
  return cleaned || timestampName();
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

// --- Byte-level PDF builder ---

class ByteBuilder {
  private chunks: Uint8Array[] = [];
  public length = 0;

  appendString(str: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  appendBytes(bytes: Uint8Array): void {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  toUint8Array(): Uint8Array {
    const result = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function parseJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i < bytes.length - 1) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      if (i + 9 > bytes.length) return null;
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return { width, height };
    }
    if (i + 4 > bytes.length) return null;
    const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
    i += 2 + segLen;
  }
  return null;
}

function parsePngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
  const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
  return { width, height };
}

function isJpegData(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function getImageDimensions(bytes: Uint8Array, fallbackW: number, fallbackH: number): { width: number; height: number } {
  const jpeg = parseJpegSize(bytes);
  if (jpeg) return jpeg;
  const png = parsePngSize(bytes);
  if (png) return png;
  return { width: fallbackW || 1240, height: fallbackH || 1754 };
}

/**
 * Generates a multi-page PDF from an ordered list of scan pages.
 * Each image is embedded as-is (JPEG DCTDecode or PNG FlateDecode is not
 * supported for raw PNG — only JPEG images are embedded directly; PNG
 * images are read and embedded with the appropriate filter).
 *
 * Preserves page order, handles any page count.
 */
export async function generatePdf(
  pages: ScanPage[],
  documentName: string
): Promise<GeneratedPdf> {
  if (pages.length === 0) {
    throw new Error('Cannot generate a PDF from zero pages.');
  }

  await ensureDir(PDF_DIR);

  const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = sanitizeFileName(documentName);
  const outputPath = `${PDF_DIR}${safeName}_${docId}.pdf`;

  // Load all image bytes
  const imageBytes: Uint8Array[] = [];
  for (const page of pages) {
    const base64 = await FileSystem.readAsStringAsync(page.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    imageBytes.push(base64ToUint8(base64));
  }

  const A4_W = 595.28;
  const A4_H = 841.89;
  const margin = 24;
  const pageCount = pages.length;

  // Object numbering:
  // 1: Catalog, 2: Pages
  // 3..3+N-1: Page objects
  // 3+N..3+2N-1: Content streams
  // 3+2N..3+3N-1: Image XObjects
  const pageObjStart = 3;
  const contentObjStart = 3 + pageCount;
  const imageObjStart = 3 + 2 * pageCount;
  const totalObjects = 3 + 3 * pageCount;

  const builder = new ByteBuilder();
  builder.appendString('%PDF-1.4\n');
  // Binary comment to mark as binary PDF
  builder.appendString('%\xe2\xe3\xcf\xd3\n');

  const offsets: number[] = new Array(totalObjects + 1).fill(0);

  // Helper to write an object header
  const writeObject = (num: number, content: string) => {
    offsets[num] = builder.length;
    builder.appendString(`${num} 0 obj\n${content}\nendobj\n`);
  };

  // 1: Catalog
  writeObject(1, `<< /Type /Catalog /Pages 2 0 R >>`);

  // 2: Pages
  const kids = Array.from({ length: pageCount }, (_, i) => `${pageObjStart + i} 0 R`).join(' ');
  writeObject(2, `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

  for (let i = 0; i < pageCount; i++) {
    const bytes = imageBytes[i];
    const dims = getImageDimensions(bytes, pages[i].width, pages[i].height);
    const imgW = dims.width;
    const imgH = dims.height;
    const isLandscape = imgW > imgH;
    const pageW = isLandscape ? A4_H : A4_W;
    const pageH = isLandscape ? A4_W : A4_H;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    const pageObjNum = pageObjStart + i;
    const contentObjNum = contentObjStart + i;
    const imageObjNum = imageObjStart + i;

    // Page
    writeObject(
      pageObjNum,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im${i} ${imageObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );

    // Content stream
    const contentStream = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im${i} Do\nQ\n`;
    writeObject(contentObjNum, `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`);

    // Image XObject — raw binary stream
    const filter = isJpegData(bytes) ? '/DCTDecode' : '/ASCIIHexDecode';
    const imgHeader = `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter ${filter} /Length ${bytes.length} >>`;

    // Write object header manually so we can insert raw bytes
    offsets[imageObjNum] = builder.length;
    builder.appendString(`${imageObjNum} 0 obj\n${imgHeader}\nstream\n`);
    builder.appendBytes(bytes);
    builder.appendString(`\nendstream\nendobj\n`);
  }

  // Cross-reference table
  const xrefOffset = builder.length;
  builder.appendString('xref\n');
  builder.appendString(`0 ${totalObjects + 1}\n`);
  builder.appendString('0000000000 65535 f \n');
  for (let i = 1; i <= totalObjects; i++) {
    builder.appendString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  builder.appendString(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\n`);
  builder.appendString(`startxref\n${xrefOffset}\n`);
  builder.appendString('%%EOF');

  // Convert to base64 and write
  const finalBytes = builder.toUint8Array();
  const base64 = uint8ToBase64(finalBytes);
  await FileSystem.writeAsStringAsync(outputPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const thumbnailUri = await createThumbnail(pages[0].uri, docId);

  return {
    path: outputPath,
    pageCount,
    thumbnailUri,
  };
}
