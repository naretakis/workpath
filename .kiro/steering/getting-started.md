# Getting Started with WorkPath

**A simplified guide for new developers**

---

## What You're Building

A simple app to track work hours for Medicaid compliance. That's it!

**Core features:**
- Log daily work/volunteer/education hours
- See monthly total
- Know if you're meeting the 80-hour requirement
- Export your data
- Works offline

---

## Tech Stack (Keep It Simple)

- **Next.js**: React framework (you'll learn as you go)
- **TypeScript**: Adds types to JavaScript (helps catch errors)
- **Material-UI**: Pre-built components (so you don't design from scratch)
- **Dexie.js**: Makes IndexedDB easier to use
- **next-pwa**: Makes your app work offline

---

## Development Setup

### Prerequisites
- Node.js 18+ installed
- A code editor (VS Code recommended)
- A browser (Chrome recommended for DevTools)

### Quick Start
```bash
# Create the project
npx create-next-app@latest workpath --typescript --app

# Go into the folder
cd workpath

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled dexie date-fns

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Coding Standards (Simplified)

### TypeScript
- Use types for function parameters and return values
- Avoid `any` - use specific types
- Let TypeScript help you catch errors

```typescript
// ✅ Good
function calculateTotal(hours: number[]): number {
  return hours.reduce((sum, h) => sum + h, 0);
}

// ❌ Bad
function calculateTotal(hours: any): any {
  return hours.reduce((sum, h) => sum + h, 0);
}
```

### Components
- Use functional components
- One component per file
- Name files with PascalCase: `Calendar.tsx`

```typescript
// ✅ Good
export function Calendar() {
  return <div>Calendar</div>;
}

// ❌ Bad
export default () => <div>Calendar</div>;
```

### Styling
- Use Material-UI's `sx` prop
- Mobile-first (design for phone, then desktop)

```typescript
<Box sx={{
  padding: 2,           // Mobile
  md: { padding: 3 }    // Desktop
}}>
```

---

## Git Workflow (Simplified)

### Commit Often
```bash
# After completing a task
git add .
git commit -m "Add calendar component"
git push
```

### Commit Messages
Keep them simple and descriptive:
- "Add calendar component"
- "Fix date calculation bug"
- "Update dashboard styling"

**Don't worry about:**
- ❌ Conventional commits
- ❌ Branch strategies
- ❌ Git hooks
- ❌ Complex workflows

Just commit when something works!

---

## Development Workflow

### 1. Read the Task
Look at `tasks.md` and pick the next task

### 2. Write the Code
- Create the file
- Write the code
- Test in browser

### 3. Test It Works
- Open browser
- Click around
- Check DevTools console for errors

### 4. Commit
```bash
git add .
git commit -m "Complete task 3.2: Build calendar"
```

### 5. Move to Next Task
Repeat!

---

## Debugging Tips

### Browser DevTools
- **Console**: See errors and logs
- **Application → IndexedDB**: See your database
- **Network**: See if service worker is working
- **Lighthouse**: Test PWA score

### Common Issues

**"Module not found"**
```bash
npm install <package-name>
```

**"Type error"**
- Read the error message
- Add the correct type
- Ask ChatGPT if stuck

**"Nothing shows up"**
- Check browser console for errors
- Check if component is imported
- Check if component is rendered

---

## Learning Resources

### When You're Stuck
1. Read the error message
2. Google the error
3. Check the docs:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Material-UI Docs](https://mui.com/)
   - [Dexie Docs](https://dexie.org/)
4. Ask ChatGPT/Claude
5. Take a break!

### Good Tutorials
- [Next.js Tutorial](https://nextjs.org/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Docs](https://react.dev/learn)

---

## What NOT to Worry About (Yet)

- ❌ Automated testing
- ❌ CI/CD pipelines
- ❌ Git hooks
- ❌ Code coverage
- ❌ Performance optimization
- ❌ Complex state management
- ❌ Documentation generation

**Focus on making it work first!**

---

## Success Checklist

You're doing great when:
- ✅ You can run `npm run dev` and see your app
- ✅ You can add a feature and see it work
- ✅ You understand most of the code you write
- ✅ You can fix simple bugs
- ✅ You commit regularly

---

## Getting Help

### Stuck on a Task?
1. Re-read the task description
2. Look at the design document
3. Check if there's example code
4. Google the specific thing you're trying to do
5. Ask for help (ChatGPT, forums, friends)

### Feeling Overwhelmed?
- Take a break
- Work on one small piece at a time
- Remember: everyone starts somewhere
- It's okay to not understand everything

---

## Next Steps

1. Read `requirements.md` to understand what you're building
2. Read `design.md` to see how it's structured
3. Start with task 1.1 in `tasks.md`
4. Build one task at a time
5. Celebrate small wins!

---

## Remember

- **Simple is better than complex**
- **Working is better than perfect**
- **Learning by doing is the best way**
- **Ask for help when stuck**
- **Have fun!**

You've got this! 🚀
