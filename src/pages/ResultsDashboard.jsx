/**
 * ResultsDashboard.jsx
 * Page displaying analysis results, scores, and recommendations
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, getLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { saveAssessmentReport, getAssessmentReport } from '../utils/firebase';
import ScoreCard from '../components/ScoreCard';
import ChartComponent from '../components/ChartComponent';
import { FaFootballBall, FaRunning, FaTableTennis, FaVolleyballBall, FaDumbbell } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ResultsDashboard() {
  // ========== ALL HOOKS MUST BE CALLED FIRST ==========
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState(location.state?.analysis || location.state?.report || null);
  const [loading, setLoading] = useState(false);
  const hasSavedRef = useRef(false);
  const videoIdRef = useRef(location.state?.videoId || location.state?.resultId || null);

  // Load report from Firestore if reportId is provided
  useEffect(() => {
    const loadReport = async () => {
      if (reportId && !analysis && user && !authLoading) {
        setLoading(true);
        try {
          const report = await getAssessmentReport(reportId);
          
          // Transform Firestore report to analysis format
          const transformedAnalysis = {
            overallScore: report.overallScore,
            scores: report.scores,
            recommendedSports: report.recommendedSports || [],
            sportsSuitability: report.sportsSuitability || report.recommendedSports || [],
            suggestions: report.suggestions || []
          };
          
          setAnalysis(transformedAnalysis);
        } catch (error) {
          console.error('Error loading report:', error);
          navigate('/history');
        } finally {
          setLoading(false);
        }
      }
    };

    if (reportId && user && !authLoading) {
      loadReport();
    }
  }, [reportId, user, authLoading, navigate, analysis]);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Save to Firestore if user is authenticated and report hasn't been saved yet
  useEffect(() => {
    const saveToFirestore = async () => {
      if (!analysis || !isAuthenticated || !user || hasSavedRef.current) {
        return;
      }

      try {
        hasSavedRef.current = true;
        const videoId = videoIdRef.current || Date.now().toString();
        await saveAssessmentReport(user.uid, analysis, videoId);
        console.log('Assessment report saved to Firestore');
      } catch (error) {
        console.error('Error saving assessment to Firestore:', error);
        // Don't block the UI if Firestore save fails
        // IndexedDB storage still preserved for offline caching
      }
    };

    saveToFirestore();
  }, [analysis, isAuthenticated, user]);

  // ========== ALL CONDITIONAL RETURNS AFTER ALL HOOKS ==========
  
  // Show loading state while checking authentication or loading report
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis results found.</p>
          <button
            onClick={() => navigate('/analyze')}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg"
          >
            {t('results.analyzeAgain')}
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER LOGIC ==========
  
  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const lang = getLanguage();

    // Title
    doc.setFontSize(20);
    doc.text('Sportify - Talent Analysis Report', 14, 20);

    // Overall Score
    doc.setFontSize(16);
    doc.text(`Overall Score: ${analysis.overallScore}/100`, 14, 35);

    // Individual Scores
    doc.setFontSize(14);
    doc.text('Individual Metrics:', 14, 50);
    
    const scoresData = [
      ['Agility', analysis.scores.agility],
      ['Balance', analysis.scores.balance],
      ['Coordination', analysis.scores.coordination],
      ['Reaction Time', analysis.scores.reactionTime]
    ];

    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Score']],
      body: scoresData,
      theme: 'striped',
    });

    let startY = doc.lastAutoTable.finalY + 15;

    // Recommended Sports
    doc.setFontSize(14);
    doc.text('Recommended Sports:', 14, startY);
    startY += 5;

    const sportsData = analysis.recommendedSports.map(sport => [
      sport.name,
      `${sport.suitabilityScore}/100`,
      sport.meetsRequirements ? 'Yes' : 'No'
    ]);

    doc.autoTable({
      startY: startY,
      head: [['Sport', 'Suitability Score', 'Meets Requirements']],
      body: sportsData,
      theme: 'striped',
    });

    startY = doc.lastAutoTable.finalY + 15;

    // Improvement Suggestions
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      doc.setFontSize(14);
      doc.text('Improvement Suggestions:', 14, startY);
      startY += 5;

      const suggestionsText = analysis.suggestions.map(s => {
        const suggestionText = typeof s.suggestion === 'object' 
          ? (lang === 'hi' ? s.suggestion.hi : s.suggestion.en)
          : s.suggestion;
        return `${s.metric}: ${suggestionText}`;
      }).join('\n');

      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(suggestionsText, 180);
      doc.text(splitText, 14, startY);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        287,
        { align: 'center' }
      );
    }

    doc.save(`sportify-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('results.title')}
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-primary-100 px-8 py-4 rounded-2xl shadow-lg border border-primary-200"
          >
            <span className="text-3xl font-bold text-primary-600 score-value">
              {analysis.overallScore}/100
            </span>
            <span className="ml-3 text-lg text-primary-700 font-semibold">{t('results.overallScore')}</span>
          </motion.div>
        </div>

        {/* Individual Scores */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('results.scores.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScoreCard
              title={t('results.scores.agility')}
              score={analysis.scores.agility}
              color="primary"
              index={0}
            />
            <ScoreCard
              title={t('results.scores.balance')}
              score={analysis.scores.balance}
              color="green"
              index={1}
            />
            <ScoreCard
              title={t('results.scores.coordination')}
              score={analysis.scores.coordination}
              color="blue"
              index={2}
            />
            <ScoreCard
              title={t('results.scores.reactionTime')}
              score={analysis.scores.reactionTime}
              color="purple"
              index={3}
            />
          </div>
        </div>

        {/* Recommended Sports */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('results.recommendedSports.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.recommendedSports.map((sport, index) => {
              // Get sport icon
              const getSportIcon = (sportId) => {
                const iconClass = "w-8 h-8 text-primary-600";
                switch (sportId?.toLowerCase() || sport.name?.toLowerCase()) {
                  case 'football':
                    return <FaFootballBall className={iconClass} />;
                  case 'athletics':
                    return <FaRunning className={iconClass} />;
                  case 'badminton':
                    return <FaTableTennis className={iconClass} />;
                  case 'volleyball':
                    return <FaVolleyballBall className={iconClass} />;
                  case 'throwing':
                  case 'throwing events':
                    return <FaDumbbell className={iconClass} />;
                  default:
                    return <FaRunning className={iconClass} />;
                }
              };

              return (
                <motion.div
                  key={sport.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {getSportIcon(sport.id)}
                      <h3 className="text-xl font-bold text-gray-900">{sport.name}</h3>
                    </div>
                    {sport.meetsRequirements && (
                      <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {t('results.recommendedSports.meetsRequirements')}
                      </span>
                    )}
                  </div>
                <div className="mb-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {t('results.recommendedSports.suitabilityScore')}
                    </span>
                    <span className="text-xl font-bold text-gray-900 score-value">
                      {sport.suitabilityScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        sport.meetsRequirements ? 'bg-primary-600' : 'bg-gray-400'
                      }`}
                      style={{ width: `${sport.suitabilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="font-medium">Agility: <span className="font-bold score-value">{sport.scoreBreakdown.agility}</span></div>
                  <div className="font-medium">Balance: <span className="font-bold score-value">{sport.scoreBreakdown.balance}</span></div>
                  <div className="font-medium">Coordination: <span className="font-bold score-value">{sport.scoreBreakdown.coordination}</span></div>
                  <div className="font-medium">Reaction Time: <span className="font-bold score-value">{sport.scoreBreakdown.reactionTime}</span></div>
                </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Opportunities Mapping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Opportunities for You
          </h2>
          <div className="space-y-6">
            {analysis.recommendedSports.map((sport, index) => {
              // Map sport to opportunities
              const getOpportunities = (sportId) => {
                const opportunities = [];
                
                // Khelo India opportunity for all recommended sports
                opportunities.push({
                  id: `khelo-india-${sportId}`,
                  type: 'Khelo India',
                  name: `Khelo India Youth Games - ${sport.name}`,
                  description: 'National level competition for youth athletes. Participate in trials to represent your state.',
                  level: 'National',
                  ageRange: '14-21 years',
                  link: 'https://kheloindia.gov.in'
                });

                // School/District Level opportunity
                opportunities.push({
                  id: `district-${sportId}`,
                  type: 'School/District Level',
                  name: `${sport.name} - District Trials`,
                  description: 'Open trials for district-level team selection. Perfect starting point for competitive sports.',
                  level: 'District',
                  ageRange: '16-25 years',
                  link: null
                });

                return opportunities;
              };

              const sportOpportunities = getOpportunities(sport.id || sport.name.toLowerCase());

              return (
                <motion.div
                  key={sport.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Opportunities for {sport.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sportOpportunities.map((opp, oppIndex) => (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (oppIndex * 0.05) }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="bg-primary-100 text-primary-800 text-xs font-bold px-3 py-1 rounded-full">
                            {opp.type}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {opp.level}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {opp.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {opp.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Age: {opp.ageRange}
                          </span>
                          {opp.link ? (
                            <a
                              href={opp.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              Learn More →
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Contact your school
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* All Sports Chart */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('results.allSports.title')}
          </h2>
          <ChartComponent sports={analysis.sportsSuitability} />
        </div>

        {/* Improvement Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('results.suggestions.title')}
            </h2>
            <div className="space-y-6">
              {analysis.suggestions.map((suggestion, index) => {
                const suggestionText = typeof suggestion.suggestion === 'object'
                  ? (t('common.loading') === 'Loading...' ? suggestion.suggestion.en : suggestion.suggestion.hi)
                  : suggestion.suggestion;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {suggestion.metric}
                      </h3>
                      <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                        {t('results.suggestions.currentScore')}: {suggestion.currentScore} → {t('results.suggestions.targetScore')}: {suggestion.targetScore}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{suggestionText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={downloadPDFReport}
            className="px-10 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t('results.downloadReport')}
          </button>
          <button
            onClick={() => navigate('/analyze')}
            className="px-10 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t('results.analyzeAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsDashboard;
