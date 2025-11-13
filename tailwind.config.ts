import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS v4 Configuration
 *
 * Note: In Tailwind v4, most theme configuration has moved to CSS using the @theme directive.
 * See app/globals.css for color palette, typography, and other design tokens.
 *
 * This file is maintained for:
 * - Content paths (required)
 * - Dark mode strategy (class-based)
 * - PostCSS plugins (if needed)
 * - Legacy compatibility
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
}
export default config
