import { useEffect, useState } from 'react';

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-ink">ShortList</h1>
      <p className="mt-4 text-lg text-neutral-600">Menu Intelligence &amp; Decision Platform</p>
      <p className="mt-6 text-sm text-neutral-500">
        Status: <span className={status === 'ok' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-neutral-500'}>{status}</span>
      </p>
      {status === 'ok' && <p className="mt-2 text-lg text-accent">{message}</p>}
    </main>
  );
}
