import achievementsData from "../mockData/achievements.json"

class AchievementService {
  constructor() {
    this.data = [...achievementsData]
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
    const achievement = this.data.find(item => item.Id === numId)
    return achievement ? { ...achievement } : null
  }

  async getByStudent(studentId) {
    await this.delay()
    return this.data
      .filter(achievement => achievement.studentId === studentId)
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .map(achievement => ({ ...achievement }))
  }

  async create(achievement) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newAchievement = {
      ...achievement,
      Id: maxId + 1,
      earnedAt: new Date().toISOString()
    }
    this.data.push(newAchievement)
    return { ...newAchievement }
  }

  async checkAndAwardAchievements(studentId, eventType, eventData) {
    await this.delay()
    const newAchievements = []
    
    // Mock achievement logic
    if (eventType === "assessment_completed" && eventData.score === 100) {
      const maxId = Math.max(...this.data.map(item => item.Id), 0)
      const perfectScoreAchievement = {
        Id: maxId + 1,
        studentId,
        type: "assessment",
        title: "Perfect Score",
        description: `Scored 100% on ${eventData.moduleName}`,
        earnedAt: new Date().toISOString(),
        metadata: {
          score: 100,
          icon: "target",
          color: "green",
          points: 100
        }
      }
      this.data.push(perfectScoreAchievement)
      newAchievements.push(perfectScoreAchievement)
    }
    
    return newAchievements
  }
}

export default new AchievementService()