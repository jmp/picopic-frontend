import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app name', () => {
    render(<App />);
    const name = screen.getByText(/picopic/i);
    expect(name).toBeInTheDocument();
  });

  it('renders an input field for upload a file', () => {
    render(<App />);
    const input = screen.getByAltText(/file/i);
    expect(input).toBeInTheDocument();
  });

  it('renders the help text', () => {
    render(<App />);
    const input = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(input).toBeInTheDocument();
  });
});
