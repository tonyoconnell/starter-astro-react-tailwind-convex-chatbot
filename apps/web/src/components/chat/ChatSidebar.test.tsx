import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatSidebar } from './ChatSidebar';

// Mock the external dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('../../convex/_generated/api', () => ({
  api: {
    functions: {
      queries: {
        chats: { getUserChats: 'getUserChats' },
      },
      mutations: {
        chats: { createChat: 'createChat', deleteChat: 'deleteChat' },
      },
    },
  },
}));

vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 minutes ago'),
}));

describe('ChatSidebar Integration Tests', () => {
  const mockUseQuery = vi.mocked(
    await import('convex/react').then(m => m.useQuery)
  );
  const mockUseMutation = vi.mocked(
    await import('convex/react').then(m => m.useMutation)
  );

  const mockCreateChat = vi.fn();
  const mockDeleteChat = vi.fn();
  const mockOnSelectChat = vi.fn();
  const mockOnNewChat = vi.fn();

  const mockChats = [
    {
      _id: 'chat1',
      title: 'First Chat',
      userId: 'user1',
      _creationTime: Date.now(),
      latestMessage: {
        _id: 'msg1',
        content: 'Hello world',
        _creationTime: Date.now(),
        role: 'user',
      },
      messageCount: 5,
    },
    {
      _id: 'chat2',
      title: 'Second Chat',
      userId: 'user1',
      _creationTime: Date.now() - 1000,
      latestMessage: {
        _id: 'msg2',
        content: 'How are you?',
        _creationTime: Date.now() - 500,
        role: 'assistant',
      },
      messageCount: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation
      .mockReturnValueOnce(mockCreateChat)
      .mockReturnValueOnce(mockDeleteChat);
  });

  it('renders chat list with chats', () => {
    mockUseQuery.mockReturnValue(mockChats);

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('First Chat')).toBeInTheDocument();
    expect(screen.getByText('Second Chat')).toBeInTheDocument();
    expect(screen.getByText('You: Hello world')).toBeInTheDocument();
    expect(screen.getByText('AI: How are you?')).toBeInTheDocument();
    expect(screen.getByText('5 messages')).toBeInTheDocument();
    expect(screen.getByText('3 messages')).toBeInTheDocument();
  });

  it('renders empty state when no chats exist', () => {
    mockUseQuery.mockReturnValue([]);

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first chat')).toBeInTheDocument();
  });

  it('handles chat selection', () => {
    mockUseQuery.mockReturnValue(mockChats);

    render(
      <ChatSidebar
        userId="user1"
        currentChatId="chat1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    const secondChat = screen.getByText('Second Chat');
    fireEvent.click(secondChat);

    expect(mockOnSelectChat).toHaveBeenCalledWith('chat2');
  });

  it('highlights current chat', () => {
    mockUseQuery.mockReturnValue(mockChats);

    render(
      <ChatSidebar
        userId="user1"
        currentChatId="chat1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    const firstChatContainer = screen.getByText('First Chat').closest('div');
    expect(firstChatContainer).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('handles new chat creation', async () => {
    mockUseQuery.mockReturnValue(mockChats);
    mockCreateChat.mockResolvedValue('chat3');

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    // Open new chat modal
    const newChatButton = screen.getByTitle('New Chat');
    fireEvent.click(newChatButton);

    expect(screen.getByText('Create New Chat')).toBeInTheDocument();

    // Fill in chat title
    const titleInput = screen.getByPlaceholderText('Enter chat title...');
    fireEvent.change(titleInput, { target: { value: 'New Test Chat' } });

    // Create chat
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateChat).toHaveBeenCalledWith({
        userId: 'user1',
        title: 'New Test Chat',
        model: undefined,
        systemPrompt: undefined,
      });
    });

    await waitFor(() => {
      expect(mockOnNewChat).toHaveBeenCalledWith('chat3');
    });
  });

  it('handles chat deletion', async () => {
    mockUseQuery.mockReturnValue(mockChats);
    mockDeleteChat.mockResolvedValue(undefined);

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <ChatSidebar
        userId="user1"
        currentChatId="chat1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    // Find and click delete button (should appear on hover)
    const firstChatContainer = screen.getByText('First Chat').closest('div');
    const deleteButton = firstChatContainer?.querySelector('button[title="Delete chat"]');
    
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete this chat? This action cannot be undone.'
    );

    await waitFor(() => {
      expect(mockDeleteChat).toHaveBeenCalledWith({
        chatId: 'chat1',
        userId: 'user1',
      });
    });

    confirmSpy.mockRestore();
  });

  it('filters chats based on search', () => {
    mockUseQuery.mockReturnValue(mockChats);

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search chats...');
    fireEvent.change(searchInput, { target: { value: 'First' } });

    expect(screen.getByText('First Chat')).toBeInTheDocument();
    expect(screen.queryByText('Second Chat')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue(undefined);

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles modal cancellation', () => {
    mockUseQuery.mockReturnValue(mockChats);

    render(
      <ChatSidebar
        userId="user1"
        onSelectChat={mockOnSelectChat}
        onNewChat={mockOnNewChat}
      />
    );

    // Open new chat modal
    const newChatButton = screen.getByTitle('New Chat');
    fireEvent.click(newChatButton);

    expect(screen.getByText('Create New Chat')).toBeInTheDocument();

    // Cancel modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Create New Chat')).not.toBeInTheDocument();
  });
});