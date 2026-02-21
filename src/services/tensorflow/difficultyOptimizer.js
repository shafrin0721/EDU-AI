/**
 * DifficultyOptimizer - TensorFlow.js based lesson difficulty optimization
 * Uses ML to dynamically modulate lesson difficulty based on learner performance
 */

import * as tf from '@tensorflow/tfjs';

class DifficultyOptimizer {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.difficultyLevels = ['beginner', 'easy', 'intermediate', 'advanced', 'expert'];
    this.thresholds = {
      excellent: 0.9,
      proficient: 0.75,
      developing: 0.6,
      struggling: 0.4
    };
  }

  async initialize() {
    try {
      await tf.ready();
      
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [8],
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 5,
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
      console.log('Difficulty optimizer initialized');
      return true;
    } catch (error) {
      console.error('Error initializing difficulty optimizer:', error);
      return false;
    }
  }

  extractFeatures(learnerData) {
    const features = [
      (learnerData.recentScore || 0) / 100,
      (learnerData.averageScore || 0) / 100,
      learnerData.completionRate || 0,
      learnerData.consistencyScore || 0,
      learnerData.learningVelocity || 0,
      learnerData.practiceEngagement || 0,
      learnerData.timeSpent || 0,
      learnerData.difficultyLevel || 0
    ];
    return features;
  }

  async predictOptimalDifficulty(learnerData) {
    if (!this.isReady) {
      await this.initialize();
    }

    const features = this.extractFeatures(learnerData);
    const inputTensor = tf.tensor2d([features]);
    
    let prediction;
    try {
      prediction = this.model.predict(inputTensor);
      const probabilities = await prediction.data();
      
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const recommendedLevel = this.difficultyLevels[maxIndex];
      const confidence = Math.max(...probabilities);
      
      return {
        level: recommendedLevel,
        confidence: confidence,
        allProbabilities: this.difficultyLevels.reduce((acc, level, i) => {
          acc[level] = probabilities[i];
          return acc;
        }, {})
      };
    } finally {
      inputTensor.dispose();
      if (prediction) prediction.dispose();
    }
  }

  calculateDifficultyAdjustment(performanceScore) {
    if (performanceScore >= this.thresholds.excellence) {
      return {
        direction: 'increase',
        steps: 2,
        reason: 'Exceptional performance - ready for more challenging content'
      };
    }
    if (performanceScore >= this.thresholds.proficient) {
      return {
        direction: 'maintain',
        steps: 0,
        reason: 'Good performance - current difficulty level is appropriate'
      };
    }
    if (performanceScore >= this.thresholds.developing) {
      return {
        direction: 'slight_decrease',
        steps: -1,
        reason: 'Moderate performance - slight difficulty reduction recommended'
      };
    }
    return {
      direction: 'decrease',
      steps: -2,
      reason: 'Struggling - significant difficulty reduction needed'
    };
  }

  async getDifficultyRecommendation(learnerData) {
    const performanceScore = learnerData.performanceScore || 
      ((learnerData.recentScore || 0) * 0.6 + (learnerData.averageScore || 0) * 0.4) / 100;

    const mlPrediction = await this.predictOptimalDifficulty(learnerData);
    const ruleBasedAdjustment = this.calculateDifficultyAdjustment(performanceScore);

    return {
      mlRecommendation: mlPrediction,
      ruleBasedAdjustment: ruleBasedAdjustment,
      finalRecommendation: this.combineRecommendations(mlPrediction, ruleBasedAdjustment),
      performanceScore: performanceScore
    };
  }

  combineRecommendations(mlPrediction, ruleBasedAdjustment) {
    return {
      level: mlPrediction.level,
      adjustment: ruleBasedAdjustment,
      confidence: mlPrediction.confidence
    };
  }

  async batchPredict(learnerDataArray) {
    const results = [];
    for (const data of learnerDataArray) {
      const result = await this.getDifficultyRecommendation(data);
      results.push({
        learnerId: data.learnerId,
        ...result
      });
    }
    return results;
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.isReady = false;
    }
  }
}

const difficultyOptimizer = new DifficultyOptimizer();
export default difficultyOptimizer;
