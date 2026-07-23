export interface OCRImage {
  uri: string;
  width: number;
  height: number;
}

class OCRSessionManager {
  private image: OCRImage | null = null;
  private text = "";

  setImage(image: OCRImage) {
    this.image = image;
  }

  getImage() {
    return this.image;
  }

  setText(text: string) {
    this.text = text;
  }

  getText() {
    return this.text;
  }

  clear() {
    this.image = null;
    this.text = "";
  }
}
export const OCRSession = new OCRSessionManager();