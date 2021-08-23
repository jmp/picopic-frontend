import React from 'react';

export type ResultProps = {
  url: string,
  originalSize: number,
  optimizedSize: number,
  hidden?: boolean,
};

export function Result(props: ResultProps) {
  const {url, originalSize, optimizedSize, hidden} = props;
  return (
    <div title="Result" hidden={hidden}>
      <p id="optimized-title">Optimized image:</p>
      <a id="download-button" href={url} download="optimized.png">
        <div id="image-frame">
          <img id="optimized-image" src={url} alt="Optimized"/>
          <p id="help-text">Click here to download</p>
        </div>
      </a>
      <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of
        original).</p>
    </div>
  );
}