import modulesData from "../mockData/modules.json"

class ModuleService {
  constructor() {
    this.data = [...modulesData]
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
    const module = this.data.find(item => item.Id === numId)
    return module ? { ...module } : null
  }

  async getByCourse(courseId) {
    await this.delay()
    return this.data
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.sequence - b.sequence)
      .map(module => ({ ...module }))
  }

  async create(module) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newModule = {
      ...module,
      Id: maxId + 1
    }
    this.data.push(newModule)
    return { ...newModule }
  }

  async update(id, updates) {
    await this.delay()
    const numId = parseInt(id)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index] = {
      ...this.data[index],
      ...updates,
      Id: numId
    }
    return { ...this.data[index] }
  }

  async delete(id) {
    await this.delay()
    const numId = parseInt(id)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return false
    
    this.data.splice(index, 1)
    return true
  }

async getModuleProgress(moduleId, studentId) {
    await this.delay()
    return {
      completed: Math.random() > 0.3,
      progress: Math.floor(Math.random() * 100),
      timeSpent: Math.floor(Math.random() * 120) + 15,
      lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      comprehensionScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
      engagementLevel: Math.random() * 0.3 + 0.7, // 0.7-1.0
      difficultyRating: Math.random() < 0.3 ? 'easy' : Math.random() < 0.7 ? 'medium' : 'hard'
    }
  }

  async getModulesByDifficulty(difficulty) {
    await this.delay()
    return this.data
      .filter(module => module.difficulty === difficulty)
      .map(module => ({ ...module }))
  }

  async getModulesForAdaptivePath(studentId) {
    await this.delay()
    // Mock adaptive learning logic
    const studentLevel = Math.random() < 0.3 ? 'beginner' : Math.random() < 0.7 ? 'intermediate' : 'advanced'
    return this.data
      .filter(module => module.difficulty === studentLevel || 
        (studentLevel === 'intermediate' && module.difficulty === 'beginner') ||
        (studentLevel === 'advanced' && ['beginner', 'intermediate'].includes(module.difficulty)))
      .sort((a, b) => a.sequence - b.sequence)
      .map(module => ({ ...module }))
  }

  async updateModuleContent(moduleId, contentData) {
    await this.delay()
    const numId = parseInt(moduleId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index].content = { ...this.data[index].content, ...contentData }
    this.data[index].updatedAt = new Date().toISOString()
    return { ...this.data[index] }
  }

  async getModuleAnalytics(moduleId) {
    await this.delay()
    return {
      totalStudents: Math.floor(Math.random() * 200) + 50,
      averageProgress: Math.floor(Math.random() * 40) + 60,
      averageTimeSpent: Math.floor(Math.random() * 60) + 30,
      completionRate: Math.random() * 0.3 + 0.7,
      strugglingStudents: Math.floor(Math.random() * 20) + 5,
      topPerformers: Math.floor(Math.random() * 30) + 10,
      commonMistakes: [
        "Confusion about core concepts",
        "Skipping prerequisite material", 
        "Insufficient practice time"
      ],
      recommendedImprovements: [
        "Add more interactive examples",
        "Include additional practice exercises",
        "Provide prerequisite review materials"
      ]
    }
  }
}

export default new ModuleService()