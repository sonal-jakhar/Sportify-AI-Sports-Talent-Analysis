/**
 * Footer.jsx
 * Footer component with app information
 */

import { useTranslation } from '../i18n';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('app.name')}</h3>
            <p className="text-gray-400 text-sm">
              {t('app.tagline')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-white">
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="/analyze" className="text-gray-400 hover:text-white">
                  {t('nav.analyze')}
                </a>
              </li>
              <li>
                <a href="/opportunities" className="text-gray-400 hover:text-white">
                  {t('nav.opportunities')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.aboutTitle')}</h3>
            <p className="text-gray-400 text-sm">
              {t('settings.description')}
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {t('app.name')}. {t('footer.allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
