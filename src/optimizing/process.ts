import {uploadImage} from './upload';
import {downloadImage} from './download';

type ProcessFileSuccessParams = {
  originalSize: number,
  optimizedSize: number,
  downloadUrl: string,
};

export function processFile(
  file: File,
  onSuccess: (params: ProcessFileSuccessParams) => void,
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
      const downloadUrl = URL.createObjectURL(blob);
      onSuccess({
        originalSize: imageData.byteLength,
        optimizedSize: optimizedData.byteLength,
        downloadUrl: downloadUrl,
      });
    } catch (error) {
      onError(error);
    }
  }
  reader.readAsArrayBuffer(file);
}