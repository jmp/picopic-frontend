import React from 'react';

type ErrorProps = {
  children: any,
  hidden: boolean,
};

export function Error({children, hidden}: ErrorProps) {
  return (
    <div hidden={hidden} className="error">
      <div className="error-title">Oops!</div>
      {children}
    </div>
  );
}