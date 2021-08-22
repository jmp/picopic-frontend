import {baseUrl} from './constants';

export async function downloadImage(key: string): Promise<ArrayBuffer> {
  console.log('Downloading image.');
  const {url} = await fetchDownloadUrl(key);
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`failed to download image (status ${response.status})`);
  }
  return await response.arrayBuffer();
}

async function fetchDownloadUrl(key: string): Promise<any> {
  console.log('Fetching download URL.');
  const response = await fetch(`${baseUrl}/download-url/${key}`);
  if (response.status !== 200) {
    throw new Error(`could not fetch download URL (status ${response.status}).`);
  }
  return await response.json();
}
