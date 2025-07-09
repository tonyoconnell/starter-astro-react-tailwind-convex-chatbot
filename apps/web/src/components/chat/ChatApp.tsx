import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $user } from '@starter/lib/auth';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';

// Temporary type definition until Convex is configured
type Id<T> = string;

interface ChatAppProps {
  initialChatId?: string;
}

export function ChatApp({ initialChatId }: ChatAppProps = {}) {
  const user = useStore($user);
  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);

  // Get current chat ID from URL or props
  useEffect(() => {
    if (initialChatId) {
      setCurrentChatId(initialChatId as Id<"chats">);
      setSelectedChatId(initialChatId as Id<"chats">);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const chatId = urlParams.get('chatId');
      if (chatId) {
        setCurrentChatId(chatId as Id<"chats">);
        setSelectedChatId(chatId as Id<"chats">);
      }
    }
  }, [initialChatId]);

  // Handle chat selection
  const handleSelectChat = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setCurrentChatId(chatId);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('chatId', chatId);
    window.history.pushState({}, '', url.toString());
  };

  // Handle new chat creation
  const handleNewChat = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setCurrentChatId(chatId);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('chatId', chatId);
    window.history.pushState({}, '', url.toString());
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const chatId = urlParams.get('chatId');
      if (chatId) {
        setCurrentChatId(chatId as Id<"chats">);
        setSelectedChatId(chatId as Id<"chats">);
      } else {
        setCurrentChatId(null);
        setSelectedChatId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-4">Please log in to access the chat interface.</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <ChatSidebar
          userId={user.id as Id<"users">}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          className="h-full"
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatInterface
            chatId={selectedChatId}
            userId={user.id as Id<"users">}
            className="h-full"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a chat</h2>
              <p className="text-gray-500">Choose a chat from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}