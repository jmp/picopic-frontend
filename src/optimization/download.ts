import {baseUrl} from '../../package.json';

export async function downloadImage(key: string): Promise<ArrayBuffer> {
  const {url} = await fetchDownloadUrl(key);
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`failed to download image (status ${response.status})`);
  }
  return await response.arrayBuffer();
}

async function fetchDownloadUrl(key: string): Promise<any> {
  const response = await fetch(`${baseUrl}/download-url/${key}`);
  if (response.status !== 200) {
    throw new Error(`could not fetch download URL (status ${response.status})`);
  }
  return await response.json();
}
