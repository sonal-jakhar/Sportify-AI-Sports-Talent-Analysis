/**
 * ScoringEngine.js
 * Rule-based scoring engine that calculates sports suitability scores
 * based on pose detection metrics
 */

import sportsMapping from './SportsMapping.json';

class ScoringEngine {
  constructor() {
    this.sportsMapping = sportsMapping.sports;
  }

  /**
   * Calculate scores for all metrics
   * @param {Object} metrics - Metrics from PoseProcessor
   * @returns {Object} Scores object with agility, balance, coordination, reactionTime
   */
  calculateScores(metrics) {
    return {
      agility: Math.round(Math.min(100, Math.max(0, metrics.agility))),
      balance: Math.round(Math.min(100, Math.max(0, metrics.balance))),
      coordination: Math.round(Math.min(100, Math.max(0, metrics.coordination))),
      reactionTime: Math.round(Math.min(100, Math.max(0, metrics.reactionTime)))
    };
  }

  /**
   * Calculate sports suitability scores for each sport
   * @param {Object} scores - Individual metric scores
   * @returns {Array} Array of sports with suitability scores, sorted by score
   */
  calculateSportsSuitability(scores) {
    const results = this.sportsMapping.map(sport => {
      // Weighted score calculation
      const weightedScore = 
        (scores.agility * sport.weight.agility) +
        (scores.balance * sport.weight.balance) +
        (scores.coordination * sport.weight.coordination) +
        (scores.reactionTime * sport.weight.reactionTime);

      // Check if minimum requirements are met
      const meetsRequirements = 
        scores.agility >= sport.minScores.agility &&
        scores.balance >= sport.minScores.balance &&
        scores.coordination >= sport.minScores.coordination &&
        scores.reactionTime >= sport.minScores.reactionTime;

      return {
        ...sport,
        suitabilityScore: Math.round(weightedScore),
        meetsRequirements,
        scoreBreakdown: {
          agility: scores.agility,
          balance: scores.balance,
          coordination: scores.coordination,
          reactionTime: scores.reactionTime
        }
      };
    });

    // Sort by suitability score (descending)
    return results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  /**
   * Get recommended sports (top 3 or those meeting requirements)
   * @param {Array} sportsSuitability - Array from calculateSportsSuitability
   * @returns {Array} Recommended sports
   */
  getRecommendedSports(sportsSuitability) {
    const recommended = sportsSuitability
      .filter(sport => sport.meetsRequirements)
      .slice(0, 3);

    // If none meet requirements, return top 3 by score
    if (recommended.length === 0) {
      return sportsSuitability.slice(0, 3);
    }

    return recommended;
  }

  /**
   * Generate improvement suggestions based on scores
   * @param {Object} scores - Individual metric scores
   * @param {Array} recommendedSports - Recommended sports
   * @returns {Array} Array of improvement suggestions
   */
  generateImprovementSuggestions(scores, recommendedSports) {
    const suggestions = [];

    // Analyze weak areas
    const weakAreas = [];
    if (scores.agility < 60) weakAreas.push({ metric: 'agility', score: scores.agility });
    if (scores.balance < 60) weakAreas.push({ metric: 'balance', score: scores.balance });
    if (scores.coordination < 60) weakAreas.push({ metric: 'coordination', score: scores.coordination });
    if (scores.reactionTime < 60) weakAreas.push({ metric: 'reactionTime', score: scores.reactionTime });

    // Sort by score (lowest first)
    weakAreas.sort((a, b) => a.score - b.score);

    // Generate suggestions for weak areas
    const suggestionMap = {
      agility: {
        en: 'Practice quick direction changes, ladder drills, and agility cone exercises to improve movement speed and responsiveness.',
        hi: 'गति और प्रतिक्रिया में सुधार के लिए त्वरित दिशा परिवर्तन, सीढ़ी अभ्यास और चपलता शंकु अभ्यास करें।'
      },
      balance: {
        en: 'Focus on single-leg exercises, yoga poses, and stability training to enhance body control and balance.',
        hi: 'शरीर नियंत्रण और संतुलन बढ़ाने के लिए एकल-पैर अभ्यास, योग मुद्राएं और स्थिरता प्रशिक्षण पर ध्यान दें।'
      },
      coordination: {
        en: 'Practice bilateral exercises, juggling, and synchronized movements to improve coordination between body parts.',
        hi: 'शरीर के अंगों के बीच समन्वय में सुधार के लिए द्विपक्षीय अभ्यास, जगलिंग और समकालिक गतिविधियों का अभ्यास करें।'
      },
      reactionTime: {
        en: 'Train with reaction drills, quick response exercises, and sports-specific drills to improve reaction speed.',
        hi: 'प्रतिक्रिया गति में सुधार के लिए प्रतिक्रिया अभ्यास, त्वरित प्रतिक्रिया अभ्यास और खेल-विशिष्ट अभ्यास के साथ प्रशिक्षण लें।'
      }
    };

    weakAreas.slice(0, 3).forEach(area => {
      if (suggestionMap[area.metric]) {
        suggestions.push({
          metric: area.metric,
          currentScore: area.score,
          targetScore: 70,
          suggestion: suggestionMap[area.metric]
        });
      }
    });

    // Add sport-specific suggestions if no recommendations meet requirements
    if (recommendedSports.length > 0 && !recommendedSports[0].meetsRequirements) {
      const topSport = recommendedSports[0];
      suggestions.push({
        metric: 'general',
        currentScore: topSport.suitabilityScore,
        targetScore: 75,
        suggestion: {
          en: `Focus on improving ${topSport.name.toLowerCase()} specific skills. Work on the metrics where you're below the minimum requirements.`,
          hi: `${topSport.nameHi} विशिष्ट कौशल में सुधार पर ध्यान दें। उन मीट्रिक्स पर काम करें जहाँ आप न्यूनतम आवश्यकताओं से नीचे हैं।`
        }
      });
    }

    return suggestions;
  }

  /**
   * Calculate overall sports suitability score
   * @param {Object} scores - Individual metric scores
   * @returns {number} Overall score (0-100)
   */
  calculateOverallScore(scores) {
    const avgScore = (
      scores.agility + 
      scores.balance + 
      scores.coordination + 
      scores.reactionTime
    ) / 4;

    return Math.round(avgScore);
  }

  /**
   * Process complete analysis
   * @param {Object} metrics - Raw metrics from PoseProcessor
   * @returns {Object} Complete analysis results
   */
  processAnalysis(metrics) {
    const scores = this.calculateScores(metrics);
    const sportsSuitability = this.calculateSportsSuitability(scores);
    const recommendedSports = this.getRecommendedSports(sportsSuitability);
    const suggestions = this.generateImprovementSuggestions(scores, recommendedSports);
    const overallScore = this.calculateOverallScore(scores);

    return {
      scores,
      sportsSuitability,
      recommendedSports,
      suggestions,
      overallScore,
      timestamp: new Date().toISOString()
    };
  }
}

export default ScoringEngine;
