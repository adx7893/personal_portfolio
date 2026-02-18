import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white inline-flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Dashboard
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Welcome back, {user?.fullName || user?.firstName || 'User'}.
          </p>
        </div>
      </div>
    </section>
  );
};

export { Dashboard };
