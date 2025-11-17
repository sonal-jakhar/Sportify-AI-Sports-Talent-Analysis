/**
 * Navbar.jsx
 * Navigation component with language support and authentication
 */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation, setLanguage, getLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { signOut } from '../utils/firebase';

function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const isActive = (path) => location.pathname === path;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
    // Force re-render by triggering language change event
    window.dispatchEvent(new CustomEvent('languagechange'));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast(t('auth.logoutSuccess'), 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error signing out:', error);
      showToast(t('auth.error'), 'error');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                {t('app.name')}
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold ${
                  isActive('/')
                    ? 'border-primary-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-gray-700'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/analyze"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold ${
                  isActive('/analyze')
                    ? 'border-primary-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-gray-700'
                }`}
              >
                {t('nav.analyze')}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/history"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold ${
                    isActive('/history')
                      ? 'border-primary-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-gray-700'
                  }`}
                >
                  {t('nav.history')}
                </Link>
              )}
              <Link
                to="/settings"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold ${
                  isActive('/settings')
                    ? 'border-primary-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-gray-700'
                }`}
              >
                {t('nav.settings')}
              </Link>
            </div>
          </div>
          {/* Right side: Language Toggle + Auth Buttons */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {/* Language Toggle - Only show on home page */}
            {location.pathname === '/' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    currentLang === 'en'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    currentLang === 'hi'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  HI
                </button>
              </div>
            )}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl transition-all ${
                        isActive('/login')
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                      }`}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md hover:shadow-lg ${
                        isActive('/signup') ? 'shadow-lg' : ''
                      }`}
                    >
                      {t('nav.signup')}
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
              isActive('/')
                ? 'bg-primary-50 border-primary-600 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/analyze"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
              isActive('/analyze')
                ? 'bg-primary-50 border-primary-600 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
            }`}
          >
            {t('nav.analyze')}
          </Link>
          {isAuthenticated && (
            <Link
              to="/history"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
                isActive('/history')
                  ? 'bg-primary-50 border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
              }`}
            >
              {t('nav.history')}
            </Link>
          )}
          <Link
            to="/settings"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
              isActive('/settings')
                ? 'bg-primary-50 border-primary-600 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
            }`}
          >
            {t('nav.settings')}
          </Link>
          {!loading && (
            <>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-bold text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                >
                  {t('nav.logout')}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
                      isActive('/login')
                        ? 'bg-primary-50 border-primary-600 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
                    }`}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
                      isActive('/signup')
                        ? 'bg-primary-50 border-primary-600 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-primary-50 hover:border-primary-300 hover:text-gray-800'
                    }`}
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
