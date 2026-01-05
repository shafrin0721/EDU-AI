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
            reason: score >= 90 ? "high_performance" : "reinforcement_needed"
          }
        ]
      },
      submittedAt: new Date().toISOString()
    }
    
    this.data.push(newAssessment)
    return { ...newAssessment }
  }
}

export default new AssessmentService()