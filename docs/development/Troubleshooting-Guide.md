# Troubleshooting Guide for New Developers

This guide helps you solve common issues when working with automated quality checks.

## Table of Contents

1. [Understanding Error Messages](#understanding-error-messages)
2. [Common Issues and Solutions](#common-issues-and-solutions)
3. [Step-by-Step Debugging](#step-by-step-debugging)
4. [Getting Unstuck](#getting-unstuck)

## Understanding Error Messages

### Reading Hook Failure Messages

When a Git hook fails, you'll see output like this:

```
🔍 Running pre-commit checks...
❌ Pre-commit checks failed. Please fix the issues above.
```

**What to do**: Scroll up to see the actual error messages above this line.

### Common Error Patterns

#### TypeScript Errors

```
src/components/MyComponent.tsx:15:7 - error TS2322: Type 'string' is not assignable to type 'number'.
```

**Translation**: On line 15, column 7 of MyComponent.tsx, you're trying to use a string where a number is expected.

#### ESLint Errors

```
/src/components/MyComponent.tsx
  15:7  error  'myVariable' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Translation**: On line 15, you declared a variable but never used it.

#### Test Failures

```
FAIL src/components/MyComponent.test.tsx
  ● MyComponent › should render correctly
    expect(received).toBe(expected)
    Expected: "Hello"
    Received: "Goodbye"
```

**Translation**: Your test expected "Hello" but got "Goodbye".

## Common Issues and Solutions

### Issue 1: "Cannot commit - ESLint errors"

**Symptoms**:

```
❌ Pre-commit checks failed
   ESLint found errors
```

**Solution**:

```bash
# Step 1: See what's wrong
npm run lint

# Step 2: Auto-fix what can be fixed
npm run lint:fix

# Step 3: Manually fix remaining issues
# (ESLint will tell you what needs fixing)

# Step 4: Try committing again
git add .
git commit -m "your message"
```

**Common ESLint issues**:

1. **Unused variables**

   ```typescript
   // ❌ Bad
   const myVar = "hello"; // Declared but never used

   // ✅ Good - Remove it
   // (or use it somewhere)
   ```

2. **Missing dependencies in useEffect**

   ```typescript
   // ❌ Bad
   useEffect(() => {
     doSomething(myProp);
   }, []); // Missing myProp in dependencies

   // ✅ Good
   useEffect(() => {
     doSomething(myProp);
   }, [myProp]);
   ```

3. **Console.log statements**

   ```typescript
   // ❌ Bad (in production code)
   console.log("debug info");

   // ✅ Good - Remove or use proper logging
   // (or add eslint-disable comment if needed for debugging)
   ```

### Issue 2: "Cannot commit - Prettier formatting"

**Symptoms**:

```
❌ Pre-commit checks failed
   Prettier found formatting issues
```

**Solution**:

```bash
# Auto-format all files
npm run format

# Try committing again
git add .
git commit -m "your message"
```

**Note**: Prettier usually auto-formats during pre-commit, so this is rare. If it happens, just run the format command.

### Issue 3: "Cannot push - TypeScript errors"

**Symptoms**:

```
❌ TypeScript check failed
   Found 3 errors
```

**Solution**:

```bash
# Step 1: See all TypeScript errors
npm run type-check

# Step 2: Fix each error
# Common fixes below

# Step 3: Verify it's fixed
npm run type-check

# Step 4: Commit and push
git add .
git commit -m "fix: resolve type errors"
git push
```

**Common TypeScript issues**:

1. **Type mismatch**

   ```typescript
   // ❌ Bad
   const age: number = "25"; // String assigned to number

   // ✅ Good
   const age: number = 25;
   ```

2. **Missing type annotation**

   ```typescript
   // ❌ Bad
   function greet(name) {
     // Parameter 'name' implicitly has 'any' type
     return `Hello ${name}`;
   }

   // ✅ Good
   function greet(name: string): string {
     return `Hello ${name}`;
   }
   ```

3. **Possibly undefined**

   ```typescript
   // ❌ Bad
   const user = users.find((u) => u.id === id);
   console.log(user.name); // user might be undefined

   // ✅ Good
   const user = users.find((u) => u.id === id);
   if (user) {
     console.log(user.name);
   }
   // Or use optional chaining
   console.log(user?.name);
   ```

4. **Missing return type**

   ```typescript
   // ❌ Bad
   function calculateTotal(items) {
     // Missing types
     return items.reduce((sum, item) => sum + item.price, 0);
   }

   // ✅ Good
   interface Item {
     price: number;
   }

   function calculateTotal(items: Item[]): number {
     return items.reduce((sum, item) => sum + item.price, 0);
   }
   ```

### Issue 4: "Cannot push - Tests failing"

**Symptoms**:

```
❌ Tests failed or coverage below threshold
   3 tests failed
   Coverage: 75% (threshold: 80%)
```

**Solution**:

```bash
# Step 1: Run tests to see failures
npm run test

# Step 2: Run in watch mode to debug
npm run test:watch

# Step 3: Fix failing tests

# Step 4: Check coverage
npm run test:coverage

# Step 5: Add tests if coverage is low

# Step 6: Commit and push
git add .
git commit -m "test: fix failing tests and improve coverage"
git push
```

**Common test issues**:

1. **Test expects wrong value**

   ```typescript
   // ❌ Test is wrong
   expect(result).toBe("Hello"); // But code returns 'Hi'

   // ✅ Fix the test or the code
   expect(result).toBe("Hi"); // If code is correct
   // OR fix the code to return 'Hello'
   ```

2. **Async test not waiting**

   ```typescript
   // ❌ Bad - Not waiting for async operation
   it("should fetch data", () => {
     fetchData();
     expect(data).toBeDefined(); // Runs before fetch completes
   });

   // ✅ Good - Wait for async operation
   it("should fetch data", async () => {
     await fetchData();
     expect(data).toBeDefined();
   });
   ```

3. **Missing test coverage**

   ```bash
   # See what's not covered
   npm run test:coverage
   open coverage/lcov-report/index.html

   # Write tests for uncovered lines
   ```

### Issue 5: "Cannot push - Build failing"

**Symptoms**:

```
❌ Build failed
   Module not found: Can't resolve '@/components/MyComponent'
```

**Solution**:

```bash
# Step 1: Try building locally
npm run build

# Step 2: Common fixes:

# Fix 1: Missing import
# Check if file exists and path is correct

# Fix 2: Circular dependency
# Check if two files import each other

# Fix 3: Missing dependency
npm install

# Fix 4: TypeScript errors
npm run type-check

# Step 3: Try building again
npm run build

# Step 4: If successful, commit and push
git add .
git commit -m "fix: resolve build errors"
git push
```

### Issue 6: "Hooks not running"

**Symptoms**:

- You commit but no checks run
- You push but no checks run

**Solution**:

```bash
# Reinstall Husky
rm -rf .husky
npx husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Try committing again
git commit -m "test commit"
```

### Issue 7: "Coverage below threshold"

**Symptoms**:

```
❌ Coverage: 75% (threshold: 80%)
```

**Solution**:

```bash
# Step 1: See coverage report
npm run test:coverage

# Step 2: Open HTML report to see what's not covered
open coverage/lcov-report/index.html

# Step 3: Write tests for uncovered code
# Focus on:
# - Uncovered lines (red in report)
# - Uncovered branches (if statements)
# - Uncovered functions

# Step 4: Run coverage again
npm run test:coverage

# Step 5: Commit and push
git add .
git commit -m "test: improve test coverage to 82%"
git push
```

## Step-by-Step Debugging

### When You're Completely Stuck

Follow this process:

#### Step 1: Identify the Problem

```bash
# Run each check individually to find what's failing
npm run type-check      # TypeScript
npm run lint            # ESLint
npm run format:check    # Prettier
npm run test            # Tests
npm run build           # Build
```

#### Step 2: Focus on One Issue

Don't try to fix everything at once. Pick the first error and fix it.

#### Step 3: Use Verbose Output

```bash
# For TypeScript
npm run type-check -- --pretty

# For tests
npm run test -- --verbose

# For build
npm run build -- --verbose
```

#### Step 4: Search for the Error

Copy the error message and search:

1. In the codebase (might be a common issue)
2. In the steering documents
3. On Google/Stack Overflow
4. In the tool's documentation

#### Step 5: Make Small Changes

- Fix one thing at a time
- Test after each change
- Commit when something works

#### Step 6: Ask for Help

If stuck for more than 30 minutes:

1. Document what you've tried
2. Share the error message
3. Ask in team chat
4. Create an issue if it's a tooling problem

## Getting Unstuck

### Quick Fixes to Try

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Clean build
rm -rf .next
npm run build

# 3. Clear test cache
npm run test -- --clearCache

# 4. Reset Git hooks
rm -rf .husky
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# 5. Check Node version
node --version  # Should be 18+
```

### Understanding the Tools

#### TypeScript

- **What it does**: Checks types to prevent runtime errors
- **When it runs**: Pre-push hook, CI/CD
- **How to fix**: Add type annotations, fix type mismatches

#### ESLint

- **What it does**: Checks code quality and style
- **When it runs**: Pre-commit hook (auto-fix), CI/CD
- **How to fix**: Run `npm run lint:fix`, manually fix remaining

#### Prettier

- **What it does**: Formats code consistently
- **When it runs**: Pre-commit hook (auto-format)
- **How to fix**: Run `npm run format`

#### Jest

- **What it does**: Runs tests and checks coverage
- **When it runs**: Pre-commit (changed files), pre-push (all), CI/CD
- **How to fix**: Fix failing tests, add missing tests

#### Build

- **What it does**: Creates production bundle
- **When it runs**: Pre-push hook, CI/CD
- **How to fix**: Fix import errors, TypeScript errors, missing dependencies

### Emergency Procedures

#### If You Need to Push Urgently

```bash
# 1. Try to fix quickly
npm run quality:fix
npm run quality:check

# 2. If still failing and it's truly urgent
git push --no-verify

# 3. IMMEDIATELY create a follow-up task to fix issues
# 4. Document why you bypassed in commit message
```

**⚠️ WARNING**: Only use `--no-verify` in true emergencies!

#### If CI/CD is Failing but Local Passes

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Run all checks locally
npm run quality:check

# 4. If still failing, check GitHub Actions logs
# Look for differences in:
# - Node version
# - Environment variables
# - Dependencies
```

## Helpful Resources

### Quick Commands Reference

```bash
# Fix most issues automatically
npm run quality:fix

# Run all checks
npm run quality:check

# Individual checks
npm run type-check
npm run lint
npm run format:check
npm run test:coverage
npm run build
```

### Documentation

- **Quick Reference**: `.kiro/steering/QUICK-REFERENCE.md`
- **Quality Automation**: `.kiro/steering/quality-automation.md`
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`

### Getting Help

1. **Check error message carefully** - It usually tells you what's wrong
2. **Read the relevant steering document** - Solutions are often there
3. **Search the codebase** - Someone might have solved it before
4. **Ask in team chat** - Don't stay stuck!
5. **Create an issue** - If it's a tooling problem

## Remember

- **Hooks are your friends** - They catch issues early
- **Fix issues immediately** - Don't let them accumulate
- **Small commits** - Easier to debug and revert
- **Ask for help** - Everyone gets stuck sometimes
- **Learn from errors** - Each error teaches you something

## Success Tips

1. **Run `npm run quality:fix` before committing** - Saves time
2. **Run `npm run quality:check` before pushing** - Catches issues early
3. **Keep dependencies updated** - Prevents weird issues
4. **Read error messages carefully** - They're usually helpful
5. **Don't bypass hooks** - They're there to help you

---

**Still stuck?** Ask for help! We're all learning together. 🚀
