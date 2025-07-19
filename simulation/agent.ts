import { AgentConfig, AgentState, Emotion, Drives, Vector, AgentEvent, Reflection, TrainingState } from '../types';
import { IAiService } from '../services/ai_service';
import { discretizeTrainingState } from './utils';

type LogFunction = (message: string, source: 'system' | 'agent' | 'env' | 'rule-engine' | 'gemini') => void;

class Memory {
    private capacity: number;
    private memory: any[];

    constructor(capacity = 1000) {
        this.capacity = capacity;
        this.memory = [];
    }

    store(experience: any) {
        if (this.memory.length >= this.capacity) {
            this.memory.shift();
        }
        this.memory.push(experience);
    }
}

class EmotionModel {
    public emotions: Emotion;

    constructor() {
        this.emotions = { valence: 0, arousal: 0, dominance: 0 };
    }

    update_emotions(reward: number, predictability: number) {
        this.emotions.valence = this.emotions.valence * 0.95 + reward * 0.1;
        this.emotions.valence = Math.max(-1, Math.min(1, this.emotions.valence));

        const arousal_intensity = 1.0 - predictability;
        this.emotions.arousal += arousal_intensity * 0.05;
        this.emotions.arousal = Math.max(0, Math.min(1, this.emotions.arousal));
        this.emotions.arousal *= 0.99;

        const dominance_intensity = (reward + predictability) / 2.0;
        this.emotions.dominance += dominance_intensity * 0.05;
        this.emotions.dominance = Math.max(-1, Math.min(1, this.emotions.dominance));
        this.emotions.dominance *= 0.99;
    }

    get_emotions(): Emotion {
        return { ...this.emotions };
    }
}

class SelfModel {
    public current_goal_key: "explore" | "reduce_frustration";
    public current_subgoal: string | null;
    public drives: Drives;

    constructor() {
        this.current_goal_key = "explore";
        this.current_subgoal = "Optimize training loss";
        this.drives = {
            curiosity: Math.random() * 0.4 + 0.1,
            understanding: Math.random() * 0.2 + 0.1,
            frustration: Math.random() * 0.2,
        };
    }

    update_goal(goal_key: "explore" | "reduce_frustration", subgoal: string | null) {
        this.current_goal_key = goal_key;
        this.current_subgoal = subgoal;
    }

    update_drives(updates: Partial<Drives>) {
        this.drives = { ...this.drives, ...updates };
        this.drives.curiosity = Math.max(0, Math.min(1, this.drives.curiosity));
        this.drives.understanding = Math.max(0, Math.min(1, this.drives.understanding));
        this.drives.frustration = Math.max(0, Math.min(1, this.drives.frustration));
    }
}

export class KI_Agent {
    public id: number;
    private config: AgentConfig;
    private qTable: { [state: string]: number[] } = {};
    private memory: Memory;
    public emotion_model: EmotionModel;
    public self_model: SelfModel;
    private log: LogFunction;
    private aiService: IAiService | null;
    public lastAction: number = 0;
    public lastReward: number = 0;
    private eventHistory: AgentEvent[] = [];
    private eventIdCounter = 0;
    private frustrationPeakLogged = false;
    private impulsiveExploreLogged = false;
    private rewardWindow: number[] = [];
    public isConfused: boolean = false;
    private confusionThreshold: number = -0.05; // Agent gets confused if reward is consistently negative
    private lastDecisionContext: AgentState | null = null;
    private isAnalyzing: boolean = false;
    public reflections: Reflection[] = [];
    private reflectionIdCounter = 0;

    constructor(id: number, config: AgentConfig, logFunction: LogFunction, aiService: IAiService | null) {
        this.id = id;
        this.config = config;
        this.log = logFunction;
        this.aiService = aiService;

        this.memory = new Memory(config.memory_capacity);
        this.emotion_model = new EmotionModel();
        this.self_model = new SelfModel();
        this.self_model.current_goal_key = config.initial_goal_key;
    }

    private logEvent(type: AgentEvent['type'], message: string, step: number) {
        const newEvent: AgentEvent = {
            id: this.eventIdCounter++,
            step,
            type,
            message
        };
        this.eventHistory.push(newEvent);
        if (this.eventHistory.length > 50) {
            this.eventHistory.shift();
        }
    }

    updateConfig(newConfig: Partial<AgentConfig>) {
        this.config = { ...this.config, ...newConfig };
    }
    
    private getQValues(dState: string): number[] {
        if (!this.qTable[dState]) {
            this.qTable[dState] = Array(this.config.action_size).fill(0);
        }
        return this.qTable[dState];
    }

    decide(state: TrainingState, _goalPosition: Vector, step: number): number {
        const dState = discretizeTrainingState(state);
        const qValues = this.getQValues(dState);
        
        const { arousal } = this.emotion_model.get_emotions();
        let effectiveEpsilon = this.config.epsilon + arousal * (1 - this.config.epsilon);

        if (this.self_model.drives.frustration > this.config.frustration_threshold) {
            effectiveEpsilon = Math.min(1.0, effectiveEpsilon + this.config.impulsive_exploration_boost);
            if (!this.impulsiveExploreLogged) {
                this.logEvent('impulsive_explore', `Frustration > threshold. Boosting exploration.`, step);
                this.impulsiveExploreLogged = true;
            }
        } else {
            this.impulsiveExploreLogged = false;
        }

        if (this.isConfused) {
            effectiveEpsilon = Math.min(1.0, effectiveEpsilon + this.config.meta_cognitive_boost);
        }

        if (Math.random() < effectiveEpsilon) {
            this.lastAction = Math.floor(Math.random() * this.config.action_size);
        } else {
            const maxQ = Math.max(...qValues);
            const bestActions = qValues.map((q, i) => q === maxQ ? i : -1).filter(i => i !== -1);
            this.lastAction = bestActions[Math.floor(Math.random() * bestActions.length)];
        }
        
        this.lastDecisionContext = this.getFullState(state, [0, 0], this.lastReward);

        return this.lastAction;
    }

    learn(state: TrainingState, action: number, reward: number, next_state: TrainingState, _goalPosition: Vector, step: number) {
        const dState = discretizeTrainingState(state);
        const dNextState = discretizeTrainingState(next_state);
        
        const intrinsic_reward = this.calculate_intrinsic_reward(dNextState, step);
        const total_reward = reward + intrinsic_reward * this.self_model.drives.curiosity;
        
        this.memory.store({ state: dState, action, reward: total_reward, next_state: dNextState });
        this.lastReward = total_reward;

        const qValues = this.getQValues(dState);
        const nextQValues = this.getQValues(dNextState);
        const maxNextQ = Math.max(...nextQValues);

        const oldQ = qValues[action];
        const newQ = oldQ + this.config.learning_rate * (total_reward + this.config.gamma * maxNextQ - oldQ);
        this.qTable[dState][action] = newQ;
        
        const oldFrustration = this.self_model.drives.frustration;

        this.runMetaCognition(total_reward, step);
        
        const predictability = 1 - Math.min(1, Math.abs(newQ - oldQ));
        this.emotion_model.update_emotions(reward, predictability);

        this.update_drives(intrinsic_reward, step);
        this.check_and_update_goal(step);

        const newFrustration = this.self_model.drives.frustration;
        const wasBadOutcome = reward < -0.1 && newFrustration > oldFrustration;
        if (wasBadOutcome && !this.isAnalyzing && this.lastDecisionContext && this.aiService?.isAvailable()) {
            this.runRetrospectiveAnalysis(step, this.lastDecisionContext, reward);
        }
        this.lastDecisionContext = null; // Consume context
    }

    private async runRetrospectiveAnalysis(step: number, agentStateAtDecision: AgentState, outcomeReward: number) {
        if (!this.aiService) return;
        this.isAnalyzing = true;
        this.log(`Agent ${this.id} is reflecting on a poor outcome (reward: ${outcomeReward.toFixed(2)}).`, 'gemini');
        
        try {
            const analysis = await this.aiService.getRetrospectiveAnalysis(agentStateAtDecision, outcomeReward, this.config.language || 'en');
            if(analysis) {
                 const newReflection: Reflection = {
                    id: this.reflectionIdCounter++,
                    step,
                    ...analysis
                 };
                 this.reflections.unshift(newReflection);
                 if(this.reflections.length > 10) { 
                    this.reflections.pop();
                 }
                 this.logEvent('critical_reflection', analysis.thought, step);
                 
                 this.applyReflectionToModel(agentStateAtDecision, analysis.betterAction);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            this.log(`Agent ${this.id} reflection failed: ${message}`, 'system');
        } finally {
            this.isAnalyzing = false;
        }
    }

    private applyReflectionToModel(agentStateAtDecision: AgentState, betterAction: number) {
        const mistakeAction = agentStateAtDecision.lastAction;
        const dState = agentStateAtDecision.discretizedState;
        
        const qValues = this.getQValues(dState);

        if (qValues[betterAction] !== undefined && mistakeAction !== betterAction) {
            const updateAmount = this.config.reflection_learning_rate;

            const oldMistakeQ = qValues[mistakeAction];
            const oldBetterQ = qValues[betterAction];

            qValues[mistakeAction] -= updateAmount;
            qValues[betterAction] += updateAmount;
            
            this.log(
                `Agent ${this.id} learned from reflection. State: ${dState}. ` +
                `Action ${mistakeAction} Q-value changed from ${oldMistakeQ.toFixed(3)} to ${qValues[mistakeAction].toFixed(3)}. ` +
                `Action ${betterAction} Q-value changed from ${oldBetterQ.toFixed(3)} to ${qValues[betterAction].toFixed(3)}.`,
                'rule-engine'
            );
        }
    }
    
    private runMetaCognition(reward: number, step: number) {
        this.rewardWindow.push(reward);
        if (this.rewardWindow.length > this.config.meta_cognitive_reward_window) {
            this.rewardWindow.shift();
        }

        if (this.rewardWindow.length < this.config.meta_cognitive_reward_window) {
            return;
        }

        const avgReward = this.rewardWindow.reduce((a, b) => a + b, 0) / this.rewardWindow.length;
        
        if (avgReward < this.confusionThreshold && !this.isConfused) {
            this.isConfused = true;
            this.logEvent('meta_cognition_active', `Performance is low (avg reward: ${avgReward.toFixed(2)}). Boosting exploration.`, step);
        } else if (avgReward >= this.confusionThreshold && this.isConfused) {
            this.isConfused = false;
            this.logEvent('meta_cognition_inactive', `Performance improved (avg reward: ${avgReward.toFixed(2)}). Resuming normal operation.`, step);
        }
    }
    
    private calculate_intrinsic_reward(dNextState: string, step: number): number {
        if (!this.qTable[dNextState]) {
            this.log(`Agent ${this.id} discovered a new training state! Curiosity bonus! State: ${dNextState}`, 'agent');
            this.logEvent('new_state', `Discovered state: ${dNextState}`, step);
            return 0.1; // Smaller bonus than physical exploration
        }
        return 0;
    }

    private update_drives(intrinsic_reward: number, step: number) {
        const { valence } = this.emotion_model.get_emotions();
        let { curiosity, understanding, frustration } = this.self_model.drives;

        frustration *= 0.98;

        curiosity += intrinsic_reward * 0.1 + (Math.random() - 0.5) * 0.01;
        understanding += intrinsic_reward * 0.05 + (Math.random() - 0.5) * 0.005;

        if (valence < -0.5) {
            frustration += 0.04;
        } else if (valence > 0.2) {
            frustration -= 0.05;
        } else {
            frustration -= 0.01;
        }
        
        this.self_model.update_drives({ curiosity, understanding, frustration });

        if (frustration > this.config.frustration_threshold && !this.frustrationPeakLogged) {
            this.logEvent('frustration_peak', `Frustration crossed threshold (${frustration.toFixed(2)})`, step);
            this.frustrationPeakLogged = true;
        } else if (frustration < this.config.frustration_threshold) {
            this.frustrationPeakLogged = false;
        }
    }

    private check_and_update_goal(step: number) {
        const { frustration } = this.self_model.drives;
        const currentGoal = this.self_model.current_goal_key;

        if (currentGoal === "explore" && frustration > this.config.frustration_threshold) {
            this.self_model.update_goal("reduce_frustration", null);
            this.log(`Agent ${this.id} is frustrated! Goal: Reduce Frustration`, 'rule-engine');
            this.logEvent('goal_change', `Goal set to 'Reduce Frustration'`, step);
        } 
        else if (currentGoal === "reduce_frustration" && frustration < 0.4) {
            this.self_model.update_goal("explore", "Optimize training loss");
            this.log(`Agent ${this.id} feels better. Goal: Optimize Training`, 'rule-engine');
            this.logEvent('goal_change', `Goal set to 'Optimize Training'`, step);
        }
    }

    getFullState(current_state: TrainingState, _goalPosition: Vector, last_reward: number): AgentState {
        const dState = discretizeTrainingState(current_state);
        const qValues = this.getQValues(dState);

        return {
            id: this.id,
            position: [0, 0], // Not used
            goalPosition: [0, 0], // Not used
            emotion: this.emotion_model.get_emotions(),
            drives: { ...this.self_model.drives },
            currentGoal: this.self_model.current_goal_key,
            currentSubGoal: this.self_model.current_subgoal,
            lastReward: last_reward,
            lastAction: this.lastAction,
            discretizedState: dState,
            qValues: [...qValues],
            eventHistory: [...this.eventHistory],
            isConfused: this.isConfused,
            reflections: [...this.reflections],
            trainingState: current_state,
        };
    }
}