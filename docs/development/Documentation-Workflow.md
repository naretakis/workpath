# Documentation Workflow

This document provides a quick guide to maintaining documentation in the WorkPath project.

## Overview

Documentation is largely automated through:

- ✅ **CHANGELOG**: Auto-generated from commit messages
- ✅ **Versioning**: Synced across all files automatically
- ✅ **API Docs**: Generated from TypeScript/JSDoc comments
- ✅ **README**: Updated with release script

## Daily Development

### Writing Code Documentation

Add JSDoc comments to all public functions:

````typescript
/**
 * Calculates monthly compliance based on activities.
 *
 * @param activities - Array of activities for the month
 * @param month - Month to calculate (YYYY-MM format)
 * @returns Compliance result with hours and status
 *
 * @example
 * ```typescript
 * const result = calculateCompliance(activities, '2027-01');
 * console.log(result.isCompliant);
 * ```
 */
export function calculateCompliance(
  activities: Activity[],
  month: string,
): ComplianceResult {
  // Implementation
}
````

### Writing Commit Messages

Use conventional commits format for automatic changelog:

```bash
# Features (appear in changelog)
git commit -m "feat(tracking): add batch entry for activities"

# Bug fixes (appear in changelog)
git commit -m "fix(export): prevent data loss on failure"

# Documentation (appear in changelog if significant)
git commit -m "docs: update API documentation"

# Other changes (hidden from changelog)
git commit -m "chore: update dependencies"
git commit -m "refactor: simplify calculation logic"
git commit -m "test: add unit tests for compliance"
```

## Creating a Release

### Automatic Release (Recommended)

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Preview what will happen
npm run release:dry-run

# 3. Create release
npm run release

# This automatically:
# - Analyzes commits since last release
# - Determines version bump (patch/minor/major)
# - Updates package.json version
# - Generates/updates CHANGELOG.md
# - Syncs version to manifest.json
# - Updates README
# - Creates git tag
# - Commits changes
# - Pushes to remote with tags
```

### Manual Version Bump

```bash
# Bug fixes only (1.0.0 -> 1.0.1)
npm run release:patch

# New features (1.0.0 -> 1.1.0)
npm run release:minor

# Breaking changes (1.0.0 -> 2.0.0)
npm run release:major
```

## Updating Documentation

### Update README

```bash
# Manually update README from template
npm run docs:update
```

### Generate API Documentation

```bash
# Generate API docs from TypeScript/JSDoc
npm run docs:api

# Watch mode for development
npm run docs:api:watch
```

### Check Version Consistency

```bash
# Check if versions match across files
npm run version:check

# Sync versions if they don't match
npm run version:sync
```

## What Gets Updated Automatically

### On Every Release

1. **package.json** - Version number
2. **CHANGELOG.md** - Generated from commits
3. **public/manifest.json** - PWA version
4. **README.md** - Version badges
5. **Git tags** - Semantic version tag

### On Every Commit (via hooks)

1. **Commit message** - Validated for conventional format
2. **Code comments** - Checked by linter

### On Demand

1. **API Documentation** - Run `npm run docs:api`
2. **README** - Run `npm run docs:update`

## Documentation Checklist

### Before Every Commit

- [ ] Added JSDoc comments for new public functions
- [ ] Added inline comments for complex logic
- [ ] Commit message follows conventional format

### Before Every Release

- [ ] Run `npm run release:dry-run` to preview
- [ ] Verify CHANGELOG looks correct
- [ ] Check version bump is appropriate
- [ ] Ensure README is current
- [ ] All documentation links work

### Monthly/Quarterly

- [ ] Review and update README
- [ ] Update architecture docs
- [ ] Review steering documents
- [ ] Update troubleshooting guide
- [ ] Generate fresh API docs

## Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

**Appear in CHANGELOG:**

- `feat`: New features
- `fix`: Bug fixes
- `perf`: Performance improvements
- `docs`: Documentation (if significant)

**Hidden from CHANGELOG:**

- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Scopes

Use these to categorize changes:

- `onboarding`, `exemptions`, `tracking`, `documents`
- `export`, `import`, `settings`
- `db`, `ui`, `a11y`, `pwa`
- `sw`, `cache`, `offline`, `sync`, `perf`

### Examples

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

```
docs(api): update compliance calculation documentation

Add examples and clarify edge cases for compliance calculations.
```

## Troubleshooting

### CHANGELOG not generating

```bash
# Check commits follow conventional format
git log --oneline

# Verify commitlint is working
npx commitlint --from HEAD~1 --to HEAD --verbose

# Try dry run
npm run release:dry-run
```

### Version mismatch

```bash
# Check versions
npm run version:check

# Sync versions
npm run version:sync

# Verify
npm run version:check
```

### README not updating

```bash
# Update manually
npm run docs:update

# Check template exists
ls docs/templates/README.template.md
```

### API docs not generating

```bash
# Check TypeDoc is installed
npm list typedoc

# Generate with verbose output
npx typedoc --logLevel Verbose
```

## Best Practices

1. **Write JSDoc as you code** - Don't leave it for later
2. **Use conventional commits** - Required for automatic changelog
3. **Preview releases** - Always run dry-run first
4. **Keep README current** - Update with major features
5. **Link documentation** - Cross-reference related docs
6. **Review CHANGELOG** - Before finalizing release
7. **Version consistently** - Use release scripts, not manual edits

## Quick Commands Reference

```bash
# Documentation
npm run docs:api         # Generate API docs
npm run docs:update      # Update README
npm run version:check    # Check version consistency
npm run version:sync     # Sync versions

# Releases
npm run release          # Auto release
npm run release:patch    # Patch release (1.0.0 -> 1.0.1)
npm run release:minor    # Minor release (1.0.0 -> 1.1.0)
npm run release:major    # Major release (1.0.0 -> 2.0.0)
npm run release:dry-run  # Preview release
```

## References

- **Documentation Automation**: `../../.kiro/steering/documentation-automation.md`
- **Git Workflow**: `../../.kiro/steering/git-workflow.md`
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Semantic Versioning**: https://semver.org/
- **Keep a Changelog**: https://keepachangelog.com/

---

**Remember**: Good documentation is written as you code, not after! 📝
