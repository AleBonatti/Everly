'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Inbox, Plus, X, LogOut, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useItems } from '@/lib/hooks/useItems'
import { useCategories } from '@/lib/hooks/useCategories'
import type { Item } from '@/lib/services/items'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Toggle from '@/components/ui/Toggle'
import Modal from '@/components/ui/Modal'
import Dialog from '@/components/ui/Dialog'
import CategoryPicker from '@/components/ui/CategoryPicker'
import EmptyState from '@/components/ui/EmptyState'
import ListItem from '@/components/ui/ListItem'
import Loader from '@/components/ui/Loader'

export default function HomePage() {
  const router = useRouter()

  // Fetch items from Supabase
  const {
    items: allItems,
    loading,
    error,
    createNewItem,
    updateExistingItem,
    deleteExistingItem,
    toggleStatus,
  } = useItems()

  // Fetch categories from Supabase
  const {
    categories: dbCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories()

  // Transform categories for CategoryPicker component
  const categories = useMemo(() => {
    return dbCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }))
  }, [dbCategories])

  // UI State
  const [hideDone, setHideDone] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add item form state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Filter items using useMemo
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (hideDone && item.status === 'done') return false
      if (selectedCategory && item.categoryId !== selectedCategory) return false
      return true
    })
  }, [allItems, hideDone, selectedCategory])

  // Handlers
  const handleAddItem = async () => {
    if (!newTitle.trim() || !newCategory) return

    try {
      setIsSubmitting(true)
      await createNewItem({
        categoryId: newCategory,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
      })
      setNewTitle('')
      setNewCategory('')
      setNewDescription('')
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to create item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !editTitle.trim() || !editCategory) return

    try {
      setIsSubmitting(true)
      await updateExistingItem(editingItem.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      })
      setEditingItem(null)
    } catch (err) {
      console.error('Failed to update item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteExistingItem(id)
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const handleToggleDone = async (id: string) => {
    try {
      await toggleStatus(id)
    } catch (err) {
      console.error('Failed to toggle item status:', err)
    }
  }

  const openEditModal = (id: string) => {
    const item = allItems.find((i) => i.id === id)
    if (item) {
      setEditingItem(item)
      setEditTitle(item.title)
      setEditCategory(item.categoryId)
      setEditDescription(item.description || '')
    }
  }

  const getCategoryLabel = (categoryId: string) => {
    const category = dbCategories.find((c) => c.id === categoryId)
    return category?.name || categoryId
  }

  const getCategoryColor = (categoryId: string) => {
    const category = dbCategories.find((c) => c.id === categoryId)
    return category?.color || undefined
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container-custom flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">FutureList</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/account')}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Account</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-custom py-8">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading || categoriesLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="lg" text="Loading..." />
          </div>
        ) : categoriesError ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{categoriesError}</p>
            </div>
          </motion.div>
        ) : (
          <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filters section */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryPicker
              categories={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              showAll
              label="Filter by category"
            />
            <Toggle
              label="Hide done items"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
            />
          </div>

          {/* Add item button/form */}
          {!showAddForm ? (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddForm(true)}
              className="mb-6"
            >
              Add New Item
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Add New Item
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="What do you want to do?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  fullWidth
                />
                <CategoryPicker
                  categories={categories}
                  value={newCategory}
                  onChange={setNewCategory}
                  label="Category"
                  required
                />
                <Textarea
                  label="Description (optional)"
                  placeholder="Add more details..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  fullWidth
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleAddItem}
                    disabled={!newTitle.trim() || !newCategory || isSubmitting}
                    loading={isSubmitting}
                  >
                    Add Item
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewTitle('')
                      setNewCategory('')
                      setNewDescription('')
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Items list or empty state */}
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={
                allItems.length === 0
                  ? 'No items yet'
                  : 'No items match your filters'
              }
              description={
                allItems.length === 0
                  ? 'Add your first item to get started with FutureList!'
                  : 'Try adjusting your filters or add a new item.'
              }
              action={
                allItems.length === 0
                  ? {
                      label: 'Add your first item',
                      onClick: () => setShowAddForm(true),
                    }
                  : undefined
              }
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    layout
                  >
                    <ListItem
                      id={item.id}
                      title={item.title}
                      category={getCategoryLabel(item.categoryId)}
                      categoryColor={getCategoryColor(item.categoryId)}
                      done={item.status === 'done'}
                      description={item.description || undefined}
                      onEdit={openEditModal}
                      onDelete={(id) => setDeleteConfirm(id)}
                      onToggleDone={handleToggleDone}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
        </>
        )}
      </main>

      {/* Edit modal */}
      <Modal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Item"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            fullWidth
          />
          <CategoryPicker
            categories={categories}
            value={editCategory}
            onChange={setEditCategory}
            label="Category"
            required
          />
          <Textarea
            label="Description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            fullWidth
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setEditingItem(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditItem}
              disabled={!editTitle.trim() || !editCategory || isSubmitting}
              loading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteItem(deleteConfirm)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
