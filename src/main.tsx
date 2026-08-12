import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party browser extension errors (e.g. MetaMask / Web3 script injections)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('MetaMask') ||
        event.reason.message?.includes('ethereum') ||
        event.reason.message?.includes('web3') ||
        event.reason?.code === 4001)
    ) {
      event.preventDefault();
      console.warn('Suppressed third-party extension rejection:', event.reason);
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('MetaMask') ||
      event.message?.includes('ethereum') ||
      event.message?.includes('web3')
    ) {
      event.preventDefault();
      console.warn('Suppressed third-party extension error:', event.message);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

