# PWA Bootstrap Guide: From eAPD-Next to New Project

This document provides a comprehensive guide for bootstrapping a new Progressive Web Application (PWA).

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Kiro Integration and Development Workflow](#kiro-integration-and-development-workflow)
5. [Documentation Structure](#documentation-structure)
6. [Testing Strategy (From Day One)](#testing-strategy-from-day-one)
7. [Build and Deployment Pipeline](#build-and-deployment-pipeline)
8. [Development Standards and Best Practices](#development-standards-and-best-practices)
9. [Quality Assurance and Automation](#quality-assurance-and-automation)
10. [Step-by-Step Bootstrap Process](#step-by-step-bootstrap-process)

## Project Overview

### Core Concept

This new PWA will leverage a guided, multi-step user experience with stepper-like functionality, local-first data storage, and comprehensive validation. The application will guide users through a series of pages to complete a complex workflow.

### Key Similarities to eAPD-Next

- **Guided Multi-Step Experience**: Users progress through structured steps with clear navigation
- **Local-First Architecture**: All data stored locally using IndexedDB, no server dependencies
- **Progressive Web App**: Offline-capable, installable PWA
- **Material-UI Design System**: Consistent, accessible UI components
- **Real-time Validation**: Immediate feedback and error prevention
- **Auto-save Functionality**: Continuous data protection
- **Export Capabilities**: Multiple output formats for completed workflows

### Key Differences

- **No Rich Text Editing**: Simplified without Milkdown or complex text editing
- **Domain-Specific Workflow**: Tailored to new business domain
- **Testing-First Approach**: Comprehensive test coverage from project inception
- **Build-Error Prevention**: Automated quality gates to prevent deployment failures

## Technology Stack

### Core Technologies

```json
{
  "framework": "Next.js 14+ (App Router)",
  "ui_library": "React 18+",
  "language": "TypeScript (strict mode)",
  "ui_framework": "Material-UI (MUI) v5+",
  "styling": "Emotion (MUI's CSS-in-JS)",
  "data_storage": "IndexedDB (via Dexie.js)",
  "testing": "Jest + React Testing Library + Playwright",
  "linting": "ESLint + Prettier",
  "type_checking": "TypeScript strict mode",
  "deployment": "GitHub Pages via GitHub Actions",
  "pwa": "Next.js PWA plugin"
}
```

### Development Tools

```json
{
  "package_manager": "npm",
  "git_hooks": "Husky + lint-staged",
  "code_quality": "ESLint + Prettier + TypeScript",
  "testing_coverage": "Jest coverage reports (80% minimum)",
  "ci_cd": "GitHub Actions",
  "development_ai": "Kiro AI Assistant"
}
```

## Project Structure

### Directory Layout

```
[PROJECT_NAME]/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions deployment
├── .kiro/
│   └── steering/
│       ├── development-standards.md   # Development guidelines
│       ├── material-ui-guidelines.md  # UI component standards
│       ├── git-workflow.md           # Git and deployment process
│       └── [domain]-knowledge.md     # Domain-specific knowledge
├── docs/
│   ├── domain/                       # Business domain knowledge
│   ├── design/                       # UX and design guidelines
│   ├── testing/                      # Testing strategies and procedures
│   ├── development/                  # Development process documentation
│   └── tasks/                        # Task-specific guides
├── public/
│   ├── icons/                        # PWA icons
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── [workflow]/              # Workflow pages
│   ├── components/                   # Reusable UI components
│   │   ├── common/                  # Generic components
│   │   ├── forms/                   # Form-specific components
│   │   └── layout/                  # Layout components
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Utility libraries
│   │   ├── storage/                 # IndexedDB operations
│   │   ├── validation/              # Form validation
│   │   └── export/                  # Data export utilities
│   ├── theme/                        # Material-UI theme configuration
│   └── types/                        # TypeScript type definitions
├── tests/
│   ├── __mocks__/                   # Test mocks
│   ├── components/                  # Component tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests (Playwright)
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── jest.config.js                   # Jest test configuration
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── playwright.config.ts             # Playwright E2E configuration
├── tsconfig.json                    # TypeScript configuration
├── CHANGELOG.md                     # Version history
└── README.md                        # Project documentation
```

## Kiro Integration and Development Workflow

### Kiro Steering Documents Setup

#### 1. Domain Knowledge Document Template

Create `.kiro/steering/[domain]-knowledge.md`:

```markdown
# [Domain] Knowledge for [Project Name] Development

## [Domain] Overview

### What is [Core Concept]?

[Detailed explanation of the business domain]

### [Domain] Types and Purposes

[Different categories or types within the domain]

### Core [Domain] Concepts

[Key concepts developers need to understand]

## Regulatory/Business Context

[Any regulations, standards, or business rules that apply]

## User Pain Points

[Common problems users face that the application solves]

## Workflow Structure

[Description of the multi-step process users will follow]

## Data Management Requirements

[How data should be structured and stored]

## Integration Requirements

[Any external systems or data sources]

## Development Considerations

[Technical implementation guidance specific to this domain]
```

#### 2. Kiro Spec Templates

Create example specs in `docs/development/kiro-spec-templates/`:

**Feature Spec Template:**

```markdown
# Feature Spec: [Feature Name]

## Overview

Brief description of the feature and its purpose within the workflow.

## User Story

As a [user type], I want to [action] so that [benefit].

## Requirements

### Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2

### Technical Requirements

- [ ] TypeScript interfaces defined
- [ ] Material-UI components used
- [ ] IndexedDB storage implemented
- [ ] Validation rules applied
- [ ] Tests written (unit + integration)

## Design Specifications

### UI Components

- Component 1: [Description]
- Component 2: [Description]

### Data Flow

[How data moves through the component]

### Validation Rules

[What validation is required]

## Testing Requirements

### Unit Tests

- [ ] Component rendering
- [ ] User interactions
- [ ] Validation logic
- [ ] Data operations

### Integration Tests

- [ ] Workflow integration
- [ ] Data persistence
- [ ] Navigation flow

## Implementation Notes

[Any specific technical considerations]

## Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2
```

#### 3. Kiro Development Best Practices

**Using Kiro Throughout Development:**

1. **Project Planning Phase**
   - Use Kiro to create initial project structure
   - Generate component specifications
   - Plan testing strategy

2. **Feature Development Phase**
   - Create Kiro specs for each feature
   - Use Kiro to implement components with tests
   - Leverage Kiro for code review and optimization

3. **Quality Assurance Phase**
   - Use Kiro to identify and fix build issues
   - Generate comprehensive test suites
   - Optimize performance and accessibility

**Kiro Hooks for Quality Assurance:**

Create `.kiro/hooks/` directory with:

```markdown
# Pre-Commit Quality Check Hook

**Trigger**: Before each commit
**Purpose**: Ensure code quality and prevent build failures

**Actions**:

1. Run TypeScript type checking
2. Execute ESLint with auto-fix
3. Run Prettier formatting
4. Execute relevant tests
5. Check test coverage thresholds
6. Validate component accessibility

**Configuration**: Automatically runs via Husky pre-commit hook
```

## Documentation Structure

### Core Documentation Files

#### README.md Structure

```markdown
# [Project Name]

Brief description of the project and its purpose.

## Features

- Feature 1
- Feature 2

## Getting Started

### Prerequisites

### Installation

### Development

## Usage

### Basic Workflow

### Advanced Features

## Contributing

### Development Process

### Code Standards

### Testing Requirements

## Deployment

### GitHub Pages Setup

### CI/CD Pipeline

## License
```

#### CHANGELOG.md Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - YYYY-MM-DD

### Added

- Initial release
- Core workflow functionality
- PWA capabilities

### Changed

- N/A

### Fixed

- N/A

### Security

- N/A
```

### Documentation Directory Structure

```
docs/
├── domain/
│   ├── About-[Project].md           # Project overview
│   ├── [Domain]-101.md              # Basic domain education
│   ├── Glossary-of-Terms.md         # Domain terminology
│   └── User-Workflows.md            # User journey documentation
├── design/
│   ├── UX-Principles.md             # User experience guidelines
│   ├── Content-Guide.md             # Writing and style guidelines
│   └── Design-Evolution.md          # Design decision history
├── testing/
│   ├── Testing-Strategy.md          # Overall testing approach
│   ├── Component-Testing.md         # Component test guidelines
│   ├── Integration-Testing.md       # Integration test procedures
│   └── E2E-Testing.md              # End-to-end test procedures
├── development/
│   ├── Architecture-Decisions.md    # ADR documentation
│   ├── Development-Process.md       # Internal development docs
│   ├── Kiro-Integration.md         # Kiro usage guidelines
│   └── kiro-spec-templates/        # Kiro spec templates
└── tasks/
    └── [specific-integration-guides] # Task-specific documentation
```

## Testing Strategy (From Day One)

### Testing Philosophy

- **Test-Driven Development**: Write tests before or alongside implementation
- **Comprehensive Coverage**: Minimum 80% code coverage maintained
- **Quality Gates**: Automated testing prevents deployment of broken code
- **Accessibility Testing**: Built-in accessibility validation

### Testing Layers

#### 1. Unit Tests (Jest + React Testing Library)

```typescript
// Example component test structure
describe("ComponentName", () => {
  it("should render with default props", () => {
    // Test implementation
  });

  it("should handle user interactions correctly", () => {
    // Test implementation
  });

  it("should validate form inputs properly", () => {
    // Test implementation
  });

  it("should be accessible to screen readers", () => {
    // Accessibility test
  });
});
```

#### 2. Integration Tests

```typescript
// Example integration test
describe("Workflow Integration", () => {
  it("should complete full user workflow", () => {
    // Multi-component integration test
  });

  it("should persist data correctly", () => {
    // IndexedDB integration test
  });
});
```

#### 3. End-to-End Tests (Playwright)

```typescript
// Example E2E test
test("complete workflow end-to-end", async ({ page }) => {
  // Full user journey test
});
```

### Testing Configuration

#### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

#### Test Scripts (`package.json`)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

## Build and Deployment Pipeline

### GitHub Actions Configuration

#### Deployment Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_VERSION: ${{ github.sha }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

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
```

### Build Error Prevention

#### Pre-commit Hooks (Husky + lint-staged)

**`.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
npm run test:coverage
```

**`package.json` lint-staged configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

#### Quality Gates Script

Create `scripts/quality-check.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require("child_process");

const checks = [
  { name: "Type Check", command: "npm run type-check" },
  { name: "Linting", command: "npm run lint" },
  { name: "Tests", command: "npm run test:coverage" },
  { name: "Build", command: "npm run build" },
];

for (const check of checks) {
  console.log(`Running ${check.name}...`);
  try {
    execSync(check.command, { stdio: "inherit" });
    console.log(`✅ ${check.name} passed`);
  } catch (error) {
    console.error(`❌ ${check.name} failed`);
    process.exit(1);
  }
}

console.log("🎉 All quality checks passed!");
```

## Development Standards and Best Practices

### Code Quality Standards

- **TypeScript Strict Mode**: All strict flags enabled
- **Component Standards**: Functional components with proper TypeScript interfaces
- **Accessibility**: WCAG 2.1 AA compliance required
- **Performance**: Components render in <100ms
- **Testing**: 80% minimum code coverage

### Material-UI Integration

- **Component Selection**: Use appropriate MUI components for each use case
- **Theme Consistency**: Follow established theme patterns
- **Responsive Design**: Mobile-first approach with breakpoint usage
- **Accessibility**: Proper ARIA labels and semantic HTML

### Git Workflow

- **Branch Strategy**: Feature branches from main, direct merge to main
- **Commit Messages**: Conventional commit format
- **Code Review**: Required for all changes
- **Automated Deployment**: Main branch auto-deploys to production

## Quality Assurance and Automation

### Automated Quality Checks

#### 1. Pre-commit Validation

- TypeScript compilation
- ESLint with auto-fix
- Prettier formatting
- Related test execution
- Coverage threshold validation

#### 2. CI/CD Pipeline Validation

- Full test suite execution
- Build verification
- E2E test validation
- Deployment verification

#### 3. Kiro Hook Integration

**Build Error Prevention Hook:**

```markdown
# Build Error Prevention Hook

**Trigger**: On file save in development
**Purpose**: Catch and fix build errors immediately

**Actions**:

1. Run TypeScript check on changed files
2. Auto-fix ESLint issues
3. Run related tests
4. Display build status in IDE
5. Suggest fixes for common issues

**Benefits**:

- Prevents accumulation of build errors
- Reduces deployment failures
- Maintains development velocity
```

### Testing Automation

#### Continuous Testing Strategy

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:test": "concurrently \"npm run dev\" \"npm run test:watch\"",
    "quality:check": "node scripts/quality-check.js",
    "quality:fix": "npm run lint:fix && npm run format && npm run test:update"
  }
}
```

## Step-by-Step Bootstrap Process

### Phase 1: Project Initialization

1. **Create New Repository**

   ```bash
   mkdir [project-name]
   cd [project-name]
   git init
   ```

2. **Setup Next.js with TypeScript**

   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
   ```

3. **Install Core Dependencies**
   ```bash
   npm install @mui/material @emotion/react @emotion/styled
   npm install @mui/icons-material @mui/x-date-pickers
   npm install dexie react-hook-form
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   npm install --save-dev playwright @playwright/test
   npm install --save-dev husky lint-staged
   ```

### Phase 2: Project Structure Setup

4. **Create Directory Structure**

   ```bash
   mkdir -p .kiro/steering docs/{domain,design,testing,development,tasks}
   mkdir -p src/{components/{common,forms,layout},hooks,lib/{storage,validation,export},theme,types}
   mkdir -p tests/{__mocks__,components,integration,e2e}
   ```

5. **Copy Configuration Files**
   - Copy all configuration files from eAPD-Next
   - Update project-specific settings
   - Modify package.json scripts and dependencies

### Phase 3: Kiro Integration

6. **Setup Kiro Steering Documents**
   - Copy and adapt development standards
   - Copy Material-UI guidelines
   - Copy git workflow documentation
   - Create domain-specific knowledge document

7. **Create Kiro Spec Templates**
   - Setup feature spec templates
   - Create component spec templates
   - Document Kiro best practices

### Phase 4: Core Implementation

8. **Implement Base Components**
   - Layout components
   - Navigation components
   - Form components
   - Common UI components

9. **Setup Data Layer**
   - IndexedDB schema
   - Storage utilities
   - Data validation
   - Export functionality

### Phase 5: Testing Infrastructure

10. **Implement Testing Framework**
    - Jest configuration
    - React Testing Library setup
    - Playwright E2E setup
    - Coverage reporting

11. **Create Test Templates**
    - Component test templates
    - Integration test templates
    - E2E test templates

### Phase 6: Quality Assurance

12. **Setup Quality Gates**
    - Husky pre-commit hooks
    - GitHub Actions workflow
    - Quality check scripts
    - Build error prevention

13. **Configure Deployment**
    - GitHub Pages setup
    - Environment configuration
    - Version management
    - Changelog automation

### Phase 7: Documentation

14. **Create Documentation**
    - README.md
    - CHANGELOG.md
    - Domain documentation
    - Development guides

15. **Setup Kiro Hooks**
    - Quality assurance hooks
    - Build error prevention
    - Testing automation

## Success Metrics

### Quality Metrics

- **Test Coverage**: Maintain 80%+ coverage
- **Build Success Rate**: 95%+ successful deployments
- **Code Quality**: Zero ESLint errors, consistent Prettier formatting
- **Performance**: <100ms component render times
- **Accessibility**: WCAG 2.1 AA compliance

### Development Velocity Metrics

- **Feature Delivery**: Consistent sprint velocity
- **Bug Rate**: <5% post-deployment bugs
- **Technical Debt**: Minimal accumulation through quality gates
- **Developer Experience**: Reduced time spent on build fixes

## Conclusion

This bootstrap guide provides a comprehensive foundation for creating a new PWA. By following this guide and implementing quality gates from day one, the new project will maintain high code quality and development velocity throughout its lifecycle.

The integration with Kiro AI assistant ensures that development best practices are consistently applied, and the automated quality checks prevent the accumulation of technical debt that can slow down future development.
