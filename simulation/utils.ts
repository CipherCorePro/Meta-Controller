import { TrainingState } from "../types";

// --- New Discretization for Meta-Learning ---

/**
 * Converts a continuous training state vector into a discrete string representation.
 * This is crucial for the Q-table in the meta-learning context.
 * @param state The agent's current training state vector [validationLoss, lossTrend, currentLearningRate].
 * @returns A string key for the Q-table, e.g., "loss_high_trend_inc_lr_low"
 */
export function discretizeTrainingState(state: TrainingState): string {
    const [validationLoss, lossTrend, learningRate] = state;

    // Discretize Validation Loss
    let lossCategory: string;
    if (validationLoss > 2.0) lossCategory = 'exploding';
    else if (validationLoss > 0.5) lossCategory = 'high';
    else if (validationLoss > 0.1) lossCategory = 'mid';
    else lossCategory = 'low';

    // Discretize Loss Trend
    let trendCategory: string;
    if (lossTrend > 0.01) trendCategory = 'inc';       // Increasing
    else if (lossTrend < -0.01) trendCategory = 'dec'; // Decreasing
    else trendCategory = 'plateau';                     // Plateauing

    // Discretize Learning Rate (log scale)
    let lrCategory: string;
    if (learningRate > 1e-3) lrCategory = 'high';
    else if (learningRate > 1e-5) lrCategory = 'mid';
    else lrCategory = 'low';

    return `loss_${lossCategory}_trend_${trendCategory}_lr_${lrCategory}`;
}
