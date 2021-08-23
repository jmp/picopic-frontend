import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app name', () => {
    render(<App />);
    const name = screen.getByText(/picopic/i);
    expect(name).toBeInTheDocument();
  });
});
