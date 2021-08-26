import React from 'react';
import {OptimizationResult} from '../optimization/optimizer';

export type ResultProps = OptimizationResult & {
  hidden: boolean,
};

export function Result(props: ResultProps) {
  const {downloadUrl, originalSize, optimizedSize, hidden} = props;
  return (
    <div hidden={hidden} title="Result">
      <p id="optimized-title">Optimized image:</p>
      <a id="download-button" href={downloadUrl} download="optimized.png">
        <div id="image-frame">
          <img id="optimized-image" src={downloadUrl} alt="Optimized"/>
          <p id="help-text">Click here to download</p>
        </div>
      </a>
      <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of
        original).</p>
    </div>
  );
}

Result.defaultProps = {
  downloadUrl: '',
  originalSize: 0,
  optimizedSize: 0,
  hidden: false,
};