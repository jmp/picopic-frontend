import React from 'react';
import {render, screen} from '@testing-library/react';
import {Footer} from './Footer';

describe('Footer', () => {
  it('shows commit from git-info.json', () => {
    render(<Footer />);
    expect(screen.getByText('dev')).toBeVisible();
  });
});
