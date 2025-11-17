/**
 * PoseProcessor.js
 * Core module for pose detection using MediaPipe and TensorFlow.js
 * Extracts joint landmarks and calculates movement metrics
 */

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

class PoseProcessor {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
    this.landmarkHistory = [];
    this.frameCount = 0;
    this.startTime = null;
    this.firstMovementTime = null;
  }

  /**
   * Initialize the pose detection model
   * Ensures TensorFlow.js backend is ready before creating the detector
   */
  async initialize() {
    try {
      // Wait for TensorFlow.js backend to be ready
      // This is critical to prevent "Backend 'undefined' has not yet been initialized" error
      console.log('Waiting for TensorFlow.js backend to initialize...');
      await tf.ready();
      
      // Check current backend and ensure one is set
      let backendName = tf.getBackend();
      console.log(`Current TensorFlow.js backend: ${backendName || 'none'}`);
      
      // If no backend is set, initialize one (prefer WebGL for performance)
      if (!backendName) {
        try {
          // Try WebGL first for better performance
          await tf.setBackend('webgl');
          await tf.ready();
          backendName = tf.getBackend();
          console.log(`WebGL backend initialized: ${backendName}`);
        } catch (webglError) {
          console.warn('WebGL backend not available, falling back to CPU:', webglError);
          try {
            // Fallback to CPU if WebGL fails
            await tf.setBackend('cpu');
            await tf.ready();
            backendName = tf.getBackend();
            console.log(`CPU backend initialized: ${backendName}`);
          } catch (cpuError) {
            console.error('Failed to initialize CPU backend:', cpuError);
            throw new Error('Unable to initialize TensorFlow.js backend');
          }
        }
      }

      // Verify backend is ready
      if (!backendName) {
        throw new Error('TensorFlow.js backend is not initialized');
      }

      // Small delay to ensure backend is fully initialized and stable
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now create the pose detector
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
        minPoseScore: 0.25,
      };

      console.log('Creating pose detector with MoveNet...');
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      if (!this.detector) {
        throw new Error('Failed to create pose detector');
      }

      this.isInitialized = true;
      console.log('PoseProcessor initialized successfully with backend:', backendName);
      return true;
    } catch (error) {
      console.error('Error initializing PoseProcessor:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Process a single video frame
   * @param {HTMLVideoElement|HTMLImageElement|ImageData} input - Video frame
   * @returns {Promise<Object>} Detection result with landmarks
   */
  async processFrame(input) {
    if (!this.isInitialized || !this.detector) {
      throw new Error('PoseProcessor not initialized');
    }

    try {
      const pose = await this.detector.estimatePoses(input);
      
      if (pose && pose.length > 0 && pose[0].keypoints) {
        const keypoints = pose[0].keypoints;
        const timestamp = Date.now();

        if (this.startTime === null) {
          this.startTime = timestamp;
        }

        // Store landmark data with timestamp
        const landmarkData = {
          timestamp,
          frameNumber: this.frameCount++,
          keypoints: keypoints.map(kp => ({
            name: kp.name,
            x: kp.x,
            y: kp.y,
            score: kp.score
          }))
        };

        this.landmarkHistory.push(landmarkData);

        // Detect first significant movement
        if (this.firstMovementTime === null && this.landmarkHistory.length > 5) {
          const hasMovement = this.detectFirstMovement();
          if (hasMovement) {
            this.firstMovementTime = timestamp;
          }
        }

        return landmarkData;
      }

      return null;
    } catch (error) {
      console.error('Error processing frame:', error);
      return null;
    }
  }

  /**
   * Detect first significant movement
   * @returns {boolean} True if movement detected
   */
  detectFirstMovement() {
    if (this.landmarkHistory.length < 6) return false;

    const recent = this.landmarkHistory.slice(-6);
    const current = recent[recent.length - 1];
    const previous = recent[0];

    // Check movement in major joints (shoulders, hips, knees)
    const majorJoints = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 
                         'left_knee', 'right_knee'];

    for (const jointName of majorJoints) {
      const currentJoint = current.keypoints.find(kp => kp.name === jointName);
      const previousJoint = previous.keypoints.find(kp => kp.name === jointName);

      if (currentJoint && previousJoint && currentJoint.score > 0.5 && previousJoint.score > 0.5) {
        const dx = currentJoint.x - previousJoint.x;
        const dy = currentJoint.y - previousJoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Threshold for significant movement (adjust based on video dimensions)
        if (distance > 10) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calculate movement metrics from landmark history
   * @returns {Object} Metrics including agility, balance, coordination, reaction time
   */
  calculateMetrics() {
    if (this.landmarkHistory.length < 30) {
      throw new Error('Insufficient frames for analysis. Need at least 30 frames.');
    }

    const metrics = {
      agility: this.calculateAgility(),
      balance: this.calculateBalance(),
      coordination: this.calculateCoordination(),
      reactionTime: this.calculateReactionTime()
    };

    return metrics;
  }

  /**
   * Calculate agility score based on movement speed
   * @returns {number} Agility score (0-100)
   */
  calculateAgility() {
    if (this.landmarkHistory.length < 10) return 0;

    let totalSpeed = 0;
    let validPairs = 0;

    // Calculate average speed of major joints across frames
    const trackedJoints = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip',
                          'left_elbow', 'right_elbow', 'left_knee', 'right_knee'];

    for (let i = 1; i < this.landmarkHistory.length; i++) {
      const current = this.landmarkHistory[i];
      const previous = this.landmarkHistory[i - 1];
      const timeDelta = (current.timestamp - previous.timestamp) / 1000; // seconds

      if (timeDelta <= 0) continue;

      let frameSpeed = 0;
      let jointCount = 0;

      for (const jointName of trackedJoints) {
        const currentJoint = current.keypoints.find(kp => kp.name === jointName);
        const previousJoint = previous.keypoints.find(kp => kp.name === jointName);

        if (currentJoint && previousJoint && 
            currentJoint.score > 0.5 && previousJoint.score > 0.5) {
          const dx = currentJoint.x - previousJoint.x;
          const dy = currentJoint.y - previousJoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = distance / timeDelta;
          frameSpeed += speed;
          jointCount++;
        }
      }

      if (jointCount > 0) {
        totalSpeed += frameSpeed / jointCount;
        validPairs++;
      }
    }

    if (validPairs === 0) return 0;

    const avgSpeed = totalSpeed / validPairs;
    
    // Normalize speed to 0-100 scale (adjust thresholds based on typical values)
    // Assuming avgSpeed ranges from 0 to ~200 pixels/second
    const normalized = Math.min(100, (avgSpeed / 2) * 100);
    return Math.round(Math.max(0, normalized));
  }

  /**
   * Calculate balance score based on body sway and stability
   * @returns {number} Balance score (0-100)
   */
  calculateBalance() {
    if (this.landmarkHistory.length < 20) return 0;

    // Analyze stability of center of mass (approximated by hip position)
    const hipPositions = [];
    
    for (const frame of this.landmarkHistory) {
      const leftHip = frame.keypoints.find(kp => kp.name === 'left_hip');
      const rightHip = frame.keypoints.find(kp => kp.name === 'right_hip');

      if (leftHip && rightHip && leftHip.score > 0.5 && rightHip.score > 0.5) {
        const centerX = (leftHip.x + rightHip.x) / 2;
        const centerY = (leftHip.y + rightHip.y) / 2;
        hipPositions.push({ x: centerX, y: centerY });
      }
    }

    if (hipPositions.length < 10) return 0;

    // Calculate standard deviation of hip positions
    const avgX = hipPositions.reduce((sum, pos) => sum + pos.x, 0) / hipPositions.length;
    const avgY = hipPositions.reduce((sum, pos) => sum + pos.y, 0) / hipPositions.length;

    let variance = 0;
    for (const pos of hipPositions) {
      const dx = pos.x - avgX;
      const dy = pos.y - avgY;
      variance += dx * dx + dy * dy;
    }
    variance /= hipPositions.length;

    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = better balance
    // Normalize: 0-50 pixels stdDev maps to 100-0 score
    const normalized = Math.max(0, 100 - (stdDev / 50) * 100);
    return Math.round(Math.min(100, normalized));
  }

  /**
   * Calculate coordination score based on joint synchronization
   * @returns {number} Coordination score (0-100)
   */
  calculateCoordination() {
    if (this.landmarkHistory.length < 15) return 0;

    // Analyze synchronization between left and right body parts
    const leftRightPairs = [
      ['left_shoulder', 'right_shoulder'],
      ['left_elbow', 'right_elbow'],
      ['left_hip', 'right_hip'],
      ['left_knee', 'right_knee'],
      ['left_ankle', 'right_ankle']
    ];

    let totalSynchronization = 0;
    let validPairs = 0;

    for (const [leftJoint, rightJoint] of leftRightPairs) {
      const movements = [];

      for (let i = 1; i < this.landmarkHistory.length; i++) {
        const current = this.landmarkHistory[i];
        const previous = this.landmarkHistory[i - 1];

        const leftCurrent = current.keypoints.find(kp => kp.name === leftJoint);
        const leftPrevious = previous.keypoints.find(kp => kp.name === leftJoint);
        const rightCurrent = current.keypoints.find(kp => kp.name === rightJoint);
        const rightPrevious = previous.keypoints.find(kp => kp.name === rightJoint);

        if (leftCurrent && leftPrevious && rightCurrent && rightPrevious &&
            leftCurrent.score > 0.5 && leftPrevious.score > 0.5 &&
            rightCurrent.score > 0.5 && rightPrevious.score > 0.5) {
          
          const leftDx = leftCurrent.x - leftPrevious.x;
          const leftDy = leftCurrent.y - leftPrevious.y;
          const leftMovement = Math.sqrt(leftDx * leftDx + leftDy * leftDy);

          const rightDx = rightCurrent.x - rightPrevious.x;
          const rightDy = rightCurrent.y - rightPrevious.y;
          const rightMovement = Math.sqrt(rightDx * rightDx + rightDy * rightDy);

          movements.push({
            left: leftMovement,
            right: rightMovement
          });
        }
      }

      if (movements.length > 5) {
        // Calculate correlation between left and right movements
        const avgLeft = movements.reduce((sum, m) => sum + m.left, 0) / movements.length;
        const avgRight = movements.reduce((sum, m) => sum + m.right, 0) / movements.length;

        let covariance = 0;
        let varLeft = 0;
        let varRight = 0;

        for (const m of movements) {
          const diffLeft = m.left - avgLeft;
          const diffRight = m.right - avgRight;
          covariance += diffLeft * diffRight;
          varLeft += diffLeft * diffLeft;
          varRight += diffRight * diffRight;
        }

        const stdLeft = Math.sqrt(varLeft / movements.length);
        const stdRight = Math.sqrt(varRight / movements.length);

        if (stdLeft > 0 && stdRight > 0) {
          const correlation = Math.abs(covariance / (movements.length * stdLeft * stdRight));
          totalSynchronization += correlation;
          validPairs++;
        }
      }
    }

    if (validPairs === 0) return 0;

    const avgCoordination = (totalSynchronization / validPairs) * 100;
    return Math.round(Math.min(100, Math.max(0, avgCoordination)));
  }

  /**
   * Calculate reaction time in milliseconds
   * @returns {number} Reaction time in ms (lower is better, converted to 0-100 score)
   */
  calculateReactionTime() {
    if (this.firstMovementTime === null || this.startTime === null) {
      return 0;
    }

    const reactionTimeMs = this.firstMovementTime - this.startTime;

    // Convert to score: 0ms = 100, 1000ms = 0, 2000ms+ = 0
    // Better reaction time = higher score
    const score = Math.max(0, 100 - (reactionTimeMs / 10));
    return Math.round(Math.min(100, score));
  }

  /**
   * Reset processor state
   */
  reset() {
    this.landmarkHistory = [];
    this.frameCount = 0;
    this.startTime = null;
    this.firstMovementTime = null;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
    this.reset();
  }
}

export default PoseProcessor;
