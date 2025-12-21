'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DiaryEntry {
  id: string;
  content: string;
  aiReply: string;
  createdAt: string;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/diary');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        setError('Failed to load entries');
        return;
      }

      setEntries(data.entries || []);
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim()) {
      setError('Please write something before submitting');
      return;
    }

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      setError('Please set up your OpenAI API key in settings first');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentEntry.trim(),
          openaiApiKey: apiKey
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        setError(data.error || 'Failed to save entry');
        return;
      }

      setEntries(prev => [data.entry, ...prev]);
      setAiReply(data.entry.aiReply);
      setCurrentEntry('');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 animate-gradient-shift">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-rose-200/50 border-t-rose-500 rounded-full animate-spin mb-6"></div>
          <h1 className="text-2xl font-light text-rose-600 mb-2">Loading your diary...</h1>
          <p className="text-gray-600">Preparing your personal space</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 animate-gradient-shift">
      <div className="min-h-screen flex">
        <aside className="w-80 bg-white/70 backdrop-blur-sm border-r border-rose-100/50 overflow-hidden flex flex-col animate-fade-in">
          <div className="p-6 border-b border-rose-100/50 bg-gradient-to-r from-white/80 to-rose-50/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              DiaryBaby
            </h1>
            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/settings"
                className="text-gray-600 hover:text-rose-600 text-sm transition-colors duration-200 hover:underline underline-offset-2"
              >
                ⚙️ Settings
              </Link>
              <form
                action="/api/auth/logout"
                method="POST"
                className="inline"
              >
                <button
                  type="submit"
                  className="text-gray-600 hover:text-rose-600 text-sm transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 diary-scrollbar">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-rose-400">📝</span>
              Previous Entries
            </h2>

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <span className="text-2xl">🌸</span>
                </div>
                <p className="text-gray-500 text-sm font-light">
                  No entries yet. Start writing your first entry!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gradient-to-r from-white/60 to-rose-50/40 rounded-2xl cursor-pointer hover:from-white/80 hover:to-rose-50/60 transition-all duration-300 hover:shadow-md hover:shadow-rose-200/50 border border-rose-100/30"
                  >
                    <p className="text-sm text-gray-700 line-clamp-2 font-medium">
                      {truncateContent(entry.content)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>🕐</span>
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col animate-fade-in">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-4xl font-light text-gray-800 mb-2">Write Your Entry</h2>
              <p className="text-gray-600">Share your thoughts, feelings, and reflections</p>
            </div>

            <div className="max-w-3xl">
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50 rounded-2xl text-rose-600 animate-slide-down">
                  {error}
                </div>
              )}

              <div className="mb-8">
                <textarea
                  value={currentEntry}
                  onChange={(e) => {
                    setCurrentEntry(e.target.value);
                    setError('');
                  }}
                  className="w-full px-6 py-5 rounded-3xl border-2 border-rose-100/50 bg-white/60 backdrop-blur-sm focus:border-rose-300 focus:ring-4 focus:ring-rose-200/50 transition-all duration-300 resize-none shadow-lg shadow-rose-200/30 hover:shadow-xl hover:shadow-rose-300/40 focus:shadow-2xl focus:shadow-rose-400/50 font-light text-gray-700 placeholder-gray-400"
                  style={{ height: '200px' }}
                  placeholder="How are you feeling today? What's on your mind? Take your time to write what's in your heart..."
                  disabled={isSubmitting}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !currentEntry.trim()}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-4 px-12 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-rose-300/50 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Writing to DiaryBaby...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    Write to DiaryBaby
                  </span>
                )}
              </button>

              {aiReply && (
                <div className="mt-12 animate-fade-in">
                  <div className="p-8 bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-white/40 rounded-3xl border border-rose-200/50 shadow-2xl shadow-rose-200/40 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg animate-pulse-soft">
                        💝
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-rose-600 mb-3">DiaryBaby's gentle response</h3>
                        <p className="text-gray-800 leading-relaxed text-lg font-light">{aiReply}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}