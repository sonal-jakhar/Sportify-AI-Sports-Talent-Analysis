/**
 * Signup.jsx
 * User signup page with email/password registration
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { signUp } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        setError(t('auth.error'));
        setLoading(false);
        return;
      }

      // Check password match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Check password length
      if (password.length < 6) {
        setError(t('auth.weakPassword'));
        setLoading(false);
        return;
      }

      // Sign up
      await signUp(email, password);
      
      // Show success toast
      showToast(t('auth.signupSuccess'), 'success');
      
      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = t('auth.error');
      if (err.code === 'auth/invalid-email') {
        errorMessage = t('auth.invalidEmail');
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = t('auth.emailInUse');
      } else if (err.code === 'auth/weak-password') {
        errorMessage = t('auth.weakPassword');
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = t('auth.networkError');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('auth.signup')}
            </h1>
            <p className="text-gray-600">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
                placeholder={t('auth.email')}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
                placeholder={t('auth.password')}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('auth.weakPassword')}
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
                placeholder={t('auth.confirmPassword')}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? t('common.loading') : t('auth.signup')}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/login"
                className="text-primary-600 font-bold hover:text-primary-700 hover:underline"
              >
                {t('auth.signInNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

