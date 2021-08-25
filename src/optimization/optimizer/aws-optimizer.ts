import {OptimizationResult, Optimizer} from './optimizer';
import {uploadImage} from '../upload';
import {downloadImage} from '../download';

export class AwsOptimizer implements Optimizer {
  async optimize(file: File): Promise<OptimizationResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onabort = () => reject(new Error('image read aborted'));
      reader.onerror = () => reject(new Error('could not read image'));
      reader.onload = async () => {
        const originalImageData = reader.result as ArrayBuffer;
        try {
          const url = await uploadImage(originalImageData);
          const optimizedImageData = await downloadImage(url);
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