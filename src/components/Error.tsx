import React from 'react';

type ErrorProps = {
  children: any,
  hidden: boolean,
};

export function Error({children, hidden}: ErrorProps) {
  return (
    <p hidden={hidden} className="error">
      {children}
    </p>
  );
}