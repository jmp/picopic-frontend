import React from 'react';
import {render, screen} from '@testing-library/react';
import {Dropzone} from './Dropzone';

describe('Dropzone', () => {
  it('shows a file input field when not hidden', () => {
    render(<Dropzone onDrop={() => {}} />);
    expect(screen.queryByRole("form")).not.toBeNull();
  });

  it('does not show a file input field when loading', () => {
    render(<Dropzone onDrop={() => {}} hidden />);
    expect(screen.queryByRole("form")).toBeNull();
  });

  it('renders children', () => {
    render(<Dropzone onDrop={() => {}}><p>Testing</p></Dropzone>);
    expect(screen.getByText("Testing")).toBeInTheDocument();
  });
});
