/**
 * Chat utility functions and helpers
 */

import { Chat, ChatWithMetadata, ChatSettings, AIModel, ModelConfig } from '../types/chat';
import { Message } from '../types/message';

// Available AI models configuration
export const AI_MODELS: Record<AIModel, ModelConfig> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model with advanced reasoning',
    maxTokens: 8192,
    costPerToken: 0.03,
    supportsVision: true,
    supportsFunction: true,
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    costPerToken: 0.002,
    supportsVision: false,
    supportsFunction: true,
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance and capability',
    maxTokens: 200000,
    costPerToken: 0.015,
    supportsVision: true,
    supportsFunction: false,
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and cost-effective',
    maxTokens: 200000,
    costPerToken: 0.0025,
    supportsVision: true,
    supportsFunction: false,
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model',
    maxTokens: 200000,
    costPerToken: 0.075,
    supportsVision: true,
    supportsFunction: false,
  },
};

// Default system prompts
export const DEFAULT_SYSTEM_PROMPTS = {
  default: 'You are a helpful AI assistant. Please provide accurate, helpful, and concise responses.',
  codeHelper: 'You are an expert programmer. Help with coding questions, debugging, and best practices.',
  creativeWriting: 'You are a creative writing assistant. Help with storytelling, character development, and narrative structure.',
  researchAssistant: 'You are a research assistant. Help with gathering information, fact-checking, and analysis.',
  translator: 'You are a professional translator. Translate text accurately while preserving meaning and context.',
  teacher: 'You are a knowledgeable teacher. Explain concepts clearly and provide educational support.',
};

/**
 * Generate a default chat title based on context
 */
export function generateChatTitle(firstMessage?: string): string {
  if (!firstMessage) {
    return `Chat ${new Date().toLocaleDateString()}`;
  }

  // Extract first few words for title
  const words = firstMessage.trim().split(/\s+/).slice(0, 5);
  const title = words.join(' ');
  
  // Limit length and add ellipsis if needed
  if (title.length > 50) {
    return title.substring(0, 47) + '...';
  }
  
  return title;
}

/**
 * Validate chat title
 */
export function validateChatTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }
  
  if (title.length > 100) {
    return { valid: false, error: 'Title cannot exceed 100 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate system prompt
 */
export function validateSystemPrompt(prompt: string): { valid: boolean; error?: string } {
  if (prompt.length > 2000) {
    return { valid: false, error: 'System prompt cannot exceed 2000 characters' };
  }
  
  return { valid: true };
}

/**
 * Get model configuration by ID
 */
export function getModelConfig(modelId: AIModel): ModelConfig | undefined {
  return AI_MODELS[modelId];
}

/**
 * Calculate estimated cost for messages
 */
export function calculateChatCost(messages: Message[], model: AIModel): number {
  const modelConfig = getModelConfig(model);
  if (!modelConfig || !modelConfig.costPerToken) {
    return 0;
  }
  
  const totalTokens = messages.reduce((sum, message) => {
    return sum + (message.metadata?.tokenCount || 0);
  }, 0);
  
  return totalTokens * modelConfig.costPerToken;
}

/**
 * Get chat statistics
 */
export function getChatStatistics(chat: ChatWithMetadata): {
  messageCount: number;
  lastActivity: Date | null;
  model: string;
  hasSystemPrompt: boolean;
} {
  return {
    messageCount: chat.messageCount,
    lastActivity: chat.lastActivity ? new Date(chat.lastActivity) : null,
    model: chat.model || 'unknown',
    hasSystemPrompt: !!(chat.systemPrompt && chat.systemPrompt.trim()),
  };
}

/**
 * Format chat for export
 */
export function formatChatForExport(chat: Chat, messages: Message[]): string {
  const lines = [
    `Chat: ${chat.title || 'Untitled'}`,
    `Created: ${new Date(chat._creationTime).toLocaleString()}`,
    `Model: ${chat.model || 'Unknown'}`,
    '',
  ];
  
  if (chat.systemPrompt) {
    lines.push(`System Prompt: ${chat.systemPrompt}`, '');
  }
  
  lines.push('Messages:', '');
  
  messages.forEach((message, index) => {
    const timestamp = new Date(message._creationTime).toLocaleString();
    const role = message.role.toUpperCase();
    
    lines.push(`${index + 1}. [${timestamp}] ${role}: ${message.content}`);
  });
  
  return lines.join('\n');
}

/**
 * Search chats by title or content
 */
export function searchChats(
  chats: ChatWithMetadata[],
  searchTerm: string
): ChatWithMetadata[] {
  if (!searchTerm.trim()) {
    return chats;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return chats.filter(chat => 
    chat.title?.toLowerCase().includes(lowerSearchTerm) ||
    chat.latestMessage?.content.toLowerCase().includes(lowerSearchTerm) ||
    chat.systemPrompt?.toLowerCase().includes(lowerSearchTerm)
  );
}

/**
 * Sort chats by various criteria
 */
export function sortChats(
  chats: ChatWithMetadata[],
  sortBy: 'createdAt' | 'updatedAt' | 'messageCount' | 'title',
  order: 'asc' | 'desc' = 'desc'
): ChatWithMetadata[] {
  return [...chats].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = a._creationTime - b._creationTime;
        break;
      case 'updatedAt':
        comparison = (a.lastActivity || a._creationTime) - (b.lastActivity || b._creationTime);
        break;
      case 'messageCount':
        comparison = a.messageCount - b.messageCount;
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter chats by various criteria
 */
export function filterChats(
  chats: ChatWithMetadata[],
  filters: {
    model?: AIModel;
    hasSystemPrompt?: boolean;
    minMessages?: number;
    maxMessages?: number;
    dateRange?: { start: Date; end: Date };
  }
): ChatWithMetadata[] {
  return chats.filter(chat => {
    // Filter by model
    if (filters.model && chat.model !== filters.model) {
      return false;
    }
    
    // Filter by system prompt presence
    if (filters.hasSystemPrompt !== undefined) {
      const hasPrompt = !!(chat.systemPrompt && chat.systemPrompt.trim());
      if (filters.hasSystemPrompt !== hasPrompt) {
        return false;
      }
    }
    
    // Filter by message count
    if (filters.minMessages !== undefined && chat.messageCount < filters.minMessages) {
      return false;
    }
    if (filters.maxMessages !== undefined && chat.messageCount > filters.maxMessages) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const chatDate = new Date(chat._creationTime);
      if (chatDate < filters.dateRange.start || chatDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Get default chat settings
 */
export function getDefaultChatSettings(): ChatSettings {
  return {
    model: 'gpt-4',
    systemPrompt: DEFAULT_SYSTEM_PROMPTS.default,
    temperature: 0.7,
    maxTokens: 4000,
    enableVision: false,
    enableFunctions: false,
  };
}

/**
 * Validate chat settings
 */
export function validateChatSettings(settings: ChatSettings): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate model
  if (!AI_MODELS[settings.model]) {
    errors.push(`Invalid model: ${settings.model}`);
  }
  
  // Validate temperature
  if (settings.temperature !== undefined) {
    if (settings.temperature < 0 || settings.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }
  }
  
  // Validate max tokens
  if (settings.maxTokens !== undefined) {
    const modelConfig = getModelConfig(settings.model);
    if (modelConfig && modelConfig.maxTokens && settings.maxTokens > modelConfig.maxTokens) {
      errors.push(`Max tokens cannot exceed ${modelConfig.maxTokens} for ${settings.model}`);
    }
  }
  
  // Validate system prompt
  if (settings.systemPrompt) {
    const promptValidation = validateSystemPrompt(settings.systemPrompt);
    if (!promptValidation.valid && promptValidation.error) {
      errors.push(promptValidation.error);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}