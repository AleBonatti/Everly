'use client'

/**
 * UserListItem Component
 *
 * A card-based list item for displaying users in the admin panel.
 * Note: Users list doesn't support drag-and-drop sorting.
 */

import React from 'react'
import { Edit, Trash2, Calendar, Shield, User as UserIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { AdminUser } from '@/lib/services/admin-users'
import { USER_ROLES } from '@/types/auth'

export interface UserListItemProps {
  user: AdminUser
  onEdit: (user: AdminUser) => void
  onDelete: (userId: string) => void
  isDeleting: boolean
  deleteConfirm: string | null
  onDeleteConfirm: (userId: string | null) => void
}

export function UserListItem({
  user,
  onEdit,
  onDelete,
  isDeleting,
  deleteConfirm,
  onDeleteConfirm,
}: UserListItemProps) {
  return (
    <div
      className="
        group relative rounded-lg border border-neutral-200 bg-white p-4 shadow-sm
        transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900
      "
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
          {user.role === USER_ROLES.ADMIN ? (
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          ) : (
            <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {user.fullName || 'No name'}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="truncate">
              {user.email || (
                <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                  {user.id}
                </span>
              )}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                user.role === USER_ROLES.ADMIN
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {user.role === USER_ROLES.ADMIN ? (
                <Shield className="h-3 w-3" />
              ) : (
                <UserIcon className="h-3 w-3" />
              )}
              {user.role}
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => onEdit(user)}
          >
            Edit
          </Button>

          {deleteConfirm === user.id ? (
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(user.id)}
                loading={isDeleting}
                disabled={isDeleting}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDeleteConfirm(user.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
