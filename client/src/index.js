import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';
import './index.scss';
import App from './App';
import { Provider } from 'react-redux';
import store from './store'; // Ensure you have a store.js or equivalent

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
