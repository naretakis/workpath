# Development Documentation

Welcome to the WorkPath development documentation! This directory contains comprehensive guides for developers working on the project.

## 📚 Documentation Overview

### For New Developers

Start here if you're new to the project:

1. **[Quick Reference Guide](../../.kiro/steering/QUICK-REFERENCE.md)** - Command cheat sheet and common tasks
2. **[Quality Gates Flow](./Quality-Gates-Flow.md)** - Visual guide to automated quality checks
3. **[Troubleshooting Guide](./Troubleshooting-Guide.md)** - Solutions to common problems

### Core Documentation

Essential reading for all developers:

- **[Development Standards](../../.kiro/steering/development-standards.md)** - TypeScript, code quality, testing standards
- **[Quality Automation](../../.kiro/steering/quality-automation.md)** - Complete automation setup and configuration
- **[Documentation Automation](../../.kiro/steering/documentation-automation.md)** - Automated docs, versioning, and changelog
- **[Git Workflow](../../.kiro/steering/git-workflow.md)** - Branching strategy and commit conventions
- **[Material-UI Guidelines](../../.kiro/steering/material-ui-guidelines.md)** - UI component standards and PWA patterns

### Domain Knowledge

Understanding the business domain:

- **[Medicaid Domain Knowledge](../../.kiro/steering/medicaid-domain-knowledge.md)** - HR1 legislation and work requirements

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd workpath

# 2. Install dependencies
npm install

# 3. Setup Git hooks
npx husky install

# 4. Verify setup
npm run quality:check

# 5. Start development
npm run dev
```

### Daily Workflow

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/123-my-feature

# 2. Make changes
# Edit files...

# 3. Commit (hooks run automatically)
git add .
git commit -m "feat(scope): description"

# 4. Push (hooks run automatically)
git push origin feature/123-my-feature

# 5. Create Pull Request on GitHub
```

## ✅ Quality Checks

### Automated Checks

Quality checks run automatically at three stages:

1. **On Commit** (2-5 seconds)
   - ESLint auto-fix
   - Prettier auto-format
   - Tests for changed files
   - Manifest validation

2. **On Push** (1-2 minutes)
   - TypeScript type check
   - Full test suite with coverage
   - Production build

3. **On Pull Request** (5-10 minutes)
   - All push checks
   - E2E tests
   - Lighthouse audit
   - Deploy preview

### Manual Checks

Run these commands anytime:

```bash
# Fix most issues automatically
npm run quality:fix

# Run all checks
npm run quality:check

# Individual checks
npm run type-check      # TypeScript
npm run lint            # ESLint
npm run format          # Prettier
npm run test:coverage   # Tests
npm run build           # Build
```

## 🐛 Troubleshooting

### Common Issues

| Issue             | Quick Fix                                |
| ----------------- | ---------------------------------------- |
| Commit blocked    | `npm run quality:fix`                    |
| Push blocked      | `npm run quality:check`                  |
| TypeScript errors | `npm run type-check`                     |
| Test failures     | `npm run test:watch`                     |
| Build errors      | `npm run build`                          |
| Hooks not running | `npx husky install && chmod +x .husky/*` |

See [Troubleshooting Guide](./Troubleshooting-Guide.md) for detailed solutions.

## 📖 Documentation Structure

```
docs/
├── development/
│   ├── README.md                      # This file
│   ├── Quality-Gates-Flow.md          # Visual guide to quality checks
│   ├── Troubleshooting-Guide.md       # Common issues and solutions
│   ├── Architecture-Decisions.md      # ADR documentation
│   └── kiro-spec-templates/          # Kiro spec templates
├── domain/                            # Business domain knowledge
├── design/                            # UX and design guidelines
├── testing/                           # Testing strategies
├── tasks/                             # Task-specific guides
└── templates/                         # Documentation templates
    └── README.template.md             # README template

.kiro/steering/
├── QUICK-REFERENCE.md                 # Command cheat sheet
├── quality-automation.md              # Automation setup
├── documentation-automation.md        # Documentation automation
├── development-standards.md           # Development standards
├── git-workflow.md                    # Git workflow
├── material-ui-guidelines.md          # UI guidelines
└── medicaid-domain-knowledge.md       # Domain knowledge
```

## 🎯 Development Standards

### Code Quality

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Zero warnings required
- **Prettier**: Consistent formatting
- **Tests**: 80% minimum coverage
- **Build**: Must succeed without errors

### Component Standards

- **Functional components** with TypeScript
- **Props interfaces** explicitly defined
- **Custom hooks** for reusable logic
- **Material-UI** components for UI
- **Accessibility** WCAG 2.1 AA compliant

### PWA Standards

- **Offline-first** architecture
- **Service worker** for caching
- **IndexedDB** for data storage
- **Lighthouse score** >90
- **Mobile-first** responsive design

## 🔐 Security Standards

- **Local-first**: All data stored locally
- **No external transmission**: Except user-initiated exports
- **Input validation**: Zod schemas for all inputs
- **XSS prevention**: Sanitize user input
- **Encryption**: For sensitive fields

## ♿ Accessibility Standards

- **Semantic HTML**: Proper heading hierarchy
- **ARIA labels**: On all interactive elements
- **Keyboard navigation**: Fully supported
- **Color contrast**: 4.5:1 minimum
- **Touch targets**: 44px minimum
- **Screen reader**: Tested and compatible

## 📱 PWA Requirements

- **Works offline**: All features functional
- **Installable**: On mobile and desktop
- **Fast**: <3s load time on 3G
- **Responsive**: Mobile-first design
- **Secure**: HTTPS only
- **Discoverable**: Manifest and service worker

## 🧪 Testing Strategy

### Test Layers

1. **Unit Tests** (Jest + React Testing Library)
   - Component rendering
   - User interactions
   - Validation logic
   - Utility functions

2. **Integration Tests**
   - Multi-component workflows
   - Data persistence
   - Navigation flows

3. **E2E Tests** (Playwright)
   - Complete user journeys
   - Cross-browser testing
   - Mobile testing

### Coverage Requirements

- **Overall**: 80% minimum
- **Utilities**: 100% coverage
- **Components**: 80%+ coverage
- **Critical paths**: Integration tests required

## 🚢 Deployment

### Deployment Pipeline

```
Commit → Push → PR → Review → Merge → Deploy
  ↓       ↓      ↓      ↓       ↓       ↓
Hooks   Hooks   CI    Human   CI    Production
```

### Deployment Targets

- **Main branch**: Auto-deploys to production (GitHub Pages)
- **Feature branches**: No deployment
- **Pull requests**: Deploy preview (optional)

### Deployment Requirements

- ✅ All quality checks pass
- ✅ Code review approved
- ✅ Lighthouse audit >90
- ✅ No console errors
- ✅ PWA manifest valid

## 🆘 Getting Help

### When You're Stuck

1. **Check error message** - Usually tells you what's wrong
2. **Read documentation** - Solution might be documented
3. **Search codebase** - Someone might have solved it
4. **Ask in team chat** - Don't stay stuck!
5. **Create an issue** - If it's a tooling problem

### Resources

- **Quick Reference**: `.kiro/steering/QUICK-REFERENCE.md`
- **Troubleshooting**: `docs/development/Troubleshooting-Guide.md`
- **Quality Automation**: `.kiro/steering/quality-automation.md`
- **Development Standards**: `.kiro/steering/development-standards.md`

## 💡 Pro Tips

1. **Run `npm run quality:fix` before committing** - Saves time
2. **Use `npm run test:watch` while developing** - Instant feedback
3. **Check `npm run quality:check` before pushing** - Catches issues early
4. **Keep PRs small** - Easier to review, faster to merge
5. **Write tests first** - TDD prevents bugs
6. **Commit often** - Small commits are easier to review

## 📈 Success Metrics

Track these to ensure quality:

- ✅ Build success rate: 95%+
- ✅ Test coverage: 80%+
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Lighthouse scores: 90+
- ✅ PR review time: <24 hours

## 🎓 Learning Resources

### Internal

- All steering documents in `.kiro/steering/`
- All development docs in `docs/development/`
- Code examples in the codebase

### External

- **TypeScript**: https://www.typescriptlang.org/docs/
- **React**: https://react.dev/
- **Next.js**: https://nextjs.org/docs
- **Material-UI**: https://mui.com/
- **PWA**: https://web.dev/progressive-web-apps/
- **Testing Library**: https://testing-library.com/
- **Playwright**: https://playwright.dev/

## 🤝 Contributing

1. Read the development standards
2. Follow the Git workflow
3. Write tests for your code
4. Ensure all quality checks pass
5. Create a pull request
6. Respond to code review feedback
7. Celebrate when merged! 🎉

---

**Welcome to the team!** If you have questions, don't hesitate to ask. We're all here to help each other succeed. 🚀
