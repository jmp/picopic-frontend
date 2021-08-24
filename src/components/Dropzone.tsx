import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Result, ResultProps} from './Result';
import {Loader} from './Loader';
import {Help} from './Help';
import {Optimizer} from '../optimization/optimizer';
import {AwsOptimizer} from '../optimization/aws-optimizer';

type DropzoneProps = {
  state: State,
  result: ResultProps,
  optimizer: Optimizer,
};

export enum State {
  Ready,
  Loading,
  Success,
  Failure,
}

export function Dropzone(props: DropzoneProps) {
  const optimizer = props.optimizer;
  const [state, setState] = useState(props.state);
  const [result, setResult] = useState(props.result);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setState(State.Loading);
    acceptedFiles.forEach(async (file: File) => {
      try {
        const result = await optimizer.optimize(file);
        setState(State.Success);
        setResult(result);
      } catch (e) {
        console.error('Failed to process image:', e);
        setState(State.Failure);
      }
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
      <Loader hidden={state !== State.Loading} />
      <div title="File" className="dropzone" hidden={state === State.Loading} {...getRootProps()}>
        <input alt="File" {...getInputProps()} />
        <Help>Drag &amp; drop an image file here to shrink it.</Help>
      </div>
      <Result {...result} hidden={state !== State.Success} />
    </>
  );
}

Dropzone.defaultProps = {
  state: State.Ready,
  result: {url: '', originalSize: 0, optimizedSize: 0},
  optimizer: new AwsOptimizer(),
};