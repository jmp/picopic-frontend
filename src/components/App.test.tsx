import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import App, {OptimizationState} from './App';
import {Optimizer} from '../optimization/optimizer';

describe('App', () => {
  const downloadUrl = 'http://localhost/fake-download-url';

  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => downloadUrl);
  });

  afterEach(() => {
    // @ts-ignore
    window.URL.createObjectURL.mockReset();
  });

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
    const expectedKey = '570084b01d3a49baa1e39b61fd5690d3';
    const expectedImageData = new ArrayBuffer(512);
    const optimizedImageData = new ArrayBuffer(256);
    const image = new File([expectedImageData], 'tmp.png', {type: 'image/png' });
    const uploadImage = async (imageData: ArrayBuffer) => {
      expect(imageData).toEqual(expectedImageData);
      return expectedKey;
    };
    const downloadImage = async (key: string) => {
      expect(key).toEqual(expectedKey);
      return optimizedImageData;
    };
    const optimizer = new Optimizer(uploadImage, downloadImage);
    render(<App optimizer={optimizer} />);
    const input = screen.getByAltText(/file/i);
    Object.defineProperty(input, 'files', {value: [image]});
    fireEvent.change(input);
    await waitFor(() => expect(
      screen.getByText("Size reduced 512B → 256B (50.0% of original).")
    ).toBeVisible());
  });

  it('stops loading if optimizing an image fails', async () => {
    const expectedError = 'Something failed!';
    const image = new File([new ArrayBuffer(512)], 'tmp.png', {type: 'image/png' });
    const uploadImage = async () => { throw new Error(expectedError); };
    const downloadImage = async () => new ArrayBuffer(0);
    const optimizer = new Optimizer(uploadImage, downloadImage);
    render(<App optimizer={optimizer} />);
    const input = screen.getByAltText(/file/i);
    Object.defineProperty(input, 'files', {value: [image]});
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByText(expectedError)).toBeVisible());
  });
});
