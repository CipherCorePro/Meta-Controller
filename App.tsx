import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrainingEnvironment } from './simulation/training_environment';
import { KI_Agent } from './simulation/agent';
import { AgentConfig, AgentState, LogEntry, SimulationState, RewardDataPoint, AiConfig } from './types';
import ControlPanel from './components/ControlPanel';
import AgentDashboard from './components/AgentDashboard';
import LogPanel from './components/LogPanel';
import TweakPanel from './components/TweakPanel';
import Modal from './components/Modal';
import { BrainIcon, Cog6ToothIcon, InformationCircleIcon, ChartBarIcon, TerminalIcon, WrenchScrewdriverIcon } from './components/Icons';
import { useLanguage } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import TrainingMonitor from './components/TrainingMonitor';
import SettingsModal from './components/SettingsModal';
import { IAiService } from './services/ai_service';
import { GeminiService } from './services/gemini_service';
import { LmStudioService } from './services/lmstudio_service';

interface ExplanationState {
    isOpen: boolean;
    isLoading: boolean;
    isCfLoading: boolean;
    content: string;
    cfContent: string;
    agentState: AgentState | null;
}

const NUM_AGENTS = 1;

const App: React.FC = () => {
    const { t, lang } = useLanguage();
    const [simulationState, setSimulationState] = useState<SimulationState>({
        isRunning: false,
        speed: 500,
        episode: 0,
        step: 0,
    });
    // AI Service State
    const [aiConfig, setAiConfig] = useState<AiConfig>(() => {
        const savedConfig = localStorage.getItem('aiConfig');
        return savedConfig ? JSON.parse(savedConfig) : {
            provider: 'gemini',
            lmStudio: { baseUrl: 'http://localhost:1234/v1', model: '' }
        };
    });
    const [aiService, setAiService] = useState<IAiService | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [agentActivity, setAgentActivity] = useState<boolean[]>(Array(NUM_AGENTS).fill(true));
    const [environment, setEnvironment] = useState<TrainingEnvironment | null>(null);
    const [agents, setAgents] = useState<KI_Agent[]>([]);
    const [agentStates, setAgentStates] = useState<AgentState[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [rewardHistory, setRewardHistory] = useState<RewardDataPoint[]>([]);
    const [trainingHistory, setTrainingHistory] = useState<{epoch: number, validationLoss: number}[]>([]);

    const [liveConfig, setLiveConfig] = useState<Omit<AgentConfig, 'input_size' | 'action_size' | 'emotion_dim' | 'memory_capacity' | 'causal_memory_capacity' | 'world_model_hidden_size' | 'world_model_learning_rate' | 'world_model_reward_history_window' | 'attention_initial_layers' | 'attention_layer_growth_threshold' | 'novelty_threshold' | 'novelty_tolerance' | 'initial_goal_key' | 'viewRadius' | 'diffusionFactor' | 'meta_cognitive_reward_window' | 'language'>>({
        learning_rate: 0.1,
        gamma: 0.9,
        epsilon: 0.1,
        frustration_threshold: 0.8,
        impulsive_exploration_boost: 0.4,
        enable_obstacles: false,
        num_obstacles: 0,
        meta_cognitive_boost: 0.25,
        reflection_learning_rate: 0.5,
    });
    const [explanation, setExplanation] = useState<ExplanationState>({ isOpen: false, isLoading: false, isCfLoading: false, content: '', cfContent: '', agentState: null });
    const simulationRef = useRef<number | null>(null);

    const defaultConfig: Omit<AgentConfig, keyof typeof liveConfig | 'language'> = {
        input_size: 3,
        action_size: 3,
        emotion_dim: 3,
        memory_capacity: 1000,
        causal_memory_capacity: 200,
        world_model_hidden_size: 32,
        world_model_learning_rate: 0.0005,
        world_model_reward_history_window: 20,
        attention_initial_layers: 2,
        attention_layer_growth_threshold: 0.95,
        novelty_threshold: 0.6,
        novelty_tolerance: 0.6,
        initial_goal_key: "explore",
        viewRadius: 0,
        diffusionFactor: 0,
        meta_cognitive_reward_window: 20,
    };

    useEffect(() => {
        // Initialize AI service based on config
        if (aiConfig.provider === 'gemini') {
            setAiService(new GeminiService());
        } else {
            setAiService(new LmStudioService(aiConfig.lmStudio));
        }
    }, [aiConfig]);

    const addLog = useCallback((message: string, source: LogEntry['source'] = 'system') => {
        const newLog: LogEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            message,
            source,
        };
        setLogs(prev => [newLog, ...prev.slice(0, 199)]);
    }, []);

    const initializeSimulation = useCallback(() => {
        addLog(t('logs.initializing_meta'), 'system');
        const fullConfig: AgentConfig = { ...defaultConfig, ...liveConfig, language: lang };
        
        const env = new TrainingEnvironment();
        setEnvironment(env);
        
        const newAgents = Array.from({ length: NUM_AGENTS }, (_, i) => new KI_Agent(i, fullConfig, addLog, aiService));
        setAgents(newAgents);
        
        const initialState = env.getState();
        const initialAgentStates = newAgents.map((agent) => agent.getFullState(initialState, [0, 0], 0));
        setAgentStates(initialAgentStates);

        setSimulationState(prev => ({ ...prev, episode: 1, step: 0 }));
        setAgentActivity(Array(NUM_AGENTS).fill(true));
        setLogs([]);
        setRewardHistory([]);
        setTrainingHistory([ {epoch: 0, validationLoss: env.getValidationLoss()} ]);
    }, [addLog, JSON.stringify(liveConfig), lang, JSON.stringify(defaultConfig), t, aiService]);
    
    useEffect(() => {
        // Debounce re-initialization to avoid rapid changes
        const handler = setTimeout(() => {
            if (aiService) {
                initializeSimulation();
            }
        }, 100);
        return () => clearTimeout(handler);
    }, [initializeSimulation, aiService]);
    
    const runSimulationStep = useCallback(() => {
        if (!environment || agents.length === 0 || !agentActivity[0]) return;

        const epoch = simulationState.step + 1;
        
        const currentState = environment.getState();
        const agent = agents[0];
        
        const action = agent.decide(currentState, [0, 0], epoch);
        const [nextState, reward, done] = environment.step(action);

        agent.learn(currentState, action, reward, nextState, [0, 0], epoch);
        
        const newAgentState = agent.getFullState(nextState, [0, 0], agent.lastReward);
        
        setRewardHistory(prev => [...prev, { step: epoch, avgReward: reward}].slice(-200));
        setTrainingHistory(prev => [...prev, { epoch, validationLoss: environment.getValidationLoss() }]);
        setSimulationState(prev => ({...prev, step: epoch}));
        setAgentStates([newAgentState]);

        if (done) {
            addLog(t('logs.training_complete', { epochs: epoch }), 'system');
            setSimulationState(prev => ({...prev, isRunning: false}));
        }

    }, [agents, environment, simulationState.step, agentActivity, t]);

    useEffect(() => {
        const fullConfig: Partial<AgentConfig> = { ...liveConfig, language: lang };
        agents.forEach(agent => agent.updateConfig(fullConfig));
    }, [liveConfig, agents, lang]);

    useEffect(() => {
        if (simulationState.isRunning) {
            simulationRef.current = window.setTimeout(runSimulationStep, simulationState.speed);
        }
        return () => {
            if (simulationRef.current) {
                clearTimeout(simulationRef.current);
            }
        };
    }, [simulationState.isRunning, simulationState.speed, runSimulationStep]);

    const handleExplainDecision = async (agentState: AgentState) => {
        if(agentState.id == null || !aiService) return;
        setExplanation({ isOpen: true, isLoading: true, isCfLoading: false, content: '', cfContent: '', agentState });
        addLog(`Requesting explanation for Agent ${agentState.id}'s action...`, 'gemini');
        try {
            const explanationText = await aiService.getExplanation(agentState, lang);
            setExplanation(prev => ({ ...prev, isLoading: false, content: explanationText }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setExplanation(prev => ({ ...prev, isLoading: false, content: `Error: ${errorMessage}` }));
            addLog(`AI Service Error: ${errorMessage}`, 'system');
        }
    };
    
    const handleCounterfactualExplain = async (agentState: AgentState, alternativeAction: number) => {
        if (!aiService) return;
        setExplanation(prev => ({ ...prev, isCfLoading: true, cfContent: '' }));
        addLog(`Requesting counterfactual explanation for Agent ${agentState.id}...`, 'gemini');
        try {
            const cfText = await aiService.getCounterfactualExplanation(agentState, alternativeAction, lang);
            setExplanation(prev => ({ ...prev, isCfLoading: false, cfContent: cfText }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setExplanation(prev => ({ ...prev, isCfLoading: false, cfContent: `Error: ${errorMessage}`}));
            addLog(`AI Service Error: ${errorMessage}`, 'system');
        }
    };
    
    const handleSaveAiConfig = (newConfig: AiConfig) => {
        setAiConfig(newConfig);
        localStorage.setItem('aiConfig', JSON.stringify(newConfig));
        setIsSettingsOpen(false);
        addLog("AI configuration updated.", "system");
    };

    const handleToggleAgentActivity = (agentId: number) => {
        setAgentActivity(prev => {
            const newActivity = [...prev];
            newActivity[agentId] = !newActivity[agentId];
            addLog(`Agent ${agentId} has been ${newActivity[agentId] ? 'activated' : 'deactivated'}.`, 'system');
            return newActivity;
        });
    };

    const handleControlChange = (newSimState: Partial<SimulationState>) => {
        setSimulationState(prev => ({...prev, ...newSimState}));
    };
    
    const handleReset = () => {
        setSimulationState(prev => ({...prev, isRunning: false}));
        initializeSimulation();
    };
    
    const handleSave = () => addLog("Save/Load is not applicable in this version.", 'system');
    const handleLoad = () => addLog("Save/Load is not applicable in this version.", 'system');

    return (
        <div className="min-h-screen text-gray-200 font-sans p-4 flex flex-col gap-4">
            <header className="flex justify-between items-center bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                    <BrainIcon className="w-8 h-8 text-cyan-400"/>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                        {t('header.title')}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                        <InformationCircleIcon className="w-5 h-5" />
                        <span>{t('header.subtitle')}</span>
                    </div>
                    <LanguageSwitcher />
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-md bg-gray-700 hover:bg-cyan-600 text-gray-300 hover:text-white transition-colors"
                        title={t('config.ai_settings.title')}
                    >
                        <WrenchScrewdriverIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <ControlPanel 
                        simulationState={simulationState}
                        onStateChange={handleControlChange}
                        onReset={handleReset}
                        onSave={handleSave}
                        onLoad={handleLoad as any}
                    />
                    {environment && (
                        <TrainingMonitor 
                           history={trainingHistory}
                           currentLr={environment.getLearningRate()}
                        />
                    )}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
                     <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-cyan-400"><Cog6ToothIcon className="w-6 h-6"/>{t('config.title')}</h2>
                        <TweakPanel liveConfig={liveConfig} onConfigChange={setLiveConfig} />
                    </div>
                     <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg shadow-lg flex-grow h-96 flex flex-col min-h-0">
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-cyan-400"><TerminalIcon className="w-6 h-6"/>{t('logs.title')}</h2>
                        <LogPanel logs={logs} />
                    </div>
                </div>
            </main>
            
            <section className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg shadow-lg mt-4">
                 <h2 className="text-xl font-bold mb-4 text-cyan-400">{t('details.title')}</h2>
                 <AgentDashboard 
                    agentStates={agentStates} 
                    onExplain={handleExplainDecision} 
                    geminiAvailable={aiService?.isAvailable() || false} 
                    agentActivity={agentActivity}
                    onToggleActivity={handleToggleAgentActivity}
                 />
            </section>

            <Modal 
                isOpen={explanation.isOpen}
                onClose={() => setExplanation({isOpen: false, isLoading: false, isCfLoading: false, content: '', cfContent: '', agentState: null})}
                title={t('modal.title')}
                explanation={explanation}
                onCounterfactual={handleCounterfactualExplain}
            >
                {explanation.isLoading ? (
                     <div className="flex items-center justify-center gap-2 p-8">
                        <BrainIcon className="w-6 h-6 animate-pulse text-cyan-400" />
                        <span className="text-gray-300">{t('modal.loading')}</span>
                    </div>
                ) : (
                    <div className="p-4 text-gray-300 whitespace-pre-wrap leading-relaxed">{explanation.content}</div>
                )}
            </Modal>

            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                config={aiConfig}
                onSave={handleSaveAiConfig}
            />
        </div>
    );
};

export default App;
