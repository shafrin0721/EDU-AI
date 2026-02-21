// Import TensorFlow.js based services
import adaptiveModel from '../tensorflow/adaptiveModel'
import engagementAnalyzer from '../tensorflow/engagementAnalyzer'
import difficultyOptimizer from '../tensorflow/difficultyOptimizer'
import contentRecommender from '../tensorflow/contentRecommender'
import predictionValidator from '../tensorflow/predictionValidator'

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
    
    this.mlEnabled = true
    this.mlInitialized = false
  }

  async initializeML() {
    if (this.mlInitialized) return
    
    try {
      await Promise.all([
        adaptiveModel.initializeModel(),
        engagementAnalyzer.initialize(),
        difficultyOptimizer.initialize(),
        contentRecommender.initialize()
      ])
      this.mlInitialized = true
      console.log('TensorFlow.js models initialized successfully')
    } catch (error) {
      console.error('Error initializing ML models:', error)
      this.mlEnabled = false
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

  generateNextSteps(performance, engagement) {
    const steps = []
    
    if (performance.overallScore >= this.performanceThresholds.proficient) {
      steps.push('Continue to next module')
      steps.push('Attempt challenge exercises')
    } else if (performance.overallScore >= this.performanceThresholds.developing) {
      steps.push('Review current module content')
      steps.push('Complete additional practice exercises')
    } else {
      steps.push('Review fundamental concepts')
      steps.push('Request additional support')
    }
    
    if (engagement.overall < 0.4) {
      steps.push('Set daily learning goals')
      steps.push('Enable learning reminders')
    }
    
    return steps
  }

  calculateDifficultyAdjustment(performance) {
    if (performance.overallScore >= this.performanceThresholds.excellence) {
      return { direction: 'increase', steps: 2 }
    }
    if (performance.overallScore >= this.performanceThresholds.proficient) {
      return { direction: 'maintain', steps: 0 }
    }
    if (performance.overallScore >= this.performanceThresholds.developing) {
      return { direction: 'slight_decrease', steps: -1 }
    }
    return { direction: 'decrease', steps: -2 }
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

  selectOptimalModules(learningProfile, difficultyPreference) {
    // Simple implementation - returns recommended modules based on profile
    return {
      difficulty: difficultyPreference,
      level: learningProfile.level,
      pacing: learningProfile.preferredPace
    }
  }

  recommendPacing(learningProfile) {
    if (learningProfile.preferredPace === 'fast') {
      return { modulesPerWeek: 3, dailyTime: 45 }
    }
    if (learningProfile.preferredPace === 'slow') {
      return { modulesPerWeek: 1, dailyTime: 20 }
    }
    return { modulesPerWeek: 2, dailyTime: 30 }
  }

  determineSupportLevel(learningProfile) {
    if (learningProfile.level === 'struggling') return 'high'
    if (learningProfile.level === 'developing') return 'medium'
    return 'low'
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
    
    return Math.max(0, 1 - (standardDeviation / 30))
  }

  // TensorFlow.js powered methods
  async analyzeEngagementWithML(sessionData) {
    if (!this.mlInitialized) {
      await this.initializeML()
    }

    try {
      const analysis = await engagementAnalyzer.analyzeEngagement(sessionData)
      return {
        ...analysis,
        mlPowered: true,
        realTimeAnalysis: true
      }
    } catch (error) {
      console.error('Error in ML engagement analysis:', error)
      return this.calculateEngagementMetrics(sessionData)
    }
  }

  async getDifficultyRecommendationWithML(learnerData) {
    if (!this.mlInitialized) {
      await this.initializeML()
    }

    try {
      const recommendation = await difficultyOptimizer.getDifficultyRecommendation(learnerData)
      return {
        ...recommendation,
        mlPowered: true
      }
    } catch (error) {
      console.error('Error in ML difficulty recommendation:', error)
      return null
    }
  }

  async recommendContentWithML(learnerData, availableContent) {
    if (!this.mlInitialized) {
      await this.initializeML()
    }

    try {
      const result = await contentRecommender.recommendContent(learnerData, availableContent)
      return {
        ...result,
        mlPowered: true
      }
    } catch (error) {
      console.error('Error in ML content recommendation:', error)
      return []
    }
  }

  async predictPerformanceWithML(learnerFeatures) {
    if (!this.mlInitialized) {
      await this.initializeML()
    }

    try {
      const prediction = await adaptiveModel.predictPerformance(learnerFeatures)
      return {
        ...prediction,
        mlPowered: true
      }
    } catch (error) {
      console.error('Error in ML performance prediction:', error)
      return null
    }
  }

  async getFullAdaptiveAnalysis(learnerData, sessionData, availableContent) {
    if (!this.mlInitialized) {
      await this.initializeML()
    }

    const [engagementAnalysis, difficultyRec, contentRec, performancePred] = await Promise.all([
      this.analyzeEngagementWithML(sessionData),
      this.getDifficultyRecommendationWithML(learnerData),
      this.recommendContentWithML(learnerData, availableContent),
      this.predictPerformanceWithML(learnerData)
    ])

    return {
      engagement: engagementAnalysis,
      difficulty: difficultyRec,
      content: contentRec,
      prediction: performancePred,
      overallRecommendation: this.generateOverallRecommendation(engagementAnalysis, difficultyRec, performancePred)
    }
  }

  generateOverallRecommendation(engagement, difficulty, prediction) {
    const recommendations = []

    if (engagement?.level === 'critical') {
      recommendations.push({ type: 'urgent', message: 'Immediate intervention needed - low engagement' })
    }

    if (difficulty?.finalRecommendation?.direction === 'decrease') {
      recommendations.push({ type: 'support', message: 'Reduce difficulty and provide additional support' })
    }

    if (prediction?.predictedScore > 0.85) {
      recommendations.push({ type: 'advance', message: 'Ready for advanced content' })
    }

    return recommendations
  }

  // Prediction Validation Methods - Track AI prediction accuracy
  recordPredictionResult(prediction, actualResult, category) {
    try {
      const record = predictionValidator.recordPrediction(prediction, actualResult, category)
      console.log('Prediction result recorded:', record)
      return record
    } catch (error) {
      console.error('Error recording prediction result:', error)
      return null
    }
  }

  getPredictionAccuracy() {
    try {
      return predictionValidator.getMetricsReport()
    } catch (error) {
      console.error('Error getting prediction accuracy:', error)
      return null
    }
  }

  getAccuracyByCategory() {
    try {
      return predictionValidator.getAccuracyByCategory()
    } catch (error) {
      console.error('Error getting accuracy by category:', error)
      return null
    }
  }

  getAccuracyTrends(days = 7) {
    try {
      return predictionValidator.getAccuracyTrends(days)
    } catch (error) {
      console.error('Error getting accuracy trends:', error)
      return null
    }
  }

  getModelImprovementRecommendations() {
    try {
      return predictionValidator.getImprovementRecommendations()
    } catch (error) {
      console.error('Error getting improvement recommendations:', error)
      return null
    }
  }

  validatePredictionWithActual(prediction, actualScore, learnerId, courseId, moduleId) {
    // Determine category based on actual score
    let category = 'developing'
    if (actualScore >= 90) category = 'excellent'
    else if (actualScore >= 75) category = 'proficient'
    else if (actualScore >= 60) category = 'developing'
    else category = 'struggling'

    const actualResult = {
      actualScore: actualScore / 100, // Convert to 0-1 scale
      outcome: actualScore >= 60 ? 'completed' : 'needs_support',
      learnerId,
      courseId,
      moduleId
    }

    return this.recordPredictionResult(prediction, actualResult, category)
  }

  clearPredictionData() {
    try {
      predictionValidator.clearData()
      console.log('Prediction data cleared')
      return true
    } catch (error) {
      console.error('Error clearing prediction data:', error)
      return false
    }
  }

  exportPredictionData() {
    try {
      return predictionValidator.exportData()
    } catch (error) {
      console.error('Error exporting prediction data:', error)
      return null
    }
  }
}

const adaptiveLearningEngine = new AdaptiveLearningEngine()
export default adaptiveLearningEngine
