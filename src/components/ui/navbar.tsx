/**
 * Navbar Component
 *
 * This file re-exports the refactored Navbar from the navbar/ directory.
 * The component has been split into smaller, more maintainable pieces:
 *
 * - navbar/config.ts     - Configuration constants (countries, cities, languages)
 * - navbar/hooks.ts      - Custom hooks (useScrolled, useRegion, useLanguage)
 * - navbar/location-selector.tsx - Country/Language selector dropdowns
 * - navbar/mobile-menu.tsx      - Mobile menu component
 * - navbar/index.tsx     - Main Navbar component
 */

export { default } from './navbar/index';
export * from './navbar/config';
export * from './navbar/hooks';
