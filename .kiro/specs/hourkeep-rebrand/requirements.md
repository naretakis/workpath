# Requirements Document: HourKeep Rebrand

**Rebrand WorkPath to HourKeep**

---

## Introduction

This specification covers the complete rebranding of the application from "WorkPath" to "HourKeep" with updated tagline and description. The rebrand includes updating all code references, configuration files, documentation, GitHub repository settings, and deployment URLs to ensure consistency across the entire project.

**New Branding:**
- **App Name:** HourKeep
- **Tagline:** Keep Your Hours, Keep Your Coverage
- **Description:** Keep track of your work, volunteer, and school hours in one simple place. When it's time, share them with your agency to keep your coverage and benefits.

**Key Principles:**
- Complete and thorough - no references to "WorkPath" should remain
- Maintain all existing functionality - this is purely a branding change
- Update deployment URLs to reflect new name
- Preserve git history and existing issues/PRs where possible

---

## Glossary

- **WorkPath**: The current application name being replaced
- **HourKeep**: The new application name
- **Rebrand**: The process of changing all references from old name to new name
- **basePath**: Next.js configuration for GitHub Pages deployment URL
- **PWA Manifest**: Progressive Web App configuration file defining app metadata
- **Database Name**: IndexedDB database identifier used by Dexie.js

---

## Requirements

### Requirement 1: Update Core Application Files

**User Story:** As a developer, I want all code files to reference "HourKeep" instead of "WorkPath", so that the codebase is consistent with the new brand.

#### Acceptance Criteria

1. WHEN the database class is instantiated, THE System SHALL use "HourKeepDB" as the database name
2. WHEN the onboarding page is rendered, THE System SHALL display "Welcome to HourKeep" in the heading
3. WHEN package.json is read, THE System SHALL show "hourkeep" as the package name
4. WHERE code comments reference the application name, THE System SHALL use "HourKeep"

### Requirement 2: Update PWA Configuration

**User Story:** As a user installing the PWA, I want to see "HourKeep" as the app name, so that I know what app I'm installing.

#### Acceptance Criteria

1. WHEN the PWA manifest is loaded, THE System SHALL display "HourKeep - Keep Your Hours, Keep Your Coverage" as the full name
2. WHEN the PWA manifest is loaded, THE System SHALL display "HourKeep" as the short name
3. WHEN the PWA manifest is loaded, THE System SHALL display the new description text
4. WHEN a user adds the app to their home screen, THE System SHALL show "HourKeep" as the app name

### Requirement 3: Update Deployment Configuration

**User Story:** As a developer, I want the GitHub Pages URL to reflect the new name, so that the deployment URL is consistent with the brand.

#### Acceptance Criteria

1. WHEN Next.js builds for production, THE System SHALL use "/hourkeep" as the basePath
2. WHEN the app is deployed to GitHub Pages, THE System SHALL be accessible at the new URL path
3. WHEN next.config.ts is read, THE System SHALL reference "hourkeep" in comments and configuration

### Requirement 4: Update Documentation Files

**User Story:** As a developer or contributor, I want all documentation to reference "HourKeep", so that I understand the current project name.

#### Acceptance Criteria

1. WHEN BRANDING.md is read, THE System SHALL display "HourKeep" as the app name throughout
2. WHEN BRANDING.md is read, THE System SHALL display "Keep Your Hours, Keep Your Coverage" as the tagline
3. WHEN BRANDING.md is read, THE System SHALL display the new description
4. WHEN spec files are read, THE System SHALL reference "HourKeep" in titles and content where appropriate
5. WHEN steering files are read, THE System SHALL reference "HourKeep" in examples and descriptions

### Requirement 5: Update GitHub Repository Settings

**User Story:** As a project maintainer, I want the GitHub repository to reflect the new name, so that external users see consistent branding.

#### Acceptance Criteria

1. WHEN the repository settings are updated, THE Repository SHALL have "hourkeep" as the repository name
2. WHEN the repository is viewed, THE Repository SHALL display the new description
3. WHEN GitHub Pages is configured, THE Repository SHALL deploy to the new URL path
4. WHEN the repository About section is viewed, THE Repository SHALL show the new tagline

### Requirement 6: Preserve Existing Functionality

**User Story:** As a user of the application, I want all features to continue working after the rebrand, so that my experience is not disrupted.

#### Acceptance Criteria

1. WHEN the rebrand is complete, THE System SHALL maintain all existing user data in IndexedDB
2. WHEN the rebrand is complete, THE System SHALL preserve all feature functionality
3. WHEN the rebrand is complete, THE System SHALL maintain the same user interface and experience
4. WHEN existing users access the app, THE System SHALL continue to work without requiring data migration

### Requirement 7: Update Build and Deployment Scripts

**User Story:** As a developer, I want build scripts to reference the new name, so that generated files are correctly named.

#### Acceptance Criteria

1. WHEN build scripts execute, THE System SHALL generate files with "hourkeep" references where appropriate
2. WHEN the manifest update script runs, THE System SHALL correctly update the HourKeep manifest
3. WHEN deployment workflows run, THE System SHALL deploy to the correct GitHub Pages path

---

## Out of Scope

The following items are explicitly out of scope for this rebrand:

- **Icon/Logo Changes**: Visual assets (icons, logos) will retain current design
- **Feature Changes**: No new features or functionality changes
- **Data Migration**: No changes to database schema or data structure
- **UI/UX Changes**: No changes to user interface or user experience
- **Color Scheme**: Brand colors remain unchanged
- **Typography**: Font choices remain unchanged
- **GitHub Issues/PRs**: Existing issues and pull requests will not be updated (too disruptive)
- **Git History Rewriting**: Commit history will not be rewritten to change "WorkPath" references

---

## Notes

### Database Naming Consideration

The database name will change from "WorkPathDB" to "HourKeepDB". Since the app is still in MVP phase with no active users, no data migration is needed.

### GitHub Repository Rename

Renaming the GitHub repository will:
- ✅ Automatically redirect old URLs to new URLs
- ✅ Preserve all issues, PRs, and history
- ✅ Update clone URLs
- ⚠️ Require users to update their local git remotes
- ⚠️ Break any hardcoded links to the old URL

### Deployment URL Change

Changing from `/workpath` to `/hourkeep` means:
- Old bookmarks will break (users need to update)
- Search engines will need to re-index
- Any shared links will need updating

**Recommendation:** Consider adding a redirect from old URL to new URL if possible, or at minimum, document the URL change clearly.

---

## Success Criteria

The rebrand is complete when:

1. ✅ All code files reference "HourKeep" or "hourkeep" appropriately
2. ✅ All documentation files are updated
3. ✅ PWA manifest shows new branding
4. ✅ GitHub repository is renamed
5. ✅ GitHub Pages deploys to new URL
6. ✅ All existing features work correctly
7. ✅ No "WorkPath" references remain in active code (archive folders excluded)
8. ✅ Build and deployment succeed without errors
9. ✅ PWA installation shows correct name
10. ✅ Database migration (if implemented) works correctly
