/**
 * VideoUploader.jsx
 * Component for uploading video files
 */

import { useState, useRef } from 'react';
import { useTranslation } from '../i18n';
import { validateVideoFile, formatFileSize } from '../utils/videoUtils';

function VideoUploader({ onVideoUploaded }) {
  const { t } = useTranslation();
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setVideoFile(null);
      setPreviewUrl(null);
      return;
    }

    setVideoFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError(t('videoInput.noVideo'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create blob from file
      const blob = new Blob([videoFile], { type: videoFile.type });
      
      if (onVideoUploaded) {
        await onVideoUploaded(blob, videoFile.name);
      }
    } catch (err) {
      console.error('Error uploading video:', err);
      setError(t('videoInput.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setVideoFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-primary-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {t('videoInput.selectFile')}
          </span>
          <span className="text-xs text-gray-500">
            {t('videoInput.supportedFormats')} • {t('videoInput.maxSize')}
          </span>
        </label>
      </div>

      {videoFile && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{videoFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(videoFile.size)}</p>
              </div>
              <button
                onClick={handleClear}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>

          {previewUrl && (
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video max-w-2xl mx-auto">
              <video
                ref={videoRef}
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? t('videoInput.processing') : t('videoInput.analyze')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}

export default VideoUploader;
