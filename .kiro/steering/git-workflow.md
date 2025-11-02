---
inclusion: always
---

# Git Workflow and Commit Conventions

This document defines the Git workflow, branching strategy, and commit conventions for the WorkPath project.

## Branching Strategy

### Main Branches

- **`main`**: Production-ready code, always deployable
- **`develop`**: Integration branch for features, staging for next release

### Feature Branches

- **Naming**: `feature/<task-number>-<short-description>`
- **Example**: `feature/1.7-steering-documents`
- **Base**: Branch from `develop`
- **Merge**: Create PR to merge back into `develop`

### Bugfix Branches

- **Naming**: `bugfix/<issue-number>-<short-description>`
- **Example**: `bugfix/42-calendar-swipe-gesture`
- **Base**: Branch from `develop` (or `main` for hotfixes)
- **Merge**: Create PR to merge back into source branch

### Hotfix Branches

- **Naming**: `hotfix/<issue-number>-<short-description>`
- **Example**: `hotfix/99-data-loss-on-export`
- **Base**: Branch from `main`
- **Merge**: Create PR to merge into both `main` and `develop`

### Release Branches

- **Naming**: `release/<version>`
- **Example**: `release/1.0.0`
- **Base**: Branch from `develop`
- **Purpose**: Final testing and bug fixes before production release
- **Merge**: Merge into both `main` and `develop` when ready

## Commit Message Conventions

### Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, tooling, dependencies

### Scope

Optional, indicates the area of the codebase:

- **onboarding**: Onboarding flow
- **exemptions**: Exemption screening
- **tracking**: Activity tracking
- **documents**: Document management
- **export**: Data export
- **import**: Data import
- **settings**: Settings page
- **db**: Database/IndexedDB
- **ui**: UI components
- **a11y**: Accessibility
- **pwa**: PWA functionality
- **sw**: Service worker
- **cache**: Caching strategies
- **offline**: Offline functionality
- **sync**: Background sync
- **perf**: Performance optimization

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

### Body

- Optional, provide additional context
- Wrap at 72 characters
- Explain what and why, not how

### Footer

- Optional, reference issues or breaking changes
- Format: `Refs: #123` or `Closes: #123`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

```
feat(tracking): add batch activity entry component

Implement multi-date picker and batch entry form for logging
activities across multiple dates at once.

Refs: #1.7
```

```
fix(documents): resolve camera permission error on iOS

Camera permission was not being requested properly on iOS Safari.
Added proper permission check and fallback to file upload.

Closes: #42
```

```
docs(readme): update setup instructions

Add instructions for installing dependencies and running
the development server.
```

```
refactor(db): simplify activity query logic

Extract common query patterns into reusable functions to
reduce code duplication.
```

```
test(compliance): add unit tests for calculation utilities

Add comprehensive tests for calculateMonthlyCompliance and
income conversion functions.

Refs: #23.2
```

## Pull Request Process

### Creating a Pull Request

1. **Ensure branch is up to date** with target branch (usually `develop`)
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/1.7-steering-documents
   git rebase develop
   ```

2. **Run tests and linting**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Push branch to remote**
   ```bash
   git push origin feature/1.7-steering-documents
   ```

4. **Create PR on GitHub**
   - Use descriptive title following commit convention
   - Fill out PR template with description, testing notes, screenshots
   - Link related issues
   - Request reviewers

### PR Title Format

Follow commit message convention:

```
feat(tracking): Add batch activity entry component
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #123
Refs #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] PWA functionality update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Tested offline functionality (if applicable)

## Accessibility
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Touch targets meet 44px minimum

## PWA Compliance (if applicable)
- [ ] Service worker updated correctly
- [ ] Offline functionality works
- [ ] Manifest updated (if needed)
- [ ] Cache strategies appropriate
- [ ] Install/update prompts tested
- [ ] Works on iOS Safari and Chrome Android

## Performance
- [ ] No performance regressions
- [ ] Bundle size impact acceptable
- [ ] Lighthouse score maintained (>90)

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] JSDoc comments added for public APIs
- [ ] Documentation updated (README, CHANGELOG if needed)
- [ ] No console errors or warnings
- [ ] Tests pass locally
- [ ] Lint passes
- [ ] Build succeeds
- [ ] TypeScript strict mode passes
- [ ] Version consistency checked (if version changed)
```

### Code Review Guidelines

**For Authors:**
- Keep PRs small and focused (< 400 lines changed)
- Provide context in description
- Respond to feedback promptly
- Don't take feedback personally

**For Reviewers:**
- Review within 24 hours
- Be constructive and specific
- Ask questions, don't make demands
- Approve when satisfied, request changes if needed

### Merging

- **Squash and merge** for feature branches (clean history)
- **Merge commit** for release branches (preserve history)
- **Delete branch** after merging
- **Update local branches** after merge

## Common Git Commands

### Starting New Work

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/1.7-steering-documents

# Make changes and commit
git add .
git commit -m "feat(docs): create steering documents"

# Push to remote
git push origin feature/1.7-steering-documents
```

### Keeping Branch Updated

```bash
# Rebase on develop
git checkout develop
git pull origin develop
git checkout feature/1.7-steering-documents
git rebase develop

# Resolve conflicts if any
git add .
git rebase --continue

# Force push (rebase rewrites history)
git push origin feature/1.7-steering-documents --force-with-lease
```

### Fixing Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "new message"

# Discard local changes
git checkout -- <file>
git restore <file>
```

### Stashing Changes

```bash
# Stash current changes
git stash

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Stash with message
git stash save "WIP: implementing batch entry"
```

## Git Hooks

### Pre-commit Hook (Husky + lint-staged)

Automatically runs on `git commit`:
- ESLint on staged files
- Prettier formatting on staged files
- TypeScript type checking
- Related test execution
- PWA manifest validation

**Configuration (`.husky/pre-commit`):**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

**lint-staged configuration (`package.json`):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "public/manifest.json": [
      "node scripts/validate-manifest.js"
    ]
  }
}
```

### Pre-push Hook

Automatically runs on `git push`:
- Run all tests with coverage
- Build check
- Lighthouse PWA audit (optional)

**Configuration (`.husky/pre-push`):**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test:coverage
npm run build
```

### PWA-Specific Quality Gates

Additional checks for PWA functionality:

**Manifest Validation Script (`scripts/validate-manifest.js`):**
```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
const missingFields = requiredFields.filter(field => !manifest[field]);

if (missingFields.length > 0) {
  console.error(`❌ Manifest validation failed. Missing fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

// Validate icons
if (!manifest.icons || manifest.icons.length === 0) {
  console.error('❌ Manifest must include at least one icon');
  process.exit(1);
}

const requiredSizes = ['192x192', '512x512'];
const iconSizes = manifest.icons.map(icon => icon.sizes);
const missingIcons = requiredSizes.filter(size => !iconSizes.includes(size));

if (missingIcons.length > 0) {
  console.error(`❌ Manifest missing required icon sizes: ${missingIcons.join(', ')}`);
  process.exit(1);
}

console.log('✅ Manifest validation passed');
```

### Bypassing Hooks

Only in emergencies:
```bash
git commit --no-verify
git push --no-verify
```

**⚠️ Warning**: Bypassing hooks should be rare and documented in commit message.

## Workflow Examples

### Feature Development Workflow

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/8.1-calendar-component

# 2. Make changes and commit frequently
git add src/components/tracking/Calendar.tsx
git commit -m "feat(tracking): create calendar component structure"

git add src/components/tracking/Calendar.tsx
git commit -m "feat(tracking): add month navigation to calendar"

git add src/components/tracking/Calendar.tsx
git commit -m "feat(tracking): implement date selection in calendar"

# 3. Keep branch updated
git checkout develop
git pull origin develop
git checkout feature/8.1-calendar-component
git rebase develop

# 4. Push and create PR
git push origin feature/8.1-calendar-component
# Create PR on GitHub

# 5. Address review feedback
git add src/components/tracking/Calendar.tsx
git commit -m "fix(tracking): improve calendar accessibility"
git push origin feature/8.1-calendar-component

# 6. After PR is merged
git checkout develop
git pull origin develop
git branch -d feature/8.1-calendar-component
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/99-data-loss-on-export

# 2. Fix the issue
git add src/lib/export/json.ts
git commit -m "fix(export): prevent data loss on export failure"

# 3. Test thoroughly
npm run test
npm run build

# 4. Push and create PR to main
git push origin hotfix/99-data-loss-on-export
# Create PR to main

# 5. After merging to main, also merge to develop
git checkout develop
git pull origin develop
git merge hotfix/99-data-loss-on-export
git push origin develop

# 6. Clean up
git branch -d hotfix/99-data-loss-on-export
```

## Best Practices

### Commit Frequency

- **Commit often**: Small, logical commits are better than large ones
- **Commit complete work**: Each commit should be a working state
- **Don't commit broken code**: Ensure code compiles and tests pass

### Commit Messages

- **Be descriptive**: Explain what and why, not how
- **Use present tense**: "add feature" not "added feature"
- **Reference issues**: Include issue numbers when applicable
- **Keep subject short**: 50 characters or less

### Branch Management

- **Keep branches short-lived**: Merge within a few days
- **Delete merged branches**: Clean up after merging
- **Rebase before merging**: Keep history clean
- **Don't rebase public branches**: Only rebase feature branches

### Code Review

- **Review your own code first**: Self-review before requesting review
- **Respond to all comments**: Address or discuss all feedback
- **Be respectful**: Assume good intentions
- **Learn from feedback**: Use reviews as learning opportunities

## Quality Assurance Automation

### Continuous Integration Checks

All PRs must pass these automated checks:

1. **Type Safety**: TypeScript compilation with strict mode
2. **Code Quality**: ESLint with zero errors
3. **Formatting**: Prettier formatting compliance
4. **Test Coverage**: 80% minimum coverage maintained
5. **Build Success**: Production build completes without errors
6. **E2E Tests**: All Playwright tests pass
7. **PWA Audit**: Lighthouse PWA score >90 (on main branch)

### GitHub Actions Workflow

See `.github/workflows/deploy.yml` for complete CI/CD configuration.

**Key stages:**
- **Test**: Run all quality checks
- **Build**: Create production build
- **Deploy**: Deploy to GitHub Pages (main branch only)

### Quality Check Script

Run all quality checks locally before pushing:

```bash
npm run quality:check
```

This runs:
- TypeScript type checking
- ESLint
- Prettier
- Jest with coverage
- Production build

### Automated Deployment

- **Main branch**: Auto-deploys to production after all checks pass
- **Feature branches**: Run checks but don't deploy
- **Pull requests**: Run checks and report status

## References

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Git Best Practices**: https://git-scm.com/book/en/v2
- **PWA Best Practices**: https://web.dev/progressive-web-apps/
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Tasks Document**: `.kiro/specs/medicaid-compliance-mvp/tasks.md`
