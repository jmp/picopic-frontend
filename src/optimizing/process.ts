import {uploadImage} from './upload';
import {downloadImage} from './download';
import {OptimizationResultProps} from '../components/OptimizationResult';

export function processFile(
  file: File,
  onSuccess: (params: OptimizationResultProps) => void,
  onError: (error: Error) => void,
  onAbort: () => void,
) {
  const reader = new FileReader();
  reader.onabort = () => onAbort();
  reader.onerror = () => onError(new Error('Failure reading image file.'));
  reader.onload = async () => {
    const imageData = reader.result;
    if (!(imageData instanceof ArrayBuffer)) {
      onError(new Error('Data is not an ArrayBuffer!'));
      return;
    }
    try {
      const url = await uploadImage(imageData);
      const optimizedData = await downloadImage(url);
      const blob = new Blob([optimizedData], {type: 'image/png'});
      const downloadUrl = URL.createObjectURL(blob).toString();
      onSuccess({
        url: downloadUrl,
        originalSize: imageData.byteLength,
        optimizedSize: optimizedData.byteLength,
      });
    } catch (error) {
      onError(error);
    }
  }
  reader.readAsArrayBuffer(file);
}