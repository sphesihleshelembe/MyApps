export default class NativeProcessor {
  static async grayscale(uri: string): Promise<string> {
    throw new Error("Native grayscale not implemented.");
  }

  static async blackWhite(uri: string): Promise<string> {
    throw new Error("Native black & white not implemented.");
  }

  static async enhance(uri: string): Promise<string> {
    throw new Error("Native enhance not implemented.");
  }

  static async auto(uri: string): Promise<string> {
    throw new Error("Native auto not implemented.");
  }
}