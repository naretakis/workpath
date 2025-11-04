# Design Document: HourKeep Rebrand

**Complete Application Rebrand from WorkPath to HourKeep**

---

## Overview

This design document outlines the systematic approach to rebranding the application from "WorkPath" to "HourKeep". The rebrand is a comprehensive find-and-replace operation across code, configuration, documentation, and deployment infrastructure, while maintaining all existing functionality.

**New Branding:**
- **App Name:** HourKeep
- **Tagline:** Keep Your Hours, Keep Your Coverage
- **Description:** Keep track of your work, volunteer, and school hours in one simple place. When it's time, share them with your agency to keep your coverage and benefits.

**Design Principles:**
- Systematic and thorough - use search to find all references
- Non-breaking - maintain all functionality
- Simple - this is a text replacement operation, not a refactor
- Documented - track what was changed and why

---

## Architecture

### Rebrand Scope

The rebrand touches four main areas:

1. **Source Code** - TypeScript/JavaScript files
2. **Configuration Files** - JSON, TypeScript config files
3. **Documentation** - Markdown files
4. **External Systems** - GitHub repository, deployment URLs

### File Categories

#### Category 1: Active Code Files (MUST UPDATE)
Files that are actively used by the application:

- `src/lib/db.ts` - Database class and instance
- `src/app/onboarding/page.tsx` - Welcome screen
- `package.json` - Package name
- `next.config.ts` - Base path and comments
- `public/manifest.json` - PWA manifest
- `scripts/update-manifest.js` - Build script

#### Category 2: Documentation Files (MUST UPDATE)
Files that document the project:

- `BRANDING.md` - Primary branding document
- `.kiro/steering/medicaid-domain-knowledge.md` - Domain knowledge references
- `.kiro/steering/getting-started.md` - Getting started guide
- `.kiro/specs/*/design.md` - Spec design documents
- `.kiro/specs/*/requirements.md` - Spec requirements documents
- `.kiro/specs/*/tasks.md` - Spec task lists
- `.kiro/specs/*/README.md` - Spec readme files

#### Category 3: Archive Files (SKIP)
Files in archive directories that preserve historical context:

- `.kiro/archive-specs/**/*` - Archived specifications
- `.kiro/archive-steering/**/*` - Archived steering documents

**Decision:** Do NOT update archive files. They represent historical snapshots and should remain unchanged.

---

## Components and Changes

### 1. Database Layer (`src/lib/db.ts`)

**Current State:**
```typescript
class WorkPathDB extends Dexie {
  constructor() {
    super("WorkPathDB");
  }
}

export const db = new WorkPathDB();
```

**New State:**
```typescript
class HourKeepDB extends Dexie {
  constructor() {
    super("HourKeepDB");
  }
}

export const db = new HourKeepDB();
```

**Changes:**
- Class name: `WorkPathDB` → `HourKeepDB`
- Database name: `"WorkPathDB"` → `"HourKeepDB"`

**Impact:**
- Creates a new IndexedDB database
- Old database remains but is unused
- No data migration needed (MVP phase, no active users)

---

### 2. Onboarding Screen (`src/app/onboarding/page.tsx`)

**Current State:**
```typescript
<Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
  Welcome to WorkPath
</Typography>
```

**New State:**
```typescript
<Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
  Welcome to HourKeep
</Typography>
```

**Changes:**
- Heading text: `"Welcome to WorkPath"` → `"Welcome to HourKeep"`

---

### 3. Package Configuration (`package.json`)

**Current State:**
```json
{
  "name": "workpath",
  "version": "2.0.0"
}
```

**New State:**
```json
{
  "name": "hourkeep",
  "version": "2.0.0"
}
```

**Changes:**
- Package name: `"workpath"` → `"hourkeep"`

**Note:** Version number stays the same - this is a rebrand, not a new version.

---

### 4. Next.js Configuration (`next.config.ts`)

**Current State:**
```typescript
// In production, access at https://username.github.io/workpath/
basePath: process.env.NODE_ENV === "production" ? "/workpath" : "",
```

**New State:**
```typescript
// In production, access at https://username.github.io/hourkeep/
basePath: process.env.NODE_ENV === "production" ? "/hourkeep" : "",
```

**Changes:**
- Comment: `workpath` → `hourkeep`
- basePath: `"/workpath"` → `"/hourkeep"`

**Impact:**
- Production URL changes from `/workpath/` to `/hourkeep/`
- Development URL unchanged (localhost:3000)

---

### 5. PWA Manifest (`public/manifest.json`)

**Current State:**
```json
{
  "name": "WorkPath - Work Requirements Assistant",
  "short_name": "WorkPath",
  "description": "Track your work hours to maintain your Medicaid benefits"
}
```

**New State:**
```json
{
  "name": "HourKeep - Keep Your Hours, Keep Your Coverage",
  "short_name": "HourKeep",
  "description": "Keep track of your work, volunteer, and school hours in one simple place. When it's time, share them with your agency to keep your coverage and benefits."
}
```

**Changes:**
- Full name: Updated to include new tagline
- Short name: `"WorkPath"` → `"HourKeep"`
- Description: Updated to new description

**Impact:**
- PWA installation shows new name
- Home screen icon shows "HourKeep"
- App switcher shows new name

---

### 6. Build Scripts (`scripts/update-manifest.js`)

**Current State:**
```javascript
const basePath = isProduction ? "/workpath" : "";
```

**New State:**
```javascript
const basePath = isProduction ? "/hourkeep" : "";
```

**Changes:**
- basePath: `"/workpath"` → `"/hourkeep"`

---

### 7. Branding Document (`BRANDING.md`)

**Current State:**
```markdown
# WorkPath - Branding Guide

**App Name:** WorkPath
**Tagline:** Your Hours, Your Way
**Description:** Keep track of your work, volunteer, and school hours in one simple place
```

**New State:**
```markdown
# HourKeep - Branding Guide

**App Name:** HourKeep
**Tagline:** Keep Your Hours, Keep Your Coverage
**Description:** Keep track of your work, volunteer, and school hours in one simple place. When it's time, share them with your agency to keep your coverage and benefits.
```

**Changes:**
- Document title: `WorkPath` → `HourKeep`
- App name: `WorkPath` → `HourKeep`
- Tagline: Updated to new tagline
- Description: Updated to new description
- All references in disclaimers and statements

---

### 8. Documentation Files

**Steering Documents:**
- `.kiro/steering/medicaid-domain-knowledge.md` - Update references to "WorkPath application" → "HourKeep application"
- `.kiro/steering/getting-started.md` - Update project name and commands

**Spec Documents:**
- Update spec titles where they reference "WorkPath"
- Update design documents that show database class names
- Update any UI mockups or examples

**Approach:**
- Search for "WorkPath" in each file
- Replace with "HourKeep" where it refers to the application name
- Keep "WorkPath" in historical context (e.g., "previously called WorkPath")

---

## GitHub Repository Changes

### Repository Settings

**Changes Required:**
1. **Repository Name:** `workpath` → `hourkeep`
2. **Description:** Update to new tagline
3. **About Section:** Update to new description
4. **Topics/Tags:** Update if they reference the old name

**How to Change:**
1. Go to repository Settings
2. Under "General" → "Repository name"
3. Change to `hourkeep`
4. Click "Rename"

**Impact:**
- Old URLs automatically redirect to new URLs
- Clone URLs change (users need to update remotes)
- GitHub Pages URL changes

### GitHub Pages Configuration

**Current URL:** `https://username.github.io/workpath/`
**New URL:** `https://username.github.io/hourkeep/`

**Changes Required:**
1. Repository rename automatically updates GitHub Pages path
2. Verify deployment workflow still works
3. Update any documentation that references the URL

---

## Deployment Strategy

### Phase 1: Code Changes
1. Update all source code files
2. Update configuration files
3. Update documentation files
4. Commit changes with message: "Rebrand: WorkPath → HourKeep"

### Phase 2: Testing
1. Run `npm run dev` - verify app works locally
2. Check database initialization (new HourKeepDB)
3. Check onboarding screen shows "Welcome to HourKeep"
4. Check PWA manifest is correct
5. Run `npm run build` - verify build succeeds

### Phase 3: Repository Changes
1. Push code changes to GitHub
2. Rename repository in GitHub settings
3. Update local git remote (if needed)
4. Verify GitHub Pages deployment

### Phase 4: Verification
1. Visit new GitHub Pages URL
2. Test PWA installation
3. Verify all features work
4. Check for any broken links or references

---

## Search and Replace Strategy

### Systematic Approach

**Step 1: Find All References**
```bash
# Search for "WorkPath" (case-sensitive)
grep -r "WorkPath" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.kiro/archive-specs --exclude-dir=.kiro/archive-steering

# Search for "workpath" (lowercase)
grep -r "workpath" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.kiro/archive-specs --exclude-dir=.kiro/archive-steering
```

**Step 2: Categorize Files**
- Active code: MUST update
- Documentation: MUST update
- Archives: SKIP
- node_modules: SKIP (auto-generated)

**Step 3: Replace Systematically**
- Use IDE find-and-replace with file filters
- Review each change before applying
- Test after each category of changes

### Replacement Rules

| Find | Replace | Context |
|------|---------|---------|
| `WorkPath` | `HourKeep` | App name in text |
| `workpath` | `hourkeep` | URLs, package names, paths |
| `WorkPathDB` | `HourKeepDB` | Database class name |
| `"WorkPathDB"` | `"HourKeepDB"` | Database instance name |
| `/workpath` | `/hourkeep` | URL paths |

---

## Testing Strategy

### Manual Testing Checklist

**Development Environment:**
- [ ] App runs with `npm run dev`
- [ ] No console errors on startup
- [ ] Database initializes correctly
- [ ] Onboarding screen shows "Welcome to HourKeep"
- [ ] All pages load correctly
- [ ] All features work (add activity, view calendar, etc.)

**Build Process:**
- [ ] `npm run build` succeeds without errors
- [ ] Build output is in `out/` directory
- [ ] Manifest file is correctly updated
- [ ] Service worker is generated

**PWA Installation:**
- [ ] PWA install prompt shows "HourKeep"
- [ ] Installed app shows "HourKeep" name
- [ ] App icon shows correctly
- [ ] Offline functionality works

**Deployment:**
- [ ] GitHub Pages deploys successfully
- [ ] New URL is accessible
- [ ] All routes work on deployed site
- [ ] PWA works on deployed site

---

## Rollback Plan

If issues arise, rollback is straightforward:

**Code Rollback:**
```bash
git revert <commit-hash>
git push
```

**Repository Name Rollback:**
1. Go to repository Settings
2. Rename back to `workpath`
3. Update basePath in next.config.ts
4. Redeploy

**Note:** GitHub automatically maintains redirects from old URLs, so rollback is low-risk.

---

## Documentation Updates

### Files to Update

**Primary Documentation:**
- `BRANDING.md` - Complete update with new branding
- `README.md` - Update if it exists and references the name

**Steering Documents:**
- `.kiro/steering/medicaid-domain-knowledge.md` - Update application references
- `.kiro/steering/getting-started.md` - Update project name and commands

**Spec Documents:**
- `.kiro/specs/workpath-medicaid-mvp/` - Update references
- `.kiro/specs/workpath-enhanced-onboarding/` - Update references
- `.kiro/specs/workpath-exemption-screening/` - Update references
- `.kiro/specs/workpath-document-management/` - Update references

**Note:** Spec directory names can stay as-is (e.g., `workpath-medicaid-mvp`) since they're internal identifiers. Only update content within the files.

---

## Success Criteria

The rebrand is complete and successful when:

1. ✅ All active code files reference "HourKeep"
2. ✅ Database class is named "HourKeepDB"
3. ✅ PWA manifest shows "HourKeep" branding
4. ✅ Onboarding screen says "Welcome to HourKeep"
5. ✅ Package.json has "hourkeep" as name
6. ✅ Next.js basePath is "/hourkeep"
7. ✅ GitHub repository is renamed to "hourkeep"
8. ✅ GitHub Pages deploys to new URL
9. ✅ All documentation is updated
10. ✅ App builds and runs without errors
11. ✅ All features work correctly
12. ✅ PWA installation shows correct name
13. ✅ No "WorkPath" references in active code (archives excluded)

---

## Risk Assessment

### Low Risk
- Code changes (simple text replacement)
- Documentation updates (no functional impact)
- Package.json name (internal identifier)

### Medium Risk
- Database name change (creates new database, but no users affected)
- GitHub repository rename (redirects work, but users need to update remotes)

### Mitigation
- Test thoroughly in development before deploying
- Document the URL change for any existing users
- Keep git history intact for reference

---

## Timeline Estimate

- **Code Changes:** 30 minutes
- **Testing:** 15 minutes
- **Repository Rename:** 5 minutes
- **Deployment Verification:** 10 minutes

**Total:** ~1 hour

---

## Notes

### Why This is Simple

This rebrand is straightforward because:
- No architectural changes
- No feature changes
- No data migration needed
- No UI/UX changes
- Just text replacement

### What Makes It Thorough

Despite being simple, it must be thorough:
- Every reference must be found and updated
- Documentation must be consistent
- External systems must be updated
- Testing must verify nothing broke

### Archive Files

Archive directories (`.kiro/archive-specs/`, `.kiro/archive-steering/`) are intentionally NOT updated. They represent historical snapshots and should remain unchanged for reference.
