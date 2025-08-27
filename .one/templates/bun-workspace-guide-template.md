# Bun Workspace Quick Reference
**Optimized for 3x Performance - Engineering Team Coordination**

## Installation Commands

```bash
# Install all workspace dependencies (3x faster than npm)
bun install

# Clean install (removes cache and node_modules)
bun run install:clean

# Install with frozen lockfile (CI/production)
bun install --frozen-lockfile
```

## Development Commands

```bash
# Start all apps in development mode (parallel)
bun run dev

# Build all packages (with Turbo daemon)
bun run build

# Run tests across workspace
bun run test

# Lint all packages
bun run lint
```

## Workspace Management

```bash
# List all workspace packages and dependencies
bun run workspace:info

# Deduplicate dependencies
bun run workspace:dedupe

# Add dependency to specific workspace
bun add <package> --workspace=@apps/web

# Remove dependency from workspace
bun remove <package> --workspace=@apps/web
```

## Performance Features

### ⚡ **3x Faster Installs**
- Hardlink optimization for node_modules
- Parallel downloads and processing  
- Optimized dependency resolution

### 🗂️ **Smart Caching**
- `.bun-cache` directory for persistent caching
- Turbo daemon for build acceleration
- Remote cache integration ready

### 📦 **Workspace Optimization**
- Dependency hoisting to root level
- Symlink optimization for packages
- Cross-package TypeScript support

## Configuration Files

### `bunfig.toml` - Bun Configuration
```toml
[install]
cache = true
link = "hardlink" 
parallel = true

[workspace]
hoist = true
shareRoot = true
```

### `package.json` - Workspace Definition
```json
{
  "workspaces": [
    "apps/*",
    "packages/*", 
    "libraries/*",
    "databases/*"
  ],
  "packageManager": "bun@1.0.0"
}
```

### `turbo.json` - Pipeline Optimization
```json
{
  "daemon": true,
  "experimentalUI": true,
  "remoteCache": {
    "signature": true
  }
}
```

## Workspace Structure

```
{{PROJECT_NAME}}/
├── apps/                    # Applications
│   ├── web/                # Next.js app
│   ├── api/                # Convex backend
│   ├── desktop/            # Tauri app
│   └── cli/                # Node.js CLI
├── packages/               # Shared packages
│   ├── ui/                 # shadcn/ui components
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utilities
│   └── config/             # Shared configs
├── libraries/              # Business logic
│   ├── content/            # Content management
│   ├── agents/             # AI coordination
│   └── prompts/            # AI templates
└── databases/              # Database packages
    └── postgres/           # PostgreSQL schemas
```

## Troubleshooting

### Common Issues

**Dependency Resolution:**
```bash
# Clear cache and reinstall
bun run install:clean

# Check workspace dependencies
bun run workspace:info
```

**Build Performance:**
```bash
# Check Turbo cache status
bunx turbo run build --dry-run

# Clear Turbo cache
bunx turbo clean
```

**TypeScript Issues:**
```bash
# Type check all packages
bun run type-check

# Generate declarations
bun run build
```

### Performance Monitoring

```bash
# Time installation
time bun install

# Check bundle sizes
bun run build --analyze

# Monitor build performance
bun run build --verbose
```

## Quality Gates

### ✅ **Performance Targets**
- Install time < 10 seconds (vs 30s with npm)
- Build time < 30 seconds for full workspace
- Hot reload < 200ms for development changes

### ✅ **Dependency Health**
- Zero circular dependencies
- All peer dependencies satisfied
- Consistent versions across workspace

### ✅ **Integration Success**
- All scripts execute properly
- Cross-package imports work correctly
- TypeScript compilation successful

---
**Engineering Excellence through Optimal Package Management**