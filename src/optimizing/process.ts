import {uploadImage} from './upload';
import {downloadImage} from './download';

export async function processImage(imageData: ArrayBuffer) {
  const url = await uploadImage(imageData);
  return await downloadImage(url);
}
