/**
 * UI Integration Contracts - Central export point
 * Re-exports all type definitions for the UI integration feature
 *
 * @module specs/002-ui-integration/contracts
 */

// Component prop interfaces
export type {
  ButtonProps,
  InputProps,
  TextareaProps,
  SelectOption,
  SelectOptionGroup,
  SelectProps,
  CategoryPickerProps,
  CheckboxProps,
  ToggleProps,
  ModalProps,
  DialogProps,
  EmptyStateProps,
  CardProps,
  ListItemProps,
  LoaderProps,
  ContainerProps,
  FlexProps,
  GridProps,
} from './components'

// Domain type definitions
export type {
  ItemPriority,
  ItemStatus,
  CategoryType,
  Item,
  CreateItemInput,
  UpdateItemInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  User,
  AuthSession,
  PaginationMeta,
  ApiResponse,
  ApiListResponse,
} from './types'

// Theme and design system definitions
export type {
  ColorShade,
  ColorScale,
  ColorPalette,
  SpacingScale,
  FontSizeScale,
  FontWeightScale,
  ShadowScale,
  BorderRadiusScale,
  AnimationScale,
  ZIndexScale,
  OpacityScale,
  BreakpointScale,
  ThemeConfig,
  DesignSystemConfig,
  RuntimeTheme,
} from './theme'
