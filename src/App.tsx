import React, {Fragment, useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import Loader from 'react-loader-spinner';

const baseUrl = 'https://pc1i9r5jx6.execute-api.eu-north-1.amazonaws.com';

function uploadImage(imageData: string | ArrayBuffer | null) {
  return fetch(`${baseUrl}/upload-url`)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Could not retrieve presigned URL for uploading the image.');
      }
      return response.json();
    })
    .then(data => {
      const formData = new FormData();
      const {fields} = data;
      for (const name in fields) {
        formData.append(name, fields[name]);
      }
      // @ts-ignore
      formData.append('file', new Blob([imageData]));
      return fetch(data.url, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      }).then(response => {
        if (response.status !== 204) {
          throw new Error(`Could not upload image (status ${response.status}).`);
        }
        return fields.key;
      });
    })
}

function downloadImage(key: string) {
  return fetch(`${baseUrl}/download-url/${key}`)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Could not retrieve URL for downloading the image.');
      }
      return response.json();
    })
    .then(({url}) => fetch(url))
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`Image optimization failed (status ${response.status})`);
      }
      return response.arrayBuffer();
    });
}

function Dropzone() {
  const [isLoading, setLoading] = useState(false);
  const [isOptimized, setOptimized] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const onDrop = useCallback((acceptedFiles) => {
    setLoading(true);
    setOptimized(false);
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onabort = () => {
        setLoading(false);
        setOptimized(false);
      };
      reader.onerror = reader.onabort;
      reader.onload = () => {
        const data = reader.result;
        if (data instanceof ArrayBuffer) {
          setOriginalSize(data.byteLength);
        }
        uploadImage(data)
          .then(downloadImage)
          .then(value => {
            // @ts-ignore
            const url = URL.createObjectURL(
              // @ts-ignore
              new Blob([value], {type: 'image/png'})
            );
            setOptimizedSize(value.byteLength);
            // @ts-ignore
            document.getElementById('optimized-image').src = url;
            // @ts-ignore
            document.getElementById('download-button').href = url;
            setLoading(false);
            setOptimized(true);
          })
          .catch((error) => {
            console.error('An error occurred while processing image:', error)
            setLoading(false);
            setOptimized(false);
          });
      }
      reader.readAsArrayBuffer(file);
    })

  }, []);
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <div>
      {isLoading ? <div className="loading"><Loader type="Bars" color="#00BFFF" height={80} width={80} /></div> : <Fragment/>}
      {
        isLoading
          ? <div/>
          : <div {...getRootProps()} className="dropzone"><input {...getInputProps()} /><p>Drag & drop an image file here to shrink it.</p></div>
      }
      <div className={isOptimized ? "visible" : "hidden"}>
        <p id="optimized-title">Optimized image:</p>
        <a id="download-button" href="/" download="optimized.png">
          <div id="image-frame">
            <img id="optimized-image" src="/" alt="Optimized" />
          </div>
        </a>
        <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of original).</p>
        <p id="help-text">Click above to download.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <header className="App-header">
        <h1>Picopic!</h1>
      </header>
      <Dropzone />
    </div>
  );
}

export default App;
