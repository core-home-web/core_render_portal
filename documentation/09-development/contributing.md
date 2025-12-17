# Contributing

How to contribute to the Core Render Portal.

## Getting Started

### 1. Set Up Development Environment

Follow the [Getting Started](../01-getting-started/README.md) guide.

### 2. Understand the Codebase

- Read the [Architecture](../02-architecture/README.md) docs
- Explore the [Features](../03-features/README.md) docs
- Review existing code

### 3. Find Something to Work On

- Check issues/tasks in project management
- Ask the team for suggestions
- Look for "good first issue" labels

## Development Workflow

### 1. Create a Branch

```bash
# Pull latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature
```

### Branch Naming

```
feature/add-export-button
fix/login-redirect-issue
docs/update-api-docs
refactor/cleanup-hooks
chore/update-dependencies
```

### 2. Make Changes

- Follow [Coding Standards](./coding-standards.md)
- Write tests for new functionality
- Update documentation if needed

### 3. Test Locally

```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Build to verify
pnpm build
```

### 4. Commit Changes

Follow conventional commits:

```bash
git add .
git commit -m "feat: add export to PNG button"
```

**Commit Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### 5. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat: add whiteboard export functionality
fix: resolve login redirect issue
```

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (for UI changes)

### Checklist

Before requesting review:
- [ ] Code follows coding standards
- [ ] Tests pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Documentation updated (if needed)

## Code Review

### For Authors

- Respond to feedback promptly
- Ask for clarification if needed
- Make requested changes
- Re-request review after changes

### For Reviewers

- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve when satisfied
- Focus on:
  - Correctness
  - Readability
  - Performance
  - Security

## Testing Requirements

### New Features

- Unit tests for components
- Tests for hooks
- Integration tests if applicable

### Bug Fixes

- Test that reproduces the bug
- Test that verifies the fix

### Minimum Coverage

- Critical paths: 80%+
- Utility functions: 100%

## Documentation

### When to Update Docs

- New features
- API changes
- Configuration changes
- Breaking changes

### What to Document

- How to use the feature
- Configuration options
- Examples
- Troubleshooting

## Release Process

### Versioning

We follow semantic versioning:
- **Major (1.0.0)** - Breaking changes
- **Minor (0.1.0)** - New features
- **Patch (0.0.1)** - Bug fixes

### Release Steps

1. All PRs merged to main
2. Version bump (if applicable)
3. Changelog updated
4. Tag created
5. Deploy to production

## Getting Help

### Stuck on Something?

1. Check existing documentation
2. Search previous issues/PRs
3. Ask in team chat
4. Create a detailed issue

### Reporting Issues

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment details

## Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Help others learn
- Ask questions freely
- Celebrate successes

---

← [Debugging](./debugging.md) | Next: [Glossary](../glossary.md) →

