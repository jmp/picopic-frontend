import {baseUrl} from './constants';

export async function uploadImage(imageData: ArrayBuffer): Promise<string> {
  console.log('Uploading image.');
  const {url, fields} = await fetchUploadUrl();
  const formData = constructFormData(imageData, fields);
  await submitFormData(url, formData);
  return fields.key;
}

async function fetchUploadUrl(): Promise<any> {
  console.log('Fetching upload URL.');
  const response = await fetch(`${baseUrl}/upload-url`);
  if (response.status !== 200) {
    throw new Error('Could not retrieve presigned URL for uploading the image.');
  }
  return await response.json();
}

async function submitFormData(url: string, body: FormData) {
  console.log('Submitting form data.');
  const {status} = await fetch(url, {method: 'POST', body});
  if (status !== 204) {
    throw new Error(`Could not upload image (status ${status}).`);
  }
}

function constructFormData(imageData: ArrayBuffer, fields: any): FormData {
  console.log('Constructing form data.');
  const formData = new FormData();
  for (const name in fields) {
    formData.append(name, fields[name]);
  }
  formData.append('file', new Blob([imageData]));
  return formData;
}
