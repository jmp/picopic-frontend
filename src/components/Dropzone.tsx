import React from 'react';
import {useDropzone} from 'react-dropzone';

type DropzoneProps = {
  onDrop: (files: File[]) => void,
  children: any,
  hidden: boolean,
};

const dropzoneOptions = {
  accept: ['image/png'],
  multiple: false,
  maxFiles: 1,
  minSize: 67,
  maxSize: 5_242_880,
};

export function Dropzone(props: DropzoneProps) {
  const {onDrop, children, hidden} = props;
  const {getRootProps, getInputProps} = useDropzone({...dropzoneOptions, onDrop});
  return (
    <div role="form" hidden={hidden} className="dropzone" {...getRootProps()}>
      <input alt="File" {...getInputProps()} />
      {children}
    </div>
  );
}

Dropzone.defaultProps = {
  children: null,
  hidden: false,
};