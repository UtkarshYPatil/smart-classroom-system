// Responsive breakpoint utilities
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Hook to detect current breakpoint
export const useBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
};

// Check if device is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

// Check if device is tablet
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
};

// Check if device is desktop
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
};

// Touch-friendly size utilities
export const touchSizes = {
  minTouchTarget: '44px', // Minimum touch target size (iOS/Android guidelines)
  buttonPadding: 'px-6 py-3', // Touch-friendly button padding
  inputHeight: 'h-12', // Touch-friendly input height
  iconSize: 'w-6 h-6', // Touch-friendly icon size
};

// Responsive container classes
export const containerClasses = {
  mobile: 'px-4 py-4',
  tablet: 'px-6 py-6',
  desktop: 'px-8 py-8',
  responsive: 'px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8',
};

// Responsive grid classes
export const gridClasses = {
  responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
};

// Responsive text classes
export const textClasses = {
  heading: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  subheading: 'text-xl md:text-2xl lg:text-3xl font-semibold',
  body: 'text-sm md:text-base',
  small: 'text-xs md:text-sm',
};

// Responsive spacing utilities
export const spacing = {
  section: 'my-6 md:my-8 lg:my-12',
  card: 'p-4 md:p-6 lg:p-8',
  gap: 'gap-4 md:gap-6 lg:gap-8',
};

// Helper to combine responsive classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
