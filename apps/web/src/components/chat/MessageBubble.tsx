import { formatDistanceToNow } from 'date-fns';

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

interface MessageBubbleProps {
  message: Message;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

export function MessageBubble({ 
  message, 
  isFirst = false, 
  isLast = false, 
  className = '' 
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  // Format timestamp
  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  // Get message content (prefer parts over content)
  const getMessageContent = () => {
    if (message.parts && message.parts.length > 0) {
      return message.parts.map(part => part.text).join('');
    }
    return message.content;
  };

  if (isSystem) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {getMessageContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`flex max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isUser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            } ${
              isFirst && !isUser ? 'rounded-tl-md' : ''
            } ${
              isFirst && isUser ? 'rounded-tr-md' : ''
            } ${
              isLast && !isUser ? 'rounded-bl-md' : ''
            } ${
              isLast && isUser ? 'rounded-br-md' : ''
            }`}
          >
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {getMessageContent()}
            </div>
          </div>

          {/* Metadata */}
          {isLast && (
            <div className={`flex items-center text-xs text-gray-500 mt-1 space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <span>{formatTime(message._creationTime)}</span>
              
              {/* Token count for assistant messages */}
              {isAssistant && message.metadata?.tokenCount && (
                <span>• {message.metadata.tokenCount} tokens</span>
              )}

              {/* Model info for assistant messages */}
              {isAssistant && message.metadata?.model && (
                <span>• {message.metadata.model}</span>
              )}

              {/* Delivery status for user messages */}
              {isUser && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}