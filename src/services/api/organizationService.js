import organizationsData from "../mockData/organizations.json"

class OrganizationService {
  constructor() {
    this.data = [...organizationsData]
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
    const organization = this.data.find(item => item.Id === numId)
    return organization ? { ...organization } : null
  }

  async create(organization) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newOrganization = {
      ...organization,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.data.push(newOrganization)
    return { ...newOrganization }
  }

  async update(id, updates) {
    await this.delay()
    const numId = parseInt(id)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index] = {
      ...this.data[index],
      ...updates,
      Id: numId,
      updatedAt: new Date().toISOString()
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

  async getMetrics(organizationId) {
    await this.delay()
    return {
      totalUsers: 1247,
      activeUsers: 892,
      totalCourses: 45,
      completionRate: 73,
      monthlyGrowth: 12.5,
      engagementScore: 8.4
    }
  }
}

export default new OrganizationService()