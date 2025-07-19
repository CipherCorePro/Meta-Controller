import { AgentState, LmStudioConfig } from "../types";
import { translations, Language, TranslationKey } from '../i18n/translations';
import { IAiService } from "./ai_service";

const t = (key: TranslationKey, lang: Language, params?: Record<string, string | number>): string => {
    let str: string = translations[lang][key] || translations['en'][key];
    if (params) {
        Object.entries(params).forEach(([pKey, pValue]) => {
            str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pValue));
        });
    }
    return str;
};

const getActionText = (action: number, lang: Language): string => {
    const key = `q_action.${action}` as TranslationKey;
    const translation = t(key, lang);
    return translation || `Action ${action}`;
}

const commonPromptSetup = (agentState: AgentState, language: Language): string => {
    const { id, emotion, drives, currentGoal, discretizedState, qValues, lastAction, trainingState } = agentState;
    
    const chosenActionText = getActionText(lastAction, language);
    const goalKey = `goal.${currentGoal.replace(/_/g, '-')}` as TranslationKey;
    const translatedGoal = t(goalKey, language, {lang: language});

    const [validationLoss, _lossTrend, learningRate] = trainingState || [0,0,0];

    return `
**${t('gemini.prompt.training_context', language)}:**
- **${t('gemini.prompt.training_context.loss', language)}:** ${validationLoss.toFixed(5)}
- **${t('gemini.prompt.training_context.lr', language)}:** ${learningRate.toExponential(2)}
- **${t('gemini.prompt.state', language)}:** "${discretizedState}"

**${t('gemini.prompt.agent_data', language)}:**
- **${t('gemini.prompt.agent_id', language)}:** ${id}
- **${t('gemini.prompt.current_goal', language)}:** ${translatedGoal}
- **${t('gemini.prompt.emotions', language)}:** ${t('gemini.prompt.emotions.valence', language)}: ${emotion.valence.toFixed(2)}, ${t('gemini.prompt.emotions.arousal', language)}: ${emotion.arousal.toFixed(2)}
- **${t('gemini.prompt.drives', language)}:** ${t('gemini.prompt.drives.frustration', language)}: ${drives.frustration.toFixed(2)}

**${t('gemini.prompt.decision_data', language)}:**
- **${t('gemini.prompt.q_values', language)}:** 
  - ${getActionText(0, language)}: ${qValues[0]?.toFixed(4) || 'N/A'}
  - ${getActionText(1, language)}: ${qValues[1]?.toFixed(4) || 'N/A'}
  - ${getActionText(2, language)}: ${qValues[2]?.toFixed(4) || 'N/A'}
- **${t('gemini.prompt.action_chosen', language)}:** ${t('gemini.prompt.action_chosen_text', language, {lastAction, actionText: chosenActionText})}
`;
}

// Helper to extract JSON from a string that might contain markdown backticks
function extractJson(text: string): any {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : text;
    return JSON.parse(jsonString);
}


export class LmStudioService implements IAiService {
    private config: LmStudioConfig;

    constructor(config: LmStudioConfig) {
        this.config = config;
    }

    public isAvailable(): boolean {
        return !!this.config.baseUrl && !!this.config.model;
    }
    
    public async testConnection(): Promise<boolean> {
        if (!this.isAvailable()) return false;
        try {
            const response = await fetch(`${this.config.baseUrl}/models`, {
                method: 'GET',
            });
            return response.ok;
        } catch (error) {
            console.error("LM Studio connection test failed:", error);
            return false;
        }
    }
    
    private async baseChatCall(prompt: string): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error("LM Studio is not configured. Please check AI Provider settings.");
        }
        
        try {
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`LM Studio API Error (${response.status}): ${errorBody}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "";

        } catch (error) {
            console.error("LM Studio API call failed:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unknown error occurred while contacting the LM Studio API.");
        }
    }

    public async getExplanation(agentState: AgentState, language: Language): Promise<string> {
        const prompt = `
${t('gemini.prompt.title', language)}
${t('gemini.prompt.intro', language)}

${commonPromptSetup(agentState, language)}
**${t('gemini.prompt.task', language)}:**
${t('gemini.prompt.task_instruction', language)}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;
        return this.baseChatCall(prompt);
    }

    public async getCounterfactualExplanation(agentState: AgentState, alternativeAction: number, language: Language): Promise<string> {
        const alternativeActionText = getActionText(alternativeAction, language);
        const prompt = `
${t('gemini.prompt.counterfactual.title', language)}
${t('gemini.prompt.intro', language)}

${commonPromptSetup(agentState, language)}
**${t('gemini.prompt.counterfactual.task', language)}:**
${t('gemini.prompt.counterfactual.task_instruction', language, { alternativeAction, alternativeActionText })}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;
        return this.baseChatCall(prompt);
    }

    public async getRetrospectiveAnalysis(agentState: AgentState, outcomeReward: number, language: Language): Promise<{ thought: string; reasoning: string; betterAction: number } | null> {
         const prompt = `
${t('gemini.prompt.retrospective.title', language)}
${t('gemini.prompt.retrospective.intro', language, { outcomeReward: outcomeReward.toFixed(2)})}

${commonPromptSetup(agentState, language)}

**${t('gemini.prompt.retrospective.task', language)}**
${t('gemini.prompt.retrospective.task_instruction', language)}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;
        try {
            const responseText = await this.baseChatCall(prompt);
            const result = extractJson(responseText);

            if (![0, 1, 2].includes(result.betterAction)) {
                console.error(`LM Studio returned invalid betterAction: ${result.betterAction}`);
                const bestQAction = agentState.qValues.indexOf(Math.max(...agentState.qValues));
                result.betterAction = bestQAction;
            }

            return {
                thought: result.thought,
                reasoning: result.reasoning,
                betterAction: result.betterAction
            };

        } catch (error) {
            console.error("LM Studio Retrospective Analysis failed:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to get reflection from LM Studio: ${error.message}`);
            }
            throw new Error("An unknown error occurred while processing the LM Studio response.");
        }
    }
}
