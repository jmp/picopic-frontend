import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Result, ResultProps} from './Result';
import {Loader} from './Loader';
import {Help} from './Help';
import {Optimizer} from '../optimization/optimizer/optimizer';
import {AwsOptimizer} from '../optimization/optimizer/aws-optimizer';

type DropzoneProps = {
  state: OptimizationState,
  result: OptimizationResult,
  optimizer: Optimizer,
};

export enum OptimizationState {
  Ready,
  Loading,
  Success,
  Failure,
}

export type OptimizationResult = ResultProps;

const options = {
  accept: ['image/png'],
  multiple: false,
  maxFiles: 1,
  minSize: 67,
  maxSize: 5_242_880,
};

export function Dropzone(props: DropzoneProps) {
  const {optimizer} = props;
  const [state, setState] = useState(props.state);
  const [result, setResult] = useState(props.result);
  const onDrop = useCallback((files: File[]) => {
    setState(OptimizationState.Loading);
    files.forEach(async (file: File) => {
      try {
        const result = await optimizer.optimize(file);
        setResult(result);
        setState(OptimizationState.Success)
      } catch (e) {
        console.error('Failed to process image:', e);
        setState(OptimizationState.Failure);
      }
    });
  }, [optimizer]);
  const {getRootProps, getInputProps} = useDropzone({...options, onDrop});
  return (
    <>
      <Loader hidden={state !== OptimizationState.Loading} />
      <div title="File" className="dropzone" hidden={state === OptimizationState.Loading} {...getRootProps()}>
        <input alt="File" {...getInputProps()} />
        <Help>Drag &amp; drop an image file here to shrink it.</Help>
      </div>
      <Result {...result} />
    </>
  );
}

Dropzone.defaultProps = {
  state: OptimizationState.Ready,
  result: {
    optimizedUrl: '',
    originalSize: 0,
    optimizedSize: 0,
  },
  optimizer: new AwsOptimizer(),
};