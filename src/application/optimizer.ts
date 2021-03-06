export type OptimizationResult = {
  downloadUrl: string,
  originalSize: number,
  optimizedSize: number,
};

/** An optimizer class that encapsulates the image optimization logic. */
export class Optimizer {
  constructor(
    private uploadImage: (imageData: ArrayBuffer) => Promise<string>,
    private downloadImage: (key: string) => Promise<ArrayBuffer>,
  ) {}

  /**
   * Optimize the given image file.
   *
   * The image is optimized by uploading it to the backend for optimization.
   * The backend will provide an URL that can be used to download an optimized
   * version of the same image. The optimized image will be downloaded, and
   * the optimizer will return a result with some statistics and a download URL.
   */
  async optimize(file: File): Promise<OptimizationResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onabort = reject;
      reader.onerror = reject;
      reader.onload = async () => {
        const originalImageData = reader.result as ArrayBuffer;
        try {
          const url = await this.uploadImage(originalImageData);
          const optimizedImageData = await this.downloadImage(url);
          const blob = new Blob([optimizedImageData], {type: 'image/png'});
          resolve({
            downloadUrl: URL.createObjectURL(blob).toString(),
            originalSize: originalImageData.byteLength,
            optimizedSize: optimizedImageData.byteLength,
          });
        } catch (error) {
          reject(error);
        }
      }
      reader.readAsArrayBuffer(file);
    });
  }
}
