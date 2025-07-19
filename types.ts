export type Vector = [number, number];

// Represents the state of the simulated training environment
export type TrainingState = number[]; // [validationLoss, lossTrend, currentLearningRate]

export interface Obstacle {
    position: Vector;
}

export interface Reflection {
    id: number;
    step: number;
    thought: string;
    reasoning: string;
    betterAction: number;
}

export interface AgentConfig {
    input_size: number;
    action_size: number;
    emotion_dim: number;
    learning_rate: number;
    gamma: number; // Q-Learning discount factor
    epsilon: number; // Exploration rate
    memory_capacity: number;
    causal_memory_capacity: number; 
    world_model_hidden_size: number;
    world_model_learning_rate: number;
    world_model_reward_history_window: number;
    attention_initial_layers: number;
    attention_layer_growth_threshold: number;
    novelty_threshold: number;
    novelty_tolerance: number;
    initial_goal_key: "explore" | "reduce_frustration";
    viewRadius: number; 
    diffusionFactor: number;
    frustration_threshold: number; // Level at which agent becomes impulsive
    impulsive_exploration_boost: number; // Epsilon boost when frustrated
    enable_obstacles: boolean; // Note: Not used in meta-learning version
    num_obstacles: number; // Note: Not used in meta-learning version
    meta_cognitive_boost: number; // Epsilon boost when confused
    meta_cognitive_reward_window: number; // Window for performance tracking
    reflection_learning_rate: number; // How strongly to adjust Q-values based on reflection
    language?: 'en' | 'de';
}

export interface Emotion {
    valence: number; // -1 to 1 (unpleasant to pleasant)
    arousal: number; // 0 to 1 (calm to excited)
    dominance: number; // -1 to 1 (submissive to dominant)
}

export interface Drives {
    curiosity: number;
    understanding: number;
    frustration: number;
}

export interface AgentEvent {
    id: number;
    step: number; // Represents epoch in this context
    type: 'goal_change' | 'impulsive_explore' | 'new_state' | 'frustration_peak' | 'meta_cognition_active' | 'meta_cognition_inactive' | 'critical_reflection';
    message: string;
}

export interface AgentState {
    id: number;
    position: Vector; // Note: Not used in meta-learning version, kept for type compatibility
    goalPosition: Vector; // Note: Not used in meta-learning version
    emotion: Emotion;
    drives: Drives;
    currentGoal: string;
    currentSubGoal: string | null;
    lastReward: number;
    lastAction: number;
    discretizedState: string;
    qValues: number[];
    eventHistory: AgentEvent[];
    isConfused: boolean;
    reflections: Reflection[];
    // Meta-learning specific state
    trainingState?: TrainingState;
}

export interface SimulationState {
    isRunning: boolean;
    speed: number;
    episode: number;
    step: number; // Represents epoch in this context
}

export interface LogEntry {
    id: number;
    timestamp: Date;
    message: string;
    source: 'system' | 'agent' | 'env' | 'rule-engine' | 'gemini';
}

export interface RewardDataPoint {
    step: number; // Represents epoch
    avgReward: number;
}

// Configuration for AI Service
export type AiProvider = 'gemini' | 'lmstudio';

export interface LmStudioConfig {
    baseUrl: string;
    model: string;
}

export interface AiConfig {
    provider: AiProvider;
    lmStudio: LmStudioConfig;
}
