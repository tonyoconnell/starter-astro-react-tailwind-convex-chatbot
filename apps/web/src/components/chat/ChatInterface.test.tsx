import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from './ChatInterface';

// Mock the external dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('../../convex/_generated/api', () => ({
  api: {
    functions: {
      queries: {
        chats: { getChatById: 'getChatById' },
        messages: { getChatMessages: 'getChatMessages' },
      },
      mutations: {
        messages: { sendMessage: 'sendMessage' },
      },
    },
  },
}));

describe('ChatInterface Integration Tests', () => {
  const convexReact = vi.hoisted(() => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  }));
  
  const mockUseQuery = vi.mocked(convexReact.useQuery);
  const mockUseMutation = vi.mocked(convexReact.useMutation);

  const mockSendMessage = vi.fn();
  const mockChat = {
    _id: 'chat1',
    title: 'Test Chat',
    userId: 'user1',
    _creationTime: Date.now(),
  };

  const mockMessages = {
    messages: [
      {
        _id: 'msg1',
        chatId: 'chat1',
        role: 'user',
        content: 'Hello',
        _creationTime: Date.now(),
      },
      {
        _id: 'msg2',
        chatId: 'chat1',
        role: 'assistant',
        content: 'Hi there!',
        _creationTime: Date.now() + 1000,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(mockSendMessage);
  });

  it('renders chat interface with messages', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockChat) // chat query
      .mockReturnValueOnce(mockMessages); // messages query

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
        className="test-class"
      />
    );

    expect(screen.getByText('Test Chat')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('handles sending messages', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockChat)
      .mockReturnValueOnce(mockMessages);

    mockSendMessage.mockResolvedValue('msg3');

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
      />
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'New message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        chatId: 'chat1',
        userId: 'user1',
        role: 'user',
        content: 'New message',
      });
    });
  });

  it('handles loading states', () => {
    mockUseQuery
      .mockReturnValueOnce(undefined) // loading chat
      .mockReturnValueOnce(undefined); // loading messages

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error states', () => {
    mockUseQuery
      .mockReturnValueOnce(null) // chat not found
      .mockReturnValueOnce(null);

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
      />
    );

    expect(screen.getByText('Chat not found')).toBeInTheDocument();
    expect(screen.getByText("The chat you're looking for doesn't exist or you don't have access to it.")).toBeInTheDocument();
  });

  it('disables input when loading', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockChat)
      .mockReturnValueOnce(mockMessages);

    mockSendMessage.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
      />
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  it('handles retry on error', async () => {
    mockUseQuery
      .mockReturnValueOnce(mockChat)
      .mockReturnValueOnce(mockMessages);

    mockSendMessage.mockRejectedValue(new Error('Network error'));

    render(
      <ChatInterface
        chatId="chat1"
        userId="user1"
      />
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    const retryButton = screen.getByTitle('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });
});