import React from 'react';
import { render, screen } from '@testing-library/react';
import {Loader} from './Loader';

describe('Loader', () => {
  it('shows a loading indicator when not hidden', () => {
    render(<Loader />);
    const spinner = screen.getByTitle(/loading/i);
    expect(spinner).toBeVisible();
  });

  it('does not show a loading indicator when hidden', () => {
    render(<Loader hidden />);
    const spinner = screen.getByTitle(/loading/i);
    expect(spinner).not.toBeVisible();
  });
});
