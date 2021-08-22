import React from 'react';
import { render, screen } from '@testing-library/react';
import {OptimizationResult} from './OptimizationResult';

describe('OptimizationResult', () => {
  it('renders a download link', () => {
    const url = 'http://localhost:52173/dummy-url';
    render(<OptimizationResult url={url} originalSize={10} optimizedSize={5} />);
    const link = screen.getByText(/download/i).closest('a');
    expect(link).toHaveAttribute('href', url);
  });

  it('renders statistics', () => {
    render(<OptimizationResult url="/" originalSize={512} optimizedSize={386} />);
    const name = screen.getByText("Size reduced 512B → 386B (75.4% of original).");
    expect(name).toBeInTheDocument();
  });
});
