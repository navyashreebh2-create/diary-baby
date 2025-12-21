'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error });
        return;
      }

      router.push('/diary');
    } catch (error) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 animate-gradient-shift">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent animate-glow">
            DiaryBaby
          </h1>
          <p className="text-gray-600 text-lg">Your private, gentle diary companion</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-rose-200/50 p-8 border border-rose-100/50 hover:shadow-rose-300/50 transition-all duration-700">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50 rounded-2xl text-rose-600 text-sm animate-slide-down">
                {errors.form}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 rounded-2xl border-2 ${
                    errors.email
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-gray-200 bg-white/50 focus:border-rose-400'
                  } focus:ring-2 focus:ring-rose-400/20 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg`}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-600 animate-fade-in">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-4 rounded-2xl border-2 ${
                    errors.password
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-gray-200 bg-white/50 focus:border-rose-400'
                  } focus:ring-2 focus:ring-rose-400/20 focus:border-transparent transition-all duration-300 hover:bg-white focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg`}
                  placeholder="Your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-600 animate-fade-in">{errors.password}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-rose-300/50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200 hover:underline underline-offset-2"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}