import React, {Fragment, useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import Loader from 'react-loader-spinner';

const baseUrl = 'https://pc1i9r5jx6.execute-api.eu-north-1.amazonaws.com';

function uploadImage(imageData: string | ArrayBuffer | null) {
  return fetch(`${baseUrl}/upload-url`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const formData = new FormData();
      const {fields} = data;
      for (const name in fields) {
        formData.append(name, fields[name]);
      }
      // @ts-ignore
      formData.append('file', new Blob([imageData]));
      console.log('Form data:', formData);
      return fetch(data.url, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      }).then(() => fields.key);
    })
}

function downloadImage(key: string) {
  console.log('Fetching download URL for image with key', key);
  return fetch(`${baseUrl}/download-url/${key}`)
    .then(response => response.json())
    .then(({url}) => {
      console.log("Got download URL:", url);
      return fetch(url);
    })
    .then(response => {
      console.log("Download response:", response);
      return response.arrayBuffer();
    })
    .then(data => {
      console.log("Image downloaded:", data);
      return data;
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
        const binaryStr = reader.result;
        console.log(binaryStr);
        if (binaryStr instanceof ArrayBuffer) {
          setOriginalSize(binaryStr.byteLength);
        }
        uploadImage(binaryStr)
          .then(key => {
            console.log('Image uploaded with key', key);
            return downloadImage(key);
          })
          .then((value) => {
            console.log("Value:", value);
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
          ? <Fragment/>
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
    <Fragment>
      <header className="App-header">
        <h1>Picopic!</h1>
      </header>
      <Dropzone />
    </Fragment>
  );
}

export default App;
