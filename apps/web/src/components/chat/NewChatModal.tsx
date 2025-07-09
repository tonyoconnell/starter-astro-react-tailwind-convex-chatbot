import { useState } from 'react';

interface NewChatModalProps {
  onCreateChat: (title: string, model?: string, systemPrompt?: string) => void;
  onCancel: () => void;
}

export function NewChatModal({ onCreateChat, onCancel }: NewChatModalProps) {
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Available models
  const models = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and cost-effective' },
  ];

  // Common system prompts
  const systemPrompts = [
    {
      name: 'Default Assistant',
      prompt: 'You are a helpful AI assistant. Please provide accurate, helpful, and concise responses.',
    },
    {
      name: 'Code Helper',
      prompt: 'You are an expert programmer. Help with coding questions, debugging, and best practices.',
    },
    {
      name: 'Creative Writing',
      prompt: 'You are a creative writing assistant. Help with storytelling, character development, and narrative structure.',
    },
    {
      name: 'Research Assistant',
      prompt: 'You are a research assistant. Help with gathering information, fact-checking, and analysis.',
    },
    {
      name: 'Custom',
      prompt: '',
    },
  ];

  const [selectedPrompt, setSelectedPrompt] = useState(systemPrompts[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      onCreateChat(
        title.trim(),
        model,
        systemPrompt.trim() || undefined
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: typeof systemPrompts[0]) => {
    setSelectedPrompt(prompt);
    if (prompt.name !== 'Custom') {
      setSystemPrompt(prompt.prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chat Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Chat Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your chat..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {models.map((modelOption) => (
                  <option key={modelOption.id} value={modelOption.id}>
                    {modelOption.name} - {modelOption.description}
                  </option>
                ))}
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt (Optional)
              </label>
              
              {/* Preset Selection */}
              <div className="mb-3">
                <select
                  value={selectedPrompt.name}
                  onChange={(e) => {
                    const prompt = systemPrompts.find(p => p.name === e.target.value) || systemPrompts[0];
                    handlePromptSelect(prompt);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {systemPrompts.map((prompt) => (
                    <option key={prompt.name} value={prompt.name}>
                      {prompt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Prompt Text Area */}
              <textarea
                value={systemPrompt}
                onChange={(e) => {
                  setSystemPrompt(e.target.value);
                  if (e.target.value !== selectedPrompt.prompt) {
                    setSelectedPrompt(systemPrompts[systemPrompts.length - 1]); // Custom
                  }
                }}
                placeholder="Enter a system prompt to define the AI's behavior..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The system prompt helps define how the AI should behave in this conversation.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Chat'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}