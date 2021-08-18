import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import Loader from 'react-loader-spinner';

const baseUrl = 'https://api.picopic.io';

async function uploadImage(imageData: ArrayBuffer) {
  console.log('Uploading image.');
  const response = await fetch(`${baseUrl}/upload-url`, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error('Could not retrieve presigned URL for uploading the image.');
  }
  const {url, fields} = await fetchUploadUrl();
  const formData = constructFormData(imageData, fields);
  await submitFormData(url, formData);
  return fields.key;
}

async function fetchUploadUrl() {
  console.log('Fetching upload URL.');
  const response = await fetch(`${baseUrl}/upload-url`, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error('Could not retrieve presigned URL for uploading the image.');
  }
  return await response.json();
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

async function submitFormData(url: string, body: FormData) {
  console.log('Submitting form data.');
  const {status} = await fetch(url, {method: 'POST', body, mode: 'cors'});
  if (status !== 204) {
    throw new Error(`Could not upload image (status ${status}).`);
  }
}

async function fetchDownloadUrl(key: string) {
  console.log('Fetching download URL.');
  const response = await fetch(`${baseUrl}/download-url/${key}`, {mode: 'cors'})
  if (response.status !== 200) {
    throw new Error(`Could not retrieve download URL (status ${response.status}).`);
  }
  return await response.json();
}

async function downloadImage(key: string) {
  console.log('Downloading image.');
  const {url} = await fetchDownloadUrl(key);
  const response = await fetch(url, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error(`Image optimization failed (status ${response.status}).`);
  }
  return await response.arrayBuffer();
}

async function processImage(imageData: ArrayBuffer) {
  const url = await uploadImage(imageData);
  return await downloadImage(url);
}

enum State {
  Ready,
  Loading,
  Success,
  Failure,
  Aborted,
}

function Dropzone() {
  const [downloadLink, setDownloadLink] = useState('/');
  const [state, setState] = useState(State.Ready);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('File selected.');
    setState(State.Loading);
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onabort = () => setState(State.Aborted);
      reader.onerror = () => setState(State.Failure);
      reader.onload = async () => {
        console.log('Loading started.');
        const imageData = reader.result;
        if (!(imageData instanceof ArrayBuffer)) {
          setState(State.Failure);
          console.error('Data is not an ArrayBuffer!');
          return;
        }
        setOriginalSize(imageData.byteLength);
        console.log('Starting image processing.');
        try {
          const optimizedData = await processImage(imageData)
          const blob = new Blob([optimizedData], {type: 'image/png'});
          const url = URL.createObjectURL(blob);
          setOptimizedSize(optimizedData.byteLength);
          setDownloadLink(url);
          console.log('Image optimization finished.')
          setState(State.Success);
        } catch (error) {
          console.error('An error occurred while processing image:', error)
          setState(State.Failure);
        }
      }
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: ['image/png'],
    multiple: false,
    maxFiles: 1,
    minSize: 67,
    maxSize: 5_242_880,
  })

  return (
    <>
      <div className="loading" hidden={state !== State.Loading}>
        <Loader type="Bars" color="#00BFFF" height={80} width={80} />
      </div>
      <div className="dropzone" hidden={state === State.Loading} {...getRootProps()}>
        <input {...getInputProps()} />
        <p className="help-text">Drag &amp; drop an image file here to shrink it.</p>
      </div>
      <div hidden={state !== State.Success}>
        <OptimizedImage
          url={downloadLink}
          originalSize={originalSize}
          optimizedSize={optimizedSize}
        />
      </div>
    </>
  );
}

type OptimizedImageProps = {
  url: string,
  originalSize: number,
  optimizedSize: number,
};

function OptimizedImage(props: OptimizedImageProps) {
  const {url, originalSize, optimizedSize} = props;
  return (
    <>
      <p id="optimized-title">Optimized image:</p>
      <a id="download-button" href="/" download="optimized.png">
        <div id="image-frame">
          <img id="optimized-image" src={url} alt="Optimized" />
          <p id="help-text">Click here to download</p>
        </div>
      </a>
      <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of original).</p>
    </>
  );
}

function Header() {
  return (
    <header>
      <h1>Picopic!</h1>
    </header>
  );
}

function App() {
  return (
    <>
      <Header />
      <Dropzone />
    </>
  );
}

export default App;
