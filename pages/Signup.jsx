import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { handleInternalNav, navigateTo } from '../utils/navigation';

const Signup = () => {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigateTo('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign up.');
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Sign Up</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
            />
          </div>
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
            placeholder="Password (min 6 chars)"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-mono text-xs uppercase tracking-widest"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account? <a href="/login" onClick={handleInternalNav('/login')} className="text-indigo-600 dark:text-indigo-400">Login</a>
          </p>
        </form>
      </div>
    </section>
  );
};

export { Signup };
