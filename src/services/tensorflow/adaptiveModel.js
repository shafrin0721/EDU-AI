/**
 * AdaptiveModel - TensorFlow.js based ML model for learner performance prediction
 * Uses neural networks to predict learner performance and recommend adaptive pathways
 */

import * as tf from '@tensorflow/tfjs';

class AdaptiveModel {
  constructor() {
    this.model = null;
    this.isModelReady = false;
    this.learningRate = 0.001;
    this.epochs = 50;
    this.inputFeatures = [
      'timeSpent',           // Time spent on content (minutes)
      'interactionCount',    // Number of interactions
      'practiceCompleted',   // Practice exercises completed
      'assessmentScore',    // Previous assessment scores
      'completionRate',     // Content completion rate
      'engagementLevel',    // Overall engagement metric
      'difficultyLevel',    // Current content difficulty
      'consistencyScore',   // Learning consistency
      'learningVelocity',   // Speed of learning progression
      'prevPerformance'     // Previous performance level
    ];
  }

  /**
   * Initialize and build the neural network model
   */
  async initializeModel() {
    try {
      // Wait for TensorFlow.js to be ready
      await tf.ready();
      console.log('TensorFlow.js initialized with version:', tf.version.tfjs);

      this.model = tf.sequential({
        layers: [
          // Input layer
          tf.layers.dense({
            inputShape: [this.inputFeatures.length],
            units: 64,
            activation: 'relu',
            kernelInitializer: 'heNormal'
          }),
          // Hidden layer 1
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelInitializer: 'heNormal'
          }),
          // Hidden layer 2
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 16,
            activation: 'relu',
            kernelInitializer: 'heNormal'
          }),
          // Output layer - predict performance score (0-1)
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(this.learningRate),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });

      this.isModelReady = true;
      console.log('Adaptive model initialized successfully');
      
      // Log model summary
      this.model.summary();
      
      return true;
    } catch (error) {
      console.error('Error initializing adaptive model:', error);
      return false;
    }
  }

  /**
   * Prepare training data from learner history
   * @param {Array} learnerData - Array of learner performance data
   */
  prepareTrainingData(learnerData) {
    const features = [];
    const labels = [];

    learnerData.forEach(learner => {
      const featureVector = [
        learner.timeSpent || 0,
        learner.interactionCount || 0,
        learner.practiceCompleted || 0,
        learner.assessmentScore || 0,
        learner.completionRate || 0,
        learner.engagementLevel || 0,
        learner.difficultyLevel || 0,
        learner.consistencyScore || 0,
        learner.learningVelocity || 0,
        learner.prevPerformance || 0
      ];
      
      features.push(featureVector);
      labels.push([learner.nextPerformance || 0]);
    });

    return {
      xs: tf.tensor2d(features),
      ys: tf.tensor2d(labels)
    };
  }

  /**
   * Train the model with learner data
   * @param {Array} trainingData - Array of historical learner data
   */
  async trainModel(trainingData) {
    if (!this.isModelReady) {
      await this.initializeModel();
    }

    const { xs, ys } = this.prepareTrainingData(trainingData);

    try {
      // Train the model
      const result = await this.model.fit(xs, ys, {
        epochs: this.epochs,
        batchSize: 16,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
            }
          }
        }
      });

      console.log('Model training completed:', result);

      // Clean up tensors
      xs.dispose();
      ys.dispose();

      return result;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  /**
   * Predict performance for a learner
   * @param {Object} learnerFeatures - Current learner features
   */
  async predictPerformance(learnerFeatures) {
    if (!this.isModelReady) {
      console.warn('Model not ready, returning default prediction');
      return {
        predictedScore: 0.5,
        confidence: 0,
        recommendation: 'insufficient_data'
      };
    }

    try {
      const inputTensor = tf.tensor2d([[
        learnerFeatures.timeSpent || 0,
        learnerFeatures.interactionCount || 0,
        learnerFeatures.practiceCompleted || 0,
        learnerFeatures.assessmentScore || 0,
        learnerFeatures.completionRate || 0,
        learnerFeatures.engagementLevel || 0,
        learnerFeatures.difficultyLevel || 0,
        learnerFeatures.consistencyScore || 0,
        learnerFeatures.learningVelocity || 0,
        learnerFeatures.prevPerformance || 0
      ]]);

      const prediction = this.model.predict(inputTensor);
      const predictedScore = (await prediction.data())[0];

      // Calculate confidence based on prediction distribution
      const confidence = this.calculateConfidence(prediction);

      // Generate recommendation based on prediction
      const recommendation = this.generateRecommendation(predictedScore, learnerFeatures);

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      return {
        predictedScore: Math.max(0, Math.min(1, predictedScore)),
        confidence,
        recommendation,
        factors: this.analyzeContributingFactors(learnerFeatures)
      };
    } catch (error) {
      console.error('Error predicting performance:', error);
      return {
        predictedScore: 0.5,
        confidence: 0,
        recommendation: 'error'
      };
    }
  }

  /**
   * Calculate confidence score for prediction
   */
  calculateConfidence(predictionTensor) {
    // Simplified confidence calculation
    // In production, this would use prediction variance or ensemble methods
    return 0.75;
  }

  /**
   * Generate adaptive recommendation based on prediction
   */
  generateRecommendation(predictedScore, learnerFeatures) {
    if (predictedScore >= 0.85) {
      return {
        action: 'advance',
        difficulty: 'increase',
        reason: 'Exceptional performance - ready for advanced content'
      };
    } else if (predictedScore >= 0.7) {
      return {
        action: 'progress',
        difficulty: 'maintain',
        reason: 'Good performance - continue with current pathway'
      };
    } else if (predictedScore >= 0.5) {
      return {
        action: 'reinforce',
        difficulty: 'slight_decrease',
        reason: 'Moderate performance - add reinforcement exercises'
      };
    } else {
      return {
        action: 'remediate',
        difficulty: 'decrease',
        reason: 'Struggling - provide additional support and simplified content'
      };
    }
  }

  /**
   * Analyze which factors most contributed to the prediction
   */
  analyzeContributingFactors(learnerFeatures) {
    const factors = [];
    
    if (learnerFeatures.timeSpent > 30) {
      factors.push({ factor: 'highEngagement', impact: 'positive' });
    } else if (learnerFeatures.timeSpent < 10) {
      factors.push({ factor: 'lowTimeInvestment', impact: 'negative' });
    }

    if (learnerFeatures.practiceCompleted > 5) {
      factors.push({ factor: 'activePractice', impact: 'positive' });
    }

    if (learnerFeatures.consistencyScore > 0.7) {
      factors.push({ factor: 'consistentLearning', impact: 'positive' });
    }

    return factors;
  }

  /**
   * Batch predict for multiple learners (for analytics)
   */
  async batchPredict(learnerFeaturesArray) {
    if (!this.isModelReady) {
      return learnerFeaturesArray.map(() => ({
        predictedScore: 0.5,
        confidence: 0,
        recommendation: 'model_not_ready'
      }));
    }

    const inputs = learnerFeaturesArray.map(lf => [
      lf.timeSpent || 0,
      lf.interactionCount || 0,
      lf.practiceCompleted || 0,
      lf.assessmentScore || 0,
      lf.completionRate || 0,
      lf.engagementLevel || 0,
      lf.difficultyLevel || 0,
      lf.consistencyScore || 0,
      lf.learningVelocity || 0,
      lf.prevPerformance || 0
    ]);

    const inputTensor = tf.tensor2d(inputs);
    const predictions = this.model.predict(inputTensor);
    const scores = await predictions.data();

    const results = learnerFeaturesArray.map((lf, i) => ({
      predictedScore: Math.max(0, Math.min(1, scores[i])),
      confidence: 0.75,
      recommendation: this.generateRecommendation(scores[i], lf)
    }));

    // Clean up
    inputTensor.dispose();
    predictions.dispose();

    return results;
  }

  /**
   * Save model to IndexedDB for persistence
   */
  async saveModel() {
    if (!this.isModelReady) return false;
    
    try {
      await this.model.save('indexeddb://eduai-adaptive-model');
      console.log('Model saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving model:', error);
      return false;
    }
  }

  /**
   * Load model from IndexedDB
   */
  async loadModel() {
    try {
      await tf.ready();
      this.model = await tf.loadLayersModel('indexeddb://eduai-adaptive-model');
      this.isModelReady = true;
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.log('No saved model found, will train new model');
      return false;
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.isModelReady = false;
    }
  }
}

// Export singleton instance
const adaptiveModel = new AdaptiveModel();
export default adaptiveModel;
