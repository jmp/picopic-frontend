import React from 'react';
import { render, screen } from '@testing-library/react';
import {Help} from './Help';

describe('Help', () => {
  it('renders the given children', () => {
    const content = 'Testing';
    render(<Help>{content}</Help>);
    expect(screen.getByText(content)).toBeInTheDocument();
  });
});
