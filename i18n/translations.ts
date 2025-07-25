export const translations = {
  en: {
    'header.title': 'RL Meta-Learning Dashboard',
    'header.subtitle': 'AI-Powered Hyperparameter Tuning',
    'controls.start': 'Start Training',
    'controls.pause': 'Pause Training',
    'controls.reset': 'Reset',
    'controls.save': 'Save',
    'controls.load': 'Load',
    'controls.speed': 'Speed:',
    'controls.speed.slow': 'Slow',
    'controls.speed.normal': 'Normal',
    'controls.speed.fast': 'Fast',
    'controls.speed.insane': 'Insane',
    'controls.episode': 'Training Run:',
    'controls.step': 'Epoch:',
    'config.title': 'Meta-Controller Config',
    'config.ai_settings.title': 'AI Provider Settings',
    'config.ai_settings.provider': 'AI Provider',
    'config.ai_settings.gemini_api_key': 'Gemini API Key',
    'config.ai_settings.lmstudio_url': 'LM Studio Base URL',
    'config.ai_settings.lmstudio_model': 'Model Name',
    'config.ai_settings.lmstudio_model_placeholder': 'e.g., meta-llama/Llama-3-8b-chat-hf',
    'config.ai_settings.test_connection': 'Test Connection',
    'config.ai_settings.test_success': 'Connection successful!',
    'config.ai_settings.test_fail': 'Connection failed.',
    'config.ai_settings.save': 'Save Settings',
    'config.learning_rate': 'Agent Learning Rate (α)',
    'config.discount_factor': 'Agent Discount Factor (γ)',
    'config.exploration': 'Agent Exploration (ε)',
    'config.frustration_threshold': 'Frustration Threshold',
    'config.exploration_boost': 'Impulsive Exploration Boost',
    'config.meta_cognitive_boost': 'Meta-Cognitive Boost',
    'config.reflection_learning_rate': 'Reflection Learning Rate',
    'config.enable_obstacles': 'Enable Obstacles (N/A)',
    'config.num_obstacles': 'Number of Obstacles (N/A)',
    'performance.title': 'LLM Training Performance',
    'chart.avg_reward': 'Avg Reward',
    'chart.waiting': 'Waiting for more data...',
    'chart.val_loss': 'Validation Loss',
    'chart.learning_rate': 'Learning Rate',
    'logs.title': 'Meta-Learning Logs',
    'logs.export': 'Export Logs',
    'logs.waiting': 'Training logs will appear here...',
    'logs.source.system': 'SYSTEM',
    'logs.source.agent': 'AGENT',
    'logs.source.env': 'TRAINING-ENV',
    'logs.source.rule-engine': 'RULE-ENGINE',
    'logs.source.gemini': 'AI-SERVICE',
    'logs.initializing_meta': 'Initializing meta-learning simulation...',
    'logs.training_complete': 'Training finished after {epochs} epochs.',
    'details.title': 'Meta-Controller Agent Details',
    'dashboard.initializing': 'Initializing agent...',
    'card.agent': 'Agent',
    'card.reward': 'Reward',
    'card.drives': 'Drives',
    'card.drives.curiosity': 'Curiosity',
    'card.drives.understanding': 'Understanding',
    'card.drives.frustration': 'Frustration',
    'card.q_learning_state': 'Agent Q-Learning State',
    'card.state': 'Training State',
    'card.q_value_action': 'Action',
    'card.goal': 'Goal',
    'card.subgoal': 'Sub',
    'card.event_history': 'Event History',
    'card.no_events': 'No significant events yet.',
    'card.reflections': 'Reflections',
    'card.no_reflections': 'No reflections yet.',
    'card.reflection_tooltip': 'From Epoch {step}: {reasoning}',
    'card.confused_state': 'Agent is confused and is exploring more to find better strategies.',
    'card.activate_agent': 'Activate Agent',
    'card.deactivate_agent': 'Deactivate Agent',
    'card.explain_button': 'Explain with AI',
    'card.explain_button.title': 'Explain Agent\'s Last Decision with AI',
    'card.explain_button.disabled_title': 'AI Service not configured. Check AI Provider Settings.',
    'gauge.valence': 'Valence',
    'gauge.arousal': 'Arousal',
    'gauge.dominance': 'Dominance',
    'modal.title': 'AI Meta-Controller Explanation',
    'modal.loading': 'Generating explanation...',
    'modal.loading_cf': 'Generating counterfactual...',
    'modal.counterfactual_title': 'Counterfactual Analysis',
    'modal.counterfactual_button': 'What if it chose action "{actionText}" instead?',
    'q_action.0': 'Decrease LR',
    'q_action.1': 'Maintain LR',
    'q_action.2': 'Increase LR',
    'event.goal_change': 'Goal Change',
    'event.impulsive_explore': 'Impulsive Exploration',
    'event.new_state': 'New State Discovered',
    'event.frustration_peak': 'Frustration Peak',
    'event.meta_cognition_active': 'Meta-Cognition: Active',
    'event.meta_cognition_inactive': 'Meta-Cognition: Inactive',
    'event.critical_reflection': 'Critical Reflection',
    'gemini.prompt.title': 'You are an expert in machine learning, observing an RL agent that is tuning the hyperparameters of an LLM.',
    'gemini.prompt.intro': 'This RL agent (the "meta-controller") has just decided to adjust the learning rate of an LLM it is training. Based on the data below, explain the agent\'s choice in simple terms.',
    'gemini.prompt.agent_data': 'Meta-Controller Agent Data',
    'gemini.prompt.agent_id': 'Agent ID',
    'gemini.prompt.current_goal': 'Current Goal',
    'gemini.prompt.emotions': 'Agent Emotions',
    'gemini.prompt.emotions.valence': 'Valence (Pleasure)',
    'gemini.prompt.emotions.arousal': 'Arousal (Excitement)',
    'gemini.prompt.emotions.dominance': 'Dominance (Control)',
    'gemini.prompt.drives': 'Agent Drives',
    'gemini.prompt.drives.curiosity': 'Curiosity',
    'gemini.prompt.drives.frustration': 'Frustration',
    'gemini.prompt.state': 'Discretized Training State',
    'gemini.prompt.decision_data': 'Agent Decision Data',
    'gemini.prompt.q_values': 'Agent\'s Q-Values for this state',
    'gemini.prompt.action_chosen': 'Action Chosen',
    'gemini.prompt.action_chosen_text': 'Action {lastAction} ({actionText})',
    'gemini.prompt.training_context': 'LLM Training Context',
    'gemini.prompt.training_context.loss': 'Current Validation Loss',
    'gemini.prompt.training_context.lr': 'Current Learning Rate',
    'gemini.prompt.task': 'Your Task',
    'gemini.prompt.task_instruction': 'Explain *why* the agent likely chose this action. For example, if the loss is plateauing, decreasing the learning rate might be a good strategy. If the agent chose a seemingly poor action, consider its internal drives. Was it exploring due to high frustration or curiosity?',
    'gemini.prompt.language_instruction': 'Please write the entire response in {lang}.',
    'gemini.prompt.counterfactual.title': 'You are an expert in machine learning performing a counterfactual analysis on a meta-learning agent.',
    'gemini.prompt.counterfactual.task': 'Counterfactual Task',
    'gemini.prompt.counterfactual.task_instruction': 'The agent did NOT choose the action "{alternativeActionText}". Predict the most likely outcome if it HAD chosen that action. How would the validation loss likely have changed in the next epoch? Explain your reasoning based on the current training state (loss, trend, LR) and the agent\'s Q-values.',
    'gemini.prompt.retrospective.title': 'You are an expert in machine learning performing a retrospective analysis of a meta-learning agent\'s mistake.',
    'gemini.prompt.retrospective.intro': 'The meta-learning agent made a decision that resulted in a poor outcome (reward: {outcomeReward}), likely increasing the LLM\'s validation loss.',
    'gemini.prompt.retrospective.task': 'Your Task',
    'gemini.prompt.retrospective.task_instruction': 'Analyze the provided data. Determine what the better action would have been (0: Decrease LR, 1: Maintain LR, 2: Increase LR). Return ONLY a valid JSON object with the keys "thought", "reasoning", and "betterAction". Do not include any other text or markdown.',
    'gemini.prompt.retrospective.thought_desc': 'A short, reflective thought from the agent\'s perspective, in the first person.',
    'gemini.prompt.retrospective.reasoning_desc': 'A brief, third-person explanation of why the alternative action would have been better.',
    'gemini.prompt.retrospective.better_action_desc': 'The index of the action (0, 1, or 2) that would have been a better choice.',
    'goal.explore': 'Optimize Training',
    'goal.reduce-frustration': 'Reduce Frustration',
  },
  de: {
    'header.title': 'RL Meta-Learning Dashboard',
    'header.subtitle': 'KI-gestützte Hyperparameter-Optimierung',
    'controls.start': 'Training starten',
    'controls.pause': 'Training pausieren',
    'controls.reset': 'Zurücksetzen',
    'controls.save': 'Speichern',
    'controls.load': 'Laden',
    'controls.speed': 'Tempo:',
    'controls.speed.slow': 'Langsam',
    'controls.speed.normal': 'Normal',
    'controls.speed.fast': 'Schnell',
    'controls.speed.insane': 'Turboschnell',
    'controls.episode': 'Trainingslauf:',
    'controls.step': 'Epoche:',
    'config.title': 'Meta-Controller Konfig',
    'config.ai_settings.title': 'KI-Anbieter Einstellungen',
    'config.ai_settings.provider': 'KI-Anbieter',
    'config.ai_settings.gemini_api_key': 'Gemini API-Schlüssel',
    'config.ai_settings.lmstudio_url': 'LM Studio Basis-URL',
    'config.ai_settings.lmstudio_model': 'Modellname',
    'config.ai_settings.lmstudio_model_placeholder': 'z.B. meta-llama/Llama-3-8b-chat-hf',
    'config.ai_settings.test_connection': 'Verbindung testen',
    'config.ai_settings.test_success': 'Verbindung erfolgreich!',
    'config.ai_settings.test_fail': 'Verbindung fehlgeschlagen.',
    'config.ai_settings.save': 'Einstellungen speichern',
    'config.learning_rate': 'Agent-Lernrate (α)',
    'config.discount_factor': 'Agent-Diskontfaktor (γ)',
    'config.exploration': 'Agent-Exploration (ε)',
    'config.frustration_threshold': 'Frustrationsschwelle',
    'config.exploration_boost': 'Impulsive Explorationsverstärkung',
    'config.meta_cognitive_boost': 'Meta-kognitive Verstärkung',
    'config.reflection_learning_rate': 'Reflexions-Lernrate',
    'config.enable_obstacles': 'Hindernisse aktivieren (N/A)',
    'config.num_obstacles': 'Anzahl Hindernisse (N/A)',
    'performance.title': 'LLM-Trainingsleistung',
    'chart.avg_reward': 'Ø Belohnung',
    'chart.waiting': 'Warte auf mehr Daten...',
    'chart.val_loss': 'Validierungsverlust',
    'chart.learning_rate': 'Lernrate',
    'logs.title': 'Meta-Learning Logs',
    'logs.export': 'Logs exportieren',
    'logs.waiting': 'Trainings-Logs erscheinen hier...',
    'logs.source.system': 'SYSTEM',
    'logs.source.agent': 'AGENT',
    'logs.source.env': 'TRAINING-UMG',
    'logs.source.rule-engine': 'REGELWERK',
    'logs.source.gemini': 'KI-SERVICE',
    'logs.initializing_meta': 'Initialisiere Meta-Learning-Simulation...',
    'logs.training_complete': 'Training nach {epochs} Epochen abgeschlossen.',
    'details.title': 'Meta-Controller Agent-Details',
    'dashboard.initializing': 'Initialisiere Agent...',
    'card.agent': 'Agent',
    'card.reward': 'Belohnung',
    'card.drives': 'Antriebe',
    'card.drives.curiosity': 'Neugier',
    'card.drives.understanding': 'Verständnis',
    'card.drives.frustration': 'Frustration',
    'card.q_learning_state': 'Agent Q-Learning-Zustand',
    'card.state': 'Trainingszustand',
    'card.q_value_action': 'Aktion',
    'card.goal': 'Ziel',
    'card.subgoal': 'Unterziel',
    'card.event_history': 'Ereignisverlauf',
    'card.no_events': 'Noch keine wichtigen Ereignisse.',
    'card.reflections': 'Reflexionen',
    'card.no_reflections': 'Noch keine Reflexionen.',
    'card.reflection_tooltip': 'Aus Epoche {step}: {reasoning}',
    'card.confused_state': 'Agent ist verwirrt und exploriert mehr, um bessere Strategien zu finden.',
    'card.activate_agent': 'Agent aktivieren',
    'card.deactivate_agent': 'Agent deaktivieren',
    'card.explain_button': 'Mit KI erklären',
    'card.explain_button.title': 'Letzte Entscheidung des Agenten mit KI erklären',
    'card.explain_button.disabled_title': 'KI-Dienst nicht konfiguriert. Überprüfen Sie die KI-Anbieter-Einstellungen.',
    'gauge.valence': 'Valenz',
    'gauge.arousal': 'Aktivierung',
    'gauge.dominance': 'Dominanz',
    'modal.title': 'KI Meta-Controller Erklärung',
    'modal.loading': 'Erklärung wird generiert...',
    'modal.loading_cf': 'Kontrafaktische Analyse wird generiert...',
    'modal.counterfactual_title': 'Kontrafaktische Analyse',
    'modal.counterfactual_button': 'Was wäre, wenn stattdessen Aktion "{actionText}" gewählt worden wäre?',
    'q_action.0': 'LR verringern',
    'q_action.1': 'LR beibehalten',
    'q_action.2': 'LR erhöhen',
    'event.goal_change': 'Zielwechsel',
    'event.impulsive_explore': 'Impulsive Erkundung',
    'event.new_state': 'Neuen Zustand entdeckt',
    'event.frustration_peak': 'Frustrationsspitze',
    'event.meta_cognition_active': 'Meta-Kognition: Aktiv',
    'event.meta_cognition_inactive': 'Meta-Kognition: Inaktiv',
    'event.critical_reflection': 'Kritische Reflexion',
    'gemini.prompt.title': 'Sie sind ein Experte für maschinelles Lernen und beobachten einen RL-Agenten, der die Hyperparameter eines LLM optimiert.',
    'gemini.prompt.intro': 'Dieser RL-Agent (der „Meta-Controller“) hat gerade entschieden, die Lernrate eines von ihm trainierten LLM anzupassen. Erklären Sie seine Wahl anhand der folgenden Daten in einfachen Worten.',
    'gemini.prompt.agent_data': 'Meta-Controller-Agentendaten',
    'gemini.prompt.agent_id': 'Agenten-ID',
    'gemini.prompt.current_goal': 'Aktuelles Ziel',
    'gemini.prompt.emotions': 'Agenten-Emotionen',
    'gemini.prompt.emotions.valence': 'Valenz (Freude)',
    'gemini.prompt.emotions.arousal': 'Aktivierung (Aufregung)',
    'gemini.prompt.emotions.dominance': 'Dominanz (Kontrolle)',
    'gemini.prompt.drives': 'Agenten-Antriebe',
    'gemini.prompt.drives.curiosity': 'Neugier',
    'gemini.prompt.drives.frustration': 'Frustration',
    'gemini.prompt.state': 'Diskretisierter Trainingszustand',
    'gemini.prompt.decision_data': 'Agenten-Entscheidungsdaten',
    'gemini.prompt.q_values': 'Q-Werte des Agenten für diesen Zustand',
    'gemini.prompt.action_chosen': 'Gewählte Aktion',
    'gemini.prompt.action_chosen_text': 'Aktion {lastAction} ({actionText})',
    'gemini.prompt.training_context': 'LLM-Trainingskontext',
    'gemini.prompt.training_context.loss': 'Aktueller Validierungsverlust',
    'gemini.prompt.training_context.lr': 'Aktuelle Lernrate',
    'gemini.prompt.task': 'Ihre Aufgabe',
    'gemini.prompt.task_instruction': 'Erklären Sie, *warum* der Agent diese Aktion wahrscheinlich gewählt hat. Wenn zum Beispiel der Verlust stagniert, könnte eine Verringerung der Lernrate eine gute Strategie sein. Wenn der Agent eine scheinbar schlechte Aktion gewählt hat, berücksichtigen Sie seine internen Antriebe. Hat er aufgrund hoher Frustration oder Neugier exploriert?',
    'gemini.prompt.language_instruction': 'Bitte verfassen Sie die gesamte Antwort auf {lang}.',
    'gemini.prompt.counterfactual.title': 'Sie sind ein Experte für maschinelles Lernen und führen eine kontrafaktische Analyse eines Meta-Learning-Agenten durch.',
    'gemini.prompt.counterfactual.task': 'Kontrafaktische Aufgabe',
    'gemini.prompt.counterfactual.task_instruction': 'Der Agent hat die Aktion "{alternativeActionText}" NICHT gewählt. Sagen Sie das wahrscheinlichste Ergebnis voraus, wenn er diese Aktion gewählt HÄTTE. Wie hätte sich der Validierungsverlust in der nächsten Epoche wahrscheinlich verändert? Begründen Sie Ihre Antwort anhand des aktuellen Trainingszustands (Verlust, Trend, LR) und der Q-Werte des Agenten.',
    'gemini.prompt.retrospective.title': 'Sie sind ein Experte für maschinelles Lernen und führen eine retrospektive Analyse des Fehlers eines Meta-Learning-Agenten durch.',
    'gemini.prompt.retrospective.intro': 'Der Meta-Learning-Agent hat eine Entscheidung getroffen, die zu einem schlechten Ergebnis (Belohnung: {outcomeReward}) führte und wahrscheinlich den Validierungsverlust des LLM erhöht hat.',
    'gemini.prompt.retrospective.task': 'Ihre Aufgabe',
    'gemini.prompt.retrospective.task_instruction': 'Analysieren Sie die bereitgestellten Daten. Bestimmen Sie, was die bessere Aktion gewesen wäre (0: LR verringern, 1: LR beibehalten, 2: LR erhöhen). Geben Sie NUR ein gültiges JSON-Objekt mit den Schlüsseln "thought", "reasoning" und "betterAction" zurück. Fügen Sie keinen anderen Text oder Markdown hinzu.',
    'gemini.prompt.retrospective.thought_desc': 'Ein kurzer, nachdenklicher Gedanke aus der Perspektive des Agenten, in der ersten Person.',
    'gemini.prompt.retrospective.reasoning_desc': 'Eine kurze Erklärung in der dritten Person, warum die alternative Aktion besser gewesen wäre.',
    'gemini.prompt.retrospective.better_action_desc': 'Der Index der Aktion (0, 1 oder 2), die eine bessere Wahl gewesen wäre.',
    'goal.explore': 'Training optimieren',
    'goal.reduce-frustration': 'Frustration reduzieren',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'] & keyof (typeof translations)['de'];
