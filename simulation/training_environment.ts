import { TrainingState } from "../types";

// Actions the RL agent can take
const DECREASE_LR = 0;
const MAINTAIN_LR = 1;
const INCREASE_LR = 2;

/**
 * A simulated training environment for a Large Language Model.
 * This class mimics how a model's validation loss might behave in response
 * to changes in the learning rate, providing a testbed for the meta-learning RL agent.
 * It follows a simple parabolic curve for loss vs. learning rate.
 */
export class TrainingEnvironment {
    private epoch: number;
    private learningRate: number;
    private validationLoss: number;
    private lastValidationLoss: number;
    
    // The "optimal" learning rate in this simulation. The agent's goal is to find this.
    private optimalLR: number = 3e-4; 
    // The base loss at the optimal LR
    private baseLoss: number = 0.1;
    // How quickly the loss increases as LR moves away from optimal
    private lossSensitivity: number = 2000;
    // Maximum number of epochs for the simulation
    private maxEpochs: number = 200;

    constructor() {
       this.reset();
    }

    public reset(): void {
        this.epoch = 0;
        this.learningRate = 1e-3; // Start with a relatively high LR
        this.validationLoss = this.calculateLoss(this.learningRate);
        this.lastValidationLoss = this.validationLoss;
    }

    /**
     * The core logic of the simulated environment.
     * Loss is modeled as a parabola centered on the `optimalLR`.
     */
    private calculateLoss(lr: number): number {
        // Use log space for more realistic LR behavior
        const logLR = Math.log10(lr);
        const logOptimalLR = Math.log10(this.optimalLR);
        
        // Parabolic loss function in log space
        const loss = this.baseLoss + this.lossSensitivity * Math.pow(logLR - logOptimalLR, 2);
        
        // Add some noise and a gradual downward trend to simulate progress
        const noise = (Math.random() - 0.5) * 0.02;
        const progress = -this.epoch * 0.001; // Simulate slow improvement over time
        
        return Math.max(0.01, loss + noise + progress);
    }
    
    /**
     * Executes one step in the training simulation.
     * @param action The action from the RL agent (0, 1, or 2).
     * @returns A tuple of [nextState, reward, done].
     */
    public step(action: number): [TrainingState, number, boolean] {
        this.epoch++;
        
        // Apply the agent's action to the learning rate
        if (action === DECREASE_LR) {
            this.learningRate /= 1.5;
        } else if (action === INCREASE_LR) {
            this.learningRate *= 1.5;
        }
        // MAINTAIN_LR does nothing to the LR
        
        // Ensure LR stays within reasonable bounds
        this.learningRate = Math.max(1e-7, Math.min(1e-1, this.learningRate));

        this.lastValidationLoss = this.validationLoss;
        this.validationLoss = this.calculateLoss(this.learningRate);

        // Reward is the negative change in loss (we want to minimize loss)
        const reward = this.lastValidationLoss - this.validationLoss;
        
        const done = this.epoch >= this.maxEpochs;

        return [this.getState(), reward, done];
    }
    
    /**
     * Returns the current state of the training environment.
     */
    public getState(): TrainingState {
        const lossTrend = this.validationLoss - this.lastValidationLoss;
        return [this.validationLoss, lossTrend, this.learningRate];
    }
    
    public getValidationLoss(): number {
        return this.validationLoss;
    }

    public getLearningRate(): number {
        return this.learningRate;
    }
}
