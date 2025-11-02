---
inclusion: always
---

# Development Standards

This document defines the development standards and best practices for the WorkPath (Medicaid Compliance Assistant) project.

## TypeScript Standards

### Strict Mode

- **TypeScript strict mode is REQUIRED** for all code
- All TypeScript compiler strict flags must be enabled in `tsconfig.json`:
  - `strict: true`
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `strictFunctionTypes: true`
  - `strictBindCallApply: true`
  - `strictPropertyInitialization: true`
  - `noImplicitThis: true`
  - `alwaysStrict: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`

### PWA-Specific Type Safety

Ensure proper typing for PWA APIs:

```typescript
// Service Worker types
/// <reference lib="webworker" />

// Type guards for PWA features
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

export function isIndexedDBSupported(): boolean {
  return "indexedDB" in window;
}

// Typed event handlers
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.register("/sw.js");
}
```

### Type Safety

- **No `any` types** - Use proper typing or `unknown` with type guards
- **Explicit return types** for all functions and methods
- **Interface over type** for object shapes (unless union/intersection needed)
- **Readonly properties** where data should not be mutated
- **Const assertions** for literal types where appropriate

### Example

```typescript
// ✅ Good
interface UserProfile {
  readonly id: string;
  name: string;
  dateOfBirth: string;
}

function getUserProfile(userId: string): Promise<UserProfile | null> {
  // implementation
}

// ❌ Bad
function getUserProfile(userId: any): any {
  // implementation
}
```

## Code Quality Standards

### Automated Quality Checks

All quality checks are automated via Git hooks and CI/CD. See `.kiro/steering/quality-automation.md` for complete setup and troubleshooting.

**Quick commands:**

```bash
npm run quality:check    # Run all checks
npm run quality:fix      # Auto-fix issues
```

### ESLint and Prettier

- **ESLint** is configured and must pass with zero warnings
- **Prettier** is configured for consistent formatting
- **Pre-commit hooks** (Husky + lint-staged) enforce linting and formatting automatically
- Run `npm run lint` to check for issues
- Run `npm run lint:fix` to auto-fix issues
- Run `npm run format` to apply formatting

### Code Organization

- **One component per file** (except for small, tightly coupled helper components)
- **Colocate related files** (component + styles + tests in same directory when appropriate)
- **Barrel exports** (index.ts) for cleaner imports from directories
- **Absolute imports** using `@/` path alias for src directory

### File Naming Conventions

- **Components**: PascalCase (e.g., `ComplianceDashboard.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useCompliance.ts`, `calculations.ts`)
- **Types**: camelCase (e.g., `profile.ts`, `activities.ts`)
- **Constants**: UPPER_SNAKE_CASE in files named with camelCase (e.g., `constants.ts`)

## Component Patterns

### Functional Components with TypeScript

All components must be functional components using TypeScript:

```typescript
interface ComplianceDashboardProps {
  totalHours: number;
  requiredHours: number;
  onViewDetails: () => void;
}

export function ComplianceDashboard({
  totalHours,
  requiredHours,
  onViewDetails
}: ComplianceDashboardProps): JSX.Element {
  const isCompliant = totalHours >= requiredHours;

  return (
    <Box>
      {/* component implementation */}
    </Box>
  );
}
```

### Props Interface Pattern

- **Always define props interface** explicitly
- **Export props interface** if it might be reused
- **Use destructuring** in function parameters
- **Provide default values** using destructuring defaults or default props

### Hooks Usage

- **Custom hooks** for reusable logic (prefix with `use`)
- **Extract complex logic** from components into hooks
- **Follow Rules of Hooks** (only call at top level, only in React functions)
- **Memoization** with `useMemo` and `useCallback` only when needed (avoid premature optimization)

### State Management

- **Local state** with `useState` for component-specific state
- **Context** for shared state across multiple components
- **IndexedDB** (via Dexie) for persistent data storage
- **Avoid prop drilling** - use Context when passing props through 3+ levels

## Error Handling

### Error Boundaries

- **Wrap major sections** in ErrorBoundary components
- **Provide fallback UI** with helpful error messages
- **Log errors** for debugging (console.error in development, structured logging in production)

### Custom Error Classes

Use custom error classes for different error types:

```typescript
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
```

### Error Handling Pattern

```typescript
try {
  await saveActivity(activityData);
  showSnackbar("Activity saved successfully", "success");
} catch (error) {
  if (error instanceof ValidationError) {
    showSnackbar(error.message, "warning");
  } else if (error instanceof DatabaseError) {
    showSnackbar("Failed to save activity. Please try again.", "error");
    console.error("Database error:", error.originalError);
  } else {
    showSnackbar("An unexpected error occurred", "error");
    console.error("Unhandled error:", error);
  }
}
```

## Testing Standards

### Test Coverage

- **80% minimum code coverage** for all code
- **100% coverage** for utility functions and calculations
- **Critical paths** must have integration tests
- **E2E tests** for complete user workflows

### Test Organization

- **Unit tests**: Colocated with source files or in `tests/` directory
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/`
- **Test utilities**: `tests/utils/`
- **Mocks**: `tests/__mocks__/`

### Test Naming

```typescript
describe("ComplianceDashboard", () => {
  it("displays compliant status when hours >= required", () => {
    // test implementation
  });

  it("displays non-compliant status when hours < required", () => {
    // test implementation
  });

  it("is accessible to screen readers", async () => {
    // accessibility test
  });
});
```

## Performance Standards

### Performance Targets (Core Web Vitals)

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8 seconds on 3G
- **Component render time**: < 100ms
- **Scrolling performance**: 60fps
- **Bundle size**: < 5MB total (< 200KB initial JS)

### PWA Performance Requirements

- **Lighthouse PWA Score**: > 90
- **Lighthouse Performance Score**: > 90
- **Lighthouse Accessibility Score**: > 95
- **Service Worker**: Must register within 1 second
- **Offline Load**: < 1 second for cached pages
- **Cache Hit Rate**: > 95% for repeat visits

### Performance Best Practices

#### Code Splitting and Lazy Loading

```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

const ActivityTracking = lazy(() => import('@/components/tracking/ActivityTracking'));
const ExemptionScreening = lazy(() => import('@/components/exemptions/ExemptionScreening'));

export function App(): JSX.Element {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" padding={4}>
        <CircularProgress />
      </Box>
    }>
      <Routes>
        <Route path="/tracking" element={<ActivityTracking />} />
        <Route path="/exemptions" element={<ExemptionScreening />} />
      </Routes>
    </Suspense>
  );
}
```

#### Image Optimization

```typescript
// Use Next.js Image component for automatic optimization
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="WorkPath Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
  placeholder="blur" // For better perceived performance
/>
```

#### Bundle Size Optimization

- **Tree shaking**: Import only what you need
- **Dynamic imports**: Load heavy libraries on demand
- **Analyze bundle**: Use `npm run build` and check bundle analyzer

```typescript
// ✅ Good - Tree-shakeable import
import { format } from "date-fns";

// ❌ Bad - Imports entire library
import * as dateFns from "date-fns";

// ✅ Good - Dynamic import for heavy library
const loadPDF = async () => {
  const { jsPDF } = await import("jspdf");
  return new jsPDF();
};
```

#### Minimize Re-renders

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Component implementation
});

// Use useMemo for expensive calculations
const sortedActivities = useMemo(() => {
  return activities.sort((a, b) => b.date.localeCompare(a.date));
}, [activities]);

// Use useCallback for event handlers passed to children
const handleSave = useCallback(async (data: ActivityData) => {
  await saveActivity(data);
}, []);
```

#### Virtualization for Long Lists

```typescript
// Use react-window for lists > 100 items
import { FixedSizeList } from 'react-window';

export function ActivityList({ activities }: Props): JSX.Element {
  return (
    <FixedSizeList
      height={600}
      itemCount={activities.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ActivityCard activity={activities[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

#### Debounce and Throttle

```typescript
// Debounce search input
import { debounce } from "lodash-es";

const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      performSearch(query);
    }, 300),
  [],
);

// Throttle scroll handler
import { throttle } from "lodash-es";

const throttledScroll = useMemo(
  () =>
    throttle(() => {
      handleScroll();
    }, 100),
  [],
);
```

## Accessibility Standards

### WCAG 2.1 AA Compliance Required

- **Semantic HTML** (use proper heading hierarchy, landmarks)
- **ARIA labels** for all interactive elements
- **Keyboard navigation** fully supported with visible focus indicators
- **Color contrast**: 4.5:1 for normal text, 3:1 for interactive elements
- **Touch targets**: 44px minimum for all interactive elements
- **Screen reader** compatibility tested

### Accessibility Testing

- **Automated**: Run Lighthouse and axe DevTools on all pages
- **Manual**: Test with keyboard navigation and screen reader (NVDA or VoiceOver)
- **Every PR** should include accessibility verification

## Security and Privacy Standards

### Data Privacy

- **Local-first**: All data stored locally in IndexedDB
- **No external transmission** except explicit user-initiated exports
- **Encryption** for sensitive fields (name, DOB)
- **No console logging** of sensitive data in production
- **Privacy warnings** before data export
- **No analytics or tracking** without explicit consent
- **Data retention**: User controls all data deletion

### Security Best Practices

#### Input Validation

Use Zod schemas for all user inputs:

```typescript
import { z } from "zod";

const ActivitySchema = z.object({
  type: z.enum(["work", "volunteer", "education", "work_program"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0).max(24),
  organization: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export type ActivityData = z.infer<typeof ActivitySchema>;

// Validate before saving
export async function saveActivity(data: unknown): Promise<void> {
  const validated = ActivitySchema.parse(data); // Throws if invalid
  await db.activities.add(validated);
}
```

#### XSS Prevention

```typescript
// Sanitize user input before rendering
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
}

// Use in components
<Typography>
  {sanitizeHTML(userInput)}
</Typography>
```

#### Content Security Policy

Configure in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
      "style-src 'self' 'unsafe-inline'", // MUI requires unsafe-inline
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

#### Client-Side Encryption

Encrypt sensitive data before storing:

```typescript
import { AES, enc } from "crypto-js";

const ENCRYPTION_KEY = "user-specific-key"; // Derive from user input or device

export function encryptSensitiveData(data: string): string {
  return AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptSensitiveData(encrypted: string): string {
  const bytes = AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(enc.Utf8);
}

// Use for sensitive fields
export interface UserProfile {
  id: string;
  name: string; // Encrypted
  dateOfBirth: string; // Encrypted
  email: string; // Encrypted
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const encrypted = {
    ...profile,
    name: encryptSensitiveData(profile.name),
    dateOfBirth: encryptSensitiveData(profile.dateOfBirth),
    email: encryptSensitiveData(profile.email),
  };

  await db.profiles.put(encrypted);
}
```

### Service Worker Security

```typescript
// Service worker should only cache same-origin resources
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Only cache same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

## Documentation Standards

### Code Comments

- **JSDoc comments** for all public functions and complex logic
- **Inline comments** for non-obvious code
- **TODO comments** with ticket references for future work
- **Avoid obvious comments** (code should be self-documenting)

### README and Documentation

- **README.md**: Project overview, setup instructions, development workflow
- **Component documentation**: Props, usage examples, accessibility notes
- **API documentation**: For all utility functions and hooks
- **Architecture documentation**: High-level system design

## PWA-Specific Development Standards

### Offline-First Architecture

All features must work offline:

```typescript
// Check online status
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Queue operations when offline
export class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];

  async add(operation: () => Promise<void>): Promise<void> {
    if (navigator.onLine) {
      await operation();
    } else {
      this.queue.push(operation);
    }
  }

  async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
      }
    }
  }
}
```

### IndexedDB Best Practices

Use Dexie.js for IndexedDB operations:

```typescript
import Dexie, { Table } from "dexie";

export interface Activity {
  id?: number;
  type: string;
  date: string;
  hours: number;
  organization: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkPathDatabase extends Dexie {
  activities!: Table<Activity>;

  constructor() {
    super("WorkPathDB");

    this.version(1).stores({
      activities: "++id, type, date, createdAt",
    });
  }
}

export const db = new WorkPathDatabase();

// Auto-save pattern
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 1000,
): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFunction(data);
    }, delay);

    return () => clearTimeout(timer);
  }, [data, saveFunction, delay]);
}
```

### Service Worker Implementation

```typescript
// Register service worker
export async function registerServiceWorker(): Promise<void> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              showUpdateNotification();
            }
          });
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

// Update service worker
export async function updateServiceWorker(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    window.location.reload();
  }
}
```

### PWA Installability

```typescript
// Handle install prompt
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  return { isInstallable, promptInstall };
}
```

### Background Sync (Future Enhancement)

```typescript
// Register background sync
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (
    "serviceWorker" in navigator &&
    "sync" in ServiceWorkerRegistration.prototype
  ) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  }
}

// In service worker (sw.js)
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-activities") {
    event.waitUntil(syncActivities());
  }
});
```

## Git Workflow

See `.kiro/steering/git-workflow.md` for detailed Git workflow and commit conventions.

## Quality Assurance Checklist

Before committing code, ensure:

- [ ] TypeScript strict mode passes with no errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] All tests pass with 80%+ coverage
- [ ] Component is accessible (keyboard nav, screen reader, ARIA labels)
- [ ] Component works offline (if applicable)
- [ ] Performance is acceptable (<100ms render)
- [ ] No console errors or warnings
- [ ] Code is documented with JSDoc comments
- [ ] Sensitive data is encrypted (if applicable)

## References

- **Quality Automation**: `.kiro/steering/quality-automation.md` - Complete automation setup
- **Quick Reference**: `.kiro/steering/QUICK-REFERENCE.md` - Command cheat sheet
- **Requirements Document**: `.kiro/specs/medicaid-compliance-mvp/requirements.md`
- **Design Document**: `.kiro/specs/medicaid-compliance-mvp/design.md`
- **Tasks Document**: `.kiro/specs/medicaid-compliance-mvp/tasks.md`
- **Material-UI Guidelines**: `.kiro/steering/material-ui-guidelines.md`
- **Git Workflow**: `.kiro/steering/git-workflow.md`
- **Domain Knowledge**: `.kiro/steering/medicaid-domain-knowledge.md`
- **PWA Best Practices**: https://web.dev/progressive-web-apps/
- **Core Web Vitals**: https://web.dev/vitals/
