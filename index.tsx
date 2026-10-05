
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import CodeGate, { getAccessState, AccessState } from './components/CodeGate';

const showLockedScreen = () => {
  document.title = '';
  document.documentElement.style.background = '#ffffff';
  document.body.style.background = '#ffffff';
};

const Root: React.FC = () => {
  const [access, setAccess] = useState<AccessState>(getAccessState);

  if (access === 'locked') return null;
  if (access === 'pending') {
    return (
      <CodeGate
        onUnlock={() => setAccess('granted')}
        onLock={() => {
          showLockedScreen();
          setAccess('locked');
        }}
      />
    );
  }
  return <App />;
};

const init = () => {
  const container = document.getElementById('root');
  if (container) {
    if (getAccessState() === 'locked') {
      showLockedScreen();
      return;
    }
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>
    );
  } else {
    console.error("Critical Error: Could not find root element with ID 'root'");
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
