import { useState } from 'react';

export function SimpleChatDemo() {
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'assistant'}>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Array<{id: string, title: string, lastMessage?: string}>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

  const handleCreateNewChat = () => {
    if (!newChatTitle.trim()) return;
    
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: newChatTitle,
      lastMessage: undefined
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setNewChatTitle('');
    setIsNewChatModalOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In a real app, this would load messages for this chat
    setMessages([]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentChatId) return;

    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Update chat with last message
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, lastMessage: inputText }
        : chat
    ));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        text: `I received your message: "${userMessage.text}". This is a demo response since the backend isn't connected yet.`, 
        sender: 'assistant' as const 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
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
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <p className="text-sm mb-2">No chats yet</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create your first chat
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {chat.title}
                  </h3>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {currentChatId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {chats.find(c => c.id === currentChatId)?.title || 'Chat'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Demo mode - backend not connected</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <p>Start the conversation by typing a message below!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Select a chat</h2>
              <p className="text-gray-500 dark:text-gray-400">Choose a chat from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Chat</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chat Title
              </label>
              <input
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateNewChat()}
                placeholder="Enter chat title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsNewChatModalOpen(false);
                  setNewChatTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewChat}
                disabled={!newChatTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}