import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  _id: string;
  _creationTime: number;
  chatId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{ type: 'text'; text: string }>;
  metadata?: {
    timestamp?: number;
    model?: string;
    tokenCount?: number;
  };
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function MessageList({ 
  messages, 
  isLoading = false, 
  error = null, 
  onRetry,
  className = '' 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle scroll to load more messages (infinite scroll)
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      if (scrollTop === 0) {
        // User scrolled to top - load more messages
        // This would trigger pagination in a real implementation
        console.log('Load more messages');
      }
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Start a conversation</h3>
          <p className="text-gray-500">Send a message to begin your chat session.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full overflow-y-auto px-4 py-6 space-y-4 ${className}`}
      onScroll={handleScroll}
    >
      {/* Loading indicator for pagination */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <MessageBubble
          key={message._id}
          message={message}
          isFirst={index === 0 || messages[index - 1]?.role !== message.role}
          isLast={index === messages.length - 1 || messages[index + 1]?.role !== message.role}
        />
      ))}

      {/* Loading indicator for new messages */}
      {isLoading && messages.length > 0 && (
        <div className="flex justify-start">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">AI is thinking...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex justify-center py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}