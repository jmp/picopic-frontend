import {Optimizer} from './optimizer';
import {uploadImage} from './upload';
import {downloadImage} from './download';
import {ResultProps} from '../components/Result';

export class AwsOptimizer implements Optimizer {
  async optimize(file: File): Promise<ResultProps> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onabort = () => reject(new Error('image read aborted'));
      reader.onerror = () => reject(new Error('could not read image'));
      reader.onload = async () => {
        const imageData = reader.result;
        if (!(imageData instanceof ArrayBuffer)) {
          reject(new Error('image data is not an ArrayBuffer'));
          return;
        }
        try {
          const url = await uploadImage(imageData);
          const optimizedData = await downloadImage(url);
          const blob = new Blob([optimizedData], {type: 'image/png'});
          const downloadUrl = URL.createObjectURL(blob).toString();
          resolve({
            url: downloadUrl,
            originalSize: imageData.byteLength,
            optimizedSize: optimizedData.byteLength,
          });
        } catch (error) {
          reject(error);
        }
      }
      reader.readAsArrayBuffer(file);
    });
  }
}