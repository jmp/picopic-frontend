import React from 'react';
import { render, screen } from '@testing-library/react';
import {Result} from './Result';

describe('Result', () => {
  it('renders a download link', () => {
    const url = 'http://localhost:52173/dummy-url';
    render(<Result downloadUrl={url} originalSize={10} optimizedSize={5} />);
    const link = screen.getByText(/download/i).closest('a');
    expect(link).toHaveAttribute('href', url);
  });

  it('renders statistics', () => {
    render(<Result downloadUrl="/" originalSize={52_969} optimizedSize={17_137} />);
    const name = screen.getByText("Size reduced 52,969 → 17,137 bytes (32.4% of original).");
    expect(name).toBeInTheDocument();
  });
});
