/**
 * AnalysisLoader.jsx
 * Page that processes video and analyzes pose data
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import PoseProcessor from '../core/PoseProcessor';
import ScoringEngine from '../core/ScoringEngine';
import { getVideo, storeResults } from '../utils/indexedDB';

function AnalysisLoader() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('initializing');
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const poseProcessorRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processVideo = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        // Initialize pose processor
        setStatus('initializing');
        setProgress(5);
        
        console.log('Creating PoseProcessor instance...');
        const poseProcessor = new PoseProcessor();
        
        setProgress(10);
        console.log('Initializing PoseProcessor (this may take a moment for TensorFlow.js to load)...');
        await poseProcessor.initialize();
        
        setProgress(15);
        poseProcessorRef.current = poseProcessor;

        // Get video
        const videoId = location.state?.videoId;
        if (!videoId) {
          throw new Error('No video ID provided');
        }

        const videoData = await getVideo(videoId);
        const videoBlob = videoData.blob;

        // Create video element
        const video = document.createElement('video');
        const videoUrl = URL.createObjectURL(videoBlob);
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        
        videoRef.current = video;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.currentTime = 0;
            resolve();
          };
        });

        setStatus('processing');
        setProgress(20);

        // Process video frames
        const fps = 10; // Reduced FPS for processing to avoid performance issues
        const duration = video.duration;
        const totalFrames = Math.floor(duration * fps);
        let currentFrame = 0;

        // Process frames sequentially
        for (let frame = 0; frame < totalFrames; frame++) {
          const targetTime = Math.min((frame / fps), duration);
          
          // Seek to target time
          await new Promise((resolve) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              resolve();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = targetTime;
          });

          // Process frame
          try {
            await poseProcessor.processFrame(video);
            currentFrame++;
            setFramesProcessed(currentFrame);
            const newProgress = 20 + ((currentFrame / totalFrames) * 60);
            setProgress(Math.min(90, newProgress));
          } catch (err) {
            console.error('Error processing frame:', err);
          }

          // Add small delay to prevent blocking UI
          if (frame % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        URL.revokeObjectURL(videoUrl);
        await finishProcessing();

      } catch (err) {
        console.error('Error processing video:', err);
        setError(err.message || t('videoInput.error'));
        setStatus('error');
      }
    };

    const finishProcessing = async () => {
      try {
        setStatus('calculating');
        setProgress(90);

        // Calculate metrics
        const metrics = poseProcessorRef.current.calculateMetrics();
        
        // Generate scores and recommendations
        const scoringEngine = new ScoringEngine();
        const analysis = scoringEngine.processAnalysis(metrics);

        setProgress(95);

        // Store results
        const videoId = location.state?.videoId;
        const resultId = await storeResults(analysis, videoId);

        setProgress(100);
        setStatus('complete');

        // Navigate to results page
        setTimeout(() => {
          navigate('/results', { state: { analysis, resultId } });
        }, 500);

        // Cleanup
        poseProcessorRef.current?.dispose();
      } catch (err) {
        console.error('Error finishing processing:', err);
        setError(err.message || t('videoInput.error'));
        setStatus('error');
      }
    };

    processVideo();

    return () => {
      // Cleanup
      if (videoRef.current && videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      poseProcessorRef.current?.dispose();
      isProcessingRef.current = false;
    };
  }, [location, navigate, t]);

  const getStatusText = () => {
    switch (status) {
      case 'initializing':
        return t('analysis.pleaseWait');
      case 'processing':
        return t('analysis.calculating');
      case 'calculating':
        return 'Calculating scores...';
      case 'complete':
        return 'Analysis complete!';
      case 'error':
        return 'Error occurred';
      default:
        return t('analysis.pleaseWait');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/analyze')}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('analysis.title')}
          </h1>
          <p className="text-gray-600">
            {t('analysis.subtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('analysis.progress')}</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <svg
              className="animate-spin h-12 w-12 text-primary-600"
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
          </div>
          <p className="text-lg text-gray-700 mb-2">{getStatusText()}</p>
          {status === 'processing' && (
            <p className="text-sm text-gray-500">
              {t('analysis.framesProcessed')}: {framesProcessed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalysisLoader;
