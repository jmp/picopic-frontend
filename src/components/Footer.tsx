import React from 'react';
import {commit} from '../git-info.json';

export function Footer() {
  return (
    <div className="footer">
      {commit}
    </div>
  );
}