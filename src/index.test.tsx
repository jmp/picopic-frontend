import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('App root', () => {
  it('renders without crashing', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    require('./index.tsx');
    expect(ReactDOM.render).toHaveBeenCalledWith(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      root,
    );
  });
});
