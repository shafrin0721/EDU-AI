class AdaptiveLearningEngine {
  constructor() {
    this.performanceThresholds = {
      excellence: 0.9,
      proficiency: 0.75,
      developing: 0.6,
      struggling: 0.4
    }
    
    this.engagementFactors = {
      timeSpent: { min: 300, optimal: 1800, max: 3600 },
      interactionRate: { min: 0.3, optimal: 0.7, max: 1.0 },
      practiceCompletion: { min: 0.5, optimal: 0.8, max: 1.0 }
    }
  }

  analyzePerformance(sessionData, assessmentData) {
    const performanceMetrics = this.calculatePerformanceMetrics(sessionData, assessmentData)
    const engagementMetrics = this.calculateEngagementMetrics(sessionData)
    const adaptationRecommendations = this.generateAdaptationRecommendations(performanceMetrics, engagementMetrics)
    
    return {
      performanceLevel: this.determinePerformanceLevel(performanceMetrics.overallScore),
      engagementLevel: this.determineEngagementLevel(engagementMetrics),
      adaptationRecommendations,
      nextStepSuggestions: this.generateNextSteps(performanceMetrics, engagementMetrics),
      difficultyAdjustment: this.calculateDifficultyAdjustment(performanceMetrics)
    }
  }

  calculatePerformanceMetrics(sessionData, assessmentData) {
    const assessmentScore = assessmentData?.score || 0
    const completionRate = sessionData?.completionRate || 0
    const accuracyRate = assessmentData?.accuracyRate || assessmentScore / 100
    
    return {
      overallScore: (assessmentScore * 0.5) + (completionRate * 0.3) + (accuracyRate * 0.2),
      assessmentScore,
      completionRate,
      accuracyRate,
      consistencyScore: this.calculateConsistency(sessionData, assessmentData)
    }
  }

  calculateEngagementMetrics(sessionData) {
    const timeSpent = sessionData?.timeSpent || 0
    const interactionCount = sessionData?.interactionCount || 0
    const practiceCompleted = sessionData?.practiceExercisesCompleted || 0
    
    const timeEngagement = this.normalizeTimeEngagement(timeSpent)
    const interactionEngagement = Math.min(interactionCount / 20, 1)
    const practiceEngagement = Math.min(practiceCompleted / 5, 1)
    
    return {
      overall: (timeEngagement * 0.4) + (interactionEngagement * 0.3) + (practiceEngagement * 0.3),
      timeSpent: timeEngagement,
      interactions: interactionEngagement,
      practice: practiceEngagement
    }
  }

  generateAdaptationRecommendations(performance, engagement) {
    const recommendations = []
    
    if (performance.overallScore >= this.performanceThresholds.excellence) {
      recommendations.push({
        type: 'difficulty_increase',
        priority: 'high',
        reason: 'Exceptional performance indicates readiness for advanced content',
        action: 'Unlock advanced modules and challenge problems'
      })
    }
    
    if (performance.overallScore <= this.performanceThresholds.struggling) {
      recommendations.push({
        type: 'remediation',
        priority: 'critical',
        reason: 'Performance indicates need for foundational review',
        action: 'Provide additional practice and simplified explanations'
      })
    }
    
    if (engagement.overall < 0.5) {
      recommendations.push({
        type: 'engagement_boost',
        priority: 'medium',
        reason: 'Low engagement may impact learning outcomes',
        action: 'Introduce interactive elements and gamification'
      })
    }
    
    return recommendations
  }

  generatePersonalizedPath(userId, performanceHistory, preferences) {
    const learningProfile = this.buildLearningProfile(performanceHistory)
    const difficultyPreference = preferences?.preferredDifficulty || 'intermediate'
    const learningStyle = preferences?.learningStyle || 'mixed'
    
    return {
      recommendedModules: this.selectOptimalModules(learningProfile, difficultyPreference),
      learningStyle: learningStyle,
      pacing: this.recommendPacing(learningProfile),
      supportLevel: this.determineSupportLevel(learningProfile)
    }
  }

  normalizeTimeEngagement(timeSpent) {
    const { min, optimal, max } = this.engagementFactors.timeSpent
    if (timeSpent < min) return timeSpent / min * 0.5
    if (timeSpent <= optimal) return 0.5 + (timeSpent - min) / (optimal - min) * 0.5
    if (timeSpent <= max) return 1 - (timeSpent - optimal) / (max - optimal) * 0.3
    return 0.7
  }

  determinePerformanceLevel(score) {
    if (score >= this.performanceThresholds.excellence) return 'excellent'
    if (score >= this.performanceThresholds.proficiency) return 'proficient'
    if (score >= this.performanceThresholds.developing) return 'developing'
    return 'struggling'
  }

  determineEngagementLevel(engagement) {
    if (engagement.overall >= 0.8) return 'high'
    if (engagement.overall >= 0.6) return 'moderate'
    if (engagement.overall >= 0.4) return 'low'
    return 'critical'
  }

  calculateConsistency(sessionData, assessmentData) {
    // Simplified consistency calculation
    const timeVariation = sessionData?.timeSpent ? Math.abs(sessionData.timeSpent - 1800) / 1800 : 0.5
    const scoreVariation = assessmentData?.score ? Math.abs(assessmentData.score - 75) / 75 : 0.5
    return Math.max(0, 1 - (timeVariation + scoreVariation) / 2)
  }

  buildLearningProfile(performanceHistory) {
    if (!performanceHistory || performanceHistory.length === 0) {
      return { level: 'beginner', consistency: 0.5, preferredPace: 'moderate' }
    }
    
    const avgScore = performanceHistory.reduce((sum, p) => sum + p.score, 0) / performanceHistory.length
    const consistency = this.calculateHistoricalConsistency(performanceHistory)
    
    return {
      level: this.determinePerformanceLevel(avgScore / 100),
      consistency,
      preferredPace: consistency > 0.7 ? 'fast' : consistency > 0.4 ? 'moderate' : 'slow'
    }
  }

  calculateHistoricalConsistency(history) {
    if (history.length < 2) return 0.5
    
    const scores = history.map(h => h.score)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.max(0, 1 - (standardDeviation / 30)) // Normalize to 0-1 range
  }
}

const adaptiveLearningEngine = new AdaptiveLearningEngine()
export default adaptiveLearningEngine