import modulesData from "../mockData/modules.json"

class ModuleService {
  constructor() {
    // Enhanced module data with YouTube videos and proper attribution
this.data = [...modulesData].map(module => ({
      ...module,
      content: {
        ...module.content,
        videoUrl: this.getYouTubeVideoForModule(module.Id),
        videoAttribution: this.getVideoAttribution(module.Id),
        type: module.content?.type || 'video'
      },
      theoreticalContent: module.theoreticalContent || {
        learningTheories: [],
        foundations: []
      }
    }))
  }

  getYouTubeVideoForModule(moduleId) {
    // Curated educational YouTube videos with proper attribution
    const videoDatabase = {
      1: "https://www.youtube.com/embed/ukzFI9rgwfU", // Machine Learning Explained by Zach Galbraith
      2: "https://www.youtube.com/embed/aircAruvnKk", // Neural Networks by 3Blue1Brown
      3: "https://www.youtube.com/embed/RVVgNr0Uhqk", // Data Science Crash Course by FreeCodeCamp
      4: "https://www.youtube.com/embed/7eh4d6sabA0", // Python Tutorial by Programming with Mosh
      5: "https://www.youtube.com/embed/HXV3zeQKqGY", // SQL Tutorial by FreeCodeCamp
      6: "https://www.youtube.com/embed/EAac_YwXjsE", // Statistics for Data Science by Edureka
      7: "https://www.youtube.com/embed/kqtD5dpn9C8", // Data Visualization with Python by Sentdex
      8: "https://www.youtube.com/embed/Z1Yd7upQsXY", // Deep Learning Fundamentals by DeepLearningAI
    }
    return videoDatabase[moduleId] || "https://www.youtube.com/embed/ukzFI9rgwfU"
  }

  getVideoAttribution(moduleId) {
    const attributionDatabase = {
      1: { creator: "Zach Galbraith", channel: "ZachGalbraith", title: "Machine Learning Explained", originalUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU" },
      2: { creator: "Grant Sanderson", channel: "3Blue1Brown", title: "Neural Networks", originalUrl: "https://www.youtube.com/watch?v=aircAruvnKk" },
      3: { creator: "FreeCodeCamp", channel: "FreeCodeCamp.org", title: "Data Science Full Course", originalUrl: "https://www.youtube.com/watch?v=RVVgNr0Uhqk" },
      4: { creator: "Mosh Hamedani", channel: "Programming with Mosh", title: "Python Tutorial", originalUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0" },
      5: { creator: "FreeCodeCamp", channel: "FreeCodeCamp.org", title: "SQL Tutorial", originalUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
      6: { creator: "Edureka", channel: "edureka!", title: "Statistics for Data Science", originalUrl: "https://www.youtube.com/watch?v=EAac_YwXjsE" },
      7: { creator: "Harrison Kinsley", channel: "sentdex", title: "Data Visualization with Python", originalUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8" },
      8: { creator: "DeepLearning.AI", channel: "DeepLearningAI", title: "Deep Learning Fundamentals", originalUrl: "https://www.youtube.com/watch?v=Z1Yd7upQsXY" }
    }
    return attributionDatabase[moduleId] || { creator: "Educational Creator", channel: "Educational Channel", title: "Educational Video", originalUrl: "#" }
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.data]
  }

  // Helper to transform module data to component format
  transformModuleData(module) {
    return {
      Id: module.Id,
      Title: module.title,
      Description: module.description,
      CourseId: module.courseId,
      Difficulty: module.difficulty,
      EstimatedDuration: module.estimatedTime || module.estimatedDuration,
      OrderIndex: module.sequence || module.sections?.length,
      contentType: module.contentType,
      // New lesson format with text sections and quizzes
      sections: module.sections || [],
      detailedLessons: module.detailedLessons || [],
      quiz: module.quiz || null,
      learningObjectives: module.learningObjectives || [],
      // Legacy support
      theoreticalContent: module.theoreticalContent || { learningTheories: [], foundations: [] }
    }
  }

  async getById(id) {
    await this.delay()
    const numId = parseInt(id)
    const module = this.data.find(item => item.Id === numId)
    if (!module) return null
    
    // Transform lowercase fields to uppercase for component compatibility
    return this.transformModuleData(module)
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
      Id: maxId + 1,
      content: {
        ...module.content,
        videoUrl: this.getYouTubeVideoForModule(maxId + 1),
        videoAttribution: this.getVideoAttribution(maxId + 1),
        type: module.content?.type || 'video'
      },
      theoreticalContent: module.theoreticalContent || {
        learningTheories: [],
        foundations: []
      }
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
      difficultyRating: Math.random() < 0.3 ? 'easy' : Math.random() < 0.7 ? 'medium' : 'hard',
      videoWatchTime: Math.floor(Math.random() * 80) + 10, // 10-90% video completion
      interactionEvents: Math.floor(Math.random() * 20) + 5 // Video interactions
    }
  }

  async getModulesByDifficulty(difficulty) {
    await this.delay()
    return this.data
      .filter(module => module.difficulty === difficulty)
      .map(module => ({ ...module }))
  }

async getModulesForAdaptivePath(studentId, performanceData = null) {
    await this.delay()
    
    // Determine student performance level from historical data
    const studentLevel = this.determineStudentLevel(studentId, performanceData)
    
    // Filter modules based on adaptive difficulty progression
    const adaptiveModules = this.data.filter(module => {
      // Always include prerequisite modules
      if (module.difficulty === 'beginner') return true
      
      // Include intermediate if student is ready
      if (module.difficulty === 'intermediate' && 
          ['intermediate', 'advanced'].includes(studentLevel)) return true
      
      // Include advanced only for high performers
      if (module.difficulty === 'advanced' && studentLevel === 'advanced') return true
      
      return false
    })
    
    // Sort by adaptive sequence considering performance
    return adaptiveModules
      .sort((a, b) => this.calculateAdaptiveSequence(a, b, studentLevel))
      .map(module => ({ 
        ...module,
        adaptiveMetadata: {
          recommendedForStudent: this.isRecommendedForStudent(module, studentLevel),
          difficultyAlignment: this.assessDifficultyAlignment(module, studentLevel),
          estimatedCompletionTime: this.estimateCompletionTime(module, studentLevel)
        }
      }))
  }

  determineStudentLevel(studentId, performanceData) {
    // If performance data provided, use it for assessment
    if (performanceData && performanceData.averageScore) {
      if (performanceData.averageScore >= 85) return 'advanced'
      if (performanceData.averageScore >= 70) return 'intermediate'
      return 'beginner'
    }
    
    // Mock intelligent level assessment based on student patterns
    const performancePattern = Math.random()
    if (performancePattern < 0.25) return 'beginner'
    if (performancePattern < 0.65) return 'intermediate'
    return 'advanced'
  }

  calculateAdaptiveSequence(moduleA, moduleB, studentLevel) {
    // Primary sort by sequence
    const sequenceDiff = moduleA.sequence - moduleB.sequence
    if (sequenceDiff !== 0) return sequenceDiff
    
    // Secondary sort by difficulty alignment with student level
    const alignmentA = this.getDifficultyScore(moduleA.difficulty, studentLevel)
    const alignmentB = this.getDifficultyScore(moduleB.difficulty, studentLevel)
    
    return alignmentB - alignmentA // Higher alignment first
  }

  getDifficultyScore(moduleDifficulty, studentLevel) {
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 }
    const moduleDiff = difficultyMap[moduleDifficulty]
    const studentDiff = difficultyMap[studentLevel]
    
    // Perfect match gets highest score
    if (moduleDiff === studentDiff) return 3
    // One level difference gets medium score
    if (Math.abs(moduleDiff - studentDiff) === 1) return 2
    // Greater difference gets lower score
    return 1
  }

  isRecommendedForStudent(module, studentLevel) {
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 }
    const moduleDiff = difficultyMap[module.difficulty]
    const studentDiff = difficultyMap[studentLevel]
    
    // Recommend modules at or slightly above student level
    return moduleDiff <= studentDiff + 1
  }

  assessDifficultyAlignment(module, studentLevel) {
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 }
    const moduleDiff = difficultyMap[module.difficulty]
    const studentDiff = difficultyMap[studentLevel]
    
    if (moduleDiff === studentDiff) return 'perfect'
    if (moduleDiff === studentDiff + 1) return 'challenging'
    if (moduleDiff === studentDiff - 1) return 'review'
    if (moduleDiff > studentDiff + 1) return 'too_advanced'
    return 'too_easy'
  }

  estimateCompletionTime(module, studentLevel) {
    const baseDuration = module.estimatedDuration || 30 // minutes
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 }
    const moduleDiff = difficultyMap[module.difficulty]
    const studentDiff = difficultyMap[studentLevel]
    
    // Adjust time based on difficulty gap
    const difficultyMultiplier = moduleDiff > studentDiff 
      ? 1 + (moduleDiff - studentDiff) * 0.3
      : Math.max(0.6, 1 - (studentDiff - moduleDiff) * 0.2)
    
    return Math.round(baseDuration * difficultyMultiplier)
  }
async updateModuleContent(moduleId, contentData) {
    await this.delay()
    const numId = parseInt(moduleId)
    const index = this.data.findIndex(item => item.Id === numId)
    if (index === -1) return null
    
    this.data[index].content = { 
      ...this.data[index].content, 
      ...contentData,
      videoUrl: contentData.videoUrl || this.data[index].content.videoUrl,
      videoAttribution: contentData.videoAttribution || this.data[index].content.videoAttribution
    }
    
    if (contentData.theoreticalContent) {
      this.data[index].theoreticalContent = {
        ...this.data[index].theoreticalContent,
        ...contentData.theoreticalContent
      }
    }
    
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
      videoEngagement: Math.random() * 0.4 + 0.6, // 0.6-1.0
      averageVideoWatchTime: Math.random() * 30 + 70, // 70-100%
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

const moduleService = new ModuleService()
export { moduleService }
export default moduleService