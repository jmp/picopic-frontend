import React, {useCallback, useState} from 'react';
import {Dropzone} from './Dropzone';
import {Header} from './Header';
import {OptimizationResult, Optimizer} from '../application/optimizer';
import {Result} from './Result';
import {Loader} from './Loader';
import {Help} from './Help';
import {Error} from './Error';
import {uploadImage} from '../application/upload';
import {downloadImage} from '../application/download';
import {Footer} from './Footer';

type AppProps = {
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

export function App(props: AppProps) {
  const [error, setError] = useState(null);
  const [state, setState] = useState(props.state);
  const [result, setResult] = useState(props.result);
  const onDrop = useCallback((files: File[]) => {
    setState(OptimizationState.Loading);
    files.forEach(async (file: File) => {
      try {
        const result = await props.optimizer.optimize(file);
        setResult(result);
        setState(OptimizationState.Success)
      } catch (e: any) {
        setState(OptimizationState.Failure);
        setError(e.message);
      }
    });
  }, [props.optimizer]);
  return (
    <>
      <Header title="Picopic!" />
      <Loader hidden={state !== OptimizationState.Loading} />
      <Dropzone hidden={state === OptimizationState.Loading} onDrop={onDrop}>
        <Help>Drag &amp; drop an image file here to shrink it.</Help>
      </Dropzone>
      <Result hidden={state !== OptimizationState.Success} {...result} />
      <Error hidden={state !== OptimizationState.Failure}>{error}</Error>
      <Footer />
    </>
  );
}

App.defaultProps = {
  state: OptimizationState.Ready,
  result: {
    optimizedUrl: '',
    originalSize: 0,
    optimizedSize: 0,
  },
  optimizer: new Optimizer(uploadImage, downloadImage),
};

export default App;
