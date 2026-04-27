import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './components/FirebaseProvider';
import { TranslationProvider } from './components/TranslationProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </FirebaseProvider>
  </StrictMode>,
);
