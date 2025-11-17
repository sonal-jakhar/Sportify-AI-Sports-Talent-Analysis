/**
 * Settings.jsx
 * Page for app settings including language selection
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';

function Settings() {
  const { t } = useTranslation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      // Show installed snackbar
      showInstalledSnackbar();
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const showInstalledSnackbar = () => {
    // Create and show snackbar
    const snackbar = document.createElement('div');
    snackbar.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    snackbar.textContent = 'App Installed Successfully!';
    document.body.appendChild(snackbar);

    setTimeout(() => {
      snackbar.remove();
    }, 3000);
  };

  const clearStorage = async (type) => {
    if (window.confirm(`Are you sure you want to clear all ${type}?`)) {
      if (type === 'videos') {
        // Clear videos from IndexedDB
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open('SportifyDB', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        await store.clear();
      } else if (type === 'results') {
        // Clear results from IndexedDB
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open('SportifyDB', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction(['results'], 'readwrite');
        const store = transaction.objectStore('results');
        await store.clear();
      }
      alert(`${type} cleared successfully!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-5xl font-bold text-gray-900 mb-10">
            {t('settings.title')}
          </h1>

          {/* PWA Install */}
          {showInstallPrompt && (
            <div className="mb-10 pb-10 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Install App
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Install Sportify as a Progressive Web App for easy access and offline functionality.
                </p>
                <button
                  onClick={handleInstall}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Install App
                </button>
              </div>
            </div>
          )}

          {/* Storage Settings */}
          <div className="mb-10 pb-10 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('settings.storage')}
            </h2>
            <div className="space-y-6">
              {/* Clear Videos Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2">{t('settings.clearVideos')}</p>
                  <p className="text-sm text-gray-600">Remove all stored video files from your device</p>
                </div>
                <button
                  onClick={() => clearStorage('videos')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm ml-4 flex-shrink-0"
                >
                  {t('settings.clear')}
                </button>
              </div>
              
              {/* Clear Results Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2">{t('settings.clearResults')}</p>
                  <p className="text-sm text-gray-600">Remove all analysis results and reports</p>
                </div>
                <button
                  onClick={() => clearStorage('results')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm ml-4 flex-shrink-0"
                >
                  {t('settings.clear')}
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('settings.about')}
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-3">
              <p className="text-gray-700">
                <span className="font-bold text-gray-900">{t('settings.version')}:</span> 1.0.0
              </p>
              <p className="text-gray-600 leading-relaxed">{t('settings.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
