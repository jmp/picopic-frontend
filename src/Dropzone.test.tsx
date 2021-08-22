import React from 'react';
import {render, screen} from '@testing-library/react';
import {Dropzone, State} from './Dropzone';

describe('Dropzone', () => {
  it('shows a file input field when not loading', () => {
    render(<Dropzone state={State.Ready} />);
    expect(screen.getByTitle(/file/i)).toBeVisible();
  });

  it('does not show a file input field when loading', () => {
    render(<Dropzone state={State.Loading} />);
    expect(screen.getByTitle(/file/i)).not.toBeVisible();
  });

  it('shows a help text when not loading', () => {
    render(<Dropzone state={State.Ready} />);
    const text = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(text).toBeVisible();
  });

  it('does not show a help text when loading', () => {
    render(<Dropzone state={State.Loading} />);
    const text = screen.getByText(/drag & drop an image file here to shrink it/i);
    expect(text).not.toBeVisible();
  });

  it('shows the results on success', () => {
    render(<Dropzone state={State.Success} />);
    expect(screen.getByTitle(/result/i)).toBeVisible();
  });

  it('does not show the results when ready', () => {
    render(<Dropzone state={State.Ready} />);
    expect(screen.getByTitle(/result/i)).not.toBeVisible();
  });

  it('does not show a loading indicator when not loading', () => {
    render(<Dropzone state={State.Ready} />);
    expect(screen.getByTitle(/loading/i)).not.toBeVisible();
  });

  it('shows a loading indicator when loading', () => {
    render(<Dropzone state={State.Loading} />);
    expect(screen.getByTitle(/loading/i)).toBeVisible();
  });
});
