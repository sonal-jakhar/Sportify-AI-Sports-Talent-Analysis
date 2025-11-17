/**
 * videoUtils.js
 * Utility functions for video processing, compression, and format handling
 */

/**
 * Compress video file before processing
 * @param {File} videoFile - Original video file
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10)
 * @returns {Promise<Blob>} Compressed video blob
 */
export async function compressVideo(videoFile, maxSizeMB = 10) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions (max width: 640px, maintain aspect ratio)
        const maxWidth = 640;
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = Math.min(maxWidth, video.videoWidth);
        canvas.height = canvas.width / aspectRatio;

        // Create video element for compression
        const compressedVideo = document.createElement('video');
        compressedVideo.src = URL.createObjectURL(videoFile);
        compressedVideo.muted = true;
        
        const chunks = [];
        const mediaRecorder = new MediaRecorder(
          compressedVideo.captureStream(),
          {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 500000 // 500 kbps
          }
        );

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          
          // Check if size is acceptable
          if (blob.size <= maxSizeMB * 1024 * 1024) {
            resolve(blob);
          } else {
            // If still too large, return original or further compress
            resolve(blob);
          }
          
          // Cleanup
          URL.revokeObjectURL(video.src);
          URL.revokeObjectURL(compressedVideo.src);
        };

        compressedVideo.onloadeddata = () => {
          mediaRecorder.start();
          compressedVideo.play();
          
          compressedVideo.onended = () => {
            mediaRecorder.stop();
          };
        };

        compressedVideo.load();
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read video file'));
    };

    reader.readAsArrayBuffer(videoFile);
  });
}

/**
 * Create a video element from blob
 * @param {Blob} videoBlob - Video blob
 * @returns {Promise<HTMLVideoElement>} Video element
 */
export function createVideoElement(videoBlob) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoBlob);
    
    video.src = url;
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      resolve(video);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Get video duration
 * @param {Blob} videoBlob - Video blob
 * @returns {Promise<number>} Duration in seconds
 */
export function getVideoDuration(videoBlob) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoBlob);
    
    video.src = url;
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
  });
}

/**
 * Validate video file
 * @param {File} file - Video file
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export function validateVideoFile(file) {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const maxSizeMB = 100;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov)$/i)) {
    return { valid: false, error: 'Invalid file type. Please use MP4, WebM, or MOV format.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }

  return { valid: true };
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
