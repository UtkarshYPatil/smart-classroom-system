# Shared UI Components and Utilities

This document describes the shared UI components and utilities implemented for the Smart Classroom Management System.

## Components

### 1. LoadingSpinner (`src/components/LoadingSpinner.jsx`)
A reusable loading spinner component with customizable size and message.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `message`: string (default: 'Loading...')

**Usage:**
```jsx
import LoadingSpinner from './components/LoadingSpinner';

<LoadingSpinner size="lg" message="Loading data..." />
```

### 2. ErrorMessage (`src/components/ErrorMessage.jsx`)
A styled error message component with optional retry and dismiss actions.

**Props:**
- `message`: string - The error message to display
- `onRetry`: function (optional) - Callback for retry action
- `onDismiss`: function (optional) - Callback for dismiss action

**Usage:**
```jsx
import ErrorMessage from './components/ErrorMessage';

<ErrorMessage 
  message="Failed to load data" 
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

### 3. Toast (`src/components/Toast.jsx`)
A toast notification component with auto-dismiss functionality.

**Props:**
- `message`: string - The notification message
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `duration`: number (default: 3000ms)
- `onClose`: function (optional) - Callback when toast closes

**Usage:**
```jsx
import Toast from './components/Toast';

<Toast 
  message="Student registered successfully!" 
  type="success"
  duration={3000}
/>
```

### 4. ToastContext (`src/contexts/ToastContext.jsx`)
A context provider for managing multiple toast notifications.

**Usage:**
```jsx
import { ToastProvider, useToast } from './contexts/ToastContext';

// Wrap your app
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
const { showToast } = useToast();
showToast('Success!', 'success');
```

### 5. ProgressBar (`src/components/ProgressBar.jsx`)
A visual progress bar with color coding based on percentage.

**Props:**
- `percentage`: number (0-100)

**Color Coding:**
- Red: < 75%
- Yellow: 75-85%
- Green: > 85%

**Usage:**
```jsx
import ProgressBar from './components/ProgressBar';

<ProgressBar percentage={85} />
```

### 6. ResponsiveContainer (`src/components/ResponsiveContainer.jsx`)
A container component with responsive padding.

**Props:**
- `children`: ReactNode
- `className`: string (optional)

**Usage:**
```jsx
import ResponsiveContainer from './components/ResponsiveContainer';

<ResponsiveContainer>
  <YourContent />
</ResponsiveContainer>
```

## Utilities

### API Utilities (`src/utils/api.js`)
Centralized API functions for all backend endpoints.

**Available APIs:**
- `studentAPI`: register, getAll, getByUid, getLatestScan, update, delete
- `attendanceAPI`: getAll, getByUid, log
- `roomAPI`: getAll, getAvailable, allocate, release
- `timetableAPI`: getByCourse, getCurrentLecture, create

**Features:**
- Automatic authentication header injection
- Centralized error handling
- Response parsing

**Usage:**
```jsx
import { studentAPI, attendanceAPI } from './utils/api';

// Register a student
const student = await studentAPI.register(studentData);

// Get attendance logs
const logs = await attendanceAPI.getAll();
```

### Responsive Utilities (`src/utils/responsive.js`)
Utilities for responsive design and device detection.

**Exports:**
- `breakpoints`: Object with breakpoint values
- `useBreakpoint()`: Hook to get current breakpoint
- `isMobile()`: Check if device is mobile
- `isTablet()`: Check if device is tablet
- `isDesktop()`: Check if device is desktop
- `touchSizes`: Touch-friendly size constants
- `containerClasses`: Responsive container classes
- `gridClasses`: Responsive grid classes
- `textClasses`: Responsive text classes
- `spacing`: Responsive spacing utilities
- `cn()`: Helper to combine classes

**Usage:**
```jsx
import { isMobile, gridClasses, textClasses } from './utils/responsive';

if (isMobile()) {
  // Mobile-specific logic
}

<div className={gridClasses.responsive}>
  <h1 className={textClasses.heading}>Title</h1>
</div>
```

## Responsive Design Enhancements

### Layout Improvements
Both `AdminLayout` and `StudentLayout` have been enhanced with:

1. **Mobile-friendly sidebar**
   - Slide-in overlay on mobile
   - Fixed sidebar on desktop
   - Touch-friendly close overlay

2. **Responsive spacing**
   - Adaptive padding: `p-4 sm:p-6 lg:p-8`
   - Proper margins for all screen sizes

3. **Touch-friendly buttons**
   - Minimum 44px height for touch targets
   - Responsive text sizing
   - Abbreviated text on mobile

### Tailwind Configuration
Updated `tailwind.config.js` with:
- Custom breakpoint for extra small devices (xs: 475px)
- Touch-friendly spacing utilities
- Minimum touch target sizes

## Best Practices

1. **Always use responsive utilities** from `src/utils/responsive.js`
2. **Test on multiple screen sizes** (mobile, tablet, desktop)
3. **Ensure touch targets are at least 44x44px**
4. **Use mobile-first approach** when adding responsive classes
5. **Leverage the ToastContext** for user notifications
6. **Use LoadingSpinner** during async operations
7. **Show ErrorMessage** for error states with retry options

## File Structure

```
frontend/src/
├── components/
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── Toast.jsx
│   ├── ProgressBar.jsx
│   ├── ResponsiveContainer.jsx
│   ├── AdminLayout.jsx (enhanced)
│   ├── StudentLayout.jsx (enhanced)
│   └── index.js (exports)
├── contexts/
│   └── ToastContext.jsx
└── utils/
    ├── api.js
    ├── responsive.js
    ├── responsiveGuide.md
    └── index.js (exports)
```

## Requirements Satisfied

✅ **Requirement 3.4**: ProgressBar component with color coding
✅ **Requirement 9.2**: Student attendance percentage display
✅ **Requirement 7.5**: API utilities with error handling
✅ **Requirement 7.3**: Responsive design for all devices
✅ **Requirement 7.2**: Tailwind CSS styling
