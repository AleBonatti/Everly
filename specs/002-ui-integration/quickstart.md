# UI Component Library Quickstart

Welcome to the SpecToDo UI component library! This guide will get you up to speed with building beautiful, accessible interfaces using our component system.

## 1. Installation

All required dependencies are already included in the project. If you're working in a fresh environment, run:

```bash
npm install
```

The following packages are already configured:

```bash
npm install lucide-react framer-motion clsx tailwind-merge
npm install -D tailwindcss@4 postcss autoprefixer
```

**Key Dependencies:**
- `lucide-react` - Icon library (0.294.0+)
- `framer-motion` - Animation library (10.16.16+)
- `clsx` - Conditional class utilities (2.1.1+)
- `tailwind-merge` - Smart Tailwind class merging (3.3.1+)
- `tailwindcss` - Utility-first CSS (4.0.0+)

## 2. Component Usage Examples

### Button Component

The Button component supports multiple variants and sizes with built-in loading states.

**Import:**
```tsx
import Button from '@/components/ui/Button';
```

**Basic Usage:**
```tsx
'use client';

export default function ButtonDemo() {
  return (
    <div className="space-y-4 p-6">
      {/* Primary Button (Default) */}
      <Button onClick={() => alert('Clicked!')}>
        Save Changes
      </Button>

      {/* Secondary Button */}
      <Button variant="secondary">
        Cancel
      </Button>

      {/* Ghost Button */}
      <Button variant="ghost">
        Learn More
      </Button>

      {/* Outline Button */}
      <Button variant="outline">
        Edit
      </Button>

      {/* Danger Button */}
      <Button variant="danger">
        Delete
      </Button>

      {/* Button Sizes */}
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      {/* Loading State */}
      <Button isLoading>
        Processing...
      </Button>

      {/* Disabled State */}
      <Button disabled>
        Disabled
      </Button>
    </div>
  );
}
```

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

---

### Input Component

The Input component provides label, error, and helper text support with accessibility features.

**Import:**
```tsx
import Input from '@/components/ui/Input';
```

**Basic Usage:**
```tsx
'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';

export default function InputDemo() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Validate email
    if (!value.includes('@')) {
      setError('Please enter a valid email');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Basic Input with Label */}
      <Input
        label="Full Name"
        placeholder="Enter your name"
        type="text"
      />

      {/* Input with Helper Text */}
      <Input
        label="Username"
        placeholder="username123"
        helperText="3-20 characters, letters and numbers only"
      />

      {/* Input with Error State */}
      <Input
        label="Email Address"
        placeholder="you@example.com"
        type="email"
        value={email}
        onChange={handleChange}
        error={error}
      />

      {/* Password Input */}
      <Input
        label="Password"
        placeholder="Enter a strong password"
        type="password"
        helperText="At least 8 characters"
      />

      {/* Disabled Input */}
      <Input
        label="Readonly Field"
        value="This is read-only"
        disabled
      />

      {/* Input with Custom ID */}
      <Input
        id="custom-input"
        label="Custom Input"
        placeholder="Uses custom ID"
      />
    </div>
  );
}
```

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

---

### Card Component

Compose complex layouts with the Card component family.

**Import:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
```

**Basic Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CardDemo() {
  return (
    <div className="space-y-4 p-6">
      {/* Basic Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to SpecToDo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Create, organize, and complete your tasks with ease.</p>
        </CardContent>
      </Card>

      {/* Bordered Card */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Track progress on your current initiatives.</p>
        </CardContent>
      </Card>

      {/* Elevated Card with Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Tasks Completed: 42</p>
            <p>Active Projects: 3</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="primary">View Details</Button>
              <Button size="sm" variant="ghost">Dismiss</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Card Layout */}
      <Card className="bg-gradient-to-r from-primary-50 to-accent-50">
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Advanced filtering and search</li>
            <li>Real-time collaboration</li>
            <li>Custom reports and analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Props:**
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}
```

---

### Tag Component

Display labels and categories with the Tag component.

**Import:**
```tsx
import Tag from '@/components/ui/Tag';
```

**Basic Usage:**
```tsx
import Tag from '@/components/ui/Tag';

export default function TagDemo() {
  return (
    <div className="space-y-4 p-6">
      {/* Default Tags */}
      <div className="flex flex-wrap gap-2">
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        <Tag>Next.js</Tag>
      </div>

      {/* Removable Tags */}
      <div className="flex flex-wrap gap-2">
        <Tag onRemove={() => console.log('Removed')}>
          Active
        </Tag>
        <Tag onRemove={() => console.log('Removed')}>
          High Priority
        </Tag>
      </div>

      {/* Tags with Custom Styling */}
      <div className="flex flex-wrap gap-2">
        <Tag className="bg-green-100 text-green-700">Completed</Tag>
        <Tag className="bg-yellow-100 text-yellow-700">In Progress</Tag>
        <Tag className="bg-red-100 text-red-700">Blocked</Tag>
      </div>
    </div>
  );
}
```

---

## 3. Theme Customization

### Extending Tailwind Config

The Tailwind configuration is located at `/Users/alessandro/Work/AI/SpecToDo/tailwind.config.ts`. Customize it to match your brand.

**Adding Custom Colors:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        success: {
          50: '#f0fdf4',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

**Customizing Spacing:**
```typescript
theme: {
  extend: {
    spacing: {
      '128': '32rem',
      '144': '36rem',
      safe: 'env(safe-area-inset-bottom)',
    },
  },
}
```

**Adjusting Breakpoints:**
```typescript
theme: {
  extend: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'tall': { 'raw': '(min-height: 800px)' },
    },
  },
}
```

**Adding Custom Utilities:**
```typescript
plugins: [
  function({ addUtilities }) {
    addUtilities({
      '.text-truncate': {
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
      },
      '.line-clamp-3': {
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
      },
    })
  }
]
```

## 4. Animation Patterns

All animations use Framer Motion. Import it with:

```tsx
import { motion } from 'framer-motion';
```

### Fade In on Mount

```tsx
import { motion } from 'framer-motion';

export function FadeInComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      This content fades in smoothly
    </motion.div>
  );
}
```

### Slide In from Bottom

```tsx
import { motion } from 'framer-motion';

export function SlideInComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      This content slides up and fades in
    </motion.div>
  );
}
```

### List Item Exit Animation

```tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function AnimatedList() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-white rounded border"
        >
          {item.name}
          <button
            onClick={() => setItems(items.filter(i => i.id !== item.id))}
            className="ml-auto text-red-600"
          >
            Delete
          </button>
        </motion.div>
      ))}
    </div>
  );
}
```

### Modal Enter/Exit

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4">Modal Title</h2>
              <p className="text-gray-600 mb-6">Your content here</p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### AnimatePresence for Lists

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedListWithPresence({ items }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.li
            key={item.id}
            variants={itemVariants}
            exit="exit"
            className="p-4 bg-white rounded border"
          >
            {item.name}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
```

## 5. Responsive Utilities

### Mobile-First Stacking

Use Tailwind's responsive prefixes to build mobile-first layouts:

```tsx
{/* Stacks on mobile, side-by-side on medium+ screens */}
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Left content</div>
  <div className="flex-1">Right content</div>
</div>

{/* Stacks on mobile, 3-column on large screens */}
<div className="flex flex-col lg:flex-row gap-4">
  <div className="flex-1">Column 1</div>
  <div className="flex-1">Column 2</div>
  <div className="flex-1">Column 3</div>
</div>
```

### Grid Breakpoints

```tsx
{/* Single column on mobile, 2 on tablet, 3 on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

{/* Responsive grid with auto-fit */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Cards here */}
</div>
```

### Conditional Spacing

```tsx
{/* Padding increases on larger screens */}
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-lg md:text-2xl lg:text-4xl">Responsive Heading</h1>
  <p className="text-sm md:text-base lg:text-lg">Responsive paragraph</p>
</div>

{/* Margin adjusts per screen */}
<div className="mb-2 md:mb-4 lg:mb-6">Spacing adjusts</div>
```

### Show/Hide Elements

```tsx
{/* Hide on mobile, show on medium+ */}
<div className="hidden md:block">Desktop only content</div>

{/* Show on mobile, hide on medium+ */}
<div className="md:hidden">Mobile only content</div>

{/* Different content per breakpoint */}
<div>
  <div className="md:hidden">Mobile Menu</div>
  <div className="hidden md:block">Desktop Navigation</div>
</div>

{/* Hide on small, show on medium, hide on large */}
<div className="hidden sm:block lg:hidden">Tablet only</div>
```

## 6. Accessibility Checklist

### Focus States

Always provide visible focus indicators:

```tsx
{/* Use ring-2 and ring-offset-2 for focus states */}
<input
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
/>

{/* All Button variants include focus styles */}
<Button>
  Focused and accessible
</Button>
```

### Keyboard Navigation

```tsx
'use client';

import { useState } from 'react';

export function KeyboardNavigation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = ['Item 1', 'Item 2', 'Item 3'];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Enter':
        // Handle selection
        break;
      case 'Escape':
        // Close menu
        break;
    }
  };

  return (
    <ul
      role="listbox"
      onKeyDown={handleKeyDown}
      className="space-y-2"
    >
      {items.map((item, index) => (
        <li
          key={item}
          role="option"
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
          className={`p-2 rounded cursor-pointer ${
            index === selectedIndex ? 'bg-primary-100' : ''
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### ARIA Attributes

```tsx
{/* Label form inputs */}
<label htmlFor="search">Search tasks</label>
<input id="search" type="text" />

{/* Describe complex components */}
<div
  role="alert"
  aria-live="polite"
  aria-describedby="error-text"
>
  <p id="error-text">This field is required</p>
</div>

{/* Mark interactive elements */}
<button
  aria-label="Close modal"
  aria-pressed={isPressed}
  aria-expanded={isOpen}
>
  X
</button>

{/* Help screen readers */}
<div
  aria-label="Loading"
  role="status"
  aria-busy={isLoading}
>
  {isLoading && <Spinner />}
</div>
```

### Color Contrast

Ensure text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

```tsx
{/* Good contrast examples */}
<p className="text-gray-900 bg-white">High contrast - Pass</p>
<p className="text-white bg-primary-600">Primary button text - Pass</p>

{/* Avoid low contrast */}
<p className="text-gray-300 bg-white">Too light - Fail</p>
<p className="text-gray-600 bg-gray-50">Insufficient - Fail</p>
```

**Primary color contrasts:**
- `text-white` on `bg-primary-600` or darker = Pass
- `text-primary-900` on `bg-primary-100` = Pass

### Touch Targets

Ensure interactive elements are at least 44x44 pixels:

```tsx
{/* Good touch target */}
<button className="h-11 px-4">44px minimum height</button>

{/* Icons should have padding */}
<button className="p-2 hover:bg-gray-100">
  <Icon className="w-5 h-5" />
</button>

{/* Links need sufficient spacing */}
<nav className="flex gap-4">
  {/* Each link has sufficient width for touch */}
  <a href="#" className="px-3 py-2">Link</a>
</nav>
```

## 7. Common Pitfalls

### Forgetting "use client" Directive

Interactive components need the `'use client'` directive:

```tsx
// WRONG - will error
export default function Form() {
  const [value, setValue] = useState('');
  return <input onChange={(e) => setValue(e.target.value)} />;
}

// CORRECT
'use client';
import { useState } from 'react';

export default function Form() {
  const [value, setValue] = useState('');
  return <input onChange={(e) => setValue(e.target.value)} />;
}
```

### Missing Font Import

Always import fonts in your layout:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpecToDo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Not Using cn() Utility

Always merge conditional classes with `cn()`:

```tsx
// WRONG - can cause style conflicts
function MyComponent({ isActive }) {
  return (
    <div className={`p-4 ${isActive ? 'bg-primary-600' : 'bg-gray-100'}`}>
      Content
    </div>
  );
}

// CORRECT - uses cn() for proper merging
import { cn } from '@/lib/utils';

function MyComponent({ isActive }) {
  return (
    <div className={cn('p-4', isActive ? 'bg-primary-600' : 'bg-gray-100')}>
      Content
    </div>
  );
}
```

### Forgetting Loading/Error States

Always handle async operations:

```tsx
'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export function TaskForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ /* data */ }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit" isLoading={isLoading}>
        Create Task
      </Button>
    </form>
  );
}
```

### Not Respecting prefers-reduced-motion

Always check for motion preferences:

```tsx
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      Respects user preferences
    </motion.div>
  );
}

// Alternative: Manual check
export function ManualReducedMotion() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      style={{
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
      }}
    >
      Content
    </div>
  );
}
```

## 8. File Organization

### Directory Structure

```
/Users/alessandro/Work/AI/SpecToDo/
├── app/
│   ├── layout.tsx           # Root layout with font setup
│   ├── globals.css          # Global styles
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Tag.tsx
│   │   └── ... (other UI components)
│   └── layout/              # Layout components
│       ├── Header.tsx
│       ├── Container.tsx
│       └── ... (navigation, footer, etc.)
├── lib/
│   └── utils.ts             # Utility functions (cn, formatDate, etc.)
├── tailwind.config.ts       # Tailwind customization
├── next.config.ts           # Next.js config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

### Where to Put Things

**New Components → `/components/ui/`**
- Self-contained, reusable UI elements
- Button, Input, Card, Modal, etc.
- Should be presentational

**Page Updates → `/app/`**
- Route handlers
- Page layouts
- Server components

**Utilities → `/lib/`**
- `cn()` - class merging
- `formatDate()` - date formatting
- `truncate()` - text utilities
- `debounce()` - event utilities
- `isValidEmail()` - validation

**Types → Co-located or `/types/`**
- Define interfaces next to components
- Or centralize in a dedicated types folder

### Component Template

```tsx
// components/ui/YourComponent.tsx
'use client'; // Add if interactive

import React from 'react';
import { cn } from '@/lib/utils';

export interface YourComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alt';
  disabled?: boolean;
}

const YourComponent = React.forwardRef<
  HTMLDivElement,
  YourComponentProps
>(
  ({ className, variant = 'default', disabled, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200',
      alt: 'bg-gray-50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-4 transition-colors',
          variants[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

YourComponent.displayName = 'YourComponent';

export default YourComponent;
```

## Quick Tips

1. **Always use `cn()`** for conditional classes - it handles Tailwind specificity correctly
2. **Add `'use client'`** to components that use hooks (useState, useEffect, etc.)
3. **Test keyboard navigation** - Tab, Enter, Escape should work
4. **Check focus states** - ensure ring utilities are visible
5. **Respect motion preferences** - use `useReducedMotion()` hook
6. **Use semantic HTML** - `<button>`, `<input>`, `<label>` for accessibility
7. **Mobile-first approach** - start with mobile, add media queries for larger screens
8. **Component composition** - build complex UIs from simple, reusable pieces
9. **Type your props** - use TypeScript interfaces for better DX
10. **Forward refs** - use `forwardRef` for custom components when needed

## Resources

- **Lucide Icons**: https://lucide.dev - Browse 400+ icons
- **Framer Motion**: https://www.framer.com/motion - Animation docs
- **Tailwind CSS**: https://tailwindcss.com/docs - Full utility reference
- **Next.js**: https://nextjs.org/docs - Framework documentation
- **Web Accessibility**: https://www.w3.org/WAI/WCAG21/quickref - WCAG guidelines

## Getting Help

- Check existing components in `/components/ui/` for patterns
- Review types in component interfaces
- Test with keyboard navigation and screen readers
- Refer to the CLAUDE.md file for project conventions
