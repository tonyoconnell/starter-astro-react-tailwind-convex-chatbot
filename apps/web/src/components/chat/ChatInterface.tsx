import { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

// Temporary type definition until Convex is configured
type Id<T> = string;

// Temporary mock hooks until Convex is configured
const useQuery = (query: any, args: any) => null;
const useMutation = (mutation: any) => () => Promise.resolve();
const api = { functions: { queries: { chats: { getChatById: null }, messages: { getChatMessages: null } }, mutations: { messages: { sendMessage: null } } } };

/**
 * Props for the ChatInterface component
 */
interface ChatInterfaceProps {
  /** ID of the chat to display */
  chatId: Id<"chats">;
  /** ID of the current user */
  userId: Id<"users">;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Main chat interface component that displays messages and handles user input
 * 
 * @param props - The component props
 * @returns A React component that renders the chat interface
 */
export function ChatInterface({ chatId, userId, className = '' }: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query for chat details
  const chat = useQuery(api.functions.queries.chats.getChatById, {
    chatId,
    userId,
  });

  // Query for messages
  const messages = useQuery(api.functions.queries.messages.getChatMessages, {
    chatId,
    limit: 50,
  });

  // Send message mutation
  const sendMessage = useMutation(api.functions.mutations.messages.sendMessage);

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await sendMessage({
        chatId,
        userId,
        role: 'user',
        content: content.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retrying failed messages
  const handleRetry = () => {
    setError(null);
  };

  if (chat === undefined || messages === undefined) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chat === null) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Chat not found</h2>
          <p className="text-gray-500">The chat you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <ChatHeader
        chat={chat}
        onUpdateTitle={(title) => {
          // Handle title update - this would be implemented with a mutation
          console.log('Update title:', title);
        }}
        className="border-b border-gray-200"
      />

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages.messages || []}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          className="h-full"
        />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={isLoading}
        placeholder="Type your message..."
        className="border-t border-gray-200"
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button
                onClick={handleRetry}
                className="bg-red-50 rounded-md p-2 inline-flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              >
                <span className="sr-only">Retry</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}