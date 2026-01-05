import coursesData from "../mockData/courses.json"

class CourseService {
  constructor() {
    this.data = [...coursesData]
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
    const course = this.data.find(item => item.Id === numId)
    return course ? { ...course } : null
  }

async getByTeacher(teacherId) {
    await this.delay()
    return this.data.filter(course => course.InstructorId === teacherId).map(course => ({ ...course }))
  }

  async getByOrganization(organizationId) {
    await this.delay()
    return this.data.filter(course => course.organizationId === organizationId).map(course => ({ ...course }))
  }

  async create(course) {
    await this.delay()
    const maxId = Math.max(...this.data.map(item => item.Id), 0)
    const newCourse = {
      ...course,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    }
    this.data.push(newCourse)
    return { ...newCourse }
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

  async getCourseAnalytics(courseId) {
    await this.delay()
    return {
      enrollments: 156,
      completions: 89,
      averageProgress: 67,
      averageRating: 4.3,
      timeSpentAverage: 280,
      strugglingStudents: 23,
      topPerformers: 45
    }
  }
}

const courseServiceInstance = new CourseService()

export default courseServiceInstance
export { courseServiceInstance as courseService }