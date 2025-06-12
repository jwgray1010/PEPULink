import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('renders Home icon in nav bar as a link to home', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Find the home icon by alt text
  const homeIcon = screen.getByAltText(/home/i);
  expect(homeIcon).toBeInTheDocument();
  // The home icon should be inside a link to "/"
  const homeLink = homeIcon.closest('a');
  expect(homeLink).toBeInTheDocument();
  expect(homeLink).toHaveAttribute('href', '/');
});
