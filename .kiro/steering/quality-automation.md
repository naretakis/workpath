---
inclusion: always
---

# Quality Automation Guide

This document provides a comprehensive guide to automated quality checks that prevent broken code from being committed or deployed. All checks run automatically via Git hooks and CI/CD pipelines.

## Overview

Quality automation ensures that:
- ✅ TypeScript compiles without errors (strict mode)
- ✅ ESLint passes with zero warnings
- ✅ Prettier formatting is applied consistently
- ✅ Tests pass with 80%+ coverage
- ✅ Build succeeds without errors
- ✅ PWA manifest is valid
- ✅ Documentation is up to date (see [Documentation Automation](./documentation-automation.md))

## Automated Quality Gates

### 1. Pre-Commit Hook (Runs on `git commit`)

**What it does:**
- Runs ESLint with auto-fix on staged TypeScript files
- Applies Prettier formatting to staged files
- Runs tests related to changed files
- Validates PWA manifest if changed

**Result:** Commit is blocked if any check fails.

### 2. Pre-Push Hook (Runs on `git push`)

**What it does:**
- Runs TypeScript type checking (strict mode)
- Runs full test suite with coverage check
- Runs production build

**Result:** Push is blocked if any check fails.

### 3. CI/CD Pipeline (Runs on Pull Requests and Main Branch)

**What it does:**
- All pre-push checks
- E2E tests with Playwright
- Lighthouse PWA audit (main branch only)
- Deploys to GitHub Pages (main branch only)

**Result:** PR cannot be merged if checks fail. Deployment is blocked if checks fail.

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install --save-dev husky lint-staged
```

### Step 2: Initialize Husky

```bash
npx husky install
npm pkg set scripts.prepare="husky install"
```

### Step 3: Create Pre-Commit Hook

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged (ESLint, Prettier, tests on staged files)
npx lint-staged

# Check if lint-staged passed
if [ $? -ne 0 ]; then
  echo "❌ Pre-commit checks failed. Please fix the issues above."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

Make it executable:
```bash
chmod +x .husky/pre-commit
```

### Step 4: Create Pre-Push Hook

Create `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# TypeScript type checking
echo "📘 Checking TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed"
  exit 1
fi

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ Tests failed or coverage below threshold"
  exit 1
fi

# Build check
echo "🏗️  Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ All pre-push checks passed!"
```

Make it executable:
```bash
chmod +x .husky/pre-push
```

### Step 5: Configure lint-staged in package.json

Add to your `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests --passWithNoTests"
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

### Step 6: Add Quality Check Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test:coverage && npm run test:e2e",
    "quality:check": "npm run type-check && npm run lint && npm run format:check && npm run test:coverage && npm run build",
    "quality:fix": "npm run lint:fix && npm run format",
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  }
}
```

### Step 7: Create Manifest Validation Script

Create `scripts/validate-manifest.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating PWA manifest...');

const manifestPath = path.join(__dirname, '../public/manifest.json');

// Check if manifest exists
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Manifest file not found at public/manifest.json');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error('❌ Manifest is not valid JSON:', error.message);
  process.exit(1);
}

// Required fields
const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
const missingFields = requiredFields.filter(field => !manifest[field]);

if (missingFields.length > 0) {
  console.error(`❌ Manifest validation failed. Missing required fields: ${missingFields.join(', ')}`);
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
  console.error('   PWA requires icons at 192x192 and 512x512');
  process.exit(1);
}

// Validate display mode
const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
if (!validDisplayModes.includes(manifest.display)) {
  console.error(`❌ Invalid display mode: ${manifest.display}`);
  console.error(`   Must be one of: ${validDisplayModes.join(', ')}`);
  process.exit(1);
}

// Validate start_url
if (!manifest.start_url.startsWith('/')) {
  console.error('❌ start_url must be a relative path starting with /');
  process.exit(1);
}

console.log('✅ Manifest validation passed!');
console.log(`   Name: ${manifest.name}`);
console.log(`   Short name: ${manifest.short_name}`);
console.log(`   Icons: ${manifest.icons.length} icon(s)`);
console.log(`   Display: ${manifest.display}`);
```

Make it executable:
```bash
chmod +x scripts/validate-manifest.js
```

### Step 8: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript type checking
        run: npm run type-check
      
      - name: ESLint
        run: npm run lint
      
      - name: Prettier format check
        run: npm run format:check
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_VERSION: ${{ github.sha }}
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  lighthouse-audit:
    runs-on: ubuntu-latest
    needs: quality-checks
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_VERSION: ${{ github.sha }}
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true

  deploy:
    runs-on: ubuntu-latest
    needs: [quality-checks, lighthouse-audit]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_VERSION: ${{ github.sha }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
          cname: your-custom-domain.com  # Optional: remove if not using custom domain
```

## Manual Quality Checks

### Run All Checks Locally

Before pushing, you can manually run all checks:

```bash
npm run quality:check
```

This runs:
1. TypeScript type checking
2. ESLint
3. Prettier format check
4. Tests with coverage
5. Production build

### Fix Common Issues Automatically

```bash
npm run quality:fix
```

This runs:
1. ESLint with auto-fix
2. Prettier formatting

### Individual Check Commands

```bash
# TypeScript only
npm run type-check

# Linting only
npm run lint

# Formatting check only
npm run format:check

# Apply formatting
npm run format

# Tests only
npm run test

# Tests with coverage
npm run test:coverage

# E2E tests only
npm run test:e2e

# Build only
npm run build
```

## Troubleshooting

### Pre-commit Hook Not Running

If the pre-commit hook isn't running:

```bash
# Reinstall Husky
rm -rf .husky
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### TypeScript Errors

If TypeScript is failing:

```bash
# Check for errors
npm run type-check

# Common fixes:
# 1. Ensure all dependencies are installed
npm install

# 2. Check tsconfig.json is correct
# 3. Look for any 'any' types or missing type definitions
```

### ESLint Errors

If ESLint is failing:

```bash
# See all errors
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# If errors persist, fix manually based on error messages
```

### Prettier Formatting Issues

If Prettier is failing:

```bash
# Check what needs formatting
npm run format:check

# Apply formatting
npm run format
```

### Test Failures

If tests are failing:

```bash
# Run tests in watch mode to debug
npm run test:watch

# Run tests with coverage to see what's not covered
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

### Build Failures

If build is failing:

```bash
# Try building with verbose output
npm run build

# Common issues:
# 1. TypeScript errors (run npm run type-check)
# 2. Missing dependencies (run npm install)
# 3. Environment variables not set
# 4. Import errors or circular dependencies
```

### Coverage Below Threshold

If coverage is below 80%:

```bash
# See coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/lcov-report/index.html

# Add tests for uncovered code
```

## Bypassing Hooks (Emergency Only)

In rare emergencies, you can bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

**⚠️ WARNING**: Only use `--no-verify` in true emergencies. Document why in commit message.

## Best Practices

### 1. Commit Often, Push Less Often

- Make small, frequent commits locally
- Run full quality checks before pushing
- This keeps your local history clean while ensuring pushed code is high quality

### 2. Fix Issues Immediately

- Don't ignore hook failures
- Fix issues right away while context is fresh
- Use `npm run quality:fix` for auto-fixable issues

### 3. Run Checks Before Creating PR

```bash
# Before creating PR, run full check
npm run quality:check

# If it passes, you're good to push and create PR
```

### 4. Keep Dependencies Updated

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# After updating, run full quality check
npm run quality:check
```

### 5. Monitor CI/CD Pipeline

- Watch GitHub Actions after pushing
- Fix any failures immediately
- Don't merge PRs with failing checks

## Quality Metrics Dashboard

Track these metrics over time:

- **Build Success Rate**: Target 95%+
- **Test Coverage**: Maintain 80%+
- **TypeScript Errors**: Zero tolerance
- **ESLint Warnings**: Zero tolerance
- **Lighthouse PWA Score**: 90+
- **Lighthouse Performance Score**: 90+
- **Lighthouse Accessibility Score**: 95+

## Documentation Automation

Documentation is automatically maintained through:

- **CHANGELOG**: Auto-generated from conventional commits
- **Versioning**: Synced across all files automatically
- **API Docs**: Generated from TypeScript/JSDoc comments
- **README**: Updated with each release

See [Documentation Automation Guide](./documentation-automation.md) for complete setup.

**Quick commands:**
```bash
npm run release          # Create release with auto-generated changelog
npm run docs:api         # Generate API documentation
npm run version:check    # Verify version consistency
npm run docs:update      # Update README
```

## References

- **Husky Documentation**: https://typicode.github.io/husky/
- **lint-staged Documentation**: https://github.com/okonet/lint-staged
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Documentation Automation**: `.kiro/steering/documentation-automation.md`
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`
