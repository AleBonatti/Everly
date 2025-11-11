/**
 * Authentication and Authorization Types
 */

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export interface AuthUser {
  id: string
  email?: string
  role: UserRole
}

export interface AuthContext {
  user: AuthUser
}

/**
 * Type guard to check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN
}

/**
 * Type guard to check if user is regular user
 */
export function isUser(role: UserRole): boolean {
  return role === USER_ROLES.USER
}

/**
 * Check if role has permission (can be extended for more complex permissions)
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}
