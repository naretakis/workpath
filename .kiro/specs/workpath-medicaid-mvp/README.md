# HourKeep MVP Spec

This directory contains the **simplified MVP specification** for HourKeep, designed for a new developer learning to build PWAs.

---

## What's Here

### Active Spec (Simplified)

- **requirements.md** - 7 core requirements (instead of 15)
- **design.md** - Simplified architecture and design
- **tasks.md** - ~25 realistic tasks (instead of 116)

### Archived Full Spec

- **archive-full-version/** - Complete enterprise-grade spec with all features

---

## The Simplification

### What We Kept

✅ Activity tracking (log hours)  
✅ Monthly calculations (80-hour requirement)  
✅ Data export (JSON)  
✅ PWA basics (offline, installable)  
✅ Simple profile setup

### What We Removed (For Now)

❌ Exemption screening questionnaire  
❌ Document photo capture  
❌ Income tracking with pay periods  
❌ Hardship reporting  
❌ Data import  
❌ Markdown reports  
❌ Complex state management  
❌ Automated testing infrastructure  
❌ CI/CD pipelines  
❌ Git hooks and quality gates

---

## Why Simplify?

The original spec was **enterprise-grade** with:

- 15 comprehensive requirements
- 116 detailed tasks
- Extensive quality automation
- Complex git workflows
- Documentation automation
- 3-6 months of full-time work

**For a new developer**, this was overwhelming and would lead to:

- Analysis paralysis
- Fighting with tooling instead of learning
- Never finishing the project
- Burnout

The simplified spec is:

- **Achievable**: 4-8 weeks part-time
- **Educational**: Learn by building, not configuring
- **Practical**: Get something working end-to-end
- **Expandable**: Can add features later

---

## How to Use This Spec

### 1. Start Here

Read the files in this order:

1. `requirements.md` - Understand what you're building
2. `design.md` - See how it's structured
3. `tasks.md` - Follow the implementation plan

### 2. Follow the Tasks

- Do tasks in order (they build on each other)
- One task at a time
- Test as you go
- Commit when it works

### 3. After MVP is Done

Once you have a working app, you can:

- Add features from `archive-full-version/`
- Refactor and improve code
- Add testing and CI/CD
- Learn advanced patterns

---

## Estimated Timeline

**Part-time (10 hours/week):**

- Phase 1 (Setup): Week 1
- Phase 2 (Profile): Week 1-2
- Phase 3 (Tracking): Week 2-4
- Phase 4 (Dashboard): Week 4-5
- Phase 5 (Settings): Week 5-6
- Phase 6 (PWA): Week 6-8
- Phase 7 (Polish): Week 8

**Total: 4-8 weeks**

**Full-time (40 hours/week):**

- 1-2 weeks

---

## Success Criteria

You're done when:

- ✅ You can log hours for any day
- ✅ You can see your monthly total
- ✅ You know if you're meeting the 80-hour requirement
- ✅ You can edit/delete entries
- ✅ You can export your data
- ✅ It works offline
- ✅ You can install it on your phone
- ✅ **You understand the code you wrote**

---

## Future Enhancements

See `archive-full-version/` for the complete feature set:

**Phase 2 (After MVP):**

- Exemption screening questionnaire
- Income tracking
- Better date navigation

**Phase 3:**

- Document photo capture
- Markdown report export
- Data import

**Phase 4:**

- Hardship reporting
- Compliance predictions
- Multi-user support

---

## Learning Goals

By building this MVP, you'll learn:

- ✅ Next.js App Router
- ✅ TypeScript basics
- ✅ Material-UI components
- ✅ IndexedDB with Dexie
- ✅ PWA fundamentals
- ✅ Responsive design
- ✅ React hooks

---

## Getting Help

### Stuck on Something?

1. Check `.kiro/steering/getting-started.md`
2. Read the design document
3. Google the specific error
4. Ask ChatGPT/Claude
5. Take a break!

### Want to Add Features?

Look at `archive-full-version/requirements.md` for ideas, but finish the MVP first!

---

## Philosophy

> "A simple app that works is better than a complex app that doesn't."

This spec prioritizes:

- **Learning** over best practices
- **Working** over perfect
- **Simple** over complex
- **Done** over comprehensive

You can always refactor and improve later!

---

## Questions?

If you're unsure about something:

1. Read the requirements
2. Check the design
3. Look at the task description
4. Ask for clarification

Remember: It's okay to not know everything. That's why you're learning!

---

**Now go build something! 🚀**
