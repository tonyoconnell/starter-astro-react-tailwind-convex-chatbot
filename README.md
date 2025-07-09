# AI-Accelerated Starter Template

A comprehensive starter template for building conversational and agent-based applications with modern web technologies.

## 🚀 Tech Stack

- **Frontend**: Astro ~5.11 with React ~19.1 islands
- **Styling**: TailwindCSS ~3.4 
- **Backend**: Convex (Coming Soon)
- **Language**: TypeScript ~5.8 in strict mode
- **Runtime**: Bun
- **Deployment**: Cloudflare Pages
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Authentication**: BetterAuth with OAuth providers
- **Database**: Convex real-time database (in development)

## 🏗️ Project Structure

```
ai-starter-template/
├── apps/
│   └── web/                # Astro frontend application
├── packages/
│   ├── config/             # Shared configurations (ESLint, TSConfig)
│   ├── lib/                # Shared utilities & types
│   └── ui/                 # Shared React UI components
├── convex/                 # Convex backend (placeholder)
├── .github/workflows/      # GitHub Actions CI/CD
└── docs/                   # Project documentation
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- Node.js 18+ (for fallback compatibility)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ai-starter-template
   bun install
   ```

2. **Start development servers:**
   ```bash
   bun dev
   ```
   This will start the Astro development server at `http://localhost:4321`

3. **Build for production:**
   ```bash
   bun run build
   ```

4. **Preview production build:**
   ```bash
   cd apps/web && bun run preview
   ```

### Available Scripts

- `bun dev` - Start all development servers
- `bun run build` - Build all packages for production
- `bun run lint` - Run linting across all packages
- `bun run test` - Run tests across all packages
- `bun run clean` - Clean build artifacts

## 🚀 Deployment

### Cloudflare Pages

The project is configured to automatically deploy to Cloudflare Pages via GitHub Actions.

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

**Deployment Process:**
1. Push to `main` branch
2. GitHub Actions runs build process
3. Deploys to Cloudflare Pages automatically

### Manual Deployment

```bash
# Install Wrangler globally (if not already installed)
bun add -g wrangler

# Login to Cloudflare
bunx wrangler login

# Deploy
bunx wrangler pages deploy apps/web/dist --project-name ai-starter-template
```

## 📦 Packages

### `@ai-template/config`
Shared configuration files (ESLint, TypeScript)

### `@ai-template/lib`
Shared utilities and types
- User types
- Date formatting utilities
- ID generation helpers

### `@ai-template/ui`
Shared React UI components
- Button component with variants
- Card component
- Styled with TailwindCSS

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run tests in specific package
cd packages/lib && bun test
```

## 💬 Chat Interface

The application features a comprehensive chat interface for AI conversations:

### Key Features

- **Real-time messaging** with AI assistants
- **Multiple chat sessions** with persistent history
- **Dark mode support** that follows system preferences
- **Responsive design** for desktop and mobile
- **Search functionality** across chat history
- **Authentication required** for secure access

### Getting Started

1. Navigate to `/chat` after logging in
2. Click **"Create your first chat"** or the **"+"** button
3. Enter a chat title and start messaging
4. Switch between chats using the sidebar

### User Guide

For detailed instructions on using the chat interface, see the [Chat Interface User Guide](./docs/user-guide/chat-interface.md).

### Technical Implementation

- **Frontend**: React components with Astro pages
- **State Management**: React hooks with local storage
- **Styling**: TailwindCSS with dark mode support
- **Testing**: Comprehensive unit and E2E tests
- **Accessibility**: Full keyboard navigation and screen reader support

## 📖 Documentation

- [BMAD Method](./CLAUDE.md) - AI-driven development framework
- [Architecture](./docs/architecture.md) - Detailed system design
- [Project Brief](./docs/project-brief.md) - Project overview and goals
- [Chat Interface User Guide](./docs/user-guide/chat-interface.md) - Complete chat feature guide

## 🤝 Contributing

This project uses the BMAD (Build Me An App, Dave) method for AI-driven development. See [CLAUDE.md](./CLAUDE.md) for development guidelines.

## 📄 License

[MIT License](LICENSE) - see LICENSE file for details.
