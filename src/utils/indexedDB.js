/**
 * indexedDB.js
 * Utility functions for IndexedDB storage
 * Used for storing uploaded/recorded videos temporarily
 */

const DB_NAME = 'SportifyDB';
const DB_VERSION = 1;
const VIDEO_STORE = 'videos';
const RESULTS_STORE = 'results';

let dbInstance = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>} Database instance
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create video store
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        const videoStore = db.createObjectStore(VIDEO_STORE, { keyPath: 'id', autoIncrement: true });
        videoStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create results store
      if (!db.objectStoreNames.contains(RESULTS_STORE)) {
        const resultsStore = db.createObjectStore(RESULTS_STORE, { keyPath: 'id', autoIncrement: true });
        resultsStore.createIndex('timestamp', 'timestamp', { unique: false });
        resultsStore.createIndex('videoId', 'videoId', { unique: false });
      }
    };
  });
}

/**
 * Store video in IndexedDB
 * @param {Blob} videoBlob - Video blob
 * @param {string} fileName - Original file name
 * @returns {Promise<number>} Video ID
 */
export async function storeVideo(videoBlob, fileName) {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEO_STORE);
    
    const videoData = {
      blob: videoBlob,
      fileName,
      timestamp: Date.now(),
      size: videoBlob.size,
      type: videoBlob.type
    };

    const request = store.add(videoData);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to store video'));
    };
  });
}

/**
 * Retrieve video from IndexedDB
 * @param {number} videoId - Video ID
 * @returns {Promise<Object>} Video data object
 */
export async function getVideo(videoId) {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readonly');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.get(videoId);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error('Video not found'));
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve video'));
    };
  });
}

/**
 * Delete video from IndexedDB
 * @param {number} videoId - Video ID
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId) {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.delete(videoId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete video'));
    };
  });
}

/**
 * Store analysis results
 * @param {Object} results - Analysis results
 * @param {number} videoId - Associated video ID
 * @returns {Promise<number>} Result ID
 */
export async function storeResults(results, videoId) {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RESULTS_STORE], 'readwrite');
    const store = transaction.objectStore(RESULTS_STORE);
    
    const resultData = {
      ...results,
      videoId,
      timestamp: Date.now()
    };

    const request = store.add(resultData);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to store results'));
    };
  });
}

/**
 * Get analysis results
 * @param {number} resultId - Result ID
 * @returns {Promise<Object>} Results object
 */
export async function getResults(resultId) {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([RESULTS_STORE], 'readonly');
    const store = transaction.objectStore(RESULTS_STORE);
    const request = store.get(resultId);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error('Results not found'));
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve results'));
    };
  });
}

/**
 * Get all stored videos
 * @returns {Promise<Array>} Array of video metadata
 */
export async function getAllVideos() {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readonly');
    const store = transaction.objectStore(VIDEO_STORE);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      // Return only metadata, not full blobs
      const videos = request.result.map(video => ({
        id: video.id,
        fileName: video.fileName,
        timestamp: video.timestamp,
        size: video.size,
        type: video.type
      }));
      resolve(videos);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve videos'));
    };
  });
}

/**
 * Clear old videos (older than specified days)
 * @param {number} days - Number of days to keep
 * @returns {Promise<number>} Number of videos deleted
 */
export async function clearOldVideos(days = 7) {
  const db = await initDB();
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEO_STORE);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(cutoffTime);
    const request = index.openCursor(range);

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to clear old videos'));
    };
  });
}
