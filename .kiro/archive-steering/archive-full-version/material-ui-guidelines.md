---
inclusion: always
---

# Material-UI (MUI) Guidelines

This document defines the standards and best practices for using Material-UI v5+ in the WorkPath project.

## MUI Version and Setup

- **MUI Version**: v5+ (latest stable)
- **Styling Solution**: Emotion (MUI's default CSS-in-JS)
- **Theme**: Custom theme defined in `src/theme/`
- **Icons**: `@mui/icons-material`

## Theme Configuration

### Theme Structure

```typescript
// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
      light: "#e33371",
      dark: "#9a0036",
      contrastText: "#ffffff",
    },
    // Additional colors...
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Responsive typography...
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 320, // Mobile-first
      md: 768, // Tablet
      lg: 1024, // Desktop
      xl: 1920, // Large desktop
    },
  },
  components: {
    // Component overrides...
  },
});
```

### Mobile-First Breakpoints

Always design for mobile first, then enhance for larger screens:

```typescript
// ✅ Good - Mobile-first
<Box
  sx={{
    padding: 2,           // Mobile (default)
    md: { padding: 3 },   // Tablet and up
    lg: { padding: 4 },   // Desktop and up
  }}
>
```

```typescript
// ❌ Bad - Desktop-first
<Box
  sx={{
    padding: 4,           // Desktop (default)
    md: { padding: 3 },   // Tablet and down
    sm: { padding: 2 },   // Mobile and down
  }}
>
```

## Component Usage Patterns

### Box Component

Use `Box` for layout and spacing:

```typescript
import { Box } from '@mui/material';

// Layout container
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 2,
  }}
>
  {children}
</Box>

// Responsive spacing
<Box
  sx={{
    padding: { xs: 2, md: 3, lg: 4 },
    margin: { xs: 1, md: 2 },
  }}
>
```

### Typography Component

Use `Typography` for all text:

```typescript
import { Typography } from '@mui/material';

<Typography variant="h1" component="h1" gutterBottom>
  Page Title
</Typography>

<Typography variant="body1" color="text.secondary">
  Body text with secondary color
</Typography>

<Typography
  variant="h6"
  sx={{
    fontSize: { xs: '1rem', md: '1.25rem' },
    fontWeight: 500,
  }}
>
  Responsive heading
</Typography>
```

### Button Component

Use `Button` with proper variants and sizes:

```typescript
import { Button } from '@mui/material';

// Primary action
<Button variant="contained" color="primary" onClick={handleSave}>
  Save Activity
</Button>

// Secondary action
<Button variant="outlined" color="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Text button
<Button variant="text" onClick={handleLearnMore}>
  Learn More
</Button>

// Mobile-optimized (44px minimum touch target)
<Button
  variant="contained"
  sx={{
    minHeight: 44,
    minWidth: 44,
    padding: { xs: '12px 24px', md: '8px 16px' },
  }}
>
  Submit
</Button>
```

### Form Components

Use MUI form components with proper validation:

```typescript
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Text input
<TextField
  label="Organization Name"
  name="organization"
  fullWidth
  required
  error={!!errors.organization}
  helperText={errors.organization?.message}
  inputProps={{
    'aria-label': 'Organization name',
  }}
/>

// Select dropdown
<FormControl fullWidth>
  <InputLabel id="activity-type-label">Activity Type</InputLabel>
  <Select
    labelId="activity-type-label"
    label="Activity Type"
    value={activityType}
    onChange={handleChange}
  >
    <MenuItem value="work">Work</MenuItem>
    <MenuItem value="volunteer">Volunteer</MenuItem>
    <MenuItem value="education">Education</MenuItem>
  </Select>
</FormControl>

// Mobile-optimized input types
<TextField
  type="number"
  inputMode="numeric"
  label="Hours"
  inputProps={{
    min: 0,
    max: 24,
    step: 0.5,
  }}
/>

<TextField
  type="date"
  label="Date"
  InputLabelProps={{
    shrink: true,
  }}
/>
```

### Card Component

Use `Card` for content grouping:

```typescript
import { Card, CardContent, CardActions, CardHeader } from '@mui/material';

<Card
  sx={{
    marginBottom: 2,
    boxShadow: 2,
  }}
>
  <CardHeader
    title="Monthly Compliance"
    subheader="January 2027"
  />
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardActions>
    <Button size="small">View Details</Button>
  </CardActions>
</Card>
```

### Dialog Component

Use `Dialog` for modals:

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

<Dialog
  open={open}
  onClose={handleClose}
  fullScreen={isMobile}  // Full-screen on mobile
  maxWidth="sm"
  fullWidth
  aria-labelledby="dialog-title"
>
  <DialogTitle id="dialog-title">
    Confirm Deletion
  </DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to delete this activity?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} color="error" variant="contained">
      Delete
    </Button>
  </DialogActions>
</Dialog>
```

### Snackbar Component

Use `Snackbar` for notifications:

```typescript
import { Snackbar, Alert } from '@mui/material';

<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
    Activity saved successfully!
  </Alert>
</Snackbar>
```

## Responsive Design Approach

### Mobile-First Styling

Always start with mobile styles and enhance for larger screens:

```typescript
<Box
  sx={{
    // Mobile (default)
    display: 'flex',
    flexDirection: 'column',
    padding: 2,

    // Tablet and up
    md: {
      flexDirection: 'row',
      padding: 3,
    },

    // Desktop and up
    lg: {
      padding: 4,
      maxWidth: 1200,
      margin: '0 auto',
    },
  }}
>
```

### Touch Target Sizing

Ensure all interactive elements meet 44px minimum:

```typescript
// ✅ Good - 44px minimum
<IconButton
  sx={{
    minWidth: 44,
    minHeight: 44,
  }}
  aria-label="Delete activity"
>
  <DeleteIcon />
</IconButton>

// ❌ Bad - Too small for touch
<IconButton size="small">
  <DeleteIcon />
</IconButton>
```

### Responsive Typography

Use responsive font sizes:

```typescript
<Typography
  variant="h1"
  sx={{
    fontSize: {
      xs: '2rem',    // Mobile
      md: '2.5rem',  // Tablet
      lg: '3rem',    // Desktop
    },
  }}
>
  WorkPath
</Typography>
```

### Responsive Spacing

Use responsive spacing with theme spacing function:

```typescript
<Box
  sx={{
    padding: { xs: 1, sm: 2, md: 3, lg: 4 },
    margin: { xs: 0.5, sm: 1, md: 2 },
    gap: { xs: 1, md: 2 },
  }}
>
```

## Theming Patterns

### Using Theme Values

Access theme values in sx prop:

```typescript
<Box
  sx={{
    color: 'primary.main',
    backgroundColor: 'background.paper',
    borderColor: 'divider',
    padding: (theme) => theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      padding: (theme) => theme.spacing(3),
    },
  }}
>
```

### Custom Theme Overrides

Override component defaults in theme:

```typescript
// src/theme/theme.ts
export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Disable uppercase
          borderRadius: 8,
          minHeight: 44, // Touch target
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },
  },
});
```

## Accessibility with MUI

### ARIA Labels

Always provide ARIA labels for interactive elements:

```typescript
<IconButton
  aria-label="Delete activity"
  onClick={handleDelete}
>
  <DeleteIcon />
</IconButton>

<TextField
  label="Hours"
  inputProps={{
    'aria-label': 'Hours worked',
    'aria-describedby': 'hours-helper-text',
  }}
  helperText="Enter hours between 0 and 24"
  id="hours-helper-text"
/>
```

### Focus Management

Ensure visible focus indicators:

```typescript
<Button
  sx={{
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
  }}
>
  Submit
</Button>
```

### Semantic HTML

Use proper semantic elements:

```typescript
// ✅ Good - Semantic
<Typography variant="h1" component="h1">
  Page Title
</Typography>

<Button component="a" href="/help">
  Help
</Button>

// ❌ Bad - Non-semantic
<Typography variant="h1" component="div">
  Page Title
</Typography>
```

## Performance Optimization

### Avoid Inline Functions in sx

```typescript
// ✅ Good - Define outside render
const boxStyles = {
  padding: 2,
  backgroundColor: 'background.paper',
};

<Box sx={boxStyles}>

// ❌ Bad - Creates new object every render
<Box sx={{ padding: 2, backgroundColor: 'background.paper' }}>
```

### Use Theme Breakpoints Helper

```typescript
import { useTheme, useMediaQuery } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog fullScreen={isMobile}>
      {/* content */}
    </Dialog>
  );
}
```

### Lazy Load Heavy Components

```typescript
import { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';

const DocumentViewer = lazy(() => import('./DocumentViewer'));

<Suspense fallback={<CircularProgress />}>
  <DocumentViewer />
</Suspense>
```

## Common Patterns

### Loading State

```typescript
import { CircularProgress, Box } from '@mui/material';

{loading ? (
  <Box display="flex" justifyContent="center" padding={4}>
    <CircularProgress />
  </Box>
) : (
  <Content />
)}
```

### Empty State

```typescript
import { Box, Typography, Button } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';

<Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  padding={4}
  textAlign="center"
>
  <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
  <Typography variant="h6" gutterBottom>
    No activities logged yet
  </Typography>
  <Typography variant="body2" color="text.secondary" paragraph>
    Start tracking your work, volunteer, or education hours
  </Typography>
  <Button variant="contained" onClick={handleAddActivity}>
    Log Your First Activity
  </Button>
</Box>
```

### Error State

```typescript
import { Alert, AlertTitle } from '@mui/material';

<Alert severity="error" sx={{ marginBottom: 2 }}>
  <AlertTitle>Error</AlertTitle>
  Failed to save activity. Please try again.
</Alert>
```

## PWA-Specific Patterns

### Install Prompt Component

Provide a custom install prompt for better UX:

```typescript
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { GetApp } from '@mui/icons-material';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps): JSX.Element {
  return (
    <Dialog open onClose={onDismiss} maxWidth="sm" fullWidth>
      <DialogTitle>Install WorkPath</DialogTitle>
      <DialogContent>
        <Typography>
          Install WorkPath on your device for quick access and offline functionality.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss}>Not Now</Button>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={onInstall}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Offline Indicator

Show connection status to users:

```typescript
import { Alert, Snackbar } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';

export function OfflineIndicator(): JSX.Element {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Snackbar
      open={!isOnline}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="warning" icon={<WifiOff />}>
        You're offline. Changes will sync when you reconnect.
      </Alert>
    </Snackbar>
  );
}
```

### Update Available Notification

Notify users when a new version is available:

```typescript
import { Snackbar, Alert, Button } from '@mui/material';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

export function UpdateNotification({ onUpdate }: UpdateNotificationProps): JSX.Element {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  return (
    <Snackbar
      open={showUpdate}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={onUpdate}>
            Update
          </Button>
        }
      >
        A new version is available
      </Alert>
    </Snackbar>
  );
}
```

### Safe Area Support for Mobile Devices

Handle notches and safe areas on mobile devices:

```typescript
// Add to theme configuration
export const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      },
    },
  },
});

// Use in components
<Box
  sx={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  }}
>
```

### Pull-to-Refresh Pattern

Implement pull-to-refresh for mobile:

```typescript
import { Box, CircularProgress } from '@mui/material';

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps): JSX.Element {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const pullDistance = currentY - startY;

    if (pullDistance > 80 && window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      await onRefresh();
      setIsPulling(false);
    }
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <Box display="flex" justifyContent="center" padding={2}>
          <CircularProgress size={24} />
        </Box>
      )}
      {children}
    </Box>
  );
}
```

## References

- **MUI Documentation**: https://mui.com/material-ui/getting-started/
- **PWA Design Patterns**: https://web.dev/patterns/
- **Design Document**: `.kiro/specs/medicaid-compliance-mvp/design.md`
- **Development Standards**: `.kiro/steering/development-standards.md`
- **Requirements Document**: `.kiro/specs/medicaid-compliance-mvp/requirements.md`
