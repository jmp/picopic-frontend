import React from 'react';
import {render, screen} from '@testing-library/react';
import {Dropzone} from './Dropzone';

describe('Dropzone', () => {
  it('renders an input field for upload a file', () => {
    render(<Dropzone />);
    const input = screen.getByAltText(/file/i);
    expect(input).toBeInTheDocument();
  });

  it('renders the help text', () => {
    render(<Dropzone />);
    const input = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(input).toBeInTheDocument();
  });
});
