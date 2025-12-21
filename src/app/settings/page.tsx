'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey('•'.repeat(16));
    }
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!response.ok) {
        router.push('/login');
        return;
      }

      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('•')) {
      setApiKey('');
    } else {
      setApiKey(value);
    }
    setMessage('');
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim() && !apiKey.startsWith('•')) {
      setMessage('Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    try {
      if (apiKey.startsWith('•')) {
        localStorage.removeItem('openai_api_key');
        setApiKey('');
        setMessage('API key removed successfully');
      } else {
        localStorage.setItem('openai_api_key', apiKey.trim());
        setApiKey('•'.repeat(16));
        setMessage('API key saved successfully');
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 animate-gradient-shift">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-rose-200/50 border-t-rose-500 rounded-full animate-spin mb-6"></div>
          <h1 className="text-2xl font-light text-rose-600 mb-2">Loading settings...</h1>
          <p className="text-gray-600">Preparing your personal space</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 animate-gradient-shift">
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
        <div className="mb-8">
          <Link
            href="/diary"
            className="inline-flex items-center text-rose-600 hover:text-rose-700 mb-4 transition-colors duration-200 hover:underline underline-offset-2"
          >
            ← Back to diary
          </Link>
          <h1 className="text-4xl font-light bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your personal diary space</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-rose-200/50 p-8 border border-rose-100/50 hover:shadow-rose-300/50 transition-all duration-700">
            <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-2xl">👤</span>
              Account Information
            </h2>

            {user && (
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>📝</span>
                    Name
                  </label>
                  <p className="text-gray-900 text-lg">{user.name}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>✉️</span>
                    Email
                  </label>
                  <p className="text-gray-900 text-lg">{user.email}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>📅</span>
                    Member since
                  </label>
                  <p className="text-gray-900 text-lg">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-rose-200/50 p-8 border border-rose-100/50 hover:shadow-rose-300/50 transition-all duration-700">
            <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-2xl">🔑</span>
              OpenAI API Key
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="text-blue-600 font-medium">💡 Security notice:</span> Your OpenAI API key is stored locally in your browser and is never sent to our servers.
                  It's used only to generate AI responses for your diary entries.
                </p>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-3">
                  API Key
                </label>
                <div className="flex gap-3">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="sk-proj-..."
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white/50 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/50 transition-all duration-300 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-6 py-4 text-gray-600 hover:text-rose-600 border-2 border-gray-200 hover:border-rose-300 rounded-2xl hover:bg-rose-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {showApiKey ? '👁️ Hide' : '👁️ Show'}
                  </button>
                </div>
              </div>

              {message && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl text-green-700 text-sm animate-slide-down">
                  {message}
                </div>
              )}

              <button
                onClick={handleSaveApiKey}
                disabled={isSaving}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-rose-300/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>💾</span>
                    Save API Key
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-rose-200/50 p-8 border border-rose-100/50 hover:shadow-rose-300/50 transition-all duration-700">
            <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-2xl">🚪</span>
              Session
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Sign out of your account on this device. You can always come back and sign in again later.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-300/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <span>👋</span>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}