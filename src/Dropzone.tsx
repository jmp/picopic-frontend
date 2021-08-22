import React, {useCallback, useState} from "react";
import {processFile} from "./optimizing/process";
import {useDropzone} from "react-dropzone";
import Loader from "react-loader-spinner";
import {OptimizationResult} from "./OptimizationResult";

enum State {
  Ready,
  Loading,
  Success,
  Failure,
  Aborted,
}

export function Dropzone() {
  const [downloadLink, setDownloadUrl] = useState('/');
  const [state, setState] = useState(State.Ready);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('File selected.');
    setState(State.Loading);
    acceptedFiles.forEach((file: File) => {
      processFile(
        file,
        ({originalSize, optimizedSize, downloadUrl}) => {
          setState(State.Success);
          setOriginalSize(originalSize);
          setOptimizedSize(optimizedSize);
          setDownloadUrl(downloadUrl);
        },
        (error) => {
          console.error('Failed to process image:', error);
          setState(State.Failure);
        },
        () => setState(State.Aborted),
      );
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
        <Loader type="Bars" color="#00BFFF" height={80} width={80}/>
      </div>
      <div className="dropzone" hidden={state === State.Loading} {...getRootProps()}>
        <input alt="File" {...getInputProps()} />
        <p className="help-text">Drag &amp; drop an image file here to shrink it.</p>
      </div>
      <div hidden={state !== State.Success}>
        <OptimizationResult
          url={downloadLink}
          originalSize={originalSize}
          optimizedSize={optimizedSize}
        />
      </div>
    </>
  );
}