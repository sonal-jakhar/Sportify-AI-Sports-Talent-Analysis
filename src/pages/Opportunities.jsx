/**
 * Opportunities.jsx
 * Page displaying sports opportunities based on user profile
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import opportunitiesData from '../core/Opportunities.json';

function Opportunities() {
  const { t } = useTranslation();
  const [selectedSport, setSelectedSport] = useState('all');
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    // Load opportunities from JSON
    let filtered = opportunitiesData.opportunities;

    if (selectedSport !== 'all') {
      filtered = filtered.filter(opp =>
        opp.eligibility.sports.includes(selectedSport)
      );
    }

    setOpportunities(filtered);
  }, [selectedSport]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type) => {
    const typeKey = type.toLowerCase().replace(/\s+/g, '-');
    return t(`opportunities.type.${typeKey}`, type);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('opportunities.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('opportunities.subtitle')}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('opportunities.filterBy')}
          </label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 font-medium"
          >
            <option value="all">{t('opportunities.allSports')}</option>
            <option value="football">Football</option>
            <option value="athletics">Athletics</option>
            <option value="badminton">Badminton</option>
            <option value="volleyball">Volleyball</option>
            <option value="throwing">Throwing Events</option>
          </select>
        </div>

        {/* Opportunities List */}
        {opportunities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-200">
            <p className="text-gray-600 text-lg font-medium">{t('opportunities.noOpportunities')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-8 pb-6 flex-grow">
                  <div className="mb-5">
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs font-bold px-4 py-2 rounded-full">
                      {getTypeLabel(opportunity.type)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {opportunity.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {opportunity.description}
                  </p>

                  {/* Details Section */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">{t('opportunities.date')}:</span>
                      <span className="ml-1">{formatDate(opportunity.date)}</span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">{t('opportunities.location')}:</span>
                      <span className="ml-1">{opportunity.location}</span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">{t('opportunities.ageRange')}:</span>
                      <span className="ml-1">{opportunity.eligibility.ageMin}-{opportunity.eligibility.ageMax} {t('opportunities.years')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-8 pb-8 pt-6 border-t border-gray-200">
                  {opportunity.website ? (
                    <a
                      href={opportunity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {t('opportunities.learnMore')}
                    </a>
                  ) : (
                    <button className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      {t('opportunities.apply')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Opportunities;
