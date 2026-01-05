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
      lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

export default new ModuleService()