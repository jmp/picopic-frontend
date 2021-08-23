import React from 'react';
import { render, screen } from '@testing-library/react';
import {Result} from './Result';

describe('Result', () => {
  it('renders a download link', () => {
    const url = 'http://localhost:52173/dummy-url';
    render(<Result url={url} originalSize={10} optimizedSize={5} />);
    const link = screen.getByText(/download/i).closest('a');
    expect(link).toHaveAttribute('href', url);
  });

  it('renders statistics', () => {
    render(<Result url="/" originalSize={512} optimizedSize={386} />);
    const name = screen.getByText("Size reduced 512B → 386B (75.4% of original).");
    expect(name).toBeInTheDocument();
  });
});
