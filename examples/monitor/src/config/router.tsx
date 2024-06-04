import { Link, createBrowserRouter } from 'react-router-dom';
import App from '../App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div>
        <h1>Hello World</h1>
        <Link to="about">About Us</Link>
        <Link to="main">Main Us</Link>
        <Link to="app">App Us</Link>
      </div>
    ),
  },
  {
    path: 'about',
    element: (
      <div data-monitor-name="about">
        <h1>About</h1>
        <Link to="/main">to main</Link>
      </div>
    ),
  },
  {
    path: 'main',
    element: (
      <div data-monitor-name="main">
        <h1>main</h1>
        <Link to="/about">to about</Link>
      </div>
    ),
  },
  {
    path: 'app',
    element: <App />,
  },
]);
