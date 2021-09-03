import React from 'react';
import { render, screen } from '@testing-library/react';
import {Error} from './Error';

describe('Error', () => {
  it('shows the given children when not hidden', () => {
    const content = 'This should be visible';
    render(<Error hidden={false}>{content}</Error>);
    expect(screen.getByText(content)).toBeVisible();
  });

  it('does not show the given children when hidden', () => {
    const content = 'This should not be visible';
    render(<Error hidden>{content}</Error>);
    expect(screen.getByText(content)).not.toBeVisible();
  });
});
