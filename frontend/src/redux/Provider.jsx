// blog-application/frontend/src/redux/Provider.jsx
'use client'; // This must be a client component

import { Provider } from 'react-redux';
import store from './store/store';

// A component to wrap the entire app in the Redux Provider
export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}