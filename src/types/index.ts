export interface Model {
  id: string;
  name: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stop: string[];
}

export interface Chat {
  id: string;
  modelId: string;
  title: string;
  messages: Message[];
  settings: ModelSettings;
  createdAt: number;
  updatedAt: number;
}