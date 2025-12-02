# Responsive Design Guide

## Breakpoints

The application uses the following breakpoints:

- **xs**: 475px - Extra small devices
- **sm**: 640px - Small devices (phones)
- **md**: 768px - Medium devices (tablets)
- **lg**: 1024px - Large devices (desktops)
- **xl**: 1280px - Extra large devices
- **2xl**: 1536px - Ultra-wide screens

## Touch-Friendly Guidelines

### Minimum Touch Target Size
All interactive elements should have a minimum size of 44x44px for comfortable touch interaction.

```jsx
// Use the min-h-touch and min-w-touch utilities
<button className="min-h-touch min-w-touch px-4 py-2">
  Click Me
</button>
```

### Button Padding
Use generous padding for touch-friendly buttons:

```jsx
<button className="px-6 py-3 text-base">
  Touch-Friendly Button
</button>
```

## Responsive Patterns

### Container Spacing
Use responsive padding that increases with screen size:

```jsx
import { containerClasses } from '../utils/responsive';

<div className={containerClasses.responsive}>
  {/* Content */}
</div>

// Or manually:
<div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
  {/* Content */}
</div>
```

### Grid Layouts
Use responsive grid classes:

```jsx
import { gridClasses } from '../utils/responsive';

// 1 column on mobile, 2 on tablet, 3 on desktop
<div className={gridClasses.responsive}>
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Typography
Scale text sizes responsively:

```jsx
import { textClasses } from '../utils/responsive';

<h1 className={textClasses.heading}>Responsive Heading</h1>
<p className={textClasses.body}>Responsive body text</p>
```

### Sidebar Navigation
Implement mobile-friendly sidebars:

```jsx
// Mobile: Slide-in overlay
// Desktop: Fixed sidebar

<aside className={`
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
  w-72
  fixed
  transition-all
  z-20
`}>
  {/* Sidebar content */}
</aside>

// Add overlay for mobile
{isSidebarOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
    onClick={() => setIsSidebarOpen(false)}
  />
)}
```

### Form Inputs
Make inputs touch-friendly:

```jsx
<input
  type="text"
  className="w-full h-12 px-4 text-base rounded-lg border"
  placeholder="Touch-friendly input"
/>
```

### Tables
Make tables responsive with horizontal scroll on mobile:

```jsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

### Cards
Stack cards on mobile, grid on larger screens:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {cards.map(card => (
    <div key={card.id} className="bg-white rounded-lg p-4 shadow">
      {/* Card content */}
    </div>
  ))}
</div>
```

## Utility Functions

### Check Device Type

```jsx
import { isMobile, isTablet, isDesktop } from '../utils/responsive';

if (isMobile()) {
  // Mobile-specific logic
}
```

### Get Current Breakpoint

```jsx
import { useBreakpoint } from '../utils/responsive';

const breakpoint = useBreakpoint();
// Returns: 'xs', 'sm', 'md', 'lg', 'xl', or '2xl'
```

## Best Practices

1. **Mobile-First Approach**: Start with mobile styles, then add larger breakpoints
2. **Touch Targets**: Ensure all interactive elements are at least 44x44px
3. **Readable Text**: Use minimum 16px font size for body text on mobile
4. **Spacing**: Increase spacing on larger screens for better visual hierarchy
5. **Navigation**: Use hamburger menu on mobile, full navigation on desktop
6. **Images**: Use responsive images with appropriate sizes for each breakpoint
7. **Testing**: Test on actual devices, not just browser resize
8. **Performance**: Lazy load images and components for mobile devices

## Common Responsive Classes

```jsx
// Visibility
hidden md:block          // Hidden on mobile, visible on tablet+
block md:hidden          // Visible on mobile, hidden on tablet+

// Flexbox
flex-col md:flex-row     // Stack on mobile, row on tablet+

// Width
w-full md:w-1/2 lg:w-1/3 // Full width on mobile, half on tablet, third on desktop

// Text alignment
text-center md:text-left // Centered on mobile, left-aligned on tablet+

// Padding/Margin
p-4 md:p-6 lg:p-8       // Responsive padding
m-2 md:m-4 lg:m-6       // Responsive margin
```

## Component Examples

### Responsive Button

```jsx
<button className="
  w-full md:w-auto
  px-6 py-3
  text-base
  min-h-touch
  rounded-lg
  bg-blue-600
  text-white
  hover:bg-blue-700
  transition-colors
">
  Responsive Button
</button>
```

### Responsive Card

```jsx
<div className="
  bg-white
  rounded-lg
  shadow-md
  p-4 md:p-6 lg:p-8
  space-y-4
">
  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
    Card Title
  </h2>
  <p className="text-sm md:text-base text-gray-600">
    Card content
  </p>
</div>
```

### Responsive Form

```jsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <input
      type="text"
      className="w-full h-12 px-4 text-base rounded-lg border"
      placeholder="First Name"
    />
    <input
      type="text"
      className="w-full h-12 px-4 text-base rounded-lg border"
      placeholder="Last Name"
    />
  </div>
  <button className="
    w-full md:w-auto
    px-6 py-3
    min-h-touch
    bg-blue-600
    text-white
    rounded-lg
  ">
    Submit
  </button>
</form>
```
