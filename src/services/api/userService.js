import usersData from "../mockData/users.json"

class UserService {
  constructor() {
    this.data = [...usersData]
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
    const user = this.data.find(item => item.Id === numId)
    return user ? { ...user } : null
  }

  async getByOrganization(organizationId) {
    await this.delay()
    return this.data.filter(user => user.organizationId === organizationId).map(user => ({ ...user }))
  }

  async getByRole(role) {
    await this.delay()
    return this.data.filter(user => user.role === role).map(user => ({ ...user }))
  }

  async create(user) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newUser = {
      ...user,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
    this.data.push(newUser)
    return { ...newUser }
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
      lastActive: new Date().toISOString()
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

  async updateProfile(userId, profileData) {
    await this.delay()
    const numId = parseInt(userId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index].profile = {
      ...this.data[index].profile,
      ...profileData
    }
    this.data[index].lastActive = new Date().toISOString()
    return { ...this.data[index] }
  }
}

export default new UserService()