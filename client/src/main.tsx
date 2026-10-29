import { createRoot } from 'react-dom/client';
import App from './App.js';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';

createRoot(document.getElementById('root')!).render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>,
);
