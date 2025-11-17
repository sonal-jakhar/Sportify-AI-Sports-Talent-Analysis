# Sportify - AI Sports Talent Analysis

A production-ready Progressive Web App that uses AI-powered pose detection to analyze athletic movements and recommend suitable sports.

## Features

- 🎥 **Video Input**: Record live video or upload video files (MP4, WebM, MOV)
- 🤖 **AI Pose Detection**: Uses MediaPipe and TensorFlow.js for real-time pose analysis
- 📊 **Talent Scoring**: Comprehensive scoring across agility, balance, coordination, and reaction time
- 🏆 **Sport Recommendations**: Personalized sport recommendations based on analysis
- 📍 **Opportunity Mapping**: Discover local and national sports opportunities
- 🌐 **Multilingual**: English and Hindi support
- 📱 **PWA**: Full Progressive Web App support with offline capability
- 💾 **Offline Storage**: IndexedDB for storing videos and results locally

## Tech Stack

- React + Vite
- Tailwind CSS
- TensorFlow.js
- MediaPipe Pose
- IndexedDB
- PWA (Service Worker + Manifest)
- React Router

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/       # Reusable UI components
  pages/           # Page components
  core/            # Core business logic (PoseProcessor, ScoringEngine)
  i18n/            # Internationalization files
  utils/           # Utility functions
public/            # Static assets and PWA files
```

## Usage

1. **Record or Upload Video**: Go to the Analyze page and either record a video using your camera or upload an existing video file.

2. **Analysis**: The app will process your video frame-by-frame using AI pose detection.

3. **View Results**: See your scores, recommended sports, and improvement suggestions.

4. **Explore Opportunities**: Check out sports opportunities that match your profile.

5. **Download Report**: Generate and download a PDF report of your analysis.

## Deployment

The app can be deployed to Vercel or Netlify:

```bash
# Build the app
npm run build

# Deploy the dist/ folder to your hosting provider
```

## License

MIT
