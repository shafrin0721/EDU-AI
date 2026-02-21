/**
 * EngagementAnalyzer - TensorFlow.js based engagement pattern analysis
 * Analyzes learner behavior patterns and engagement trends
 */

import * as tf from '@tensorflow/tfjs';

class EngagementAnalyzer {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.engagementThreshold = {
      high: 0.8,
      moderate: 0.5,
      low: 0.3,
      critical: 0.15
    };
  }

  /**
   * Initialize the engagement analysis model
   */
  async initialize() {
    try {
      await tf.ready();
      
      // Create a simple model for engagement classification
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [6], // 6 engagement features
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 4, // 4 engagement levels
            activation: 'softmax'
          })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.isReady = true;
      console.log('Engagement analyzer initialized');
      return true;
    } catch (error) {
      console.error('Error initializing engagement analyzer:', error);
      return false;
    }
  }

  /**
   * Extract engagement features from session data
   */
  extractEngagementFeatures(sessionData) {
    const features = {
      timeEngagement: this.calculateTimeEngagement(sessionData.timeSpent),
      interactionEngagement: this.calculateInteractionEngagement(sessionData.interactionCount),
      practiceEngagement: this.calculatePracticeEngagement(sessionData.practiceExercisesCompleted),
      progressEngagement: this.calculateProgressEngagement(sessionData.completionRate),
      consistencyEngagement: this.calculateConsistencyEngagement(sessionData.sessionHistory),
      sessionFrequency: this.calculateSessionFrequency(sessionData.sessionsLastWeek)
    };

    return [
      features.timeEngagement,
      features.interactionEngagement,
      features.practiceEngagement,
      features.progressEngagement,
      features.consistencyEngagement,
      features.sessionFrequency
    ];
  }

  /**
   * Calculate time-based engagement score
   */
  calculateTimeEngagement(timeSpent) {
    const optimalTime = 30; // 30 minutes
    const maxTime = 60;
    
    if (timeSpent < 5) return 0.1;
    if (timeSpent > maxTime) return 0.7;
    
    // Optimal engagement around 30 minutes
    const ratio = timeSpent / optimalTime;
    if (ratio <= 1) return ratio * 0.9;
    return Math.max(0.3, 1 - (ratio - 1) * 0.3);
  }

  /**
   * Calculate interaction-based engagement
   */
  calculateInteractionEngagement(interactions) {
    const optimalInteractions = 20;
    const minInteractions = 5;
    
    if (interactions < minInteractions) return interactions / minInteractions * 0.3;
    if (interactions > optimalInteractions * 2) return 0.8;
    
    return Math.min(1, interactions / optimalInteractions);
  }

  /**
   * Calculate practice engagement
   */
  calculatePracticeEngagement(practiceCompleted) {
    const optimal = 8;
    const min = 2;
    
    if (practiceCompleted < min) return practiceCompleted / min * 0.3;
    return Math.min(1, practiceCompleted / optimal);
  }

  /**
   * Calculate progress-based engagement
   */
  calculateProgressEngagement(completionRate) {
    return Math.min(1, completionRate / 100);
  }

  /**
   * Calculate consistency engagement
   */
  calculateConsistencyEngagement(sessionHistory) {
    if (!sessionHistory || sessionHistory.length < 2) return 0.5;
    
    const scores = sessionHistory.map(s => s.engagementScore || 0.5);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - stdDev);
  }

  /**
   * Calculate session frequency
   */
  calculateSessionFrequency(sessionsLastWeek) {
    const optimalFrequency = 5;
    if (sessionsLastWeek <= 0) return 0.1;
    if (sessionsLastWeek > optimalFrequency * 2) return 0.8;
    return Math.min(1, sessionsLastWeek / optimalFrequency);
  }

  /**
   * Analyze engagement patterns
   */
  async analyzeEngagement(sessionData) {
    if (!this.isReady) {
      await this.initialize();
    }

    const features = this.extractEngagementFeatures(sessionData);
    const overallEngagement = this.calculateOverallEngagement(features);
    const engagementLevel = this.determineEngagementLevel(overallEngagement);
    const patterns = this.identifyEngagementPatterns(sessionData);
    const warnings = this.detectEngagementWarnings(features);
    const recommendations = this.generateEngagementRecommendations(engagementLevel, patterns);

    return {
      overallScore: overallEngagement,
      level: engagementLevel,
      features: {
        timeEngagement: features[0],
        interactionEngagement: features[1],
        practiceEngagement: features[2],
        progressEngagement: features[3],
        consistencyEngagement: features[4],
        sessionFrequency: features[5]
      },
      patterns,
      warnings,
      recommendations,
      trend: this.calculateEngagementTrend(sessionData)
    };
  }

  /**
   * Calculate overall engagement score
   */
  calculateOverallEngagement(features) {
    const weights = {
      time: 0.2,
      interaction: 0.2,
      practice: 0.2,
      progress: 0.2,
      consistency: 0.1,
      frequency: 0.1
    };

    return (
      features[0] * weights.time +
      features[1] * weights.interaction +
      features[2] * weights.practice +
      features[3] * weights.progress +
      features[4] * weights.consistency +
      features[5] * weights.frequency
    );
  }

  /**
   * Determine engagement level category
   */
  determineEngagementLevel(score) {
    if (score >= this.engagementThreshold.high) return 'high';
    if (score >= this.engagementThreshold.moderate) return 'moderate';
    if (score >= this.engagementThreshold.low) return 'low';
    return 'critical';
  }

  /**
   * Identify engagement patterns
   */
  identifyEngagementPatterns(sessionData) {
    const patterns = [];

    // Pattern: Consistent learner
    if (sessionData.sessionHistory && sessionData.sessionHistory.length >= 3) {
      const recentSessions = sessionData.sessionHistory.slice(-3);
      const avgEngagement = recentSessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / recentSessions.length;
      if (avgEngagement > 0.7) {
        patterns.push({
          type: 'consistent_learner',
          description: 'Shows consistent engagement over time',
          positive: true
        });
      }
    }

    // Pattern: Peak time learner
    if (sessionData.preferredTime) {
      patterns.push({
        type: 'peak_time_learner',
        description: `Most active during ${sessionData.preferredTime}`,
        positive: true
      });
    }

    // Pattern: Weekend learner
    if (sessionData.weekendActivity && sessionData.weekendActivity > 0.5) {
      patterns.push({
        type: 'weekend_learner',
        description: 'Prefers learning on weekends',
        positive: true
      });
    }

    // Pattern: Spaced learner
    if (sessionData.averageGapBetweenSessions && sessionData.averageGapBetweenSessions > 1) {
      patterns.push({
        type: 'spaced_learner',
        description: 'Benefits from spaced learning sessions',
        positive: true
      });
    }

    return patterns;
  }

  /**
   * Detect engagement warnings
   */
  detectEngagementWarnings(features) {
    const warnings = [];

    if (features[0] < 0.3) {
      warnings.push({
        type: 'low_time_engagement',
        message: 'Student spends very little time on content',
        severity: 'high'
      });
    }

    if (features[1] < 0.3) {
      warnings.push({
        type: 'low_interaction',
        message: 'Minimal interaction with learning materials',
        severity: 'medium'
      });
    }

    if (features[4] < 0.3) {
      warnings.push({
        type: 'inconsistent_learning',
        message: 'Learning pattern is highly inconsistent',
        severity: 'medium'
      });
    }

    if (features[5] < 0.3) {
      warnings.push({
        type: 'low_session_frequency',
        message: 'Rarely logs in to learn',
        severity: 'high'
      });
    }

    return warnings;
  }

  /**
   * Generate engagement improvement recommendations
   */
  generateEngagementRecommendations(engagementLevel, patterns) {
    const recommendations = [];

    if (engagementLevel === 'critical' || engagementLevel === 'low') {
      recommendations.push({
        type: 'gamification',
        action: 'Introduce gamification elements like badges and leaderboards',
        priority: 'high'
      });

      recommendations.push({
        type: 'reminder',
        action: 'Set up learning reminders and notifications',
        priority: 'medium'
      });

      recommendations.push({
        type: 'shorter_content',
        action: 'Break content into shorter, digestible segments',
        priority: 'high'
      });
    }

    if (engagementLevel === 'moderate') {
      recommendations.push({
        type: 'increase_interactivity',
        action: 'Add more interactive exercises and quizzes',
        priority: 'medium'
      });

      recommendations.push({
        type: 'social_learning',
        action: 'Encourage peer learning and discussion',
        priority: 'low'
      });
    }

    if (engagementLevel === 'high') {
      recommendations.push({
        type: 'advanced_content',
        action: 'Student is ready for advanced/challenging content',
        priority: 'low'
      });

      recommendations.push({
        type: 'mentor_role',
        action: 'Consider allowing student to mentor others',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Calculate engagement trend over time
   */
  calculateEngagementTrend(sessionData) {
    if (!sessionData.sessionHistory || sessionData.sessionHistory.length < 2) {
      return 'insufficient_data';
    }

    const recent = sessionData.sessionHistory.slice(-3);
    const older = sessionData.sessionHistory.slice(0, Math.min(3, sessionData.sessionHistory.length - 3));

    if (recent.length === 0 || older.length === 0) return 'insufficient_data';

    const recentAvg = recent.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.15) return 'improving';
    if (difference < -0.15) return 'declining';
    return 'stable';
  }

  /**
   * Batch analyze engagement for multiple learners
   */
  async batchAnalyzeEngagement(learnerSessions) {
    const results = [];
    
    for (const session of learnerSessions) {
      const analysis = await this.analyzeEngagement(session);
      results.push({
        learnerId: session.learnerId,
        ...analysis
      });
    }

    return results;
  }

  /**
   * Get engagement summary for analytics dashboard
   */
  async getEngagementSummary(allSessions) {
    if (!allSessions || allSessions.length === 0) {
      return {
        averageEngagement: 0,
        distribution: { high: 0, moderate: 0, low: 0, critical: 0 },
        trends: []
      };
    }

    const analyses = await this.batchAnalyzeEngagement(allSessions);
    
    const totalEngagement = analyses.reduce((sum, a) => sum + a.overallScore, 0);
    const averageEngagement = totalEngagement / analyses.length;

    const distribution = {
      high: analyses.filter(a => a.level === 'high').length,
      moderate: analyses.filter(a => a.level === 'moderate').length,
      low: analyses.filter(a => a.level === 'low').length,
      critical: analyses.filter(a => a.level === 'critical').length
    };

    return {
      averageEngagement,
      distribution,
      totalLearners: analyses.length,
      topPatterns: this.getTopPatterns(analyses),
      commonWarnings: this.getCommonWarnings(analyses)
    };
  }

  /**
   * Get most common engagement patterns
   */
  getTopPatterns(analyses) {
    const patternCounts = {};
    
    analyses.forEach(a => {
      a.patterns.forEach(p => {
        patternCounts[p.type] = (patternCounts[p.type] || 0) + 1;
      });
    });

    return Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Get most common warnings
   */
  getCommonWarnings(analyses) {
    const warningCounts = {};
    
    analyses.forEach(a => {
      a.warnings.forEach(w => {
        warningCounts[w.type] = (warningCounts[w.type] || 0) + 1;
      });
    });

    return Object.entries(warningCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.isReady = false;
    }
  }
}

// Export singleton instance
const engagementAnalyzer = new EngagementAnalyzer();
export default engagementAnalyzer;
