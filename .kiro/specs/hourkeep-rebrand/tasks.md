# Implementation Plan: HourKeep Rebrand

**Complete Application Rebrand from WorkPath to HourKeep**

---

This implementation plan breaks down the rebrand into discrete, sequential tasks. Each task is focused on a specific category of files to ensure nothing is missed.

---

## Tasks

- [x] 1. Update core application code files
  - Update database class name and instance in `src/lib/db.ts`
  - Update onboarding welcome message in `src/app/onboarding/page.tsx`
  - Update package name in `package.json`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update configuration files
  - Update basePath and comments in `next.config.ts`
  - Update basePath in `scripts/update-manifest.js`
  - _Requirements: 3.1, 3.2, 7.1, 7.2_

- [x] 3. Update PWA manifest
  - Update app name, short name, and description in `public/manifest.json`
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Update primary branding document
  - Update all references in `BRANDING.md` including app name, tagline, description, disclaimers, and privacy statement
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Update steering documentation
  - Update references in `.kiro/steering/medicaid-domain-knowledge.md`
  - Update project name and commands in `.kiro/steering/getting-started.md`
  - _Requirements: 4.4, 4.5_

- [x] 6. Update spec documentation
  - Update references in `.kiro/specs/workpath-medicaid-mvp/` files (design.md, requirements.md, README.md)
  - Update references in `.kiro/specs/workpath-enhanced-onboarding/` files
  - Update references in `.kiro/specs/workpath-exemption-screening/` files
  - Update references in `.kiro/specs/workpath-document-management/` files (if exists)
  - _Requirements: 4.4, 4.5_

- [x] 7. Test application locally
  - Run `npm run dev` and verify app starts without errors
  - Check database initialization creates HourKeepDB
  - Verify onboarding screen shows "Welcome to HourKeep"
  - Test all core features (add activity, view calendar, export)
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. Test build process
  - Run `npm run build` and verify it succeeds
  - Check that manifest is correctly updated in build output
  - Verify no build errors or warnings related to the rebrand
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9. Commit changes locally
  - Stage all changed files
  - Commit with message: "Rebrand: WorkPath → HourKeep"
  - Do NOT push yet
  - _Requirements: All code requirements_

- [ ] 10. Rename GitHub repository
  - Go to repository Settings → General → Repository name
  - Change from "workpath" to "hourkeep"
  - Click "Rename" button
  - Update repository description and about section
  - _Requirements: 5.1, 5.2_

- [ ] 11. Push changes and deploy
  - Push committed changes to GitHub
  - Wait for GitHub Actions deployment to complete
  - Deployment will now go to new URL path
  - _Requirements: 5.3_

- [ ] 12. Verify deployment
  - Visit new URL: `https://username.github.io/hourkeep/`
  - Test PWA installation from deployed site
  - Verify all routes work on deployed site
  - _Requirements: 5.3, 2.4_

- [ ] 13. Final verification
  - Install PWA and verify it shows "HourKeep" name
  - Test offline functionality
  - Verify all features work in production
  - Check for any console errors
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

---

## Notes

### Task Execution Order

Tasks must be executed in order because:

- Tasks 1-6 are code/documentation changes
- Task 7-8 verify changes work locally
- Task 9 commits changes locally (but doesn't push)
- Task 10 renames repository BEFORE pushing
- Task 11 pushes changes (triggers deployment to new URL)
- Task 12-13 verify production deployment

**Why rename before pushing?** The code has `basePath: "/hourkeep"` but if the repo is still named "workpath", the deployment will fail or go to the wrong URL. Renaming first ensures the deployment goes to the correct path.

### Archive Files

Do NOT update files in these directories:

- `.kiro/archive-specs/`
- `.kiro/archive-steering/`

These represent historical snapshots and should remain unchanged.

### Testing Focus

Pay special attention to:

- Database initialization (new name)
- PWA manifest (user-facing name)
- Build process (basePath changes)
- Deployment URL (GitHub Pages path)

### Rollback

If issues arise:

```bash
# Rollback code changes
git revert <commit-hash>
git push

# Rollback repository name
# Go to Settings → Rename back to "workpath"
```

---

## Success Checklist

After completing all tasks, verify:

- [ ] App runs locally without errors
- [ ] Database is named "HourKeepDB"
- [ ] Onboarding shows "Welcome to HourKeep"
- [ ] PWA manifest has correct branding
- [ ] Build succeeds without errors
- [ ] GitHub repository is renamed
- [ ] Deployment works at new URL
- [ ] PWA installation shows "HourKeep"
- [ ] All features work in production
- [ ] No "WorkPath" references in active code

---

## Estimated Time

- Tasks 1-6 (Code/docs): 30 minutes
- Tasks 7-8 (Local testing): 15 minutes
- Task 9 (Commit locally): 2 minutes
- Task 10 (Rename repo): 5 minutes
- Task 11 (Push/deploy): 3 minutes
- Tasks 12-13 (Verify deployment): 10 minutes

**Total: ~1 hour**
