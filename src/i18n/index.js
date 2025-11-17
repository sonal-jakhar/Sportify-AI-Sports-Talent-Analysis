/**
 * i18n/index.js
 * Internationalization setup and utilities
 */

import en from './en.json';
import hi from './hi.json';

const translations = {
  en,
  hi
};

let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Set current language
 * @param {string} lang - Language code ('en' or 'hi')
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    // Trigger custom event for language change
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  }
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Translate a key path
 * @param {string} key - Translation key path (e.g., 'nav.home')
 * @param {Object} params - Optional parameters for string interpolation
 * @returns {string} Translated string
 */
export function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Simple parameter replacement
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
  }

  return result;
}

/**
 * React hook for translations (returns translation function)
 * @returns {Function} Translation function
 */
export function useTranslation() {
  return { t, language: currentLanguage, setLanguage };
}

export default { t, setLanguage, getLanguage, useTranslation };
