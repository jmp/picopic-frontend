import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import App, {OptimizationState} from './App';
import {Optimizer} from '../application/optimizer';

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
    const text = screen.getByText(/select an image file to shrink it/i);
    expect(text).toBeVisible();
  });

  it('does not show a help text when loading', () => {
    render(<App state={OptimizationState.Loading} />);
    const text = screen.getByText(/select an image file to shrink it/i);
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
    const expectedKey = 'x6j6qFNQKw97WZa3HJGeM_4ow23oawyU47bF6VK_qaY';
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
      screen.getByText("Size reduced 512 → 256 bytes (50.0% of original).")
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

  it('shows an error if no compatible images were selected', async () => {
    const expectedError = 'Please select a PNG file smaller than 1 MB.';
    const image = new File([new ArrayBuffer(1_048_577)], 'tmp.png', {type: 'image/png' });
    const uploadImage = async () => { throw new Error(); };
    const downloadImage = async () => { throw new Error(); };
    const optimizer = new Optimizer(uploadImage, downloadImage);
    render(<App optimizer={optimizer} />);
    const input = screen.getByAltText(/file/i);
    Object.defineProperty(input, 'files', {value: [image]});
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByText(expectedError)).toBeVisible());
  });
});
