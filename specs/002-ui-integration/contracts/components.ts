/**
 * UI Component prop type definitions
 * These interfaces define the contract for all reusable UI components
 *
 * @module specs/002-ui-integration/contracts/components
 */

import React from 'react'

/**
 * Props for the Button component
 * Extends native HTML button attributes with custom styling options
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'

  /** Size variant of the button */
  size?: 'sm' | 'md' | 'lg'

  /** Whether the button is in a loading state */
  isLoading?: boolean

  /** Whether the button is disabled */
  disabled?: boolean

  /** Icon element to display before text */
  icon?: React.ReactNode

  /** Whether the button should take full width of its container */
  fullWidth?: boolean

  /** Custom className to merge with component styles */
  className?: string

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

  /** Child content */
  children?: React.ReactNode
}

/**
 * Props for the Input component
 * Extends native HTML input attributes with custom styling and validation options
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string

  /** Helper text displayed below the input */
  helperText?: string

  /** Error message to display */
  error?: string | boolean

  /** Whether the input has an error */
  hasError?: boolean

  /** Icon element to display at the start of the input */
  startIcon?: React.ReactNode

  /** Icon element to display at the end of the input */
  endIcon?: React.ReactNode

  /** Size variant of the input */
  size?: 'sm' | 'md' | 'lg'

  /** Whether the input is disabled */
  disabled?: boolean

  /** Custom className to merge with component styles */
  className?: string

  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void

  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void

  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void

  /** Placeholder text */
  placeholder?: string

  /** Input value */
  value?: string | number | readonly string[]
}

/**
 * Props for the Textarea component
 * Extends native HTML textarea attributes with custom styling and validation options
 */
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Label text displayed above the textarea */
  label?: string

  /** Helper text displayed below the textarea */
  helperText?: string

  /** Error message to display */
  error?: string | boolean

  /** Whether the textarea has an error */
  hasError?: boolean

  /** Size variant of the textarea */
  size?: 'sm' | 'md' | 'lg'

  /** Number of visible text rows */
  rows?: number

  /** Whether the textarea is disabled */
  disabled?: boolean

  /** Whether to allow resizing of the textarea */
  resizable?: boolean

  /** Custom className to merge with component styles */
  className?: string

  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void

  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void

  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void

  /** Placeholder text */
  placeholder?: string

  /** Textarea value */
  value?: string | number | readonly string[]
}

/**
 * Option item for Select and Dropdown components
 */
export interface SelectOption {
  /** Unique identifier for the option */
  value: string | number

  /** Display label for the option */
  label: string

  /** Whether the option is disabled */
  disabled?: boolean

  /** Optional description or additional info */
  description?: string
}

/**
 * Option group for organizing Select options
 */
export interface SelectOptionGroup {
  /** Label for the group */
  label: string

  /** Options within this group */
  options: SelectOption[]

  /** Whether the group is disabled */
  disabled?: boolean
}

/**
 * Props for the Select component
 * Dropdown selection component
 */
export interface SelectProps {
  /** Array of available options */
  options?: (SelectOption | SelectOptionGroup)[]

  /** Label text displayed above the select */
  label?: string

  /** Helper text displayed below the select */
  helperText?: string

  /** Error message to display */
  error?: string | boolean

  /** Whether the select has an error */
  hasError?: boolean

  /** Currently selected value */
  value?: string | number | readonly (string | number)[]

  /** Default selected value */
  defaultValue?: string | number

  /** Whether multiple selections are allowed */
  multiple?: boolean

  /** Placeholder text */
  placeholder?: string

  /** Whether the select is disabled */
  disabled?: boolean

  /** Whether the select is required */
  required?: boolean

  /** Size variant of the select */
  size?: 'sm' | 'md' | 'lg'

  /** Custom className to merge with component styles */
  className?: string

  /** Change handler */
  onChange?: (value: string | number | (string | number)[]) => void

  /** Focus handler */
  onFocus?: () => void

  /** Blur handler */
  onBlur?: () => void

  /** Search callback for filterable selects */
  onSearch?: (query: string) => void

  /** Whether the select is searchable */
  searchable?: boolean
}

/**
 * Props for the CategoryPicker component
 * Specialized component for selecting a category
 */
export interface CategoryPickerProps {
  /** Array of available categories */
  categories: Array<{
    id: string
    name: string
    color?: string | null
  }>

  /** Currently selected category ID */
  selectedCategoryId?: string | null

  /** Placeholder text */
  placeholder?: string

  /** Whether the picker is disabled */
  disabled?: boolean

  /** Label text displayed above the picker */
  label?: string

  /** Helper text displayed below the picker */
  helperText?: string

  /** Error message to display */
  error?: string | boolean

  /** Change handler */
  onChange?: (categoryId: string) => void

  /** Whether to show category colors */
  showColors?: boolean

  /** Custom className to merge with component styles */
  className?: string
}

/**
 * Props for the Checkbox component
 * Single checkbox input with optional label
 */
export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked?: boolean

  /** Default checked state */
  defaultChecked?: boolean

  /** Whether the checkbox is disabled */
  disabled?: boolean

  /** Whether the checkbox is required */
  required?: boolean

  /** Label text displayed next to the checkbox */
  label?: string

  /** Helper text displayed below the checkbox */
  helperText?: string

  /** Error message to display */
  error?: string | boolean

  /** Change handler */
  onChange?: (checked: boolean) => void

  /** Custom className to merge with component styles */
  className?: string

  /** Name attribute for form submission */
  name?: string

  /** Value attribute for form submission */
  value?: string

  /** Whether to display the checkbox in an indeterminate state */
  indeterminate?: boolean
}

/**
 * Props for the Toggle component
 * Switch/toggle control
 */
export interface ToggleProps {
  /** Whether the toggle is enabled */
  enabled?: boolean

  /** Default enabled state */
  defaultEnabled?: boolean

  /** Whether the toggle is disabled */
  disabled?: boolean

  /** Label text displayed next to the toggle */
  label?: string

  /** Description text displayed below the label */
  description?: string

  /** Change handler */
  onChange?: (enabled: boolean) => void

  /** Size variant of the toggle */
  size?: 'sm' | 'md' | 'lg'

  /** Custom className to merge with component styles */
  className?: string

  /** Color for the active state */
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
}

/**
 * Props for the Modal component
 * Full-screen overlay modal dialog
 */
export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean

  /** Callback when the modal should close */
  onClose: () => void

  /** Title of the modal */
  title?: string

  /** Description or subtitle of the modal */
  description?: string

  /** Modal content */
  children: React.ReactNode

  /** Footer content (typically action buttons) */
  footer?: React.ReactNode

  /** Whether the modal has a close button */
  showCloseButton?: boolean

  /** Whether the modal can be dismissed by clicking outside */
  closeOnBackdropClick?: boolean

  /** Whether the modal can be dismissed by pressing Escape */
  closeOnEscape?: boolean

  /** Size variant of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** Custom className for the modal content */
  className?: string

  /** Custom className for the backdrop/overlay */
  backdropClassName?: string

  /** Z-index for stacking */
  zIndex?: number

  /** Animation duration in milliseconds */
  animationDuration?: number
}

/**
 * Props for the Dialog component
 * Lightweight dialog/confirmation component
 */
export interface DialogProps {
  /** Whether the dialog is open */
  isOpen: boolean

  /** Callback when the dialog should close */
  onClose: () => void

  /** Title of the dialog */
  title: string

  /** Description or message content */
  description?: string

  /** Danger message to display (typically for destructive actions) */
  dangerMessage?: string

  /** Primary button text */
  primaryButtonText?: string

  /** Secondary button text */
  secondaryButtonText?: string

  /** Danger button text (for destructive actions) */
  dangerButtonText?: string

  /** Callback when primary action is triggered */
  onPrimaryAction?: () => void | Promise<void>

  /** Callback when secondary action is triggered */
  onSecondaryAction?: () => void

  /** Callback when danger action is triggered */
  onDangerAction?: () => void | Promise<void>

  /** Whether any action is in progress */
  isLoading?: boolean

  /** Type of dialog */
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirmation'

  /** Custom className */
  className?: string
}

/**
 * Props for the EmptyState component
 * Display when no data is available
 */
export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode

  /** Title text */
  title: string

  /** Description or details */
  description?: string

  /** Action button configuration */
  action?: {
    label: string
    onClick: () => void
  }

  /** Alternative action button */
  secondaryAction?: {
    label: string
    onClick: () => void
  }

  /** Custom className */
  className?: string

  /** Content to display below the action buttons */
  footer?: React.ReactNode
}

/**
 * Props for the Card component
 * Container for grouped content
 */
export interface CardProps {
  /** Card content */
  children: React.ReactNode

  /** Whether the card has a hover effect */
  hoverable?: boolean

  /** Whether the card has a border */
  bordered?: boolean

  /** Shadow level of the card */
  shadow?: 'none' | 'sm' | 'md' | 'lg'

  /** Padding size of the card */
  padding?: 'none' | 'sm' | 'md' | 'lg'

  /** Background color variant */
  variant?: 'default' | 'subtle' | 'transparent'

  /** Click handler for clickable cards */
  onClick?: () => void

  /** Whether the card is clickable */
  clickable?: boolean

  /** Custom className */
  className?: string

  /** Aria label for accessibility */
  ariaLabel?: string
}

/**
 * Props for the ListItem component
 * Individual item in a list with optional actions
 */
export interface ListItemProps {
  /** Item content/label */
  children: React.ReactNode

  /** Icon to display at the start */
  startIcon?: React.ReactNode

  /** Icon or action button to display at the end */
  endIcon?: React.ReactNode

  /** Secondary text or description */
  description?: string

  /** Whether the item is selected */
  selected?: boolean

  /** Whether the item is disabled */
  disabled?: boolean

  /** Click handler */
  onClick?: () => void

  /** Whether the item is clickable */
  clickable?: boolean

  /** Divider variant to display below the item */
  divider?: 'none' | 'full' | 'inset'

  /** Custom className */
  className?: string

  /** Badge content to display */
  badge?: React.ReactNode
}

/**
 * Props for the Loader component
 * Loading indicator/spinner
 */
export interface LoaderProps {
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg'

  /** Color variant of the loader */
  color?: 'primary' | 'accent' | 'inherit'

  /** Loading text to display */
  text?: string

  /** Whether the text should appear below the spinner */
  showText?: boolean

  /** Custom className */
  className?: string

  /** Animation speed (1 = normal, 2 = double speed) */
  speed?: number

  /** Whether the loader has a transparent background */
  transparent?: boolean
}

/**
 * Props for a generic container component
 */
export interface ContainerProps {
  /** Container content */
  children: React.ReactNode

  /** Maximum width of the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'

  /** Custom className */
  className?: string

  /** Whether to center content */
  centered?: boolean
}

/**
 * Props for a generic flex component
 */
export interface FlexProps {
  /** Flex content */
  children: React.ReactNode

  /** Flex direction */
  direction?: 'row' | 'column'

  /** Justify content alignment */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

  /** Align items alignment */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'

  /** Flex wrap behavior */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'

  /** Gap between items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /** Custom className */
  className?: string
}

/**
 * Props for a generic grid component
 */
export interface GridProps {
  /** Grid content */
  children: React.ReactNode

  /** Number of columns */
  columns?: 1 | 2 | 3 | 4 | 6 | 12

  /** Gap between items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /** Custom className */
  className?: string
}
