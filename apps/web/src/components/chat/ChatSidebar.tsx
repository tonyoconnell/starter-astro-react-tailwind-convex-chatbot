import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { NewChatModal } from './NewChatModal';

// Temporary type definition until Convex is configured
type Id<T> = string;

// Temporary mock hooks until Convex is configured
const useQuery = (query: any, args: any) => [];
const useMutation = (mutation: any) => () => Promise.resolve();
const api = { functions: { queries: { chats: { getUserChats: null } }, mutations: { chats: { createChat: null, deleteChat: null } } } };

/**
 * Chat object with metadata for sidebar display
 */
interface Chat {
  /** Unique chat identifier */
  _id: Id<"chats">;
  /** Chat creation timestamp */
  _creationTime: number;
  /** ID of the user who owns this chat */
  userId: Id<"users">;
  /** Optional chat title */
  title?: string;
  /** AI model used for this chat */
  model?: string;
  /** System prompt for this chat */
  systemPrompt?: string;
  /** Latest message in the chat */
  latestMessage?: {
    _id: string;
    content: string;
    _creationTime: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
  /** Total number of messages in this chat */
  messageCount: number;
}

/**
 * Props for the ChatSidebar component
 */
interface ChatSidebarProps {
  /** ID of the current user */
  userId: Id<"users">;
  /** ID of the currently selected chat */
  currentChatId?: Id<"chats">;
  /** Callback when a chat is selected */
  onSelectChat: (chatId: Id<"chats">) => void;
  /** Callback when a new chat is created */
  onNewChat: (chatId: Id<"chats">) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Chat sidebar component that displays a list of chats and provides chat management functionality
 * 
 * @param props - The component props
 * @returns A React component that renders the chat sidebar
 */
export function ChatSidebar({
  userId,
  currentChatId,
  onSelectChat,
  onNewChat,
  className = ''
}: ChatSidebarProps) {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Query for user's chats
  const chats = useQuery(api.functions.queries.chats.getUserChats, {
    userId,
    limit: 100,
  });

  // Create chat mutation
  const createChat = useMutation(api.functions.mutations.chats.createChat);

  // Delete chat mutation
  const deleteChat = useMutation(api.functions.mutations.chats.deleteChat);

  // Handle creating a new chat
  const handleCreateChat = async (title: string, model?: string, systemPrompt?: string) => {
    try {
      const chatId = await createChat({
        userId,
        title: title.trim(),
        model,
        systemPrompt,
      });
      onNewChat(chatId);
      setIsNewChatModalOpen(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
      // In a real app, you'd show a toast notification here
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId: Id<"chats">) => {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        await deleteChat({ chatId, userId });
        // If the current chat was deleted, redirect to the first available chat
        if (currentChatId === chatId && chats && chats.length > 1) {
          const remainingChats = chats.filter(chat => chat._id !== chatId);
          if (remainingChats.length > 0) {
            onSelectChat(remainingChats[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  // Filter chats based on search term
  const filteredChats = chats?.filter(chat =>
    chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.latestMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Format time for display
  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  if (chats === undefined) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="New Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">
              {searchTerm ? 'No chats found' : 'No chats yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                Create your first chat
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat._id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat._id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-white hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {chat.title || 'Untitled Chat'}
                    </h3>
                    {chat.latestMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.latestMessage.role === 'user' ? 'You: ' : 'AI: '}
                        {chat.latestMessage.content}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-400 space-x-2">
                      <span>{formatTime(chat._creationTime)}</span>
                      <span>•</span>
                      <span>{chat.messageCount} messages</span>
                      {chat.model && (
                        <>
                          <span>•</span>
                          <span>{chat.model}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <NewChatModal
          onCreateChat={handleCreateChat}
          onCancel={() => setIsNewChatModalOpen(false)}
        />
      )}
    </div>
  );
}