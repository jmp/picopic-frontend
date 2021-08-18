import {baseUrl} from './constants';

export async function downloadImage(key: string) {
  console.log('Downloading image.');
  const {url} = await fetchDownloadUrl(key);
  const response = await fetch(url, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error(`Image optimization failed (status ${response.status}).`);
  }
  return await response.arrayBuffer();
}

async function fetchDownloadUrl(key: string) {
  console.log('Fetching download URL.');
  const response = await fetch(`${baseUrl}/download-url/${key}`, {mode: 'cors'})
  if (response.status !== 200) {
    throw new Error(`Could not retrieve download URL (status ${response.status}).`);
  }
  return await response.json();
}
