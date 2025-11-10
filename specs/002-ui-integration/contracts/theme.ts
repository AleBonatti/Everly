/**
 * Theme configuration and design system type definitions
 * These interfaces define the contract for theme configuration matching Tailwind CSS structure
 *
 * @module specs/002-ui-integration/contracts/theme
 */

/**
 * Represents a single color shade in a color scale
 */
export type ColorShade = string

/**
 * Represents a color scale with multiple shades
 * Typically from 50 (lightest) to 900 (darkest)
 */
export interface ColorScale {
  /** Lightest shade, used for backgrounds and very subtle elements */
  50?: ColorShade
  /** Very light shade */
  100?: ColorShade
  /** Light shade */
  200?: ColorShade
  /** Lighter shade */
  300?: ColorShade
  /** Medium-light shade */
  400?: ColorShade
  /** Medium/base shade, typically used as the primary color */
  500?: ColorShade
  /** Medium-dark shade */
  600?: ColorShade
  /** Dark shade */
  700?: ColorShade
  /** Darker shade */
  800?: ColorShade
  /** Darkest shade, used for text and strong emphasis */
  900?: ColorShade
  /** Nearly black shade for very strong emphasis */
  950?: ColorShade
}

/**
 * Named color palette
 */
export interface ColorPalette {
  /** Primary brand color - used for main actions and highlights */
  primary?: ColorScale
  /** Secondary brand color - used for secondary actions */
  secondary?: ColorScale
  /** Accent color - used for special emphasis */
  accent?: ColorScale
  /** Success state color */
  success?: ColorScale
  /** Warning state color */
  warning?: ColorScale
  /** Error/danger state color */
  error?: ColorScale
  /** Info state color */
  info?: ColorScale
  /** Gray scale for neutral elements */
  gray?: ColorScale
  /** Additional custom colors */
  [key: string]: ColorScale | undefined
}

/**
 * Represents spacing scale values
 * Used for padding, margin, gaps, etc.
 */
export interface SpacingScale {
  /** 0 spacing */
  none?: string
  /** Extra small spacing (0.25rem / 4px) */
  xs?: string
  /** Small spacing (0.5rem / 8px) */
  sm?: string
  /** Medium spacing (1rem / 16px) */
  md?: string
  /** Large spacing (1.5rem / 24px) */
  lg?: string
  /** Extra large spacing (2rem / 32px) */
  xl?: string
  /** 2x large spacing (2.5rem / 40px) */
  '2xl'?: string
  /** 3x large spacing (3rem / 48px) */
  '3xl'?: string
  /** 4x large spacing (3.5rem / 56px) */
  '4xl'?: string
  /** 5x large spacing (4rem / 64px) */
  '5xl'?: string
  /** 6x large spacing (5rem / 80px) */
  '6xl'?: string
  /** Additional custom spacing values */
  [key: string]: string | undefined
}

/**
 * Represents font size scale values
 */
export interface FontSizeScale {
  /** Extra small font size (0.75rem / 12px) */
  xs?: [fontSize: string, lineHeight: string] | string
  /** Small font size (0.875rem / 14px) */
  sm?: [fontSize: string, lineHeight: string] | string
  /** Base/medium font size (1rem / 16px) */
  base?: [fontSize: string, lineHeight: string] | string
  /** Large font size (1.125rem / 18px) */
  lg?: [fontSize: string, lineHeight: string] | string
  /** Extra large font size (1.25rem / 20px) */
  xl?: [fontSize: string, lineHeight: string] | string
  /** 2x large font size (1.5rem / 24px) */
  '2xl'?: [fontSize: string, lineHeight: string] | string
  /** 3x large font size (1.875rem / 30px) */
  '3xl'?: [fontSize: string, lineHeight: string] | string
  /** 4x large font size (2.25rem / 36px) */
  '4xl'?: [fontSize: string, lineHeight: string] | string
  /** 5x large font size (3rem / 48px) */
  '5xl'?: [fontSize: string, lineHeight: string] | string
  /** 6x large font size (3.75rem / 60px) */
  '6xl'?: [fontSize: string, lineHeight: string] | string
  /** 7x large font size (4.5rem / 72px) */
  '7xl'?: [fontSize: string, lineHeight: string] | string
  /** 8x large font size (6rem / 96px) */
  '8xl'?: [fontSize: string, lineHeight: string] | string
  /** Additional custom font sizes */
  [key: string]: [fontSize: string, lineHeight: string] | string | undefined
}

/**
 * Represents font weight values
 */
export interface FontWeightScale {
  /** Thin weight (100) */
  thin?: string | number
  /** Extra light weight (200) */
  extralight?: string | number
  /** Light weight (300) */
  light?: string | number
  /** Normal weight (400) */
  normal?: string | number
  /** Medium weight (500) */
  medium?: string | number
  /** Semi bold weight (600) */
  semibold?: string | number
  /** Bold weight (700) */
  bold?: string | number
  /** Extra bold weight (800) */
  extrabold?: string | number
  /** Black weight (900) */
  black?: string | number
}

/**
 * Represents shadow values
 */
export interface ShadowScale {
  /** No shadow */
  none?: string
  /** Small shadow */
  sm?: string
  /** Medium shadow */
  md?: string
  /** Base shadow */
  base?: string
  /** Large shadow */
  lg?: string
  /** Extra large shadow */
  xl?: string
  /** 2x large shadow */
  '2xl'?: string
  /** Inner shadow */
  inner?: string
  /** Additional custom shadows */
  [key: string]: string | undefined
}

/**
 * Represents border radius values
 */
export interface BorderRadiusScale {
  /** No border radius (0) */
  none?: string
  /** Small border radius (0.125rem) */
  sm?: string
  /** Base border radius (0.25rem) */
  base?: string
  /** Medium border radius (0.375rem) */
  md?: string
  /** Large border radius (0.5rem) */
  lg?: string
  /** Extra large border radius (0.75rem) */
  xl?: string
  /** 2x large border radius (1rem) */
  '2xl'?: string
  /** 3x large border radius (1.5rem) */
  '3xl'?: string
  /** Fully rounded (9999px) */
  full?: string
}

/**
 * Represents animation/transition values
 */
export interface AnimationScale {
  /** Duration or animation definition */
  [key: string]: string | number | undefined
}

/**
 * Represents z-index scale values
 */
export interface ZIndexScale {
  /** Auto z-index */
  auto?: string | number
  /** Zero z-index */
  zero?: string | number
  /** Positive integer z-index values */
  [key: string]: string | number | undefined
}

/**
 * Represents opacity scale values
 */
export interface OpacityScale {
  /** No opacity (0) */
  0?: string
  /** 5% opacity */
  5?: string
  /** 10% opacity */
  10?: string
  /** 20% opacity */
  20?: string
  /** 25% opacity */
  25?: string
  /** 30% opacity */
  30?: string
  /** 40% opacity */
  40?: string
  /** 50% opacity */
  50?: string
  /** 60% opacity */
  60?: string
  /** 70% opacity */
  70?: string
  /** 75% opacity */
  75?: string
  /** 80% opacity */
  80?: string
  /** 90% opacity */
  90?: string
  /** 95% opacity */
  95?: string
  /** Full opacity (100) */
  100?: string
}

/**
 * Breakpoint configuration for responsive design
 */
export interface BreakpointScale {
  /** Mobile first breakpoint (default) */
  sm?: string
  /** Medium devices breakpoint */
  md?: string
  /** Large devices breakpoint */
  lg?: string
  /** Extra large devices breakpoint */
  xl?: string
  /** 2x extra large devices breakpoint */
  '2xl'?: string
  /** Additional custom breakpoints */
  [key: string]: string | undefined
}

/**
 * Complete theme configuration
 * Matches Tailwind CSS configuration structure
 */
export interface ThemeConfig {
  /** Color palette configuration */
  colors?: ColorPalette

  /** Spacing scale configuration */
  spacing?: SpacingScale

  /** Font size scale configuration */
  fontSize?: FontSizeScale

  /** Font weight scale configuration */
  fontWeight?: FontWeightScale

  /** Line height scale configuration */
  lineHeight?: SpacingScale

  /** Letter spacing configuration */
  letterSpacing?: {
    tight?: string
    normal?: string
    wide?: string
    [key: string]: string | undefined
  }

  /** Shadow scale configuration */
  boxShadow?: ShadowScale

  /** Border radius scale configuration */
  borderRadius?: BorderRadiusScale

  /** Border width configuration */
  borderWidth?: {
    DEFAULT?: string
    0?: string
    2?: string
    4?: string
    8?: string
    [key: string]: string | undefined
  }

  /** Z-index scale configuration */
  zIndex?: ZIndexScale

  /** Opacity scale configuration */
  opacity?: OpacityScale

  /** Animation/transition configuration */
  animation?: AnimationScale

  /** Transition configuration */
  transitionDuration?: {
    DEFAULT?: string
    75?: string
    100?: string
    150?: string
    200?: string
    300?: string
    500?: string
    700?: string
    1000?: string
    [key: string]: string | undefined
  }

  /** Breakpoint configuration */
  screens?: BreakpointScale

  /** Font family configuration */
  fontFamily?: {
    sans?: string
    serif?: string
    mono?: string
    [key: string]: string | undefined
  }

  /** Min-width configuration */
  minWidth?: SpacingScale

  /** Max-width configuration */
  maxWidth?: SpacingScale

  /** Min-height configuration */
  minHeight?: SpacingScale

  /** Max-height configuration */
  maxHeight?: SpacingScale

  /** Width configuration */
  width?: SpacingScale

  /** Height configuration */
  height?: SpacingScale

  /** Aspect ratio configuration */
  aspectRatio?: {
    auto?: string
    square?: string
    video?: string
    '1/1'?: string
    '16/9'?: string
    '4/3'?: string
    '21/9'?: string
    [key: string]: string | undefined
  }

  /** Cursor configuration */
  cursor?: {
    auto?: string
    default?: string
    pointer?: string
    wait?: string
    text?: string
    move?: string
    'not-allowed'?: string
    [key: string]: string | undefined
  }

  /** Display configuration */
  display?: string[]

  /** Position configuration */
  position?: string[]

  /** Additional custom theme values */
  extend?: Partial<ThemeConfig>
}

/**
 * Complete design system configuration
 */
export interface DesignSystemConfig {
  /** Theme configuration */
  theme: ThemeConfig

  /** Custom component style presets */
  components?: {
    [key: string]: {
      base?: string
      variants?: {
        [variantName: string]: string
      }
      defaultVariants?: {
        [key: string]: string
      }
    }
  }

  /** Utilities configuration */
  utilities?: {
    [key: string]: string | object
  }

  /** Plugin configurations */
  plugins?: Array<string | [string, Record<string, unknown>]>

  /** Dark mode configuration */
  darkMode?: 'class' | 'media' | false | string[]

  /** Presets to extend from */
  presets?: DesignSystemConfig[]
}

/**
 * Runtime theme provider configuration
 * Used to pass theme values to components at runtime
 */
export interface RuntimeTheme {
  /** Current theme name */
  name: 'light' | 'dark' | string

  /** Theme configuration */
  config: ThemeConfig

  /** CSS variable mappings for dynamic theming */
  cssVariables?: {
    [cssVariable: string]: string
  }

  /** Whether dark mode is enabled */
  isDark: boolean

  /** Custom theme metadata */
  metadata?: {
    version?: string
    author?: string
    description?: string
    [key: string]: unknown
  }
}
