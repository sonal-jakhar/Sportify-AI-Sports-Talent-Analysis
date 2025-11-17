# Sportify - AI Sports Talent Analysis

A **production-ready Progressive Web App (PWA)** that uses **AI-powered pose detection** (MediaPipe/TensorFlow.js) to analyze athletic movements and provide personalized sports talent scoring and recommendations.

## Features ✨

- 🎥 **Video Input**: Users can record live video or upload existing video files (MP4, WebM, MOV) directly through the browser.
- 🤖 **Client-Side AI**: Uses **MediaPipe** and **TensorFlow.js** to perform all pose analysis locally in the browser for high speed and data privacy.
- 📊 **Talent Scoring**: Comprehensive metrics are calculated for **agility, balance, coordination, and reaction time**.
- 🏆 **Sport Recommendations**: Personalized sports and role recommendations based on the user's analyzed scores compared against pre-set matrices.
- 🌐 **Multilingual**: Supports both English and Hindi languages.
- 📱 **PWA Support**: Full Progressive Web App functionality, including **offline capability** and installation to mobile/desktop.
- 💾 **Offline Storage**: **IndexedDB** is used for securely storing analysis results and user data locally on the device.

---

## Tech Stack 🛠️

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | Modern, fast development and lightweight bundling. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid styling. |
| **AI/ML** | **TensorFlow.js + MediaPipe Pose** | Enables fast, client-side pose estimation in the browser. |
| **Navigation** | **React Router** | Manages routing for the Single Page Application (SPA). |
| **Persistence** | **IndexedDB** | Local, high-volume data storage for PWA offline features. |
| **Hosting** | **Firebase Hosting** | Reliable, secure CDN hosting for static assets and easy integration with Firebase services. |

---

## Installation 🚀

To get a local copy up and running, follow these simple steps.

```bash
# 1. Clone the repository
git clone [Your GitHub Repo URL Here]
cd Sportify-AI-Sports-Talent-Analysis

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# The app will be available at http://localhost:5173 (or similar)

Project Structure 📁
src/
  components/       # Reusable UI components
  pages/           # Main page components (Login, Analyze, Report, etc.)
  core/            # Core business logic (e.g., PoseProcessor, TalentScoringEngine)
  i18n/            # Internationalization (multilingual) files
  utils/           # General utility functions
public/            # Static assets and PWA files (manifest.json, service-worker.js)

Usage Workflow 📈
Record or Upload Video: The user accesses the Analyze page and submits their performance video.

Analysis: The client-side TensorFlow.js model processes the video frame-by-frame, extracting 33 keypoints.

Scoring: The app calculates the four core metrics: Agility, Balance, Coordination, and Reaction Time.

Data Sync: Scores and reports are synced to Firebase Firestore for remote access and persistence.

View Report: The user views their personalized report, talent scores, and sport recommendations.

Deployment 🌐
The production-ready build is deployed to Firebase Hosting for reliability and integration with Firebase services.

Bash

# 1. Build the production files
npm run build

# 2. Deploy the generated 'dist/' folder to Firebase Hosting
firebase deploy --only hosting

License

Distributed under the MIT License.