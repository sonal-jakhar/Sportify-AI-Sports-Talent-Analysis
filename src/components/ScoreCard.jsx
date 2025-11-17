/**
 * ScoreCard.jsx
 * Component for displaying individual metric scores
 */

import { motion } from 'framer-motion';

function ScoreCard({ title, score, color = 'primary', index = 0 }) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const bgColorClass = colorClasses[color] || colorClasses.primary;

  // Calculate circumference for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
        {title}
      </h3>
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
            className={bgColorClass}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="text-3xl font-bold text-gray-800 score-value"
            >
              {score}
            </motion.div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${bgColorClass} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}

export default ScoreCard;
