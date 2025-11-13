import * as LucideIcons from 'lucide-react';

/**
 * Get a Lucide icon component by name
 * @param iconName - The name of the icon (e.g., 'Film', 'Music', 'Book')
 * @returns The icon component or null if not found
 */
export function getIconComponent(iconName: string | null | undefined) {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || null;
}
