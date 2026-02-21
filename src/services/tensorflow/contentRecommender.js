/**
 * ContentRecommender - TensorFlow.js based content sequencing and recommendation
 * Optimizes content sequence and learning pathways based on learner needs
 */

import * as tf from '@tensorflow/tfjs';

class ContentRecommender {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.contentTypes = ['video', 'reading', 'interactive', 'quiz', 'assignment', 'project'];
  }

  async initialize() {
    try {
      await tf.ready();
      
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [10],
            units: 64,
            activation: 'relu'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 6,
            activation: 'softmax'
          })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.isReady = true;
      console.log('Content recommender initialized');
      return true;
    } catch (error) {
      console.error('Error initializing content recommender:', error);
      return false;
    }
  }

  extractContentFeatures(learnerData, contentItem) {
    const learnerScore = learnerData.performanceScore || 0.5;
    const contentDifficulty = contentItem.difficulty || 0.5;
    const engagementLevel = learnerData.engagementLevel || 0.5;
    const consistencyScore = learnerData.consistencyScore || 0.5;
    const learningVelocity = learnerData.learningVelocity || 0.5;
    const timePreference = learnerData.timePreference || 0.5;
    const preferredContentType = this.getContentTypeScore(learnerData.preferredContentType);
    const completedSimilar = learnerData.completedSimilar || 0;
    const practiceScore = learnerData.practiceScore || 0.5;
    const masteryLevel = learnerData.masteryLevel || 0;

    return [
      learnerScore,
      contentDifficulty,
      engagementLevel,
      consistencyScore,
      learningVelocity,
      timePreference,
      preferredContentType,
      completedSimilar,
      practiceScore,
      masteryLevel
    ];
  }

  getContentTypeScore(preferredType) {
    const typeScores = {
      'video': 0.9,
      'reading': 0.7,
      'interactive': 0.85,
      'quiz': 0.6,
      'assignment': 0.5,
      'project': 0.4
    };
    return typeScores[preferredType] || 0.5;
  }

  async recommendContent(learnerData, availableContent) {
    if (!this.isReady) {
      await this.initialize();
    }

    const recommendations = [];

    for (const content of availableContent) {
      const features = this.extractContentFeatures(learnerData, content);
      const inputTensor = tf.tensor2d([features]);
      
      let prediction;
      try {
        prediction = this.model.predict(inputTensor);
        const scores = await prediction.data();
        
        const relevanceScore = Math.max(...scores);
        const contentType = this.contentTypes[scores.indexOf(relevanceScore)];
        
        recommendations.push({
          contentId: content.id,
          title: content.title,
          type: content.type,
          relevanceScore: relevanceScore,
          recommendedReason: this.generateRecommendationReason(learnerData, content, relevanceScore),
          estimatedTime: content.estimatedTime || 15,
          difficulty: content.difficulty,
          prerequisites: content.prerequisites || []
        });
      } finally {
        inputTensor.dispose();
        if (prediction) prediction.dispose();
      }
    }

    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      recommendations: recommendations.slice(0, 10),
      learningPath: this.generateLearningPath(recommendations),
      totalEstimatedTime: recommendations.slice(0, 5).reduce((sum, r) => sum + r.estimatedTime, 0)
    };
  }

  generateRecommendationReason(learnerData, content, score) {
    const reasons = [];

    if (learnerData.performanceScore > 0.8 && content.difficulty > 0.7) {
      reasons.push('Challenging content for advanced learner');
    } else if (learnerData.performanceScore < 0.5 && content.difficulty > 0.5) {
      reasons.push('May need additional support');
    }

    if (learnerData.engagementLevel < 0.4 && content.type === 'interactive') {
      reasons.push('Interactive content to boost engagement');
    }

    if (content.type === 'quiz' && learnerData.recentQuizScore < 0.7) {
      reasons.push('Practice quiz to improve understanding');
    }

    if (reasons.length === 0) {
      reasons.push('Recommended based on your learning profile');
    }

    return reasons.join('. ');
  }

  generateLearningPath(recommendations) {
    const path = [];
    let cumulativeTime = 0;

    for (const rec of recommendations.slice(0, 7)) {
      path.push({
        contentId: rec.contentId,
        title: rec.title,
        type: rec.type,
        order: path.length + 1,
        estimatedTime: rec.estimatedTime,
        cumulativeTime: cumulativeTime + rec.estimatedTime
      });
      cumulativeTime += rec.estimatedTime;
    }

    return path;
  }

  async optimizeSequence(learnerData, contentItems) {
    const scored = await Promise.all(
      contentItems.map(async (content) => {
        const features = this.extractContentFeatures(learnerData, content);
        const inputTensor = tf.tensor2d([features]);
        
        let prediction;
        try {
          prediction = this.model.predict(inputTensor);
          const scores = await prediction.data();
          return {
            ...content,
            sequenceScore: Math.max(...scores),
            scoreBreakdown: this.contentTypes.reduce((acc, type, i) => {
              acc[type] = scores[i];
              return acc;
            }, {})
          };
        } finally {
          inputTensor.dispose();
          if (prediction) prediction.dispose();
        }
      })
    );

    // Sort by sequence score
    scored.sort((a, b) => b.sequenceScore - a.sequenceScore);

    return {
      optimizedSequence: scored,
      totalTime: scored.reduce((sum, c) => sum + (c.estimatedTime || 15), 0),
      contentTypes: this.analyzeContentTypeDistribution(scored)
    };
  }

  analyzeContentTypeDistribution(contentItems) {
    const distribution = {};
    this.contentTypes.forEach(type => distribution[type] = 0);
    
    contentItems.forEach(item => {
      if (distribution[item.type] !== undefined) {
        distribution[item.type]++;
      }
    });

    return distribution;
  }

  async getPersonalizedPath(learnerData, courseContent) {
    // Group content by difficulty
    const contentByDifficulty = {
      beginner: [],
      easy: [],
      intermediate: [],
      advanced: [],
      expert: []
    };

    courseContent.forEach(content => {
      const diff = content.difficultyLevel || 'intermediate';
      if (contentByDifficulty[diff]) {
        contentByDifficulty[diff].push(content);
      }
    });

    // Determine starting point based on learner level
    const learnerLevel = this.determineLearnerLevel(learnerData);
    const sequence = [];

    // Build personalized path
    const difficultyOrder = ['beginner', 'easy', 'intermediate', 'advanced', 'expert'];
    const startIndex = difficultyOrder.indexOf(learnerLevel);
    
    for (let i = startIndex; i < difficultyOrder.length; i++) {
      const diffLevel = difficultyOrder[i];
      const content = contentByDifficulty[diffLevel];
      
      if (content && content.length > 0) {
        const optimized = await this.optimizeSequence(learnerData, content);
        sequence.push({
          difficulty: diffLevel,
          items: optimized.optimizedSequence.slice(0, 3)
        });
      }
    }

    return {
      path: sequence,
      estimatedTotalTime: sequence.reduce((sum, level) => 
        sum + level.items.reduce((s, i) => s + (i.estimatedTime || 15), 0), 0),
      difficultyProgression: difficultyOrder.slice(startIndex)
    };
  }

  determineLearnerLevel(learnerData) {
    const score = learnerData.performanceScore || 0.5;
    
    if (score >= 0.9) return 'expert';
    if (score >= 0.75) return 'advanced';
    if (score >= 0.6) return 'intermediate';
    if (score >= 0.4) return 'easy';
    return 'beginner';
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.isReady = false;
    }
  }
}

const contentRecommender = new ContentRecommender();
export default contentRecommender;
