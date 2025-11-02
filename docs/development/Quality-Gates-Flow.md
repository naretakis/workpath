# Quality Gates Flow Diagram

This document visualizes how quality checks prevent broken code from being committed or deployed.

## Overview

Quality gates are automated checkpoints that ensure code quality at every stage of development.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. WRITE CODE
   │
   ├─ Edit files in src/
   ├─ Make changes
   └─ Save files
   
2. GIT ADD
   │
   └─ git add .
   
3. GIT COMMIT ⚡ PRE-COMMIT HOOK RUNS
   │
   ├─ ✅ ESLint (auto-fix)
   ├─ ✅ Prettier (auto-format)
   ├─ ✅ Tests for changed files
   └─ ✅ Manifest validation (if changed)
   │
   ├─ ❌ BLOCKED if any check fails
   └─ ✅ COMMIT SUCCEEDS if all pass
   
4. GIT PUSH ⚡ PRE-PUSH HOOK RUNS
   │
   ├─ ✅ TypeScript type check (strict mode)
   ├─ ✅ Full test suite with coverage (80%+)
   └─ ✅ Production build
   │
   ├─ ❌ BLOCKED if any check fails
   └─ ✅ PUSH SUCCEEDS if all pass
   
5. CREATE PULL REQUEST ⚡ CI/CD PIPELINE RUNS
   │
   ├─ ✅ All pre-push checks
   ├─ ✅ E2E tests (Playwright)
   ├─ ✅ Code coverage report
   └─ ✅ Build artifacts
   │
   ├─ ❌ PR CANNOT MERGE if checks fail
   └─ ✅ PR READY FOR REVIEW if all pass
   
6. CODE REVIEW
   │
   ├─ Reviewer checks code
   ├─ Reviewer approves or requests changes
   └─ Address feedback if needed
   
7. MERGE TO MAIN ⚡ DEPLOYMENT PIPELINE RUNS
   │
   ├─ ✅ All PR checks
   ├─ ✅ Lighthouse PWA audit (score >90)
   ├─ ✅ Build for production
   └─ ✅ Deploy to GitHub Pages
   │
   ├─ ❌ DEPLOYMENT BLOCKED if checks fail
   └─ ✅ DEPLOYED TO PRODUCTION if all pass
```

## Quality Gate Details

### Pre-Commit Hook (Fastest - Runs in Seconds)

**Purpose**: Catch simple issues immediately

**Checks**:
- ESLint with auto-fix (code quality)
- Prettier formatting (code style)
- Tests for changed files only (fast feedback)
- Manifest validation (PWA compliance)

**When it runs**: Every `git commit`

**What happens if it fails**: Commit is blocked, fix issues and try again

**How to fix**:
```bash
npm run quality:fix  # Auto-fix most issues
git add .
git commit -m "your message"
```

### Pre-Push Hook (Medium - Runs in 1-2 Minutes)

**Purpose**: Ensure code compiles and tests pass before sharing

**Checks**:
- TypeScript type checking (no compilation errors)
- Full test suite with coverage (80%+ required)
- Production build (ensure it builds)

**When it runs**: Every `git push`

**What happens if it fails**: Push is blocked, fix issues and try again

**How to fix**:
```bash
npm run type-check      # See TypeScript errors
npm run test:coverage   # See test failures
npm run build           # See build errors
# Fix issues, then push again
```

### CI/CD Pipeline (Slowest - Runs in 5-10 Minutes)

**Purpose**: Comprehensive validation before merge and deployment

**Checks**:
- All pre-push checks
- E2E tests (full user workflows)
- Lighthouse audit (PWA, performance, accessibility)
- Build artifacts for deployment

**When it runs**: Every PR and merge to main

**What happens if it fails**: PR cannot merge, deployment blocked

**How to fix**: Check GitHub Actions logs, fix issues, push again

## Quality Metrics Tracked

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUALITY DASHBOARD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Build Success Rate:        [████████████████████] 98%  ✅      │
│  Test Coverage:             [████████████████████] 85%  ✅      │
│  TypeScript Errors:         0                           ✅      │
│  ESLint Warnings:           0                           ✅      │
│  Lighthouse PWA Score:      [████████████████████] 95   ✅      │
│  Lighthouse Performance:    [████████████████████] 92   ✅      │
│  Lighthouse Accessibility:  [████████████████████] 98   ✅      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Common Failure Scenarios and Solutions

### Scenario 1: Commit Blocked by ESLint

```
❌ Pre-commit checks failed
   ESLint found 3 errors in src/components/MyComponent.tsx
```

**Solution**:
```bash
npm run lint:fix     # Auto-fix
git add .
git commit -m "your message"
```

### Scenario 2: Push Blocked by TypeScript

```
❌ TypeScript check failed
   src/components/MyComponent.tsx:15:7 - error TS2322: Type 'string' is not assignable to type 'number'
```

**Solution**:
```bash
npm run type-check   # See all errors
# Fix TypeScript errors in your code
git add .
git commit -m "fix: resolve type errors"
git push
```

### Scenario 3: Push Blocked by Test Coverage

```
❌ Tests failed or coverage below threshold
   Coverage: 75% (threshold: 80%)
```

**Solution**:
```bash
npm run test:coverage   # See what's not covered
# Write tests for uncovered code
git add .
git commit -m "test: add missing tests"
git push
```

### Scenario 4: PR Blocked by Build Failure

```
❌ Build failed
   Module not found: Can't resolve '@/components/MissingComponent'
```

**Solution**:
```bash
npm run build        # Reproduce locally
# Fix import errors
git add .
git commit -m "fix: resolve import errors"
git push
```

## Best Practices

### 1. Run Checks Before Committing

```bash
# Before committing, run:
npm run quality:fix      # Fix auto-fixable issues
npm run quality:check    # Verify everything passes
```

### 2. Commit Often, Push Strategically

- Make small, frequent commits locally
- Run full checks before pushing
- Push when you have a complete, working feature

### 3. Fix Issues Immediately

- Don't ignore hook failures
- Fix issues while context is fresh
- Don't bypass hooks unless absolutely necessary

### 4. Monitor CI/CD Pipeline

- Watch GitHub Actions after pushing
- Fix failures immediately
- Don't let broken builds accumulate

## Emergency Bypass (Use Sparingly!)

In rare emergencies, you can bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency: critical production fix"

# Skip pre-push hook
git push --no-verify
```

**⚠️ WARNING**: 
- Only use in true emergencies
- Document why in commit message
- Fix issues immediately after
- Never bypass for convenience

## Time Investment vs. Value

```
┌─────────────────────────────────────────────────────────────────┐
│                  TIME INVESTMENT ANALYSIS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pre-commit hook:     2-5 seconds    ⚡ Instant feedback        │
│  Pre-push hook:       1-2 minutes    ⚡ Catches major issues    │
│  CI/CD pipeline:      5-10 minutes   ⚡ Comprehensive check     │
│                                                                  │
│  Time saved by catching bugs early:  HOURS to DAYS             │
│  Time saved by preventing bad deploys: DAYS to WEEKS           │
│  Developer confidence: PRICELESS                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

Quality gates ensure:
- ✅ No broken code is committed
- ✅ No failing tests are pushed
- ✅ No build errors reach production
- ✅ High code quality is maintained
- ✅ PWA standards are met
- ✅ Accessibility is ensured
- ✅ Performance is optimized

**Result**: Faster development, fewer bugs, happier developers!

## References

- **Quality Automation Setup**: `.kiro/steering/quality-automation.md`
- **Quick Reference**: `.kiro/steering/QUICK-REFERENCE.md`
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`
