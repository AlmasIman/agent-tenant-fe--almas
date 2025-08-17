import App from './App';
import './i18n';
import 'config/config';
import { Provider } from 'react-redux';
import { store } from '@app/store/store';
import { createRoot } from 'react-dom/client';
import React from 'react';

// interface EventTarget {
//   state?: 'activated';
// }

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
