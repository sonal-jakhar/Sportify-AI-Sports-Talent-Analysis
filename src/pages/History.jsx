/**
 * History.jsx
 * Student Profile page displaying past assessment reports
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { getUserAssessmentHistory } from '../utils/firebase';

function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch history if authenticated
    if (isAuthenticated && user) {
      fetchHistory();
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const history = await getUserAssessmentHistory(user.uid);
      setReports(history);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(t('history.error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  const getTopRecommendedSport = (recommendedSports) => {
    if (!recommendedSports || recommendedSports.length === 0) {
      return 'N/A';
    }
    
    // Sort by suitability score and return top one
    const sorted = [...recommendedSports].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return sorted[0].name;
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 font-medium">{t('history.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but show placeholder)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('history.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('history.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* History List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t('history.noHistory')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('history.noHistoryDesc')}
            </p>
            <Link
              to="/analyze"
              className="inline-block px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t('history.startAssessment')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 flex flex-col"
                onClick={(e) => {
                  // Prevent card clicks from interfering with Link clicks
                  const target = e.target;
                  if (target.closest('a')) {
                    return; // Let the Link handle its own click
                  }
                }}
              >
                {/* Report Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                      {formatDate(report.timestamp || report.createdAt).split(',')[0]}
                    </span>
                    <span className="text-2xl font-bold text-primary-600 score-value">
                      {report.overallScore}/100
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatDate(report.timestamp || report.createdAt)}
                  </div>
                </div>

                {/* Recommended Sport */}
                <div className="mb-4 flex-grow">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {t('history.recommendedSport')}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {getTopRecommendedSport(report.recommendedSports)}
                  </div>
                </div>

                {/* Score Breakdown */}
                {report.scores && (
                  <div className="mb-4 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Agility:</span>
                      <span className="font-bold text-gray-900 score-value">{report.scores.agility || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Balance:</span>
                      <span className="font-bold text-gray-900 score-value">{report.scores.balance || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Coordination:</span>
                      <span className="font-bold text-gray-900 score-value">{report.scores.coordination || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Reaction Time:</span>
                      <span className="font-bold text-gray-900 score-value">{report.scores.reactionTime || 0}</span>
                    </div>
                  </div>
                )}

                {/* View Report Button */}
                <Link
                  to={`/results/${report.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="mt-auto px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 block"
                >
                  {t('history.viewReport')}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;

