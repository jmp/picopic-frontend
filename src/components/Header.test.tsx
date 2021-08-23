import React from 'react';
import { render, screen } from '@testing-library/react';
import {Header} from './Header';

describe('Header', () => {
  it('renders the given title', () => {
    const title = 'Testing';
    render(<Header title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
