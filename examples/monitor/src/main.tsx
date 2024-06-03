import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './config/router.tsx';
import Monitor from '@rr-utils/monitor';

const monitor = Monitor.init({
  internal: 5000,
  consumer: () => {},
});

(window as any).monitor = monitor;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
