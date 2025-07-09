/**
 * Message formatting utilities
 */

import { Message, MessageRole, MessagePaginationResult, MessageFormattingOptions } from '../types/message';

/**
 * Format message timestamp
 */
export function formatMessageTime(
  timestamp: number,
  format: 'relative' | 'absolute' | 'timestamp' = 'relative'
): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  switch (format) {
    case 'relative':
      return formatRelativeTime(date, now);
    case 'absolute':
      return date.toLocaleString();
    case 'timestamp':
      return timestamp.toString();
    default:
      return date.toLocaleString();
  }
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format message content with optional truncation
 */
export function formatMessageContent(
  content: string,
  maxLength?: number,
  preserveFormatting: boolean = false
): string {
  let formatted = content;
  
  if (!preserveFormatting) {
    // Remove extra whitespace and normalize line breaks
    formatted = formatted.replace(/\s+/g, ' ').trim();
  }
  
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...';
  }
  
  return formatted;
}

/**
 * Format message for display with all options
 */
export function formatMessage(
  message: Message,
  options: MessageFormattingOptions = {}
): {
  content: string;
  timestamp: string;
  role: MessageRole;
  metadata?: any;
} {
  const {
    maxLength,
    includeMetadata = false,
    dateFormat = 'relative',
    highlightSearchTerms = [],
  } = options;
  
  let content = formatMessageContent(message.content, maxLength);
  
  // Highlight search terms
  if (highlightSearchTerms.length > 0) {
    highlightSearchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      content = content.replace(regex, '<mark>$1</mark>');
    });
  }
  
  const result = {
    content,
    timestamp: formatMessageTime(message._creationTime, dateFormat),
    role: message.role,
  };
  
  if (includeMetadata && message.metadata) {
    (result as any).metadata = message.metadata;
  }
  
  return result;
}

/**
 * Get message preview (first line or truncated content)
 */
export function getMessagePreview(message: Message, maxLength: number = 100): string {
  const content = message.content.trim();
  
  // Get first line
  const firstLine = content.split('\n')[0];
  
  // Truncate if too long
  if (firstLine.length > maxLength) {
    return firstLine.substring(0, maxLength - 3) + '...';
  }
  
  return firstLine;
}

/**
 * Format message role for display
 */
export function formatMessageRole(role: MessageRole): string {
  switch (role) {
    case 'user':
      return 'You';
    case 'assistant':
      return 'AI';
    case 'system':
      return 'System';
    default:
      return role;
  }
}

/**
 * Get message role icon
 */
export function getMessageRoleIcon(role: MessageRole): string {
  switch (role) {
    case 'user':
      return '👤';
    case 'assistant':
      return '🤖';
    case 'system':
      return '⚙️';
    default:
      return '❓';
  }
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return (count / 1000).toFixed(1) + 'K';
  } else {
    return (count / 1000000).toFixed(1) + 'M';
  }
}

/**
 * Format message conversation for export
 */
export function formatConversationForExport(
  messages: Message[],
  includeMetadata: boolean = false
): string {
  const lines: string[] = [];
  
  messages.forEach((message, index) => {
    const timestamp = new Date(message._creationTime).toLocaleString();
    const role = formatMessageRole(message.role);
    
    lines.push(`${index + 1}. [${timestamp}] ${role}:`);
    lines.push(message.content);
    
    if (includeMetadata && message.metadata) {
      const metadata = [];
      if (message.metadata.tokenCount) {
        metadata.push(`Tokens: ${message.metadata.tokenCount}`);
      }
      if (message.metadata.model) {
        metadata.push(`Model: ${message.metadata.model}`);
      }
      if (message.metadata.responseTime) {
        metadata.push(`Response time: ${message.metadata.responseTime}ms`);
      }
      
      if (metadata.length > 0) {
        lines.push(`   (${metadata.join(', ')})`);
      }
    }
    
    lines.push(''); // Empty line between messages
  });
  
  return lines.join('\n');
}

/**
 * Extract URLs from message content
 */
export function extractUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return content.match(urlRegex) || [];
}

/**
 * Extract mentions from message content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex) || [];
  return matches.map(match => match.substring(1)); // Remove @ symbol
}

/**
 * Sanitize message content for display
 */
export function sanitizeMessageContent(content: string): string {
  // Remove potentially harmful HTML tags
  const sanitized = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized;
}

/**
 * Convert message content to plain text
 */
export function messageToPlainText(message: Message): string {
  // If parts are available, use them
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('\n');
  }
  
  // Fallback to content
  return message.content;
}

/**
 * Search within message content
 */
export function searchInMessage(
  message: Message,
  searchTerm: string,
  caseSensitive: boolean = false
): boolean {
  const content = messageToPlainText(message);
  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  const text = caseSensitive ? content : content.toLowerCase();
  
  return text.includes(term);
}

/**
 * Highlight search terms in message content
 */
export function highlightSearchTerms(
  content: string,
  searchTerms: string[],
  highlightClass: string = 'highlight'
): string {
  if (searchTerms.length === 0) {
    return content;
  }
  
  let highlighted = content;
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(
      regex,
      `<span class="${highlightClass}">$1</span>`
    );
  });
  
  return highlighted;
}

/**
 * Calculate message reading time
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const words = content.split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  
  return Math.max(1, Math.round(minutes));
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message._creationTime);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(message);
  });
  
  return groups;
}

/**
 * Get conversation statistics
 */
export function getConversationStats(messages: Message[]): {
  totalMessages: number;
  messagesByRole: Record<MessageRole, number>;
  totalTokens: number;
  averageMessageLength: number;
  conversationDuration: number;
} {
  const stats = {
    totalMessages: messages.length,
    messagesByRole: { user: 0, assistant: 0, system: 0 },
    totalTokens: 0,
    averageMessageLength: 0,
    conversationDuration: 0,
  };
  
  if (messages.length === 0) {
    return stats;
  }
  
  let totalLength = 0;
  
  messages.forEach(message => {
    stats.messagesByRole[message.role]++;
    stats.totalTokens += message.metadata?.tokenCount || 0;
    totalLength += message.content.length;
  });
  
  stats.averageMessageLength = totalLength / messages.length;
  
  // Calculate conversation duration
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  stats.conversationDuration = lastMessage._creationTime - firstMessage._creationTime;
  
  return stats;
}