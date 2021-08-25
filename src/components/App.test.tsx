import React from 'react';
import { render, screen } from '@testing-library/react';
import App, {OptimizationState} from './App';

describe('App', () => {
  it('renders the app name', () => {
    render(<App />);
    const name = screen.getByText(/picopic/i);
    expect(name).toBeInTheDocument();
  });

  it('renders a file input field', () => {
    render(<App state={OptimizationState.Ready} />);
    expect(screen.getByAltText(/file/i)).toBeInTheDocument();
  });

  it('shows a help text when not loading', () => {
    render(<App state={OptimizationState.Ready} />);
    const text = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(text).toBeVisible();
  });

  it('does not show a help text when loading', () => {
    render(<App state={OptimizationState.Loading} />);
    const text = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(text).not.toBeVisible();
  });

  it('shows the results on success', () => {
    render(<App state={OptimizationState.Success} />);
    expect(screen.getByTitle(/result/i)).toBeVisible();
  });

  it('does not show the results when ready', () => {
    render(<App state={OptimizationState.Ready} />);
    expect(screen.getByTitle(/result/i)).not.toBeVisible();
  });

  it('does not show a loading indicator when not loading', () => {
    render(<App state={OptimizationState.Ready} />);
    expect(screen.getByTitle(/loading/i)).not.toBeVisible();
  });

  it('shows a loading indicator when loading', () => {
    render(<App state={OptimizationState.Loading} />);
    expect(screen.getByTitle(/loading/i)).toBeVisible();
  });
});
