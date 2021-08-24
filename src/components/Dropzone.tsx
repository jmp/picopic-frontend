import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Result, ResultProps} from './Result';
import {Loader} from './Loader';
import {Help} from './Help';
import {Optimizer} from '../optimization/optimizer/optimizer';
import {AwsOptimizer} from '../optimization/optimizer/aws-optimizer';

type DropzoneProps = {
  result: OptimizationResult,
  optimizer: Optimizer,
};

export enum OptimizationState {
  Ready,
  Loading,
  Success,
  Failure,
}

export type OptimizationResult = {
  state: OptimizationState,
  result: ResultProps,
};

const options = {
  accept: ['image/png'],
  multiple: false,
  maxFiles: 1,
  minSize: 67,
  maxSize: 5_242_880,
};

export function Dropzone(props: DropzoneProps) {
  const optimizer = props.optimizer;
  const [result, setResult] = useState(props.result);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setResult({...result, state: OptimizationState.Loading});
    acceptedFiles.forEach(async (file: File) => {
      try {
        const result = await optimizer.optimize(file);
        setResult({result, state: OptimizationState.Success});
      } catch (e) {
        console.error('Failed to process image:', e);
        setResult({...result, state: OptimizationState.Failure});
      }
    });
  }, [optimizer, result]);
  const {getRootProps, getInputProps} = useDropzone({...options, onDrop});
  return (
    <>
      <Loader hidden={result.state !== OptimizationState.Loading} />
      <div title="File" className="dropzone" hidden={result.state === OptimizationState.Loading} {...getRootProps()}>
        <input alt="File" {...getInputProps()} />
        <Help>Drag &amp; drop an image file here to shrink it.</Help>
      </div>
      <Result {...result.result} hidden={result.state !== OptimizationState.Success} />
    </>
  );
}

Dropzone.defaultProps = {
  result: {
    state: OptimizationState.Ready,
    result: {
      optimizedUrl: '',
      originalSize: 0,
      optimizedSize: 0,
      hidden: false,
    },
  },
  optimizer: new AwsOptimizer(),
};