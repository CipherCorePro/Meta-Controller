import { GoogleGenAI, Type } from "@google/genai";
import { AgentState } from "../types";
import { translations, Language, TranslationKey } from '../i18n/translations';
import { IAiService } from "./ai_service";

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY && process.env.API_KEY !== 'PLACEHOLDER_API_KEY') {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e)
    }
}

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

export class GeminiService implements IAiService {
    
    public isAvailable(): boolean {
        return !!ai;
    }

    public async getExplanation(agentState: AgentState, language: Language): Promise<string> {
        if (!this.isAvailable()) {
            return "Gemini API key is not configured. Please check AI Provider settings.";
        }

        const prompt = `
${t('gemini.prompt.title', language)}
${t('gemini.prompt.intro', language)}

${commonPromptSetup(agentState, language)}
**${t('gemini.prompt.task', language)}:**
${t('gemini.prompt.task_instruction', language)}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;

        try {
            const response = await ai!.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Gemini API call failed:", error);
            if (error instanceof Error) {
                return `Failed to get explanation from Gemini: ${error.message}`;
            }
            return "An unknown error occurred while contacting the Gemini API.";
        }
    }

    public async getCounterfactualExplanation(agentState: AgentState, alternativeAction: number, language: Language): Promise<string> {
        if (!this.isAvailable()) {
            return "Gemini API key not configured. Please check AI Provider settings.";
        }

        const alternativeActionText = getActionText(alternativeAction, language);

        const prompt = `
${t('gemini.prompt.counterfactual.title', language)}
${t('gemini.prompt.intro', language)}

${commonPromptSetup(agentState, language)}
**${t('gemini.prompt.counterfactual.task', language)}:**
${t('gemini.prompt.counterfactual.task_instruction', language, { alternativeAction, alternativeActionText })}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;
        
        try {
            const response = await ai!.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Gemini Counterfactual API call failed:", error);
            if (error instanceof Error) {
                return `Failed to get explanation from Gemini: ${error.message}`;
            }
            return "An unknown error occurred while contacting the Gemini API.";
        }
    }

    public async getRetrospectiveAnalysis(agentState: AgentState, outcomeReward: number, language: Language): Promise<{thought: string, reasoning: string, betterAction: number} | null> {
        if (!this.isAvailable()) {
            throw new Error("Gemini API key not configured. Please check AI Provider settings.");
        }
        
        const prompt = `
${t('gemini.prompt.retrospective.title', language)}
${t('gemini.prompt.retrospective.intro', language, { outcomeReward: outcomeReward.toFixed(2)})}

${commonPromptSetup(agentState, language)}

**${t('gemini.prompt.retrospective.task', language)}**
${t('gemini.prompt.retrospective.task_instruction', language)}
${t('gemini.prompt.language_instruction', language, { lang: language === 'de' ? 'German' : 'English' })}
`;

        const schema = {
          type: Type.OBJECT,
          properties: {
            thought: {
              type: Type.STRING,
              description: t('gemini.prompt.retrospective.thought_desc', language)
            },
            reasoning: {
              type: Type.STRING,
              description: t('gemini.prompt.retrospective.reasoning_desc', language)
            },
            betterAction: {
              type: Type.INTEGER,
              description: t('gemini.prompt.retrospective.better_action_desc', language),
            },
          },
          required: ["thought", "reasoning", "betterAction"]
        };

        try {
            const response = await ai!.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            
            if (![0, 1, 2].includes(result.betterAction)) {
                console.error(`Gemini returned invalid betterAction: ${result.betterAction}`);
                const bestQAction = agentState.qValues.indexOf(Math.max(...agentState.qValues));
                result.betterAction = bestQAction;
            }

            return {
                thought: result.thought,
                reasoning: result.reasoning,
                betterAction: result.betterAction
            };

        } catch (error) {
             console.error("Gemini Retrospective API call failed:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to get reflection from Gemini: ${error.message}`);
            }
            throw new Error("An unknown error occurred while contacting the Gemini API.");
        }
    }
}
