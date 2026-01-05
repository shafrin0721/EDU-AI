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

  async getUserAnalytics(userId) {
    await this.delay()
    const numId = parseInt(userId)
    const user = this.data.find(item => item.Id === numId)
    if (!user) return null

    return {
      learningStats: {
        totalCoursesEnrolled: Math.floor(Math.random() * 10) + 1,
        coursesCompleted: Math.floor(Math.random() * 5),
        totalStudyHours: user.studyHours || Math.floor(Math.random() * 200) + 50,
        averageSessionLength: Math.floor(Math.random() * 60) + 30,
        learningStreak: user.profile?.learningStreak || Math.floor(Math.random() * 30)
      },
      performanceMetrics: {
        averageScore: Math.floor(Math.random() * 30) + 70,
        improvementRate: Math.random() * 0.3 + 0.1,
        consistencyScore: Math.random() * 0.4 + 0.6,
        engagementLevel: Math.random() * 0.3 + 0.7
      },
      adaptiveProfile: {
        preferredLearningStyle: ["visual", "auditory", "kinesthetic"][Math.floor(Math.random() * 3)],
        optimalDifficulty: user.preferences?.learning?.preferredDifficulty || "intermediate",
        bestStudyTimes: ["morning", "afternoon", "evening"][Math.floor(Math.random() * 3)],
        recommendedBreakFrequency: Math.floor(Math.random() * 30) + 15
      }
    }
  }

  async getTeacherStudents(teacherId) {
    await this.delay()
    // Get students enrolled in courses taught by this teacher
    return this.data
      .filter(user => user.role === "student")
      .map(student => ({
        ...student,
        enrolledCourses: Math.floor(Math.random() * 5) + 1,
        averageProgress: Math.floor(Math.random() * 100),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
  }

  async getOrganizationUsers(organizationId, role = null) {
    await this.delay()
    let users = this.data.filter(user => user.organizationId === organizationId)
    
    if (role) {
      users = users.filter(user => user.role === role)
    }
    
    return users.map(user => ({ ...user }))
  }

  async updateUserRole(userId, newRole) {
    await this.delay()
    const numId = parseInt(userId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index].role = newRole
    this.data[index].lastActive = new Date().toISOString()
    return { ...this.data[index] }
  }

  async getUserNotificationPreferences(userId) {
    await this.delay()
    const numId = parseInt(userId)
    const user = this.data.find(item => item.Id === numId)
    if (!user) return null
    
    return user.preferences?.notifications || {
      email: true,
      push: true,
      achievements: true,
      reminders: true,
      contentUpdates: false,
      systemAlerts: true
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    await this.delay()
    const numId = parseInt(userId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    if (!this.data[index].preferences) {
      this.data[index].preferences = {}
    }
    
    this.data[index].preferences.notifications = {
      ...this.data[index].preferences.notifications,
      ...preferences
}
    
    return { ...this.data[index] }
  }

  async authenticate(email, password) {
    await this.delay()
    const user = this.data.find(u => u.email === email)
    
    if (!user) {
      return null
    }
    
    // In a real app, you would hash and compare passwords
    // For demo purposes, we'll use a simple password check
    const validPassword = password === "password123"
    
    if (!validPassword) {
      return null
    }
    
    // Update last active
    const index = this.data.findIndex(item => item.Id === user.Id)
    this.data[index].lastActive = new Date().toISOString()
    
    return { ...this.data[index] }
  }

  async emailExists(email) {
    await this.delay()
    return this.data.some(u => u.email.toLowerCase() === email.toLowerCase())
}
}

const userService = new UserService();
export { userService };
export default userService;