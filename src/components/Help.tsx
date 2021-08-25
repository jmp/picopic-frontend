import React from 'react';

type HelpProps = {
  children: any,
};

export function Help({children}: HelpProps) {
  return (
    <p className="help-text">
      {children}
    </p>
  );
}