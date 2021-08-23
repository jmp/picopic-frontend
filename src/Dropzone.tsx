import React, {useCallback, useState} from "react";
import {processFile} from "./optimizing/process";
import {useDropzone} from "react-dropzone";
import {OptimizationResult, OptimizationResultProps} from "./OptimizationResult";
import {Loader} from './Loader';

type DropzoneProps = {
  state?: State,
  result?: OptimizationResultProps,
};

export enum State {
  Ready,
  Loading,
  Success,
  Failure,
  Aborted,
}

export function Dropzone(props: DropzoneProps = {
  state: State.Ready,
  result: {url: '', originalSize: 0, optimizedSize: 0},
}) {
  const {state: initialState, result: initialResult = {url: '', originalSize: 0, optimizedSize: 0}} = props;
  const [state, setState] = useState(initialState);
  const [result, setResult] = useState(initialResult);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('File selected.');
    setState(State.Loading);
    acceptedFiles.forEach((file: File) => {
      processFile(
        file,
        ({originalSize, optimizedSize, url}) => {
          setState(State.Success);
          setResult({url, originalSize, optimizedSize});
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
      <div title="Loading..." className="loading" hidden={state !== State.Loading}>
        <Loader />
      </div>
      <div title="File" className="dropzone" hidden={state === State.Loading} {...getRootProps()}>
        <input alt="File" {...getInputProps()} />
        <p className="help-text">Drag &amp; drop an image file here to shrink it.</p>
      </div>
      <div title="Result" hidden={state !== State.Success}>
        <OptimizationResult {...result} />
      </div>
    </>
  );
}