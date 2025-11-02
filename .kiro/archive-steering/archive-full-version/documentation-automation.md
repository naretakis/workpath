---
inclusion: always
---

# Documentation Automation Guide

This document provides a comprehensive guide to automating documentation updates, including README, CHANGELOG, versioning, and API documentation.

## Overview

Documentation automation ensures that:

- ✅ CHANGELOG is updated with every release
- ✅ Version numbers are consistent across all files
- ✅ README reflects current features and setup
- ✅ API documentation is generated from code
- ✅ Component documentation is up to date
- ✅ Breaking changes are documented

## Automated Documentation Tools

### 1. Semantic Versioning with Conventional Commits

Use conventional commits to automatically determine version bumps and generate changelogs.

**Install dependencies:**

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
npm install --save-dev standard-version
```

**Configure commitlint (`.commitlintrc.json`):**

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert"
      ]
    ],
    "scope-enum": [
      2,
      "always",
      [
        "onboarding",
        "exemptions",
        "tracking",
        "documents",
        "export",
        "import",
        "settings",
        "db",
        "ui",
        "a11y",
        "pwa",
        "sw",
        "cache",
        "offline",
        "sync",
        "perf"
      ]
    ]
  }
}
```

**Add commit-msg hook (`.husky/commit-msg`):**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

Make it executable:

```bash
chmod +x .husky/commit-msg
```

### 2. Automatic CHANGELOG Generation

**Configure standard-version (`.versionrc.json`):**

```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "revert", "section": "Reverts" },
    { "type": "docs", "section": "Documentation", "hidden": false },
    { "type": "style", "section": "Styles", "hidden": true },
    { "type": "chore", "section": "Miscellaneous Chores", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring", "hidden": true },
    { "type": "test", "section": "Tests", "hidden": true }
  ],
  "commitUrlFormat": "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
  "compareUrlFormat": "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
  "issueUrlFormat": "{{host}}/{{owner}}/{{repository}}/issues/{{id}}",
  "userUrlFormat": "{{host}}/{{user}}",
  "releaseCommitMessageFormat": "chore(release): {{currentTag}}",
  "issuePrefixes": ["#"],
  "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n"
}
```

**Add scripts to package.json:**

```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch",
    "release:dry-run": "standard-version --dry-run"
  }
}
```

**Usage:**

```bash
# Automatic version bump based on commits
npm run release

# Specific version bump
npm run release:patch   # 1.0.0 -> 1.0.1
npm run release:minor   # 1.0.0 -> 1.1.0
npm run release:major   # 1.0.0 -> 2.0.0

# Preview what would happen
npm run release:dry-run
```

### 3. API Documentation with TypeDoc

**Install TypeDoc:**

```bash
npm install --save-dev typedoc
```

**Configure TypeDoc (`typedoc.json`):**

```json
{
  "entryPoints": ["src"],
  "entryPointStrategy": "expand",
  "out": "docs/api",
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "**/node_modules/**"],
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "README.md",
  "name": "WorkPath API Documentation",
  "includeVersion": true,
  "sort": ["source-order"],
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": ["Components", "Hooks", "Utilities", "Types", "*"],
  "plugin": ["typedoc-plugin-markdown"]
}
```

**Add scripts to package.json:**

```json
{
  "scripts": {
    "docs:api": "typedoc",
    "docs:api:watch": "typedoc --watch"
  }
}
```

**Usage:**

```bash
# Generate API documentation
npm run docs:api

# Watch mode for development
npm run docs:api:watch
```

### 4. Component Documentation with Storybook (Optional)

For visual component documentation:

**Install Storybook:**

```bash
npx storybook@latest init
```

**Add scripts (automatically added by Storybook):**

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### 5. README Automation

**Create README template (`docs/templates/README.template.md`):**

```markdown
# WorkPath

> Medicaid Work Requirements Compliance Assistant

[![Build Status](https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}/workflows/Deploy/badge.svg)](https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}/actions)
[![Coverage](https://codecov.io/gh/{{REPO_OWNER}}/{{REPO_NAME}}/branch/main/graph/badge.svg)](https://codecov.io/gh/{{REPO_OWNER}}/{{REPO_NAME}})
[![Version](https://img.shields.io/github/package-json/v/{{REPO_OWNER}}/{{REPO_NAME}})](https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}/releases)
[![License](https://img.shields.io/github/license/{{REPO_OWNER}}/{{REPO_NAME}})](LICENSE)

## Overview

WorkPath is a Progressive Web Application (PWA) that helps Medicaid beneficiaries track and document their work requirements compliance under HR1 legislation.

## Features

{{FEATURES}}

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

\`\`\`bash

# Clone the repository

git clone https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}.git
cd {{REPO_NAME}}

# Install dependencies

npm install

# Setup Git hooks

npx husky install

# Start development server

npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development

### Available Commands

\`\`\`bash

# Development

npm run dev # Start dev server
npm run build # Production build
npm run start # Start production server

# Quality Checks

npm run quality:check # Run all checks
npm run quality:fix # Auto-fix issues
npm run type-check # TypeScript check
npm run lint # ESLint check
npm run test:coverage # Tests with coverage

# Documentation

npm run docs:api # Generate API docs
npm run release # Create new release
\`\`\`

### Project Structure

\`\`\`
{{PROJECT_STRUCTURE}}
\`\`\`

## Testing

\`\`\`bash

# Run all tests

npm test

# Run tests in watch mode

npm run test:watch

# Run tests with coverage

npm run test:coverage

# Run E2E tests

npm run test:e2e
\`\`\`

## Deployment

The application automatically deploys to GitHub Pages when changes are merged to the main branch.

### Manual Deployment

\`\`\`bash

# Build for production

npm run build

# Deploy to GitHub Pages

npm run deploy
\`\`\`

## Documentation

- **[Development Guide](docs/development/README.md)** - Complete development documentation
- **[API Documentation](docs/api/README.md)** - Generated API documentation
- **[Quality Automation](/.kiro/steering/quality-automation.md)** - Automated quality checks
- **[Git Workflow](/.kiro/steering/git-workflow.md)** - Branching and commit conventions

## Contributing

1. Read the [Development Standards](/.kiro/steering/development-standards.md)
2. Follow the [Git Workflow](/.kiro/steering/git-workflow.md)
3. Ensure all quality checks pass
4. Create a pull request

## Versioning

We use [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

{{LICENSE}}

## Support

For questions or issues:

- Create an [issue](https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}/issues)
- Check the [documentation](docs/)
- Review [troubleshooting guide](docs/development/Troubleshooting-Guide.md)

---

Built with ❤️ using Next.js, TypeScript, and Material-UI
```

**Create README update script (`scripts/update-readme.js`):**

```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("📝 Updating README...");

// Read package.json for version and repo info
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
);

// Read template
const template = fs.readFileSync(
  path.join(__dirname, "../docs/templates/README.template.md"),
  "utf8",
);

// Extract repo info from package.json
const repoUrl = packageJson.repository?.url || "";
const repoMatch = repoUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
const repoOwner = repoMatch ? repoMatch[1] : "your-org";
const repoName = repoMatch ? repoMatch[2] : "workpath";

// Generate features list from package.json keywords or default
const features = packageJson.keywords
  ? packageJson.keywords
      .map((k) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}`)
      .join("\n")
  : `- Track work, volunteer, education, and work program activities
- Screen for exemptions from work requirements
- Calculate monthly compliance automatically
- Export data for agency submission
- Works completely offline
- Privacy-first: all data stored locally`;

// Generate project structure
const projectStructure = `workpath/
├── .github/workflows/     # CI/CD pipelines
├── .kiro/steering/        # Development guidelines
├── docs/                  # Documentation
├── public/                # Static assets and PWA files
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── theme/            # Material-UI theme
│   └── types/            # TypeScript types
└── tests/                # Test files`;

// Replace placeholders
let readme = template
  .replace(/\{\{REPO_OWNER\}\}/g, repoOwner)
  .replace(/\{\{REPO_NAME\}\}/g, repoName)
  .replace(/\{\{FEATURES\}\}/g, features)
  .replace(/\{\{PROJECT_STRUCTURE\}\}/g, projectStructure)
  .replace(/\{\{LICENSE\}\}/g, packageJson.license || "MIT");

// Write README
fs.writeFileSync(path.join(__dirname, "../README.md"), readme);

console.log("✅ README updated successfully!");
console.log(`   Version: ${packageJson.version}`);
console.log(`   Repository: ${repoOwner}/${repoName}`);
```

Make it executable:

```bash
chmod +x scripts/update-readme.js
```

### 6. Version Consistency Check

**Create version check script (`scripts/check-version-consistency.js`):**

```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔍 Checking version consistency...");

// Read package.json version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
);
const packageVersion = packageJson.version;

// Files that should contain version
const versionFiles = [
  {
    path: "public/manifest.json",
    extract: (content) => JSON.parse(content).version,
  },
  {
    path: "README.md",
    extract: (content) => {
      const match = content.match(/Version.*?(\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    },
  },
];

let hasError = false;

for (const file of versionFiles) {
  const filePath = path.join(__dirname, "..", file.path);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${file.path}`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const version = file.extract(content);

  if (version !== packageVersion) {
    console.error(`❌ Version mismatch in ${file.path}`);
    console.error(`   Expected: ${packageVersion}`);
    console.error(`   Found: ${version || "not found"}`);
    hasError = true;
  } else {
    console.log(`✅ ${file.path}: ${version}`);
  }
}

if (hasError) {
  console.error("\n❌ Version consistency check failed!");
  console.error("   Run: npm run version:sync");
  process.exit(1);
}

console.log("\n✅ All versions are consistent!");
```

**Create version sync script (`scripts/sync-versions.js`):**

```javascript
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔄 Syncing versions...");

// Read package.json version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
);
const version = packageJson.version;

console.log(`   Target version: ${version}`);

// Update manifest.json
const manifestPath = path.join(__dirname, "../public/manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.version = version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`✅ Updated public/manifest.json`);
}

// Update README.md (if it has version badge)
const readmePath = path.join(__dirname, "../README.md");
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, "utf8");
  readme = readme.replace(/Version.*?\d+\.\d+\.\d+/g, `Version ${version}`);
  fs.writeFileSync(readmePath, readme);
  console.log(`✅ Updated README.md`);
}

console.log("\n✅ Version sync complete!");
```

Make them executable:

```bash
chmod +x scripts/check-version-consistency.js
chmod +x scripts/sync-versions.js
```

## Integration with Quality Gates

### Add to package.json scripts:

```json
{
  "scripts": {
    "docs:api": "typedoc",
    "docs:update": "node scripts/update-readme.js",
    "version:check": "node scripts/check-version-consistency.js",
    "version:sync": "node scripts/sync-versions.js",
    "release": "standard-version && npm run version:sync && npm run docs:update",
    "release:minor": "standard-version --release-as minor && npm run version:sync && npm run docs:update",
    "release:major": "standard-version --release-as major && npm run version:sync && npm run docs:update",
    "release:patch": "standard-version --release-as patch && npm run version:sync && npm run docs:update",
    "release:dry-run": "standard-version --dry-run",
    "postrelease": "git push --follow-tags origin main"
  }
}
```

### Add to pre-push hook (`.husky/pre-push`):

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

# Version consistency check
echo "📋 Checking version consistency..."
npm run version:check
if [ $? -ne 0 ]; then
  echo "❌ Version consistency check failed"
  exit 1
fi

echo "✅ All pre-push checks passed!"
```

## Release Workflow

### Creating a Release

```bash
# 1. Ensure you're on main branch and up to date
git checkout main
git pull origin main

# 2. Preview what will happen
npm run release:dry-run

# 3. Create release (automatic version bump based on commits)
npm run release

# This will:
# - Analyze commits since last release
# - Determine version bump (patch/minor/major)
# - Update version in package.json
# - Generate/update CHANGELOG.md
# - Create git tag
# - Sync versions across all files
# - Update README
# - Commit changes
# - Push to remote (including tags)

# 4. GitHub Actions will automatically:
# - Run all quality checks
# - Build the application
# - Deploy to GitHub Pages
# - Create GitHub Release with changelog
```

### Manual Version Bump

```bash
# Patch release (1.0.0 -> 1.0.1) - Bug fixes
npm run release:patch

# Minor release (1.0.0 -> 1.1.0) - New features
npm run release:minor

# Major release (1.0.0 -> 2.0.0) - Breaking changes
npm run release:major
```

### What Gets Updated Automatically

1. **package.json** - Version number
2. **CHANGELOG.md** - Generated from commit messages
3. **public/manifest.json** - PWA version
4. **README.md** - Version badges and info
5. **Git tags** - Semantic version tag
6. **GitHub Release** - Created automatically by CI/CD

## Documentation Checklist

### Before Every Commit

- [ ] Code has JSDoc comments for public APIs
- [ ] Complex logic has inline comments
- [ ] Commit message follows conventional commits format

### Before Every Release

- [ ] Run `npm run release:dry-run` to preview
- [ ] Verify CHANGELOG looks correct
- [ ] Check that version bump is appropriate
- [ ] Ensure README is up to date
- [ ] Verify all documentation links work

### Quarterly (or as needed)

- [ ] Review and update README
- [ ] Update architecture documentation
- [ ] Review and update steering documents
- [ ] Update troubleshooting guide with new issues
- [ ] Generate fresh API documentation

## Documentation Standards

### JSDoc Comments

All public functions, classes, and interfaces must have JSDoc comments:

````typescript
/**
 * Calculates monthly compliance based on activities and exemptions.
 *
 * @param activities - Array of activities for the month
 * @param exemptions - Array of active exemptions
 * @param month - Month to calculate (YYYY-MM format)
 * @returns Compliance result with hours, income, and status
 *
 * @example
 * ```typescript
 * const result = calculateMonthlyCompliance(
 *   activities,
 *   exemptions,
 *   '2027-01'
 * );
 * console.log(result.isCompliant); // true or false
 * ```
 */
export function calculateMonthlyCompliance(
  activities: Activity[],
  exemptions: Exemption[],
  month: string,
): ComplianceResult {
  // Implementation
}
````

### Component Documentation

React components should have prop documentation:

````typescript
/**
 * Displays monthly compliance status with visual indicators.
 *
 * @component
 * @example
 * ```tsx
 * <ComplianceDashboard
 *   totalHours={85}
 *   requiredHours={80}
 *   onViewDetails={() => navigate('/details')}
 * />
 * ```
 */
export interface ComplianceDashboardProps {
  /** Total hours logged for the month */
  totalHours: number;
  /** Required hours to be compliant (typically 80) */
  requiredHours: number;
  /** Callback when user clicks to view details */
  onViewDetails: () => void;
}

export function ComplianceDashboard({
  totalHours,
  requiredHours,
  onViewDetails,
}: ComplianceDashboardProps): JSX.Element {
  // Implementation
}
````

### Commit Message Format

Follow conventional commits for automatic changelog generation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types that appear in CHANGELOG:**

- `feat`: New features
- `fix`: Bug fixes
- `perf`: Performance improvements
- `docs`: Documentation changes (if significant)

**Types hidden from CHANGELOG:**

- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

**Examples:**

```
feat(tracking): add batch activity entry

Implement multi-date picker and batch entry form for logging
activities across multiple dates at once.

Closes #123
```

```
fix(export): prevent data loss on export failure

Add error handling and retry logic to ensure data is not lost
if export fails midway through.

Fixes #456
```

## Automated Documentation in CI/CD

### Add to GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml

jobs:
  documentation:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate API documentation
        run: npm run docs:api

      - name: Check version consistency
        run: npm run version:check

      - name: Deploy documentation
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          destination_dir: docs
```

## Troubleshooting

### CHANGELOG not generating

```bash
# Ensure commits follow conventional format
git log --oneline

# Check commitlint configuration
cat .commitlintrc.json

# Try dry run to see what would happen
npm run release:dry-run
```

### Version mismatch errors

```bash
# Check current versions
npm run version:check

# Sync all versions
npm run version:sync

# Verify sync worked
npm run version:check
```

### README not updating

```bash
# Manually update README
npm run docs:update

# Check template exists
ls docs/templates/README.template.md

# Verify script is executable
chmod +x scripts/update-readme.js
```

## Best Practices

1. **Commit often with good messages** - Enables automatic changelog generation
2. **Use conventional commits** - Required for automatic versioning
3. **Document as you code** - JSDoc comments while writing functions
4. **Review CHANGELOG before release** - Ensure it's accurate and complete
5. **Keep README current** - Update when adding major features
6. **Version consistently** - Use release scripts, not manual edits
7. **Link documentation** - Cross-reference related docs

## References

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Semantic Versioning**: https://semver.org/
- **Keep a Changelog**: https://keepachangelog.com/
- **TypeDoc**: https://typedoc.org/
- **standard-version**: https://github.com/conventional-changelog/standard-version
- **commitlint**: https://commitlint.js.org/
