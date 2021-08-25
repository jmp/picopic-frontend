import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import user from '@testing-library/user-event';
import App, {OptimizationState} from './App';
import {OptimizationResult, Optimizer} from '../optimization/optimizer/optimizer';

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

  it('optimizes the chosen image', async () => {
    const image = new File([new ArrayBuffer(512)], 'tmp.png', {type: 'image/png' });
    const expected = {downloadUrl: 'dummy', originalSize: 512, optimizedSize: 256};
    let imageToOptimize: File | null = null;
    let optimizationResult: OptimizationResult | null = null;
    const optimizer = new class implements Optimizer {
      async optimize(file: File): Promise<OptimizationResult> {
        imageToOptimize = file;
        optimizationResult = expected;
        return expected;
      }
    }();
    render(<App optimizer={optimizer} />);
    const input = screen.getByAltText(/file/i);
    Object.defineProperty(input, 'files', {value: [image]});
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByTitle(/loading/i)).not.toBeVisible());
    expect(imageToOptimize).toEqual(image);
    expect(optimizationResult).toEqual(expected);
  });

  it('stops loading if optimizing an image fails', async () => {
    const expectedError = 'Something failed!';
    const image = new File([new ArrayBuffer(512)], 'tmp.png', {type: 'image/png' });
    const optimizer = new class implements Optimizer {
      async optimize(file: File): Promise<OptimizationResult> {
        throw new Error(expectedError);
      }
    }();
    render(<App optimizer={optimizer} />);
    const input = screen.getByAltText(/file/i);
    Object.defineProperty(input, 'files', {value: [image]});
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByText(expectedError)).toBeVisible());
  });
});
