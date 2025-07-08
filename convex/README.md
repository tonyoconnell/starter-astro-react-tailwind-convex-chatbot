# Convex Backend

This directory contains the Convex backend implementation for the AI-Accelerated Starter Template. It provides real-time database functionality, serverless functions, and file storage for the chat application.

## Directory Structure

```
convex/
├── schema.ts                 # Database schema definition
├── functions/                # Serverless functions
│   ├── queries/              # Read operations
│   │   ├── users.ts          # User queries
│   │   ├── chats.ts          # Chat queries
│   │   └── messages.ts       # Message queries
│   ├── mutations/            # Write operations
│   │   ├── users.ts          # User mutations
│   │   ├── chats.ts          # Chat mutations
│   │   ├── messages.ts       # Message mutations
│   │   └── attachments.ts    # File attachment mutations
│   └── actions/              # External API calls (future)
├── tests/                    # Backend tests
│   ├── setup.ts              # Test configuration
│   ├── queries/              # Query tests
│   └── mutations/            # Mutation tests
├── package.json              # Dependencies and scripts
├── vitest.config.ts          # Test configuration
└── README.md                 # This file
```

## Database Schema

The backend implements a comprehensive chat application schema with the following tables:

### Core Tables

- **users**: User accounts managed by BetterAuth integration
- **chats**: Chat sessions/conversations with model and prompt settings
- **messages**: Individual messages with multi-part content support
- **chat_attachments**: File attachments for conversations

### Supporting Tables

- **user_sessions**: Session management for BetterAuth
- **chat_shares**: Public sharing of chat conversations

### Key Features

- **Real-time updates**: All queries support live updates
- **Type safety**: Full TypeScript integration with frontend
- **Search functionality**: Full-text search on message content
- **File storage**: Integrated file upload/download with validation
- **Performance optimization**: Proper indexing and query optimization

## API Functions

### User Management

**Queries:**
- `getCurrentUser(tokenIdentifier)` - Get authenticated user
- `getUserById(userId)` - Get user by ID
- `getUserProfile(userId)` - Get public profile info
- `userExists(tokenIdentifier)` - Check if user exists

**Mutations:**
- `createUser(name, email, image, tokenIdentifier)` - Create new user
- `updateUser(userId, name, email, image)` - Update user profile
- `deleteUser(userId)` - Delete user account
- `updateLastAccessed(tokenIdentifier)` - Update access timestamp

### Chat Management

**Queries:**
- `getUserChats(userId)` - Get all user's chats
- `getChatById(chatId)` - Get specific chat
- `getChatForUser(chatId, userId)` - Get chat with ownership verification
- `getRecentUserChats(userId, limit)` - Get recent chats
- `getChatSummary(chatId)` - Get chat with message count
- `searchUserChats(userId, searchTerm, limit)` - Search chats by title

**Mutations:**
- `createChat(userId, title, model, systemPrompt)` - Create new chat
- `updateChat(chatId, userId, title, model, systemPrompt)` - Update chat
- `deleteChat(chatId, userId)` - Delete chat and all messages
- `archiveChat(chatId, userId)` - Archive chat
- `duplicateChat(chatId, userId)` - Duplicate chat settings

### Message Management

**Queries:**
- `getChatMessages(chatId, limit, cursor)` - Get messages with pagination
- `getRecentChatMessages(chatId, limit)` - Get recent messages
- `getMessageById(messageId)` - Get specific message
- `searchMessages(searchTerm, userId, chatId, limit)` - Search messages
- `getChatMessageCount(chatId)` - Get message count
- `getMessagesByRole(chatId, role, limit)` - Filter by role
- `getConversationContext(chatId, maxMessages, includeSystem)` - Get context for AI
- `getChatMessageStats(chatId)` - Get message statistics

**Mutations:**
- `sendMessage(chatId, userId, role, content, parts, metadata)` - Send new message
- `updateMessage(messageId, userId, content, parts, metadata)` - Update message
- `deleteMessage(messageId, userId)` - Delete message
- `addMessageReaction(messageId, userId, reaction)` - Add like/dislike
- `removeMessageReaction(messageId, userId, reaction)` - Remove reaction
- `bulkDeleteMessages(chatId, userId, messageIds, deleteAll)` - Bulk delete

### File Attachments

**Mutations:**
- `uploadAttachment(userId, chatId, fileId, fileName, fileType, fileSize)` - Upload file
- `getAttachmentUrl(attachmentId, userId)` - Get download URL
- `deleteAttachment(attachmentId, userId)` - Delete file
- `getChatAttachments(chatId, userId)` - Get all chat attachments
- `getUserAttachments(userId, limit)` - Get all user attachments
- `updateAttachment(attachmentId, userId, fileName)` - Update metadata
- `getAttachmentStats(userId)` - Get storage statistics

## Development Commands

### Local Development

```bash
# Start Convex development server
cd convex && bun run dev

# Or from project root
bun convex:dev
```

### Testing

```bash
# Run all tests
cd convex && bun test

# Run tests in watch mode
cd convex && bun test --watch

# Run specific test file
cd convex && bun test users.test.ts
```

### Deployment

```bash
# Deploy to Convex cloud
cd convex && bun run deploy

# Or from project root
bun convex:deploy
```

## Authentication Integration

The backend is designed to integrate with BetterAuth for user authentication:

1. **Token-based authentication**: Users are identified by `tokenIdentifier` from BetterAuth
2. **Automatic user creation**: New users are created during first authentication
3. **Session management**: Optional session tracking with expiration
4. **Authorization**: All operations verify user ownership of resources

## Security Features

- **Input validation**: All inputs are sanitized and validated
- **Authorization checks**: Users can only access their own data
- **File type restrictions**: Only allowed file types can be uploaded
- **Size limits**: 10MB file size limit for attachments
- **Error handling**: Comprehensive error messages without sensitive data exposure

## Performance Optimizations

- **Proper indexing**: All queries use appropriate indexes
- **Pagination**: Large result sets support cursor-based pagination
- **Search indexing**: Full-text search on message content
- **Query optimization**: Efficient queries with minimal data transfer
- **Real-time subscriptions**: Live updates without polling

## Testing Strategy

The backend includes comprehensive test coverage:

- **Unit tests**: Individual function testing with mocked dependencies
- **Integration tests**: Database operations with test data
- **Performance tests**: Query performance and index usage
- **Error handling tests**: Validation and authorization scenarios

### Test Coverage Requirements

- Backend functions: 80% minimum coverage
- Critical business logic: 90% minimum coverage
- All edge cases and error conditions tested

## Environment Configuration

Set up your environment variables for Convex:

```bash
# .env.local
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment.convex.cloud
```

## Integration with Frontend

The Convex backend automatically generates TypeScript types for frontend consumption:

1. Install Convex client in frontend: `bun add convex`
2. Import generated types: `import { api } from "../convex/_generated/api"`
3. Use type-safe queries and mutations in React components
4. Real-time updates work automatically with Convex React hooks

## Monitoring and Debugging

- **Convex Dashboard**: Real-time function logs and performance metrics
- **Query performance**: Built-in query performance monitoring
- **Error tracking**: Comprehensive error logging with context
- **Development tools**: Hot reloading and real-time schema updates

## Future Enhancements

The backend architecture supports future extensions:

- **LLM integration**: Actions for external AI API calls
- **Webhook handling**: Incoming webhooks for integrations
- **Advanced search**: Enhanced search with filters and sorting
- **Analytics**: User behavior and usage analytics
- **Caching**: Redis integration for performance optimization

This Convex backend provides a solid foundation for building real-time chat applications with full type safety, comprehensive testing, and production-ready features.