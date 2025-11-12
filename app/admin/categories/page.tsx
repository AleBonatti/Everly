'use client'

/**
 * Admin Categories Management Page
 *
 * Displays a table of all categories with CRUD operations.
 * Only accessible to admin users.
 */

import { useState } from 'react'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Loader from '@/components/ui/Loader'
import EmptyState from '@/components/ui/EmptyState'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import { useAdminCategories } from '@/lib/hooks/useAdminCategories'
import type { AdminCategory, CreateCategoryInput } from '@/lib/services/admin-categories'

const CATEGORY_TYPES = {
  DEFAULT: 'default',
  CUSTOM: 'custom',
} as const

type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES]

export default function AdminCategoriesPage() {
  const { categories, isLoading, error, createNewCategory, updateCategory, removeCategory } = useAdminCategories()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<CategoryType>(CATEGORY_TYPES.CUSTOM)
  const [formDisplayOrder, setFormDisplayOrder] = useState('0')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Reset form
  const resetForm = () => {
    setFormName('')
    setFormType(CATEGORY_TYPES.CUSTOM)
    setFormDisplayOrder('0')
    setEditingCategory(null)
  }

  // Open modal for adding new category
  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Open modal for editing existing category
  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormType(category.type as CategoryType)
    setFormDisplayOrder(category.displayOrder.toString())
    setIsModalOpen(true)
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formName.trim()) return

    try {
      setIsSubmitting(true)

      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: formName.trim(),
          type: formType,
          displayOrder: parseInt(formDisplayOrder) || 0,
        })
      } else {
        // Create new category
        const input: CreateCategoryInput = {
          name: formName.trim(),
          type: formType,
          displayOrder: parseInt(formDisplayOrder) || 0,
        }
        await createNewCategory(input)
      }
      closeModal()
    } catch (err) {
      console.error('Failed to save category:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    try {
      await removeCategory(categoryId)
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-2 text-gray-600">
            Manage categories for organizing items
          </p>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Add category button */}
        <div className="mb-6">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Add New Category
          </Button>
        </div>

        {/* Categories table */}
        {categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories found"
            description="Get started by creating your first category."
            action={{
              label: 'Add New Category',
              onClick: openAddModal,
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Display Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            category.type === 'default'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {category.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {category.displayOrder}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => openEditModal(category)}
                          >
                            Edit
                          </Button>

                          {category.type !== 'default' && (
                            deleteConfirm === category.id ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(category.id)}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => setDeleteConfirm(category.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Category Name"
              type="text"
              placeholder="e.g., Movies, Restaurants, Travel"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              fullWidth
            />

            <Select
              label="Type"
              value={formType}
              onChange={(e) => setFormType(e.target.value as CategoryType)}
              options={[
                { value: CATEGORY_TYPES.DEFAULT, label: 'Default' },
                { value: CATEGORY_TYPES.CUSTOM, label: 'Custom' },
              ]}
              required
              fullWidth
            />

            <Input
              label="Display Order"
              type="number"
              placeholder="0"
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(e.target.value)}
              fullWidth
            />

            <p className="text-xs text-gray-500">
              Lower numbers appear first. Default categories cannot be deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              disabled={isSubmitting || !formName.trim()}
              loading={isSubmitting}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  )
}
