/**
 * VideoInput.jsx
 * Page for recording or uploading video
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import VideoRecorder from '../components/VideoRecorder';
import VideoUploader from '../components/VideoUploader';
import { storeVideo } from '../utils/indexedDB';

function VideoInput() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState('upload'); // 'upload' or 'record'
  const [isProcessing, setIsProcessing] = useState(false);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
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

  const handleVideoReady = async (videoBlob, fileName = 'recorded-video.webm') => {
    setIsProcessing(true);
    
    try {
      // Store video in IndexedDB
      const videoId = await storeVideo(videoBlob, fileName);
      
      // Navigate to analysis loader with video ID
      navigate('/analysis', { state: { videoId, videoBlob } });
    } catch (error) {
      console.error('Error storing video:', error);
      alert(t('videoInput.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('videoInput.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('videoInput.subtitle')}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-gray-300 p-1 bg-white shadow-md">
            <button
              onClick={() => setMode('upload')}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {t('videoInput.upload')}
            </button>
            <button
              onClick={() => setMode('record')}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                mode === 'record'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {t('videoInput.record')}
            </button>
          </div>
        </div>

        {/* Video Input Component */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {mode === 'upload' ? (
            <VideoUploader onVideoUploaded={handleVideoReady} />
          ) : (
            <VideoRecorder onVideoRecorded={handleVideoReady} />
          )}
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-primary-600">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{t('videoInput.processing')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoInput;
