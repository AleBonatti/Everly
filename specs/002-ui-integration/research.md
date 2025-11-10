# UI Integration Research
## Feature: 002-ui-integration
**Research Date**: 2025-11-07
**Target Stack**: Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript 5.x

---

## 1. Tailwind CSS 4 Setup & Best Practices

**Decision**: Use Tailwind CSS 4 (beta) with PostCSS configuration and custom theme for slate/sky color palette

**Rationale**:
- Tailwind 4 introduces CSS-first configuration with improved performance
- Native CSS variable support enables better theme customization
- Oxide engine provides faster build times and smaller output
- Mobile-first utilities align with responsive design requirements

**Implementation Notes**:

Installation:
```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

PostCSS configuration (`postcss.config.mjs`):
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Tailwind configuration (`tailwind.config.ts`):
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        sky: {
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
          950: '#082f49',
        },
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
    },
  },
  plugins: [],
}

export default config
```

CSS entry point (`app/globals.css`):
```css
@import "tailwindcss";

@layer base {
  :root {
    --color-primary: 14 165 233; /* sky-500 */
    --color-primary-dark: 2 132 199; /* sky-600 */
    --color-background: 248 250 252; /* slate-50 */
    --color-foreground: 15 23 42; /* slate-900 */
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-background: 15 23 42;
      --color-foreground: 248 250 252;
    }
  }
}
```

Responsive breakpoints (mobile-first):
```css
/* Default (mobile): 0px+ */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */
```

Focus states and accessibility:
```typescript
// Button focus example
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-sky-500
  focus:ring-offset-2
  focus-visible:ring-2
  focus-visible:ring-sky-500
">
  Action
</button>
```

**Alternatives Considered**:
- **Tailwind CSS 3.x**: More stable but lacks CSS-first config and performance improvements
- **Vanilla Extract**: Type-safe CSS but adds complexity and build overhead
- **CSS Modules**: Requires more manual work and lacks utility-first benefits

---

## 2. Inter Variable Font Integration

**Decision**: Use next/font/google for Inter variable font with font-display: swap

**Rationale**:
- next/font automatically optimizes font loading (no layout shift)
- Variable fonts provide flexible weight/width without multiple files
- Google Fonts CDN ensures reliability and performance
- font-display: swap prevents invisible text during load

**Implementation Notes**:

Configuration in `app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

Update `tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

CSS variable usage:
```css
/* Automatically available as: */
font-family: var(--font-inter);
```

Performance considerations:
- `display: 'swap'` shows fallback font immediately
- `preload: true` (default) adds preload link for faster discovery
- Automatic subsetting reduces file size
- Self-hosted via Next.js (no external requests in production)

**Alternatives Considered**:
- **System font stack**: No loading overhead but inconsistent cross-platform appearance
- **Self-hosted fonts**: More control but requires manual optimization and CDN setup
- **Adobe Fonts**: Requires subscription and adds external dependency

---

## 3. Lucide React Icon Library

**Decision**: Use lucide-react with tree-shaking and consistent sizing patterns

**Rationale**:
- Modern, well-maintained React icon library with 1000+ icons
- Excellent tree-shaking (only import what you use)
- Consistent design language across all icons
- TypeScript support out of the box
- Accessible by default with proper ARIA attributes

**Implementation Notes**:

Installation:
```bash
npm install lucide-react
```

Import pattern (tree-shaking):
```typescript
import { Plus, Edit, Trash2, Check, X, Menu, ChevronDown } from 'lucide-react'

// Usage in component
<button>
  <Plus className="w-5 h-5" aria-hidden="true" />
  <span>Add Item</span>
</button>
```

Common icons for UI:
```typescript
// Core actions
Plus        // Add new item
Edit        // Edit existing item
Trash2      // Delete item
Check       // Confirm/complete
X           // Close/cancel
Save        // Save changes

// Navigation
Menu        // Mobile menu toggle
ChevronDown // Dropdown indicator
ChevronLeft // Back navigation
ChevronRight // Forward navigation

// Status
Circle      // Incomplete checkbox
CheckCircle // Complete checkbox
AlertCircle // Warning/error state
```

Accessibility patterns:
```typescript
// Decorative icon (has text label)
<Plus className="w-5 h-5" aria-hidden="true" />
<span>Add Item</span>

// Standalone icon (needs label)
<button aria-label="Delete item">
  <Trash2 className="w-5 h-5" />
</button>

// With title for tooltip
<Trash2
  className="w-5 h-5"
  role="img"
  aria-label="Delete item"
/>
```

Sizing patterns:
```typescript
// Small (16px): w-4 h-4 - Inline with text
// Medium (20px): w-5 h-5 - Default button icons
// Large (24px): w-6 h-6 - Prominent actions
// Extra large (32px): w-8 h-8 - Hero sections
```

Icon button component pattern:
```typescript
interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

function IconButton({ icon: Icon, label, onClick, variant = 'secondary' }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-sky-500"
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
```

**Alternatives Considered**:
- **Heroicons**: Excellent but smaller icon set (only 292 icons)
- **React Icons**: Larger bundle size due to multiple icon packs
- **Font Awesome**: Requires Pro license for best icons, larger bundle size
- **Custom SVGs**: More control but requires manual optimization and maintenance

---

## 4. Framer Motion Animations

**Decision**: Use framer-motion with respect for prefers-reduced-motion and GPU-accelerated transforms

**Rationale**:
- Industry-standard animation library for React
- Declarative API with variants pattern for reusable animations
- Built-in accessibility (respects prefers-reduced-motion)
- AnimatePresence enables exit animations for list items
- Layout animations for smooth reordering without manual calculations

**Implementation Notes**:

Installation:
```bash
npm install framer-motion
```

Respect prefers-reduced-motion:
```typescript
'use client'

import { motion, useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  )
}
```

Common animation variants:
```typescript
// Fade
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// Slide from bottom
const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// Scale
const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// Slide from right (modal)
const modalVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
}
```

AnimatePresence for list items:
```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'

function TodoList({ items }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.2 }}
        >
          {item.title}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
```

Layout animations for reordering:
```typescript
<motion.div
  layout
  layoutId={item.id}
  transition={{
    layout: { type: 'spring', stiffness: 300, damping: 30 }
  }}
>
  {item.title}
</motion.div>
```

Performance optimizations:
```typescript
// Use GPU-accelerated properties (transform, opacity)
const optimizedVariants = {
  hidden: { opacity: 0, transform: 'translateY(20px)' },
  visible: { opacity: 1, transform: 'translateY(0)' },
}

// Add will-change for complex animations
<motion.div
  style={{ willChange: 'transform, opacity' }}
  animate={{ scale: 1.1 }}
>
  Content
</motion.div>

// Use layoutId for shared element transitions
<motion.div layoutId="unique-id">
  Shared element
</motion.div>
```

Stagger children pattern:
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.title}
    </motion.li>
  ))}
</motion.ul>
```

**Alternatives Considered**:
- **CSS transitions**: Simpler but lacks declarative API and exit animations
- **React Spring**: Physics-based but steeper learning curve and larger API surface
- **GSAP**: Powerful but requires imperative approach and commercial license for React
- **react-transition-group**: Lower-level but requires more manual work

---

## 5. Next.js 15 + React 19 Patterns

**Decision**: Use Server Components by default, Client Components for interactivity, with new React 19 hooks

**Rationale**:
- Server Components reduce JavaScript bundle size
- Client Components only where interactivity is needed
- React 19 hooks (useFormStatus, useOptimistic) improve UX
- State-based modals simpler than parallel routes for this use case
- Server Actions enable progressive enhancement

**Implementation Notes**:

"use client" directive pattern:
```typescript
// server component (default)
// app/page.tsx
import { TodoList } from './components/todo-list'

export default async function HomePage() {
  // Can fetch data directly
  const todos = await getTodos()

  return (
    <main>
      <TodoList initialData={todos} />
    </main>
  )
}

// client component (interactive)
// components/todo-list.tsx
'use client'

import { useState } from 'react'

export function TodoList({ initialData }) {
  const [todos, setTodos] = useState(initialData)

  return (
    <div>
      {/* Interactive UI */}
    </div>
  )
}
```

Form handling with useFormStatus:
```typescript
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  )
}

// Parent form
function TodoForm({ action }) {
  return (
    <form action={action}>
      <input name="title" />
      <SubmitButton />
    </form>
  )
}
```

Optimistic updates with useOptimistic:
```typescript
'use client'

import { useOptimistic } from 'react'

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  )

  async function handleAdd(formData) {
    const newTodo = { id: crypto.randomUUID(), title: formData.get('title') }
    addOptimisticTodo(newTodo)
    await addTodo(formData)
  }

  return (
    <>
      {optimisticTodos.map((todo) => (
        <div key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
          {todo.title}
        </div>
      ))}
    </>
  )
}
```

State-based modals (not parallel routes):
```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Add Item
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <TodoForm item={selectedItem} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
```

Server Actions pattern:
```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function addTodo(formData: FormData) {
  const title = formData.get('title')

  // Save to database
  await db.todos.create({ title })

  // Revalidate to show new data
  revalidatePath('/')
}

// Usage in client component
'use client'

import { addTodo } from './actions'

function TodoForm() {
  return (
    <form action={addTodo}>
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  )
}
```

Component composition pattern:
```typescript
// Server component wrapper
export default function Page() {
  return (
    <div>
      <Header />
      <InteractiveContent />
    </div>
  )
}

// Client component for interactive parts only
'use client'

function InteractiveContent() {
  const [state, setState] = useState()

  return (
    <div>
      {/* Only this subtree ships JS */}
    </div>
  )
}
```

**Alternatives Considered**:
- **Parallel routes for modals**: Over-engineered for simple state-based UI
- **Pages Router**: Missing Server Components and Server Actions benefits
- **Client-only app**: Larger bundle size and worse initial load performance
- **SWR/React Query**: Adds complexity when Server Actions + revalidation suffice

---

## 6. Responsive Design Strategy

**Decision**: Mobile-first utilities with container pattern and flexible grid/flexbox layouts

**Rationale**:
- Mobile-first ensures base styles work on smallest screens
- Container pattern provides consistent max-width and padding
- Grid and Flexbox each have ideal use cases
- Touch targets meet WCAG 2.5.5 (44x44px minimum)

**Implementation Notes**:

Mobile-first utility progression:
```typescript
// Base (mobile): 0px+
<div className="text-sm p-4">
  Mobile styles (default)
</div>

// sm: 640px+
<div className="text-sm sm:text-base p-4 sm:p-6">
  Tablet styles
</div>

// md: 768px+
<div className="text-sm sm:text-base md:text-lg p-4 sm:p-6 md:p-8">
  Desktop styles
</div>

// lg: 1024px+
<div className="text-sm sm:text-base md:text-lg lg:text-xl p-4 sm:p-6 md:p-8 lg:p-12">
  Large desktop styles
</div>
```

Container pattern:
```typescript
// Layout wrapper
<div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8">
  <main className="py-8 sm:py-12 lg:py-16">
    {children}
  </main>
</div>

// Reusable component
function Container({ children, className = '' }) {
  return (
    <div className={`max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
```

Grid vs Flexbox decision matrix:
```typescript
// Grid: For card layouts with consistent columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>

// Flexbox: For linear layouts with variable widths
<div className="flex flex-col sm:flex-row gap-4 items-center">
  <div className="flex-1">Content</div>
  <div className="w-auto">Actions</div>
</div>

// Grid: For form layouts
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <label className="md:col-span-2">
    Full width input
  </label>
  <label>Half width 1</label>
  <label>Half width 2</label>
</div>
```

Touch target sizing (WCAG 2.5.5):
```typescript
// Button minimum touch target (44x44px = min-h-11 min-w-11)
<button className="
  min-h-11 min-w-11
  px-4 py-2
  rounded-md
  inline-flex items-center justify-center
">
  Action
</button>

// Icon button (needs padding for touch target)
<button className="
  p-2.5
  rounded-md
  hover:bg-slate-100
" aria-label="Delete">
  <Trash2 className="w-5 h-5" />
</button>

// Link touch target
<a className="
  inline-block
  min-h-11
  py-2 px-4
  rounded-md
  flex items-center
">
  Link text
</a>
```

Responsive typography scale:
```typescript
// Heading scales
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Hero heading
</h1>

<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
  Section heading
</h2>

<h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
  Subsection heading
</h3>

// Body text
<p className="text-sm sm:text-base md:text-lg leading-relaxed">
  Body content
</p>
```

Responsive spacing:
```typescript
// Section spacing
<section className="py-8 sm:py-12 md:py-16 lg:py-20">
  Content
</section>

// Component spacing
<div className="space-y-4 sm:space-y-6 md:space-y-8">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Gap utilities
<div className="flex gap-2 sm:gap-4 md:gap-6">
  Items
</div>
```

**Alternatives Considered**:
- **Desktop-first approach**: Requires overriding more styles at smaller breakpoints
- **Fixed pixel breakpoints**: Less flexible than Tailwind's preset breakpoints
- **CSS Grid only**: Flexbox better for certain linear layouts
- **36x36px touch targets**: Below WCAG 2.5.5 AAA recommendation (44x44px)

---

## 7. Accessibility (WCAG AA)

**Decision**: Implement WCAG 2.1 Level AA compliance with focus on contrast, focus states, keyboard navigation, and ARIA

**Rationale**:
- Legal requirement in many jurisdictions
- Improves usability for all users (not just those with disabilities)
- Focus management prevents keyboard navigation issues
- Proper ARIA attributes enable screen reader compatibility
- Semantic HTML provides baseline accessibility

**Implementation Notes**:

Contrast checker tools:
```bash
# Online tools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Stark (Figma plugin): Real-time contrast checking in design
- Chrome DevTools: Lighthouse audit includes contrast checks

# WCAG AA requirements
- Normal text (< 18px): 4.5:1 minimum contrast ratio
- Large text (>= 18px or >= 14px bold): 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

# Example checks
Background: #f8fafc (slate-50)
Text: #0f172a (slate-900)
Ratio: 15.8:1 (Pass AAA)

Background: #0ea5e9 (sky-500)
Text: #ffffff (white)
Ratio: 3.2:1 (Pass AA for large text only)
```

Focus ring patterns:
```typescript
// Default focus ring (use across all interactive elements)
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-sky-500
  focus:ring-offset-2
  focus:ring-offset-white
">
  Button text
</button>

// Focus-visible (only show on keyboard navigation)
<a className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-sky-500
  focus-visible:ring-offset-2
  rounded-md
">
  Link text
</a>

// Custom focus indicator for inputs
<input className="
  border border-slate-300
  focus:border-sky-500
  focus:ring-2
  focus:ring-sky-500/20
  focus:outline-none
  rounded-md
" />

// Dark mode focus ring
<button className="
  focus:ring-2
  focus:ring-sky-400
  focus:ring-offset-2
  focus:ring-offset-slate-900
  dark:focus:ring-offset-slate-900
">
  Button
</button>
```

Keyboard navigation patterns:
```typescript
// Tab order (use tabIndex only when necessary)
<div>
  <button>First (tab index 0)</button>
  <button>Second (tab index 0)</button>
  <button tabIndex={-1}>Skip (not in tab order)</button>
</div>

// Enter/Space for button actions
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Custom button
</div>

// Escape to close modal
function Modal({ onClose }) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return <div role="dialog" aria-modal="true">...</div>
}

// Arrow keys for lists/menus
function DropdownMenu({ items }) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => Math.min(i + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        items[focusedIndex].onClick()
        break
    }
  }

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <div
          key={item.id}
          role="menuitem"
          tabIndex={i === focusedIndex ? 0 : -1}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}
```

ARIA attributes reference:
```typescript
// aria-label: Provides accessible name
<button aria-label="Delete item">
  <Trash2 className="w-5 h-5" />
</button>

// aria-labelledby: References another element for label
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Section Title</h2>
  Content
</section>

// aria-describedby: Additional description
<input
  id="email"
  aria-describedby="email-hint"
/>
<p id="email-hint" className="text-sm text-slate-600">
  We'll never share your email
</p>

// aria-expanded: Collapsible state
<button
  aria-expanded={isOpen}
  aria-controls="dropdown-content"
  onClick={() => setIsOpen(!isOpen)}
>
  Toggle
</button>
<div id="dropdown-content" hidden={!isOpen}>
  Content
</div>

// aria-hidden: Hide decorative elements from screen readers
<Plus className="w-5 h-5" aria-hidden="true" />
<span>Add Item</span>

// aria-live: Announce dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// aria-invalid: Form validation state
<input
  aria-invalid={hasError}
  aria-errormessage={hasError ? 'error-message' : undefined}
/>
{hasError && (
  <p id="error-message" role="alert">
    This field is required
  </p>
)}

// role: Semantic role when HTML element isn't available
<div role="dialog" aria-modal="true">
  Modal content
</div>

<div role="status" aria-live="polite">
  Loading...
</div>

<nav role="navigation" aria-label="Main navigation">
  Navigation items
</nav>
```

Screen reader patterns:
```typescript
// Skip to main content link
<a
  href="#main-content"
  className="
    sr-only
    focus:not-sr-only
    focus:absolute
    focus:top-4
    focus:left-4
    focus:z-50
    focus:px-4
    focus:py-2
    focus:bg-sky-500
    focus:text-white
    focus:rounded-md
  "
>
  Skip to main content
</a>

<main id="main-content">
  Content
</main>

// Visually hidden but screen-reader accessible
<span className="sr-only">
  Additional context for screen readers
</span>

// Loading state announcement
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading items...' : `${items.length} items loaded`}
</div>
```

Form accessibility:
```typescript
// Label association (required)
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>

// Error messages
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-invalid={hasError}
  aria-describedby="password-error"
/>
{hasError && (
  <p id="password-error" role="alert" className="text-red-600">
    Password must be at least 8 characters
  </p>
)}

// Fieldset grouping
<fieldset>
  <legend>Contact preferences</legend>
  <label>
    <input type="checkbox" name="email" />
    Email
  </label>
  <label>
    <input type="checkbox" name="sms" />
    SMS
  </label>
</fieldset>
```

**Alternatives Considered**:
- **WCAG AAA compliance**: More stringent but not required for most applications
- **Accessibility overlay widgets**: Band-aid solution that doesn't fix underlying issues
- **Manual ARIA everywhere**: Over-use of ARIA can harm accessibility (use semantic HTML first)
- **Skip accessibility testing**: Legal and ethical issues, alienates users

---

## 8. Component Architecture

**Decision**: TypeScript interfaces + cn() utility + composition patterns + cva for variants

**Rationale**:
- TypeScript provides compile-time safety for props
- cn() utility merges Tailwind classes correctly
- Composition over inheritance enables flexibility
- cva (class-variance-authority) standardizes variant patterns
- Reusable primitives reduce duplication

**Implementation Notes**:

TypeScript prop interfaces:
```typescript
// Basic component props
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

// Extending native HTML props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

// Generic component
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage }: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}
```

cn() utility (clsx + tailwind-merge):
```bash
npm install clsx tailwind-merge
```

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variant === 'primary' && 'bg-sky-500 text-white hover:bg-sky-600',
        variant === 'secondary' && 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        className
      )}
      {...props}
    />
  )
}
```

Component composition patterns:
```typescript
// Compound components
interface CardProps {
  children: React.ReactNode
  className?: string
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-200', className)}>
      {children}
    </div>
  )
}

function CardBody({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-200', className)}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export { Card }

// Usage
<Card>
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    Content
  </Card.Body>
  <Card.Footer>
    <button>Action</button>
  </Card.Footer>
</Card>
```

Variant patterns with cva:
```bash
npm install class-variance-authority
```

```typescript
// components/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-sky-500 text-white hover:bg-sky-600',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'hover:bg-slate-100 text-slate-900',
        link: 'underline-offset-4 hover:underline text-sky-500',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-13 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

Render props pattern:
```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataFetcher<Todo[]> url="/api/todos">
  {(data, loading, error) => {
    if (loading) return <Spinner />
    if (error) return <Error message={error.message} />
    if (!data) return null
    return <TodoList items={data} />
  }}
</DataFetcher>
```

Custom hooks for reusable logic:
```typescript
// hooks/use-local-storage.ts
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  return [value, setStoredValue] as const
}

// hooks/use-media-query.ts
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Usage
function Component() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
}
```

**Alternatives Considered**:
- **CSS-in-JS libraries (styled-components, emotion)**: Adds runtime overhead and complexity
- **Manual class concatenation**: Error-prone and doesn't handle Tailwind conflicts
- **Props-based styling (style prop)**: Loses Tailwind benefits and increases inline styling
- **Class components**: Hooks provide better code organization and reuse

---

## Implementation Checklist

### Phase 1: Foundation Setup
- [ ] Install Tailwind CSS 4 beta and configure PostCSS
- [ ] Set up custom theme (slate/sky colors, spacing)
- [ ] Configure Inter variable font in app/layout.tsx
- [ ] Install and test lucide-react icons
- [ ] Install framer-motion for animations
- [ ] Create cn() utility function

### Phase 2: Core Components
- [ ] Build Button component with variants (cva)
- [ ] Build Input component with label/error states
- [ ] Build Card compound component
- [ ] Build Modal component with AnimatePresence
- [ ] Build IconButton component
- [ ] Test keyboard navigation and focus states

### Phase 3: Accessibility Audit
- [ ] Run Lighthouse accessibility audit
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify keyboard navigation (tab, enter, escape, arrows)
- [ ] Check color contrast ratios (WebAIM)
- [ ] Validate ARIA attributes
- [ ] Test with reduced motion enabled

### Phase 4: Responsive Testing
- [ ] Test on mobile (375px - iPhone SE)
- [ ] Test on tablet (768px - iPad)
- [ ] Test on desktop (1024px, 1280px, 1536px)
- [ ] Verify touch targets (44x44px minimum)
- [ ] Test text scaling (200% zoom)

### Phase 5: Performance Optimization
- [ ] Check bundle size (bundle analyzer)
- [ ] Verify tree-shaking (lucide-react imports)
- [ ] Test font loading (no FOUT/FOIT)
- [ ] Measure animation performance (DevTools)
- [ ] Test with slow 3G network throttling

---

## Resources

### Documentation
- [Tailwind CSS 4 Beta Docs](https://tailwindcss.com/docs/v4-beta)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Beta Docs](https://react.dev/blog/2024/04/25/react-19)
- [Framer Motion API](https://www.framer.com/motion/)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Libraries
- [class-variance-authority (cva)](https://cva.style/docs)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [clsx](https://github.com/lukeed/clsx)

---

## Summary

This research document establishes the technical foundation for implementing a modern, accessible UI using Next.js 15, React 19, and Tailwind CSS 4. Key decisions include:

1. **Styling**: Tailwind CSS 4 with custom slate/sky theme
2. **Typography**: Inter variable font via next/font
3. **Icons**: Lucide React with tree-shaking
4. **Animations**: Framer Motion with reduced motion support
5. **Architecture**: Server Components by default, Client Components for interactivity
6. **Responsive**: Mobile-first with consistent container pattern
7. **Accessibility**: WCAG AA compliance with focus on keyboard navigation and ARIA
8. **Components**: TypeScript + cn() utility + cva variants + composition

All patterns prioritize performance, accessibility, and developer experience. Implementation should follow the phased checklist to ensure systematic progress and quality assurance.
