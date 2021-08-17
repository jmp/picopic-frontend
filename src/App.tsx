import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import Loader from 'react-loader-spinner';

const baseUrl = 'https://api.picopic.io';

async function uploadImage(imageData: ArrayBuffer) {
  console.log('Uploading image.');
  console.log('Fetching upload URL.');
  const response = await fetch(`${baseUrl}/upload-url`, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error('Could not retrieve presigned URL for uploading the image.');
  }
  const {url, fields} = await response.json();
  console.log('Received upload:', url);
  const formData = constructFormData(imageData, fields);
  await submitFormData(url, formData);
  return fields.key;
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
  const {url} = await response.json();
  return url;
}

async function downloadImage(key: string) {
  console.log('Downloading image.');
  const url = await fetchDownloadUrl(key);
  const response = await fetch(url, {mode: 'cors'});
  if (response.status !== 200) {
    throw new Error(`Image optimization failed (status ${response.status}).`);
  }
  return await response.arrayBuffer();
}

async function processImage(imageData: ArrayBuffer) {
  console.log('Processing image.');
  const url = await uploadImage(imageData);
  return await downloadImage(url);
}

function Dropzone() {
  const [downloadLink, setDownloadLink] = useState('/');
  const [isLoading, setLoading] = useState(false);
  const [isOptimized, setOptimized] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const onDrop = useCallback(acceptedFiles => {
    console.log('File selected.');
    setLoading(true);
    setOptimized(false);
    const file: File = acceptedFiles[0];
    const reader = new FileReader();
    reader.onabort = () => {
      setLoading(false);
      setOptimized(false);
    };
    reader.onerror = reader.onabort;
    reader.onload = () => {
      console.log('Loading started.');
      const imageData = reader.result;
      if (imageData instanceof ArrayBuffer) {
        setOriginalSize(imageData.byteLength);
      } else {
        setLoading(false);
        setOptimized(false);
        console.error('Data is not an ArrayBuffer!');
        return;
      }
      console.log('Starting image processing.');
      processImage(imageData)
        .then(optimizedData => {
          const blob = new Blob([optimizedData], {type: 'image/png'});
          const url = URL.createObjectURL(blob);
          setOptimizedSize(optimizedData.byteLength);
          setDownloadLink(url);
          console.info('Image optimization finished.')
          setOptimized(true);
        })
        .catch(error => {
          console.error('An error occurred while processing image:', error)
          setOptimized(false);
        })
        .finally(() => {
          setLoading(false);
        })
    }
    reader.readAsArrayBuffer(file);
  }, []);
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <>
      <div className="loading" hidden={!isLoading}>
        <Loader type="Bars" color="#00BFFF" height={80} width={80} visible={isLoading} />
      </div>
      <div className="dropzone" hidden={isLoading} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag & drop an image file here to shrink it.</p>
      </div>
      <div className={isOptimized ? "visible" : "hidden"}>
        <OptimizedImage url={downloadLink} originalSize={originalSize} optimizedSize={optimizedSize} />
      </div>
    </>
  );
}

type OptimizedImageProps = {
  url: string,
  originalSize: number,
  optimizedSize: number
};

function OptimizedImage(props: OptimizedImageProps) {
  const {url, originalSize, optimizedSize} = props;
  return (
    <>
      <p id="optimized-title">Optimized image:</p>
      <a id="download-button" href="/" download="optimized.png">
        <div id="image-frame">
          <img id="optimized-image" src={url} alt="Optimized" />
        </div>
      </a>
      <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of original).</p>
      <p id="help-text">Click above to download.</p>
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
