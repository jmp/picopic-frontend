import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import './App.css';

const baseUrl = "https://pc1i9r5jx6.execute-api.eu-north-1.amazonaws.com";

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
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;
        console.log(binaryStr);
        /*
        // @ts-ignore
        document.getElementById('original-image').src = URL.createObjectURL(
          // @ts-ignore
          new Blob([binaryStr], {type: 'image/png'})
        );
        */
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
            // @ts-ignore
            document.getElementById('optimized-image').src = url;
            // @ts-ignore
            document.getElementById('download-button').href = url;
          });
      }
      reader.readAsArrayBuffer(file);
    })

  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <div className="Dropzone" {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop an image file here to optimize it.</p>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Picopic!</h1>
        <Dropzone />
        <p>Optimized image:</p>
        <img id="optimized-image" alt="Optimized" />
        <a id="download-button" href="/" download="optimized.png">Download Image</a>
      </header>
    </div>
  );
}

export default App;
