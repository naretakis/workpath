---
inclusion: always
---

# Quick Reference Guide

This is a quick reference for common development tasks and quality checks.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup Git hooks
npx husky install

# Start development server
npm run dev
```

## ✅ Quality Checks (Run Before Committing)

```bash
# Fix all auto-fixable issues
npm run quality:fix

# Run all quality checks
npm run quality:check
```

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
```

### Quality Checks
```bash
npm run type-check       # TypeScript check
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format
npm run format:check     # Prettier check
```

### Testing
```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
```

### Combined
```bash
npm run quality:check    # All checks (type, lint, format, test, build)
npm run quality:fix      # Auto-fix lint and format issues
```

### Documentation
```bash
npm run release          # Create release with changelog
npm run docs:api         # Generate API documentation
npm run docs:update      # Update README
npm run version:check    # Check version consistency
npm run version:sync     # Sync versions across files
```

## 🔧 Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/123-my-feature

# Make changes and commit (hooks run automatically)
git add .
git commit -m "feat(scope): description"

# Push (hooks run automatically)
git push origin feature/123-my-feature
```

## 🎯 What Runs When

### On `git commit`:
- ✅ ESLint (auto-fix)
- ✅ Prettier (auto-format)
- ✅ Tests for changed files
- ✅ Manifest validation (if changed)

### On `git push`:
- ✅ TypeScript type check
- ✅ Full test suite with coverage
- ✅ Production build

### On Pull Request:
- ✅ All pre-push checks
- ✅ E2E tests
- ✅ Code review required

### On Merge to Main:
- ✅ All PR checks
- ✅ Lighthouse audit
- ✅ Deploy to GitHub Pages

## 🐛 Troubleshooting

### Commit Blocked?
```bash
# See what's wrong
npm run lint
npm run type-check

# Fix automatically
npm run quality:fix

# Try commit again
git commit -m "your message"
```

### Push Blocked?
```bash
# Run full check to see all issues
npm run quality:check

# Fix issues one by one:
npm run type-check      # Fix TypeScript errors
npm run test:coverage   # Fix failing tests
npm run build           # Fix build errors
```

### Tests Failing?
```bash
# Run in watch mode to debug
npm run test:watch

# Run specific test
npm test -- path/to/test.test.ts

# Update snapshots if needed
npm test -- -u
```

### Build Failing?
```bash
# Check TypeScript first
npm run type-check

# Check for missing dependencies
npm install

# Try clean build
rm -rf .next
npm run build
```

## 🚨 Emergency Bypass (Use Sparingly!)

```bash
# Skip pre-commit hook (document why in message!)
git commit --no-verify -m "emergency: reason for bypass"

# Skip pre-push hook (document why!)
git push --no-verify
```

## 📊 Coverage Requirements

- **Minimum**: 80% overall coverage
- **Utilities**: 100% coverage
- **Components**: 80%+ coverage
- **Integration**: Critical paths covered

## 🎨 Code Style

- **TypeScript**: Strict mode, no `any`
- **Components**: Functional components with TypeScript
- **Imports**: Use `@/` alias for src imports
- **Naming**: PascalCase for components, camelCase for utilities

## 🔐 Security Checklist

- [ ] No sensitive data in code
- [ ] Input validation with Zod
- [ ] XSS prevention (sanitize user input)
- [ ] No console.log of sensitive data
- [ ] Encryption for sensitive fields

## ♿ Accessibility Checklist

- [ ] Semantic HTML
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44px minimum
- [ ] Screen reader tested

## 📱 PWA Checklist

- [ ] Works offline
- [ ] Service worker registered
- [ ] Manifest valid
- [ ] Icons 192x192 and 512x512
- [ ] Lighthouse PWA score >90
- [ ] Installable on mobile

## 🔗 Quick Links

- **Development Standards**: `.kiro/steering/development-standards.md`
- **Material-UI Guidelines**: `.kiro/steering/material-ui-guidelines.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`
- **Quality Automation**: `.kiro/steering/quality-automation.md`
- **Documentation Automation**: `.kiro/steering/documentation-automation.md`
- **Domain Knowledge**: `.kiro/steering/medicaid-domain-knowledge.md`

## 💡 Pro Tips

1. **Run `npm run quality:fix` before committing** - Fixes most issues automatically
2. **Use `npm run test:watch` while developing** - Instant feedback on tests
3. **Check `npm run quality:check` before pushing** - Catches issues early
4. **Keep PRs small** - Easier to review, faster to merge
5. **Write tests first** - TDD prevents bugs and improves design
6. **Commit often** - Small commits are easier to review and revert

## 🆘 Getting Help

If you're stuck:

1. Check the error message carefully
2. Run individual checks to isolate the issue
3. Check the relevant steering document
4. Ask for help in team chat
5. Create an issue if it's a tooling problem

## 📈 Success Metrics

Track these to ensure quality:

- ✅ Build success rate: 95%+
- ✅ Test coverage: 80%+
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Lighthouse scores: 90+
- ✅ PR review time: <24 hours
