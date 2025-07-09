import { useState } from 'react';

interface Chat {
  _id: string;
  _creationTime: number;
  userId: string;
  title?: string;
  model?: string;
  systemPrompt?: string;
}

interface ChatHeaderProps {
  chat: Chat;
  onUpdateTitle?: (title: string) => void;
  onDeleteChat?: () => void;
  onDuplicateChat?: () => void;
  className?: string;
}

export function ChatHeader({
  chat,
  onUpdateTitle,
  onDeleteChat,
  onDuplicateChat,
  className = ''
}: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title || '');
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle title editing
  const handleTitleSubmit = () => {
    if (editTitle.trim() && onUpdateTitle) {
      onUpdateTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(chat.title || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <div className={`bg-white px-4 py-3 flex items-center justify-between ${className}`}>
      {/* Left side - Title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleTitleSubmit}
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chat title"
              autoFocus
            />
            <button
              onClick={handleTitleSubmit}
              className="text-green-600 hover:text-green-800 p-1"
              title="Save"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleTitleCancel}
              className="text-red-600 hover:text-red-800 p-1"
              title="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {chat.title || 'Untitled Chat'}
            </h1>
            {onUpdateTitle && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Edit title"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Middle - Chat info */}
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {chat.model && (
          <span className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {chat.model}
          </span>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Share button (placeholder) */}
        <button
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share chat (coming soon)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>

        {/* More options dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                {onDuplicateChat && (
                  <button
                    onClick={() => {
                      onDuplicateChat();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate Chat
                  </button>
                )}
                
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Chat
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                {onDeleteChat && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                        onDeleteChat();
                      }
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Chat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}