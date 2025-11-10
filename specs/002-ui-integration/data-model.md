# Data Model: UI Components & Theme Configuration

**Date**: 2025-11-07
**Feature**: 002-ui-integration
**Phase**: Phase 1 - Design & Contracts
**Status**: Complete

---

## Overview

This document defines the UI component data structures, Tailwind CSS theme configuration, layout patterns, and animation variants for the FutureList UI integration. It serves as the comprehensive reference for component developers and designers implementing the new UI layer.

---

## 1. Theme Configuration

### Tailwind Config Structure

The theme configuration extends Tailwind CSS with custom colors, spacing, typography, and breakpoints optimized for FutureList.

```javascript
// tailwind.config.js
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
      // Color Palette
      colors: {
        // Neutral: Slate scale for text and backgrounds
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Primary Accent: Sky blue for CTAs, links, and highlights
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
        // Secondary Accent: Purple for secondary actions
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
        // Success: Green for positive states
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
        // Error: Red for errors and destructive actions
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Warning: Amber for warnings and alerts
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },

      // Spacing Scale
      // Uses 4px base unit for consistency
      spacing: {
        0: '0',
        1: '0.25rem', // 4px
        2: '0.5rem',  // 8px
        3: '0.75rem', // 12px
        4: '1rem',    // 16px
        5: '1.25rem', // 20px
        6: '1.5rem',  // 24px
        8: '2rem',    // 32px
        10: '2.5rem', // 40px
        12: '3rem',   // 48px
        16: '4rem',   // 64px
        20: '5rem',   // 80px
        24: '6rem',   // 96px
      },

      // Typography Scale
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],           // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],       // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],          // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],      // 36px
      },

      // Font Family
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },

      // Line Height
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },

      // Letter Spacing
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
      },

      // Border Radius
      borderRadius: {
        none: '0',
        sm: '0.25rem',  // 4px
        base: '0.5rem', // 8px
        md: '0.75rem',  // 12px
        lg: '1rem',     // 16px
        xl: '1.5rem',   // 24px
        full: '9999px',
      },

      // Shadow Scale
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },

      // Max Width Container
      maxWidth: {
        container: '1024px',
      },

      // Transition Timing
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },

      // Custom Utilities
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },

  plugins: [
    // Custom plugin for focus ring utilities
    function ({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '@apply outline-none ring-2 ring-offset-2 ring-primary-500': {},
        },
        '.focus-ring-dark': {
          '@apply outline-none ring-2 ring-offset-2 ring-neutral-700': {},
        },
      })
    },
  ],
}

export default config
```

### Color Palette

**Neutral/Slate** (Backgrounds, borders, text):
- 50-100: Lightest backgrounds, disabled states
- 200-300: Borders, dividers, subtle accents
- 400-500: Secondary text
- 600-700: Primary text
- 800-900: Darkest text, dark mode future-ready

**Sky (Primary Accent)** (CTAs, links, focus states):
- 500: Primary button background, active link
- 600-700: Hover states, pressed states
- 300-400: Light backgrounds, badges

**Success, Error, Warning** (State indicators):
- Success (green): Completed items, positive confirmations
- Error (red): Form errors, destructive actions
- Warning (amber): Alerts, notifications requiring attention

### Spacing Scale

All spacing uses a base 4px unit for alignment consistency:
- **4px (1x)**: Tight spacing, icon padding
- **8px (2x)**: Element spacing, small gaps
- **12px (3x)**: Component padding
- **16px (4x)**: Default padding, section spacing
- **24px (6x)**: Large section spacing
- **32px+ (8x+)**: Major layout sections

### Typography Scale

**Font**: Inter variable (loaded via `next/font/google`)

**Sizes**:
- `xs` (12px): Small labels, helper text
- `sm` (14px): Secondary text, descriptions
- `base` (16px): Default body text, form inputs
- `lg` (18px): Subheadings, emphasis
- `xl` (20px): Section headings
- `2xl-4xl`: Page headings (decreasing frequency of use)

**Line Height**:
- 1.25 (tight): Headings
- 1.5 (normal): Body text, form inputs
- 1.625 (relaxed): Long form content
- 2 (loose): Large text emphasis

### Breakpoints

Tailwind's default breakpoints (mobile-first):
- `sm`: 640px (tablets in portrait)
- `md`: 768px (tablets in landscape)
- `lg`: 1024px (desktops, max container width)
- `xl`: 1280px (large desktops)

**Usage Pattern**: Start with mobile layout, then add responsive modifiers:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Container Max-Width

All page content wrapped in a max-width container (1024px) for optimal reading width and visual hierarchy:

```tsx
<div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>
```

---

## 2. Component Prop Interfaces

### 1. Button Component

**Purpose**: Primary interactive element for user actions (submit, confirm, create, delete, etc.)

**Props Interface**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Visual style variant
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  // Size (affects padding, font size, icon size)
  size?: 'sm' | 'md' | 'lg';

  // Loading state (disables button, shows spinner)
  loading?: boolean;

  // Optional icon component (left or right)
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';

  // Native HTML button attributes
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

**Variants**:
- **primary**: Filled sky-500 background, white text, full CTA
- **secondary**: Bordered neutral-300, slate text, secondary action
- **ghost**: No background, slate text, icon-only or text-only, subtle
- **danger**: Filled error-600 background, white text, destructive action

**Sizes**:
- **sm**: 8px vertical padding, 12px horizontal, text-sm (14px)
- **md**: 10px vertical padding, 16px horizontal, text-base (16px)
- **lg**: 12px vertical padding, 20px horizontal, text-base (16px)

**States**:
- **default**: Outlined ring on focus (focus-ring class)
- **hover**: Darker shade (primary-600, secondary color shift)
- **active/pressed**: Even darker shade
- **disabled**: 50% opacity, cursor-not-allowed
- **loading**: Disabled, spinner icon, text hidden

**Example Usage**:
```tsx
// Primary CTA
<Button variant="primary" size="md" onClick={handleCreate}>
  Create Item
</Button>

// Loading state
<Button variant="primary" loading={isLoading}>
  Saving...
</Button>

// Icon button (ghost variant)
<Button variant="ghost" size="sm" icon={<Trash2 />} />

// Danger action
<Button variant="danger" size="md" onClick={handleDelete}>
  Delete
</Button>
```

---

### 2. Input Component

**Purpose**: Text input field for single-line user input with optional label and error states

**Props Interface**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Label displayed above input
  label?: string;

  // Error message displayed below input
  error?: string;

  // Helper text displayed below input (when no error)
  helperText?: string;

  // Optional icon (left side)
  icon?: React.ReactNode;

  // Native HTML input attributes
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}
```

**States**:
- **default**: Border neutral-300, text slate-700
- **focus**: Ring-2 ring-primary-500, focus-ring class
- **error**: Border error-500, text error-600, error message displayed
- **disabled**: Background neutral-50, opacity 50%
- **filled**: Non-empty value, standard styling

**Example Usage**:
```tsx
// Basic input
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With error
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 6 characters"
/>

// With helper text
<Input
  label="Username"
  placeholder="lowercase, 3-20 chars"
  helperText="Used for login and profile"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
```

---

### 3. Textarea Component

**Purpose**: Multi-line text input for item descriptions, notes, and longer form content

**Props Interface**:
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Label displayed above textarea
  label?: string;

  // Error message displayed below textarea
  error?: string;

  // Helper text displayed below textarea
  helperText?: string;

  // Character limit (shows counter)
  maxLength?: number;

  // Number of visible rows (default: 4)
  rows?: number;

  // Auto-expand as user types (if true, rows prop ignored)
  autoExpand?: boolean;

  // Native HTML textarea attributes
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
}
```

**States**: Same as Input (default, focus, error, disabled)

**Example Usage**:
```tsx
// Basic textarea
<Textarea
  label="Description"
  placeholder="Add notes about this item..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>

// With character limit
<Textarea
  label="Notes"
  maxLength={500}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  autoExpand
/>

// With error
<Textarea
  label="Details"
  value={details}
  onChange={(e) => setDetails(e.target.value)}
  error="This field is required"
/>
```

---

### 4. Select Component

**Purpose**: Dropdown select for choosing from predefined options (currently used for priority in item edit)

**Props Interface**:
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  // Label displayed above select
  label?: string;

  // Error message displayed below select
  error?: string;

  // Helper text displayed below select
  helperText?: string;

  // Array of options
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;

  // Placeholder text when no value selected
  placeholder?: string;

  // Native HTML select attributes
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
}
```

**States**: Same as Input (default, focus, error, disabled)

**Example Usage**:
```tsx
// Priority selector
<Select
  label="Priority"
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]}
  placeholder="Choose priority..."
/>

// With error
<Select
  label="Category"
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
  options={categories.map(c => ({ value: c.id, label: c.name }))}
  error="Category is required"
  required
/>
```

---

### 5. CategoryPicker Component

**Purpose**: Specialized UI for selecting categories (used inline on home page and in modal)

**Props Interface**:
```typescript
interface CategoryPickerProps {
  // Array of available categories
  categories: Array<{
    id: string;
    name: string;
    type?: 'default' | 'custom';
  }>;

  // Currently selected category ID (null = show all)
  selected: string | null;

  // Callback when selection changes
  onSelect: (categoryId: string | null) => void;

  // Selection mode (single for now, multiple in future)
  mode?: 'single';

  // Optional: Show "All Categories" option
  showAll?: boolean;

  // Inline display (chips) vs dropdown?
  display?: 'chips' | 'dropdown';
}
```

**States**:
- **default**: Neutral-200 border, slate-700 text
- **selected**: Primary-500 background, white text
- **hover**: Neutral-300 border (unselected), primary-600 (selected)
- **focus**: Ring-2 ring-primary-500

**Example Usage**:
```tsx
// Inline chip display (recommended for home page)
<CategoryPicker
  categories={categories}
  selected={selectedCategoryId}
  onSelect={setCategoryId}
  mode="single"
  display="chips"
  showAll
/>

// In modal for form
<CategoryPicker
  categories={categories}
  selected={itemCategoryId}
  onSelect={setItemCategoryId}
  mode="single"
  display="dropdown"
/>
```

---

### 6. Checkbox Component

**Purpose**: Boolean toggle input (yes/no, check/uncheck)

**Props Interface**:
```typescript
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  // Label displayed next to checkbox
  label?: string;

  // Checked state
  checked?: boolean;

  // Callback when state changes
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Helper text displayed below
  helperText?: string;

  // Native HTML attributes
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}
```

**States**:
- **unchecked**: Border neutral-300, background white
- **checked**: Background primary-500, checkmark white
- **hover**: Border primary-400 (unchecked), primary-600 (checked)
- **focus**: Ring-2 ring-primary-500
- **disabled**: Opacity 50%, cursor-not-allowed

**Example Usage**:
```tsx
// Simple checkbox
<Checkbox
  label="Subscribe to updates"
  checked={subscribe}
  onChange={(e) => setSubscribe(e.target.checked)}
/>

// "Hide done items" toggle
<Checkbox
  label="Hide completed items"
  checked={hideDone}
  onChange={(e) => setHideDone(e.target.checked)}
/>
```

---

### 7. Toggle Component

**Purpose**: Switch-style boolean toggle (more visual than checkbox)

**Props Interface**:
```typescript
interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  // Label displayed next to toggle
  label?: string;

  // Checked state
  checked?: boolean;

  // Callback when state changes
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Optional secondary label for checked state
  checkedLabel?: string;
  uncheckedLabel?: string;

  // Native HTML attributes
  disabled?: boolean;
  name?: string;
  id?: string;
}
```

**States**:
- **off**: Background neutral-200, circle left, white circle
- **on**: Background primary-500, circle right, white circle
- **hover**: Opacity 90% (off), primary-600 (on)
- **focus**: Ring-2 ring-primary-500
- **disabled**: Opacity 50%, cursor-not-allowed

**Example Usage**:
```tsx
// Simple toggle
<Toggle
  label="Notifications enabled"
  checked={notificationsOn}
  onChange={(e) => setNotificationsOn(e.target.checked)}
/>

// With explicit labels
<Toggle
  label="Dark mode"
  checked={darkModeEnabled}
  onChange={(e) => setDarkModeEnabled(e.target.checked)}
  uncheckedLabel="Light"
  checkedLabel="Dark"
/>
```

---

### 8. Modal Component

**Purpose**: Overlay dialog for edit forms, confirmations, and secondary actions

**Props Interface**:
```typescript
interface ModalProps {
  // Control modal visibility
  isOpen: boolean;

  // Callback when modal should close (backdrop click, escape key)
  onClose: () => void;

  // Modal title (displayed in header)
  title?: string;

  // Optional description below title
  description?: string;

  // Modal content
  children: React.ReactNode;

  // Modal size (affects max-width)
  size?: 'sm' | 'md' | 'lg' | 'full';

  // Show close button (X)
  showCloseButton?: boolean;

  // Allow backdrop click to close
  closeOnBackdropClick?: boolean;

  // Allow escape key to close
  closeOnEscape?: boolean;
}
```

**Sizes**:
- **sm**: max-w-sm (24rem)
- **md**: max-w-md (28rem)
- **lg**: max-w-lg (32rem)
- **full**: Full width minus margins

**States**:
- **closed**: Not rendered (modal hidden)
- **opening**: Fade-in animation (200ms)
- **open**: Fully visible, backdrop semi-transparent
- **closing**: Fade-out animation (200ms)

**Example Usage**:
```tsx
// Edit item modal
<Modal
  isOpen={isEditOpen}
  onClose={() => setIsEditOpen(false)}
  title="Edit Item"
  size="md"
>
  <ItemEditForm
    item={selectedItem}
    onSave={handleSave}
    onCancel={() => setIsEditOpen(false)}
  />
</Modal>

// Confirmation modal
<Modal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  title="Delete Item?"
  description="This action cannot be undone."
  size="sm"
>
  <ConfirmDeleteForm onConfirm={handleConfirmDelete} />
</Modal>
```

---

### 9. Dialog Component

**Purpose**: Wrapper component for modal content (forms, messages, etc.)

**Props Interface**:
```typescript
interface DialogProps {
  // Dialog title
  title?: string;

  // Dialog description/subtitle
  description?: string;

  // Dialog content (form fields, text, etc.)
  children: React.ReactNode;

  // Footer actions (buttons)
  footer?: React.ReactNode;

  // Optional className for custom styling
  className?: string;
}
```

**Example Usage**:
```tsx
// In modal with form
<Modal isOpen={isOpen} onClose={onClose}>
  <Dialog title="Add New Item" description="Create a new wishlist item">
    <ItemForm onSubmit={handleSubmit} />
    <Dialog.Footer>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="primary" type="submit">Save</Button>
    </Dialog.Footer>
  </Dialog>
</Modal>
```

---

### 10. EmptyState Component

**Purpose**: Friendly message when user has no items or empty filtered results

**Props Interface**:
```typescript
interface EmptyStateProps {
  // Icon component (Lucide icon)
  icon: React.ComponentType<{ className?: string }>;

  // Heading text
  title: string;

  // Optional description/subtext
  description?: string;

  // Optional action button
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}
```

**States**:
- **default**: Icon neutral-400, title slate-800, description slate-600
- **hover (on action)**: Button hover state if action provided

**Example Usage**:
```tsx
// No items in list
<EmptyState
  icon={Inbox}
  title="No items yet"
  description="Create your first wishlist item to get started"
  action={{
    label: "Add Item",
    onClick: () => setShowAddForm(true),
  }}
/>

// No results for filter
<EmptyState
  icon={Filter}
  title="No items in this category"
  description="Try selecting a different category or creating a new item"
/>

// No completed items
<EmptyState
  icon={CheckCircle2}
  title="Nothing completed yet"
  description="Complete items to see them here"
/>
```

---

### 11. Card Component

**Purpose**: Generic container with padding, border, and shadow for grouping related content

**Props Interface**:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Optional header section
  header?: React.ReactNode;

  // Card content
  children: React.ReactNode;

  // Optional footer section
  footer?: React.ReactNode;

  // Padding size
  padding?: 'sm' | 'md' | 'lg';

  // Shadow intensity
  shadow?: 'none' | 'sm' | 'base' | 'md' | 'lg';

  // Optional hover effect
  hoverable?: boolean;

  // Native div attributes
  className?: string;
  onClick?: () => void;
}
```

**States**:
- **default**: Background white, border neutral-200, shadow-sm
- **hover (hoverable)**: Shadow-md, slight scale (transform scale-105)
- **focus (clickable)**: Ring-2 ring-primary-500

**Example Usage**:
```tsx
// Item card in list
<Card padding="md" shadow="sm" hoverable>
  <div className="flex justify-between items-start">
    <div>
      <h3 className="text-lg font-semibold text-neutral-800">Item Title</h3>
      <p className="text-sm text-neutral-600">Category Name</p>
    </div>
    <Badge>{status}</Badge>
  </div>
</Card>

// Section card
<Card padding="lg" shadow="base">
  <Card.Header>
    <h2 className="text-xl font-bold">Account Settings</h2>
  </Card.Header>
  <Card.Content>
    {/* Form fields */}
  </Card.Content>
  <Card.Footer>
    <Button>Save Changes</Button>
  </Card.Footer>
</Card>
```

---

### 12. ListItem Component

**Purpose**: Specialized card component for displaying individual items with title, category, status, and actions

**Props Interface**:
```typescript
interface ListItemProps {
  // Item data object
  item: {
    id: string;
    title: string;
    category: {
      id: string;
      name: string;
    };
    done: boolean;
    description?: string;
    dueDate?: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
  };

  // Callback when edit button clicked
  onEdit: (itemId: string) => void;

  // Callback when delete button clicked
  onDelete: (itemId: string) => void;

  // Callback when done toggle clicked
  onToggleDone: (itemId: string, newStatus: boolean) => void;

  // Optional: Show delete confirmation before deleting
  confirmDelete?: boolean;
}
```

**States**:
- **todo**: Title slate-800, category badge primary-100/primary-700
- **done**: Title slate-400 with line-through, category badge neutral-100/neutral-600
- **hover**: Background neutral-50, action buttons visible
- **loading**: Disabled state during save

**Example Usage**:
```tsx
// In items list
{items.map(item => (
  <ListItem
    key={item.id}
    item={item}
    onEdit={(id) => {
      setSelectedItemId(id);
      setIsEditOpen(true);
    }}
    onDelete={(id) => handleDeleteItem(id)}
    onToggleDone={(id, done) => handleToggleDone(id, done)}
    confirmDelete
  />
))}
```

---

### 13. Loader Component

**Purpose**: Loading indicator (spinner or skeleton) for async operations

**Props Interface**:
```typescript
interface LoaderProps {
  // Loader type
  variant?: 'spinner' | 'skeleton';

  // Show loading indicator
  isLoading?: boolean;

  // Optional message displayed with spinner
  message?: string;

  // Size of loader
  size?: 'sm' | 'md' | 'lg';

  // Full page overlay (for global loading)
  fullPage?: boolean;

  // Optional content to show while loading (skeleton only)
  children?: React.ReactNode;
}
```

**Variants**:
- **spinner**: Rotating circle icon (Lucide `Loader2`)
- **skeleton**: Pulsing placeholder boxes (matches content shape)

**Sizes**:
- **sm**: 24px (text-sm spinners)
- **md**: 32px (default)
- **lg**: 48px (full page loader)

**Example Usage**:
```tsx
// Inline spinner
{isCreating && <Loader variant="spinner" size="sm" message="Saving..." />}

// Skeleton loaders for list
<Loader variant="skeleton" isLoading={isLoading}>
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
</Loader>

// Full page loader
{isPageLoading && <Loader variant="spinner" fullPage message="Loading..." />}
```

---

## 3. Item Data Structure

### Item Entity TypeScript Interface

```typescript
// features/items/types.ts

export type ItemStatus = 'todo' | 'done';
export type ItemPriority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  type?: 'default' | 'custom';
}

export interface Item {
  // Required fields
  id: string;
  title: string;
  category: Category;
  done: boolean;

  // Optional enrichment fields
  description?: string;
  dueDate?: string; // ISO 8601 date (YYYY-MM-DD)
  notes?: string;
  priority?: ItemPriority;
  url?: string;
  location?: string;

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  userId: string;
}

export interface ItemWithCategory extends Item {
  category: Category;
}

// Form state while editing
export interface ItemFormData {
  title: string;
  categoryId: string;
  description?: string;
  dueDate?: string;
  notes?: string;
  priority?: ItemPriority;
  done: boolean;
}

// Filter state for list
export interface ItemFilterState {
  search: string;
  categoryId: string | null;
  status: ItemStatus | null;
  showDone: boolean;
}

// List rendering state
export interface ItemListState {
  items: Item[];
  filteredItems: Item[];
  isLoading: boolean;
  error?: string;
  selectedItemId?: string;
  isEditModalOpen: boolean;
}
```

### Validation Rules

**Title**:
- Required
- Length: 1-200 characters
- Trim whitespace

**Category**:
- Required
- Must be valid category ID
- User must have permission to use category

**Description**:
- Optional
- Length: 0-1000 characters
- Can contain markdown for future rendering

**Due Date**:
- Optional
- Format: YYYY-MM-DD (ISO 8601)
- Can be past date (no validation)

**Notes**:
- Optional
- Length: 0-1000 characters
- Personal annotations only

**Priority**:
- Optional
- Enum: 'low' | 'medium' | 'high'
- Default: 'medium'

**Status**:
- Required
- Enum: 'todo' | 'done'
- Default: 'todo'

---

## 4. Layout Patterns

### Container Pattern

**Centered content container with consistent padding and max-width:**

```tsx
// Page root container
<div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Page content */}
</div>

// CSS breakdown:
// max-w-container: 1024px max-width
// mx-auto: Center horizontally
// px-4: 16px padding left/right (mobile)
// sm:px-6: 24px padding (sm breakpoint and up)
// lg:px-8: 32px padding (lg breakpoint and up)
// py-8: 32px padding top/bottom
```

### Grid Layout Pattern

**Responsive grid for item cards (mobile-first):**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <ListItem key={item.id} item={item} {...handlers} />
  ))}
</div>

// CSS breakdown:
// grid: CSS Grid
// grid-cols-1: 1 column (mobile)
// md:grid-cols-2: 2 columns (tablets)
// lg:grid-cols-3: 3 columns (desktops)
// gap-4: 16px gap between items
```

### Stack Layout Pattern

**Vertical flex layout for stacking elements:**

```tsx
<div className="flex flex-col gap-4">
  <input className="..." />
  <textarea className="..." />
  <select className="..." />
</div>

// OR with gap utility:
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// CSS breakdown:
// flex: Display flex
// flex-col: Column direction (vertical)
// gap-4: 16px gap between items
// space-y-4: Alternative - adds margin-top to children except first
```

### Card Layout Pattern

**Styled container for grouping content:**

```tsx
<div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
  {/* Card content */}
</div>

// CSS breakdown:
// rounded-lg: 16px border-radius
// border: 1px border
// border-neutral-200: Light gray border
// bg-white: White background
// p-4: 16px padding
// shadow-sm: Subtle shadow
// hover:shadow-md: Darker shadow on hover
// transition-shadow: Smooth shadow transition
```

### Form Stack Pattern

**Vertical form layout with consistent spacing:**

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <label>Title</label>
    <Input placeholder="Item title" />
  </div>

  <div className="space-y-2">
    <label>Category</label>
    <Select options={categories} />
  </div>

  <div className="flex gap-3">
    <Button variant="primary" type="submit">Save</Button>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
  </div>
</form>

// CSS breakdown:
// space-y-6: 24px gap between form groups
// space-y-2: 8px gap between label and input
// flex: Flex row for buttons
// gap-3: 12px gap between buttons
```

### Header Bar Pattern

**Top navigation bar with consistent styling:**

```tsx
<header className="border-b border-neutral-200 bg-white">
  <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-neutral-800">FutureList</h1>
    <nav className="flex gap-4">
      <Button variant="ghost">Menu</Button>
    </nav>
  </div>
</header>

// CSS breakdown:
// border-b: Bottom border
// border-neutral-200: Light gray border
// bg-white: White background
// py-4: 16px top/bottom padding
// flex justify-between: Space between logo and nav
// items-center: Vertical centering
```

### Responsive Breakpoint Usage

**Common responsive patterns:**

```tsx
// Text responsiveness
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Responsive Title
</h1>

// Layout switching
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
  <aside className="md:w-1/4">Sidebar</aside>
  <main className="md:w-3/4">Content</main>
</div>

// Visibility
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// Padding responsiveness
<div className="px-4 sm:px-6 lg:px-8">Content</div>

// Size responsiveness
<div className="w-full md:max-w-md">Form</div>
```

---

## 5. Animation Variants

### Framer Motion Variant Patterns

All animations respect `prefers-reduced-motion` media query. Users with motion preferences enabled will see instant state changes without animations.

### fadeIn Variant

**Used for**: Initial page load, modal opening, list item appearance

```typescript
const fadeInVariant = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3, // 300ms
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2, // 200ms
      ease: 'easeIn',
    },
  },
};

// Usage:
<motion.div
  initial="hidden"
  animate="visible"
  exit="exit"
  variants={fadeInVariant}
>
  {content}
</motion.div>
```

### slideIn Variant

**Used for**: List item addition, modal entrance, sidebar appearance

```typescript
const slideInVariant = {
  hidden: {
    opacity: 0,
    x: -20, // Slide from left
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3, // 300ms
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20, // Slide to right
    transition: {
      duration: 0.2, // 200ms
      ease: 'easeIn',
    },
  },
};

// Usage for vertical slide:
const slideInDownVariant = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};
```

### scaleIn Variant

**Used for**: Modal appearance, button focus, emphasis

```typescript
const scaleInVariant = {
  hidden: {
    opacity: 0,
    scale: 0.95, // Start slightly smaller
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2, // 200ms
      ease: 'easeOut',
    },
  },
};

// Usage:
<motion.div
  initial="hidden"
  animate="visible"
  variants={scaleInVariant}
>
  {content}
</motion.div>
```

### exitAnimation Variant

**Used for**: Item removal, modal close, page transition out

```typescript
const exitAnimationVariant = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2, // 200ms
      ease: 'easeIn',
    },
  },
};

// With AnimatePresence:
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

### List Item Animation Pattern

**Staggered animations for list items:**

```typescript
const listContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between items
      delayChildren: 0.1,    // 100ms before first item
    },
  },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Usage:
<motion.div
  variants={listContainerVariant}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={listItemVariant}
    >
      <ListItem {...item} />
    </motion.div>
  ))}
</motion.div>
```

### Button Press Animation

**Micro-interaction for button clicks:**

```typescript
const buttonVariant = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Usage:
<motion.button
  variants={buttonVariant}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  Click me
</motion.button>
```

### Modal Backdrop Animation

**Fade backdrop in/out with modal:**

```typescript
const backdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

<motion.div
  className="fixed inset-0 bg-black"
  variants={backdropVariant}
  initial="hidden"
  animate="visible"
  exit="exit"
  onClick={onClose}
/>
```

### Respecting prefers-reduced-motion

**Always check for user preference:**

```typescript
// Utility function
const getTransitionDuration = () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  return prefersReducedMotion ? 0 : 0.3;
};

// In variant:
const fadeInVariant = {
  visible: {
    opacity: 1,
    transition: {
      duration: getTransitionDuration(),
    },
  },
};

// Or use Framer Motion's built-in:
<motion.div
  animate={{ opacity: 1 }}
  transition={{
    duration: 0.3,
    // Framer Motion respects OS preference by default
  }}
/>
```

---

## Summary

This data model document provides comprehensive reference for:

1. **Theme Configuration**: Complete Tailwind CSS setup with colors, spacing, typography, and utilities
2. **Component Props**: 13 reusable UI components with TypeScript interfaces and usage examples
3. **Item Data Structure**: Full Item entity definition for internal application state
4. **Layout Patterns**: Common Tailwind utility patterns for page layouts and responsiveness
5. **Animation Variants**: Framer Motion patterns for smooth, delightful user interactions

All components follow consistent design principles:
- Mobile-first responsive design (320px and up)
- WCAG AA accessibility (4.5:1 contrast, keyboard navigation)
- Semantic HTML with proper ARIA attributes
- TypeScript for type safety
- Utility-first Tailwind for maintainable styling
- Framer Motion for hardware-accelerated animations

---

**Document Status**: ✅ COMPLETE
**Last Updated**: 2025-11-07
**Phase**: Phase 1 - Design & Contracts
