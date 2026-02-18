import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { handleInternalNav, navigateTo } from '../utils/navigation';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigateTo('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Login</h1>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-mono text-xs uppercase tracking-widest"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No account? <a href="/signup" onClick={handleInternalNav('/signup')} className="text-indigo-600 dark:text-indigo-400">Create one</a>
          </p>
        </form>
      </div>
    </section>
  );
};

export { Login };
