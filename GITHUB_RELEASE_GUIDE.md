# How to Create a GitHub Release

This guide will walk you through creating your first GitHub Release for WorkPath v2.0.0.

---

## Step-by-Step Instructions

### 1. Navigate to Your Repository
Go to: https://github.com/naretakis/workpath

### 2. Click on "Releases"
- Look in the right sidebar
- You'll see a section called "Releases"
- Click on "Releases" or "Create a new release"

### 3. Click "Draft a new release"
- This button is usually in the top right
- Or click "Create a new release" if this is your first one

### 4. Fill in the Release Form

#### Tag Version
- **Tag:** `v2.0.0`
- **Target:** `main` (should be selected by default)
- The tag already exists, so GitHub will recognize it

#### Release Title
```
v2.0.0 - Document Management 📸
```

#### Release Description
Copy and paste the contents from `RELEASE_NOTES_v2.0.0.md` into the description box.

The file contains:
- What's new section
- Why it matters
- Technical highlights
- Installation instructions
- And more!

### 5. Optional: Add Assets
You can attach files to the release (though not necessary for a web app):
- Build artifacts
- Documentation PDFs
- Screenshots

GitHub automatically includes:
- Source code (zip)
- Source code (tar.gz)

### 6. Set Release Options

#### Checkboxes:
- ✅ **Set as the latest release** - Check this!
- ⬜ **Set as a pre-release** - Leave unchecked (this is a stable release)
- ⬜ **Create a discussion for this release** - Optional, but recommended!

### 7. Preview (Optional)
Click the "Preview" tab to see how your release will look.

### 8. Publish Release
Click the green **"Publish release"** button at the bottom.

---

## What Happens After Publishing?

1. **Release Page Created** - Your release will appear at:
   `https://github.com/naretakis/workpath/releases/tag/v2.0.0`

2. **Latest Release Badge** - The release will be marked as "Latest"

3. **Notifications** - Anyone watching your repository will be notified

4. **Changelog Link** - GitHub will show the comparison link between versions

---

## Tips for Future Releases

### Good Release Titles
- ✅ `v2.0.0 - Document Management 📸`
- ✅ `v3.0.0 - Exemption Screening ✓`
- ❌ `Release 2.0.0`
- ❌ `New version`

### Good Release Descriptions
- Start with a summary of what's new
- Use emojis to make it scannable
- Include "Why this matters" section
- List technical highlights
- Provide installation instructions
- Link to documentation
- Include "What's next" section

### Release Checklist
Before publishing, make sure:
- [ ] Tag is pushed to GitHub
- [ ] CHANGELOG.md is updated
- [ ] README.md reflects new features
- [ ] Version in package.json is updated
- [ ] All tests pass
- [ ] Documentation is current

---

## Editing a Release

If you need to edit after publishing:
1. Go to the release page
2. Click "Edit release" button
3. Make your changes
4. Click "Update release"

---

## Deleting a Release

If you need to delete (rare):
1. Go to the release page
2. Click "Delete" button
3. Confirm deletion
4. Note: This doesn't delete the git tag

---

## Example Release URLs

After publishing, your release will be at:
- **Release page:** `https://github.com/naretakis/workpath/releases/tag/v2.0.0`
- **All releases:** `https://github.com/naretakis/workpath/releases`
- **Latest release:** `https://github.com/naretakis/workpath/releases/latest`

---

## Screenshots

### Where to Find Releases
```
GitHub Repo → Right Sidebar → Releases
```

### Release Form
```
Tag: v2.0.0
Target: main
Title: v2.0.0 - Document Management 📸
Description: [Paste from RELEASE_NOTES_v2.0.0.md]
☑ Set as the latest release
☐ Set as a pre-release
```

---

## Need Help?

- **GitHub Docs:** https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- **Example Release:** Look at other popular repos for inspiration

---

## Quick Reference

**Your release details:**
- **Tag:** `v2.0.0` (already created and pushed)
- **Title:** `v2.0.0 - Document Management 📸`
- **Description:** Copy from `RELEASE_NOTES_v2.0.0.md`
- **Target:** `main` branch
- **Type:** Latest release (not pre-release)

**Ready to publish!** 🚀
