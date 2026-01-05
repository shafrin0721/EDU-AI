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
        strengthAreas: ["concept-understanding", "problem-solving"],
        improvementAreas: score < 80 ? ["attention-to-detail"] : [],
        recommendedNextSteps: ["advanced-concepts", "practical-application"],
        confidenceLevel: score / 100,
        adaptationSuggestions: [
          {
            type: score >= 90 ? "difficulty_increase" : "additional_practice",
            reason: score >= 90 ? "high_performance" : "reinforcement_needed",
            module: `Module ${Math.floor(Math.random() * 5) + 1}`,
            topic: score >= 90 ? "Advanced Applications" : "Foundational Review"
          }
        ],
        learningInsights: {
          conceptMastery: score / 100,
          problemSolvingSpeed: Math.max(0.1, 1 - (timeSpent / 300)),
          retentionPrediction: Math.min(1, score / 80),
          recommendedStudyTime: score < 70 ? timeSpent * 1.5 : timeSpent * 0.8
        }
      },
      submittedAt: new Date().toISOString()
    }
    
    this.data.push(newAssessment)
    return { ...newAssessment }
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

export default new AssessmentService()