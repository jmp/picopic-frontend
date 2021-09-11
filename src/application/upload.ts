import {baseUrl} from '../../package.json';

/**
 * Upload the given image for optimization and return the image key.
 *
 * This will request an upload URL from the backend, constructs form data
 * containing the image, then submits the form to that URL. The image key in
 * contained in the upload URL can be used to download the optimized image.
 */
export async function uploadImage(imageData: ArrayBuffer): Promise<string> {
  const {url, fields} = await fetchUploadUrl();
  const formData = constructFormData(imageData, fields);
  await submitFormData(url, formData);
  return fields.key;
}

/**
 * Request for an URL for uploading an image to the backend and return it.
 *
 * This will request a presigned URL to an S3 bucket. The URL can be used
 * for a short period to upload a file directly to the S3 bucket. If the
 * backend responds with a status code anything other than 200, an error
 * will be thrown.
 */
async function fetchUploadUrl(): Promise<any> {
  const response = await fetch(`${baseUrl}/upload-url`);
  if (response.status !== 200) {
    throw new Error('Could not retrieve presigned URL for uploading the image.');
  }
  return await response.json();
}

/**
 * Submits the given form data to the given URL, typically an S3 bucket.
 *
 * If the S3 bucket responds with a status code anything other than 204,
 * then an error is thrown.
 */
async function submitFormData(url: string, body: FormData) {
  const {status} = await fetch(url, {method: 'POST', body});
  if (status !== 204) {
    throw new Error(`Could not upload image (status ${status}).`);
  }
}

/** Create form data containing the image to upload. */
function constructFormData(imageData: ArrayBuffer, fields: any): FormData {
  const formData = new FormData();
  for (const name in fields) {
    formData.append(name, fields[name]);
  }
  formData.append('file', new Blob([imageData]));
  return formData;
}
