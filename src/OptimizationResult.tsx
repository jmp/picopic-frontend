import React from "react";

type OptimizationResultProps = {
  url: string,
  originalSize: number,
  optimizedSize: number,
};

export function OptimizationResult(props: OptimizationResultProps) {
  const {url, originalSize, optimizedSize} = props;
  return (
    <>
      <p id="optimized-title">Optimized image:</p>
      <a id="download-button" href={url} download="optimized.png">
        <div id="image-frame">
          <img id="optimized-image" src={url} alt="Optimized"/>
          <p id="help-text">Click here to download</p>
        </div>
      </a>
      <p>Size reduced {originalSize}B → {optimizedSize}B ({(optimizedSize / originalSize * 100).toFixed(1)}% of
        original).</p>
    </>
  );
}