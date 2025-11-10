# UI Integration Contracts

This directory contains TypeScript interface contracts that define the type specifications for the UI integration feature of SpecToDo.

## Overview

The contracts are organized into three main files, each serving a specific purpose:

1. **types.ts** - Domain type definitions
2. **components.ts** - UI component prop interfaces
3. **theme.ts** - Theme and design system configurations
4. **index.ts** - Central export point for all contracts

## File Structure

### types.ts

Contains domain models and core type definitions:

- **Item** - Task/list item interface with full properties
- **CreateItemInput** / **UpdateItemInput** - Item input payloads
- **Category** - List/category interface
- **CreateCategoryInput** / **UpdateCategoryInput** - Category input payloads
- **User** - User profile interface
- **AuthSession** - Authentication session interface
- **PaginationMeta** - Pagination metadata
- **ApiResponse<T>** - Generic API response wrapper
- **ApiListResponse<T>** - Generic list response wrapper
- **ItemPriority** - Union type for priority levels
- **ItemStatus** - Union type for item status
- **CategoryType** - Union type for category types

#### Key Features
- Extends database schema types for consistency
- Includes optional properties with clear documentation
- Provides separate input/output types for API contracts
- Generic response wrappers for consistent API communication

### components.ts

Contains prop interfaces for all reusable UI components:

#### Form Components
- **ButtonProps** - Button with variants (primary, secondary, danger, ghost, outline)
- **InputProps** - Text input with validation and icons
- **TextareaProps** - Multi-line text input
- **SelectProps** - Dropdown selection with options and grouping
- **CategoryPickerProps** - Specialized category selection component
- **CheckboxProps** - Single checkbox with label
- **ToggleProps** - Switch/toggle control

#### Dialog & Overlay Components
- **ModalProps** - Full-screen overlay modal
- **DialogProps** - Lightweight confirmation dialog

#### Display Components
- **CardProps** - Content container with styling options
- **ListItemProps** - Individual list item with optional actions
- **EmptyStateProps** - Empty state placeholder
- **LoaderProps** - Loading spinner/indicator

#### Layout Components
- **ContainerProps** - Max-width container
- **FlexProps** - Flex layout wrapper
- **GridProps** - Grid layout wrapper

#### Key Features
- All components extend or omit appropriate React HTML attributes
- Comprehensive JSDoc comments for every prop
- Size and variant options for consistency
- Accessibility support (labels, error states, ARIA attributes)
- Support for custom styling via className prop
- Event handler callbacks properly typed

### theme.ts

Contains design system and theme configuration interfaces:

#### Color System
- **ColorShade** - Individual color value (hex, rgb, etc.)
- **ColorScale** - Complete color scale from 50 to 950
- **ColorPalette** - Named color groups (primary, secondary, accent, etc.)

#### Spacing & Sizing
- **SpacingScale** - Padding, margin, and gap values
- **FontSizeScale** - Font size options with line heights
- **FontWeightScale** - Font weight values
- **BorderRadiusScale** - Border radius values
- **ShadowScale** - Box shadow presets

#### Layout & Responsive
- **BreakpointScale** - Responsive breakpoints
- **ZIndexScale** - Stacking order values
- **OpacityScale** - Opacity values

#### Animation & Effects
- **AnimationScale** - Animation definitions
- **ShadowScale** - Shadow presets
- **OpacityScale** - Opacity levels

#### Configuration Objects
- **ThemeConfig** - Complete Tailwind-compatible theme configuration
- **DesignSystemConfig** - Full design system with components and utilities
- **RuntimeTheme** - Runtime theme with CSS variables and metadata

#### Key Features
- Matches Tailwind CSS configuration structure
- Extensible through extend property
- Support for custom breakpoints and values
- CSS variable mappings for runtime theming
- Dark mode configuration support

## Usage

### Importing from index.ts

```typescript
import type {
  // Component props
  ButtonProps,
  InputProps,
  // Domain types
  Item,
  Category,
  User,
  // Theme types
  ThemeConfig,
  ColorScale,
} from '@/specs/002-ui-integration/contracts'
```

### Importing from specific files

```typescript
import type { Item, Category } from '@/specs/002-ui-integration/contracts/types'
import type { ButtonProps, InputProps } from '@/specs/002-ui-integration/contracts/components'
import type { ThemeConfig } from '@/specs/002-ui-integration/contracts/theme'
```

## Component Prop Pattern Examples

### Button Component
```typescript
const MyButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  // Implementation
}
```

### Input Component
```typescript
const MyInput: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  size = 'md',
  ...props
}) => {
  // Implementation
}
```

### Modal Component
```typescript
const MyModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ...props
}) => {
  // Implementation
}
```

## Design Principles

1. **Consistency** - All interfaces follow similar patterns and naming conventions
2. **Extensibility** - Interfaces allow for custom properties through className and other escape hatches
3. **Type Safety** - Union types used for constrained values (variants, sizes, etc.)
4. **Documentation** - Every property includes JSDoc comments explaining its purpose
5. **React Best Practices** - Components follow React patterns with proper event typing
6. **Tailwind Alignment** - Theme configuration matches Tailwind CSS structure for seamless integration

## Type Hierarchy

### Domain Types
Domain types represent business logic and are used across the application:
```
User
├── AuthSession
Item
├── CreateItemInput
└── UpdateItemInput
Category
├── CreateCategoryInput
└── UpdateCategoryInput
```

### Component Props
Component props are specific to UI rendering:
```
ButtonProps
├── InputProps
├── TextareaProps
├── SelectProps
└── ...
```

### Theme Types
Theme types configure the visual design system:
```
ThemeConfig
├── ColorPalette
├── SpacingScale
├── FontSizeScale
└── ...
```

## Integration Points

These contracts are used in:

1. **Component Libraries** - Components implement interfaces defined here
2. **API Layer** - API responses use domain types from types.ts
3. **State Management** - Redux/Zustand stores use Item, Category, User types
4. **Theme Provider** - ThemeConfig drives the design system
5. **Form Validation** - CreateItemInput/UpdateItemInput guide form validation

## Extending Contracts

To add new types:

1. **New component?** - Add to components.ts
2. **New domain model?** - Add to types.ts
3. **New theme config?** - Add to theme.ts
4. **Export from index.ts** - Add to central export list

Example adding a new component:

```typescript
// In components.ts
export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>

  /** Separator character */
  separator?: string

  /** Custom className */
  className?: string
}

// In index.ts
export type { BreadcrumbProps }
```

## Validation

All TypeScript files are validated to ensure:
- ✓ No type conflicts
- ✓ Proper interface inheritance
- ✓ Correct generic type usage
- ✓ Valid React type imports
- ✓ Consistent naming conventions

Run validation with:
```bash
npx tsc --noEmit
```

## Related Documentation

- [Tailwind Configuration](../../../tailwind.config.ts)
- [TypeScript Configuration](../../../tsconfig.json)
- [Project Structure](../../../README.md)
