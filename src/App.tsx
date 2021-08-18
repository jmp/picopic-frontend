import React, {useCallback, useState} from 'react';
import Loader from 'react-loader-spinner';
import {useDropzone} from 'react-dropzone';
import {processImage} from './optimizing/process';

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

function App() {
  return (
    <>
      <header>
        <h1>Picopic!</h1>
      </header>
      <Dropzone />
    </>
  );
}

export default App;
