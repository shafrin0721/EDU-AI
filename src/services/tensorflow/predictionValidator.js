/**
 * PredictionValidator - Service for tracking and validating AI predictions
 * Compares predicted outcomes with actual results to measure model accuracy
 */

class PredictionValidator {
  constructor() {
    this.predictions = [];
    this.maxPredictions = 1000;
    this.metrics = {
      totalPredictions: 0,
      accuratePredictions: 0,
      averageError: 0,
      rmse: 0,
      mae: 0,
      accuracyByCategory: {
        excellent: { correct: 0, total: 0 },
        proficient: { correct: 0, total: 0 },
        developing: { correct: 0, total: 0 },
        struggling: { correct: 0, total: 0 }
      }
    };
  }

  /**
   * Record a prediction with its actual outcome
   * @param {Object} prediction - The predicted result
   * @param {Object} actual - The actual outcome
   * @param {string} category - Performance category (excellent, proficient, developing, struggling)
   */
  recordPrediction(prediction, actual, category = 'developing') {
    const error = Math.abs(prediction.predictedScore - actual.actualScore);
    const isAccurate = error <= 0.1; // Within 10% is considered accurate
    
    const record = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      prediction: prediction.predictedScore,
      actual: actual.actualScore,
      error,
      isAccurate,
      category,
      recommendation: prediction.recommendation?.action || 'unknown',
      actualOutcome: actual.outcome || 'completed',
      context: {
        learnerId: actual.learnerId,
        courseId: actual.courseId,
        moduleId: actual.moduleId
      }
    };

    this.predictions.unshift(record);
    
    // Keep only recent predictions
    if (this.predictions.length > this.maxPredictions) {
      this.predictions = this.predictions.slice(0, this.maxPredictions);
    }

    this.updateMetrics(record);
    
    return record;
  }

  /**
   * Update running metrics based on new prediction record
   */
  updateMetrics(record) {
    this.metrics.totalPredictions++;
    
    if (record.isAccurate) {
      this.metrics.accuratePredictions++;
    }

    // Update accuracy by category
    if (this.metrics.accuracyByCategory[record.category]) {
      this.metrics.accuracyByCategory[record.category].total++;
      if (record.isAccurate) {
        this.metrics.accuracyByCategory[record.category].correct++;
      }
    }

    // Calculate average error
    const totalError = this.predictions.reduce((sum, p) => sum + p.error, 0);
    this.metrics.averageError = totalError / this.predictions.length;

    // Calculate RMSE
    const squaredErrors = this.predictions.map(p => p.error * p.error);
    const mse = squaredErrors.reduce((sum, e) => sum + e, 0) / this.predictions.length;
    this.metrics.rmse = Math.sqrt(mse);

    // Calculate MAE
    this.metrics.mae = this.metrics.averageError;
  }

  /**
   * Get overall accuracy percentage
   */
  getOverallAccuracy() {
    if (this.metrics.totalPredictions === 0) return 0;
    return (this.metrics.accuratePredictions / this.metrics.totalPredictions) * 100;
  }

  /**
   * Get accuracy by performance category
   */
  getAccuracyByCategory() {
    const results = {};
    
    Object.keys(this.metrics.accuracyByCategory).forEach(category => {
      const { correct, total } = this.metrics.accuracyByCategory[category];
      results[category] = {
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        total,
        correct
      };
    });

    return results;
  }

  /**
   * Get prediction accuracy trends over time
   * @param {number} days - Number of days to analyze
   */
  getAccuracyTrends(days = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const recentPredictions = this.predictions.filter(
      p => new Date(p.timestamp) >= startDate
    );

    // Group by day
    const dailyData = {};
    
    recentPredictions.forEach(prediction => {
      const date = new Date(prediction.timestamp).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total: 0,
          accurate: 0,
          errors: []
        };
      }
      
      dailyData[date].total++;
      if (prediction.isAccurate) {
        dailyData[date].accurate++;
      }
      dailyData[date].errors.push(prediction.error);
    });

    // Calculate daily accuracy
    return Object.values(dailyData).map(day => ({
      date: day.date,
      accuracy: day.total > 0 ? (day.accurate / day.total) * 100 : 0,
      totalPredictions: day.total,
      avgError: day.errors.length > 0 
        ? day.errors.reduce((a, b) => a + b, 0) / day.errors.length 
        : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get content adaptation accuracy
   * Analyzes how well the AI adapted content difficulty to learner needs
   */
  getContentAdaptationAccuracy() {
    const adaptationPredictions = this.predictions.filter(
      p => p.recommendation !== 'unknown'
    );

    const adaptationOutcomes = {
      difficulty_increase: { appropriate: 0, total: 0 },
      difficulty_decrease: { appropriate: 0, total: 0 },
      maintain: { appropriate: 0, total: 0 },
      remediation: { appropriate: 0, total: 0 },
      advance: { appropriate: 0, total: 0 },
      reinforce: { appropriate: 0, total: 0 }
    };

    adaptationPredictions.forEach(pred => {
      const rec = pred.recommendation;
      if (adaptationOutcomes[rec]) {
        adaptationOutcomes[rec].total++;
        // Check if the adaptation was appropriate based on actual outcome
        if (pred.actualOutcome === 'completed' || pred.isAccurate) {
          adaptationOutcomes[rec].appropriate++;
        }
      }
    });

    // Calculate percentages
    const results = {};
    Object.keys(adaptationOutcomes).forEach(key => {
      const { appropriate, total } = adaptationOutcomes[key];
      results[key] = {
        accuracy: total > 0 ? (appropriate / total) * 100 : 0,
        total,
        appropriate
      };
    });

    return results;
  }

  /**
   * Get comprehensive metrics report
   */
  getMetricsReport() {
    return {
      summary: {
        overallAccuracy: this.getOverallAccuracy().toFixed(2) + '%',
        totalPredictions: this.metrics.totalPredictions,
        averageError: this.metrics.averageError.toFixed(4),
        rmse: this.metrics.rmse.toFixed(4),
        mae: this.metrics.mae.toFixed(4)
      },
      byCategory: this.getAccuracyByCategory(),
      trends: this.getAccuracyTrends(7),
      contentAdaptation: this.getContentAdaptationAccuracy(),
      recentPredictions: this.predictions.slice(0, 10).map(p => ({
        id: p.id,
        date: p.timestamp,
        predicted: (p.prediction * 100).toFixed(1) + '%',
        actual: (p.actual * 100).toFixed(1) + '%',
        error: (p.error * 100).toFixed(1) + '%',
        category: p.category,
        wasAccurate: p.isAccurate
      }))
    };
  }

  /**
   * Get recommendations for model improvement
   */
  getImprovementRecommendations() {
    const recommendations = [];
    const categoryAccuracy = this.getAccuracyByCategory();

    // Check for categories with low accuracy
    Object.keys(categoryAccuracy).forEach(category => {
      const { accuracy, total } = categoryAccuracy[category];
      if (total >= 5 && accuracy < 60) {
        recommendations.push({
          type: 'accuracy',
          priority: 'high',
          category,
          message: `Low accuracy (${accuracy.toFixed(1)}%) for ${category} predictions. Consider retraining with more ${category} examples.`,
          action: `Collect more training data for ${category} learners`
        });
      }
    });

    // Check overall accuracy
    const overallAccuracy = this.getOverallAccuracy();
    if (overallAccuracy < 70 && this.metrics.totalPredictions >= 20) {
      recommendations.push({
        type: 'overall',
        priority: 'critical',
        message: `Overall accuracy (${overallAccuracy.toFixed(1)}%) is below acceptable threshold. Model may need retraining.`,
        action: 'Review and retrain the adaptive model with updated data'
      });
    }

    // Check for high error cases
    const highErrorPredictions = this.predictions.filter(p => p.error > 0.2);
    if (highErrorPredictions.length > 5) {
      recommendations.push({
        type: 'error_analysis',
        priority: 'medium',
        message: `${highErrorPredictions.length} predictions have high error (>20%). Review these cases for pattern analysis.`,
        action: 'Analyze high-error cases for common factors'
      });
    }

    // Check RMSE
    if (this.metrics.rmse > 0.15) {
      recommendations.push({
        type: 'model_performance',
        priority: 'medium',
        message: `RMSE (${this.metrics.rmse.toFixed(3)}) is higher than ideal. Consider model tuning.`,
        action: 'Adjust model hyperparameters or increase training data'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        priority: 'low',
        message: 'Model is performing well! Continue collecting prediction data for ongoing monitoring.',
        action: 'No immediate action required'
      });
    }

    return recommendations;
  }

  /**
   * Export prediction data for external analysis
   */
  exportData() {
    return JSON.stringify({
      predictions: this.predictions,
      metrics: this.metrics,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Clear all prediction data
   */
  clearData() {
    this.predictions = [];
    this.metrics = {
      totalPredictions: 0,
      accuratePredictions: 0,
      averageError: 0,
      rmse: 0,
      mae: 0,
      accuracyByCategory: {
        excellent: { correct: 0, total: 0 },
        proficient: { correct: 0, total: 0 },
        developing: { correct: 0, total: 0 },
        struggling: { correct: 0, total: 0 }
      }
    };
  }
}

// Export singleton instance
const predictionValidator = new PredictionValidator();
export default predictionValidator;
