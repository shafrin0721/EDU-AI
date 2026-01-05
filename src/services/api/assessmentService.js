import assessmentsData from "../mockData/assessments.json"

class AssessmentService {
  constructor() {
    this.data = [...assessmentsData]
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.data]
  }

  async getById(id) {
    await this.delay()
    const numId = parseInt(id)
    const assessment = this.data.find(item => item.Id === numId)
    return assessment ? { ...assessment } : null
  }

  async getByStudent(studentId) {
    await this.delay()
    return this.data.filter(assessment => assessment.studentId === studentId).map(assessment => ({ ...assessment }))
  }

  async getByModule(moduleId) {
    await this.delay()
    return this.data.filter(assessment => assessment.moduleId === moduleId).map(assessment => ({ ...assessment }))
  }

  async create(assessment) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newAssessment = {
      ...assessment,
      Id: maxId + 1,
      submittedAt: new Date().toISOString()
    }
    this.data.push(newAssessment)
    return { ...newAssessment }
  }

async submitAssessment(moduleId, studentId, answers, timeSpent) {
    await this.delay(500) // Simulate AI processing time
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const score = Math.floor(Math.random() * 40) + 60 // 60-100% score
    
    const newAssessment = {
      Id: maxId + 1,
      moduleId,
      studentId,
      answers,
      score,
      timeSpent,
      attemptNumber: 1,
aiAnalysis: {
        strengthAreas: this.identifyStrengthAreas(score, timeSpent),
        improvementAreas: this.identifyImprovementAreas(score, answers),
        recommendedNextSteps: this.generateNextSteps(score, moduleId),
        confidenceLevel: this.calculateConfidenceLevel(score, timeSpent),
        adaptationSuggestions: this.generateAdaptationSuggestions(score, moduleId, timeSpent),
        learningInsights: {
          conceptMastery: score / 100,
          problemSolvingSpeed: Math.max(0.1, 1 - (timeSpent / 300)),
          retentionPrediction: this.predictRetention(score, timeSpent),
          recommendedStudyTime: this.calculateOptimalStudyTime(score, timeSpent),
          difficultyAlignment: this.assessDifficultyAlignment(score, timeSpent),
          engagementScore: this.calculateEngagementScore(timeSpent, answers),
          learningVelocity: this.calculateLearningVelocity(score, timeSpent)
        },
        personalizedRecommendations: this.generatePersonalizedRecommendations(score, studentId, moduleId)
      },
      submittedAt: new Date().toISOString()
    }
    
    this.data.push(newAssessment)
    return { ...newAssessment }
  }

identifyStrengthAreas(score, timeSpent) {
    const strengths = []
    
    if (score >= 90) strengths.push("exceptional-performance", "concept-mastery")
    else if (score >= 80) strengths.push("strong-understanding", "problem-solving")
    else if (score >= 70) strengths.push("concept-understanding")
    
    if (timeSpent && timeSpent < 900) strengths.push("quick-learning")
    else if (timeSpent && timeSpent > 1800) strengths.push("thorough-approach")
    
    return strengths
  }

  identifyImprovementAreas(score, answers) {
    const improvements = []
    
    if (score < 60) improvements.push("fundamental-concepts", "problem-approach")
    else if (score < 75) improvements.push("application-skills", "attention-to-detail")
    else if (score < 85) improvements.push("advanced-concepts")
    
    // Analyze answer patterns for more specific feedback
    if (answers && answers.length > 0) {
      const incorrectCount = answers.filter(a => !a.correct).length
      if (incorrectCount > answers.length * 0.3) {
        improvements.push("review-practice")
      }
    }
    
    return improvements
  }

  generateNextSteps(score, moduleId) {
    const steps = []
    
    if (score >= 85) {
      steps.push("advance-to-complex-topics", "explore-practical-applications", "attempt-challenge-problems")
    } else if (score >= 70) {
      steps.push("reinforce-current-concepts", "practice-similar-problems", "gradual-difficulty-increase")
    } else {
      steps.push("review-fundamentals", "additional-practice", "seek-help-if-needed")
    }
    
    return steps
  }

  calculateConfidenceLevel(score, timeSpent) {
    let confidence = score / 100
    
    // Adjust for time spent - very fast or very slow completion affects confidence
    if (timeSpent) {
      const timeRatio = timeSpent / 1800 // Expected 30 minutes
      if (timeRatio < 0.3 || timeRatio > 2.5) {
        confidence *= 0.8 // Reduce confidence for extreme time ratios
      }
    }
    
    return Math.max(0.1, Math.min(1, confidence))
  }

  generateAdaptationSuggestions(score, moduleId, timeSpent) {
    const suggestions = []
    
    if (score >= 90) {
      suggestions.push({
        type: "difficulty_increase",
        reason: "exceptional_performance",
        module: `Advanced Module ${moduleId + 1}`,
        topic: "Advanced Applications",
        confidence: 0.9
      })
    } else if (score >= 75) {
      suggestions.push({
        type: "gradual_progression",
        reason: "solid_understanding",
        module: `Module ${moduleId + 1}`,
        topic: "Next Level Concepts",
        confidence: 0.8
      })
    } else if (score >= 60) {
      suggestions.push({
        type: "reinforcement_practice",
        reason: "developing_understanding",
        module: `Practice Set ${moduleId}`,
        topic: "Skill Reinforcement",
        confidence: 0.7
      })
    } else {
      suggestions.push({
        type: "remediation",
        reason: "foundational_gaps",
        module: `Review Module ${Math.max(1, moduleId - 1)}`,
        topic: "Foundational Review",
        confidence: 0.85
      })
    }
    
    return suggestions
  }

  predictRetention(score, timeSpent) {
    let retention = Math.min(1, score / 80)
    
    // Time spent affects retention
    if (timeSpent) {
      const optimalTime = 1800 // 30 minutes
      const timeEfficiency = Math.min(1, optimalTime / Math.max(timeSpent, 300))
      retention = (retention + timeEfficiency) / 2
    }
    
    return Math.max(0.2, retention)
  }

  calculateOptimalStudyTime(score, timeSpent) {
    const baseTime = 30 // minutes
    
    if (score < 60) return baseTime * 1.8
    if (score < 75) return baseTime * 1.4
    if (score < 85) return baseTime * 1.1
    return baseTime * 0.9
  }

  assessDifficultyAlignment(score, timeSpent) {
    if (score >= 90 && timeSpent < 900) return "too_easy"
    if (score >= 85 && timeSpent < 1200) return "slightly_easy"
    if (score >= 65 && timeSpent <= 2400) return "well_aligned"
    if (score >= 50 && timeSpent > 2400) return "slightly_difficult"
    return "too_difficult"
  }

  calculateEngagementScore(timeSpent, answers) {
    let engagement = 0.5
    
    if (timeSpent) {
      const timeEngagement = Math.min(1, timeSpent / 1800)
      engagement = (engagement + timeEngagement) / 2
    }
    
    if (answers && answers.length > 0) {
      const attemptRate = answers.length / Math.max(answers.length, 10)
      engagement = (engagement + attemptRate) / 2
    }
    
    return Math.max(0.1, Math.min(1, engagement))
  }

  calculateLearningVelocity(score, timeSpent) {
    if (!timeSpent) return 0.5
    
    const scorePerMinute = score / (timeSpent / 60)
    const normalizedVelocity = Math.min(1, scorePerMinute / 3) // Normalize to reasonable range
    
    return normalizedVelocity
  }

  generatePersonalizedRecommendations(score, studentId, moduleId) {
    const recommendations = []
    
    // Performance-based recommendations
    if (score >= 90) {
      recommendations.push({
        type: "enrichment",
        message: "🌟 Exceptional work! Consider exploring advanced topics or helping peers",
        priority: "high"
      })
    } else if (score < 60) {
      recommendations.push({
        type: "support",
        message: "💪 Focus on building strong foundations. Consider additional study time",
        priority: "high"
      })
    }
    
    // Module-specific recommendations
    recommendations.push({
      type: "next_action",
      message: score >= 75 
        ? `🚀 Ready for Module ${moduleId + 1}! Your progress is excellent`
        : `📚 Consider reviewing Module ${moduleId} concepts before proceeding`,
      priority: "medium"
    })
    
    return recommendations
  }
  async getAssessmentAnalytics(moduleId) {
    await this.delay()
    const moduleAssessments = this.data.filter(a => a.moduleId === moduleId)
    
    return {
      totalAttempts: moduleAssessments.length,
      averageScore: moduleAssessments.reduce((sum, a) => sum + a.score, 0) / moduleAssessments.length || 0,
      passingRate: moduleAssessments.filter(a => a.score >= 70).length / moduleAssessments.length || 0,
      averageTimeSpent: moduleAssessments.reduce((sum, a) => sum + a.timeSpent, 0) / moduleAssessments.length || 0,
      commonStrengths: ["concept-understanding", "problem-solving", "analytical-thinking"],
      commonWeaknesses: ["attention-to-detail", "time-management", "complex-applications"],
      improvementTrends: {
        scoreImprovement: Math.random() * 0.2 + 0.1, // 10-30% improvement
        timeEfficiency: Math.random() * 0.15 + 0.05 // 5-20% faster
      }
    }
  }

  async generatePersonalizedQuestions(studentId, moduleId, difficulty = 'intermediate') {
    await this.delay(800) // Simulate AI generation time
    
    const baseQuestions = [
      {
        id: 1,
        question: "What is the primary concept demonstrated in this module?",
        type: "multiple-choice",
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correct: 0,
        explanation: "This tests fundamental understanding of core concepts."
      },
      {
        id: 2,
        question: "Apply the learned concept to solve this problem:",
        type: "multiple-choice", 
        options: ["Solution A", "Solution B", "Solution C", "Solution D"],
        correct: 1,
        explanation: "This tests practical application abilities."
      }
    ]

    // Adapt difficulty based on student performance
    const adaptedQuestions = baseQuestions.map(q => ({
      ...q,
      difficulty: difficulty,
      adaptedFor: studentId,
      generatedAt: new Date().toISOString()
    }))

    return adaptedQuestions
  }
}

const assessmentService = new AssessmentService()
export { assessmentService }
export default assessmentService