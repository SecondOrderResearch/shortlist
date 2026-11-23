import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    fetch(`${base}/api/ping`)
      .then((r) => r.json())
      .then((data) => {
        setStatus('ok');
        setMessage(data.message || 'ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <Router>
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-ink">ShortList</h1>
        <nav className="mt-8 mb-6 flex gap-2">
          <Link to="/login" className="px-4 py-2 rounded text-ink hover:text-accent">Login</Link>
          <Link to="/register" className="px-4 py-2 rounded text-ink hover:text-accent">Register</Link>
        </nav>
        <div className="flex-1 w-full max-w-2xl">
          {status === 'loading' && <p>Loading...</p>}
          {status === 'ok' && <p>{message}</p>}
        </div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </Router>
  );
}