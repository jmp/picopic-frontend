import React from 'react';
import { render, screen } from '@testing-library/react';
import {Error} from './Error';

describe('Error', () => {
  it('renders the given children', () => {
    const content = 'Testing';
    render(<Error>{content}</Error>);
    expect(screen.getByText(content)).toBeInTheDocument();
  });
});
