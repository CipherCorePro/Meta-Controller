import { AgentState } from "../types";
import { Language } from '../i18n/translations';

export interface IAiService {
    isAvailable(): boolean;
    
    getExplanation(
        agentState: AgentState,
        language: Language
    ): Promise<string>;

    getCounterfactualExplanation(
        agentState: AgentState,
        alternativeAction: number,
        language: Language
    ): Promise<string>;

    getRetrospectiveAnalysis(
        agentState: AgentState,
        outcomeReward: number,
        language: Language
    ): Promise<{ thought: string; reasoning: string; betterAction: number } | null>;
}
