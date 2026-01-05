import enrollmentsData from "../mockData/enrollments.json"

class EnrollmentService {
  constructor() {
    this.data = [...enrollmentsData]
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
    const enrollment = this.data.find(item => item.Id === numId)
    return enrollment ? { ...enrollment } : null
  }

  async getByStudent(studentId) {
    await this.delay()
    return this.data.filter(enrollment => enrollment.studentId === studentId).map(enrollment => ({ ...enrollment }))
  }

  async getByCourse(courseId) {
    await this.delay()
    return this.data.filter(enrollment => enrollment.courseId === courseId).map(enrollment => ({ ...enrollment }))
  }

  async create(enrollment) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newEnrollment = {
      ...enrollment,
      Id: maxId + 1,
      startedAt: new Date().toISOString(),
      status: "active",
      progress: 0
    }
    this.data.push(newEnrollment)
    return { ...newEnrollment }
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

  async updateProgress(studentId, courseId, progress) {
    await this.delay()
    const enrollment = this.data.find(e => e.studentId === studentId && e.courseId === courseId)
    if (!enrollment) return null
    
    enrollment.progress = progress
    if (progress >= 100) {
      enrollment.status = "completed"
      enrollment.completedAt = new Date().toISOString()
    }
    
    return { ...enrollment }
  }

  async delete(id) {
    await this.delay()
    const numId = parseInt(id)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return false
    
    this.data.splice(index, 1)
    return true
  }
}

export default new EnrollmentService()