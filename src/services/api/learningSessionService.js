import learningSessionsData from "../mockData/learningSessions.json"

class LearningSessionService {
  constructor() {
    this.data = [...learningSessionsData]
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
    const session = this.data.find(item => item.Id === numId)
    return session ? { ...session } : null
  }

  async getByStudent(studentId) {
    await this.delay()
    return this.data
      .filter(session => session.studentId === studentId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .map(session => ({ ...session }))
  }

  async getByModule(moduleId) {
    await this.delay()
    return this.data.filter(session => session.moduleId === moduleId).map(session => ({ ...session }))
  }

  async create(session) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newSession = {
      ...session,
      Id: maxId + 1,
      startTime: new Date().toISOString()
    }
    this.data.push(newSession)
    return { ...newSession }
  }

  async endSession(sessionId, engagementMetrics, performanceData) {
    await this.delay()
    const numId = parseInt(sessionId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index] = {
      ...this.data[index],
      endTime: new Date().toISOString(),
      engagementMetrics,
      performanceData,
      adaptationTriggers: this.generateAdaptationTriggers(performanceData)
    }
    
    return { ...this.data[index] }
  }

  generateAdaptationTriggers(performanceData) {
    const triggers = []
    
    if (performanceData.comprehensionQuizScore >= 0.9) {
      triggers.push({
        type: "difficulty_increase",
        reason: "high_performance",
        confidence: 0.85
      })
    } else if (performanceData.comprehensionQuizScore <= 0.6) {
      triggers.push({
        type: "additional_practice",
        reason: "struggling_concept",
        confidence: 0.78
      })
    }
    
    return triggers
  }

  async getStudentAnalytics(studentId) {
    await this.delay()
    const sessions = this.data.filter(session => session.studentId === studentId)
    
    return {
      totalSessions: sessions.length,
      totalTimeSpent: sessions.reduce((acc, session) => {
        if (session.endTime) {
          return acc + (new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60
        }
        return acc
      }, 0),
      averageEngagement: sessions.reduce((acc, session) => acc + (session.engagementMetrics?.attentionScore || 0), 0) / sessions.length,
      averagePerformance: sessions.reduce((acc, session) => acc + (session.performanceData?.comprehensionQuizScore || 0), 0) / sessions.length
    }
  }
}

const learningSessionService = new LearningSessionService();
export { learningSessionService };
export default learningSessionService;