'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Inbox, Plus, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Toggle from '@/components/ui/Toggle'
import Modal from '@/components/ui/Modal'
import Dialog from '@/components/ui/Dialog'
import CategoryPicker from '@/components/ui/CategoryPicker'
import EmptyState from '@/components/ui/EmptyState'
import ListItem from '@/components/ui/ListItem'

// Mock categories
const categories = [
  { value: 'movies', label: 'Movies' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'places', label: 'Places' },
  { value: 'books', label: 'Books' },
  { value: 'other', label: 'Other' },
]

// Mock items type
interface Item {
  id: string
  title: string
  categoryId: string
  description?: string
  done: boolean
}

export default function HomePage() {
  // State
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      title: 'Watch Inception',
      categoryId: 'movies',
      description: 'Mind-bending thriller by Christopher Nolan',
      done: false,
    },
    {
      id: '2',
      title: 'Try Sushi Master downtown',
      categoryId: 'restaurants',
      done: false,
    },
    {
      id: '3',
      title: 'Visit Grand Canyon',
      categoryId: 'places',
      description: 'Plan a 3-day trip in spring',
      done: true,
    },
  ])
  const [hideDone, setHideDone] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Add item form state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Filter items
  const filteredItems = items.filter((item) => {
    if (hideDone && item.done) return false
    if (selectedCategory && item.categoryId !== selectedCategory) return false
    return true
  })

  // Handlers
  const handleAddItem = () => {
    if (!newTitle.trim() || !newCategory) return

    const newItem: Item = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      categoryId: newCategory,
      description: newDescription.trim() || undefined,
      done: false,
    }

    setItems([newItem, ...items])
    setNewTitle('')
    setNewCategory('')
    setNewDescription('')
    setShowAddForm(false)
  }

  const handleEditItem = () => {
    if (!editingItem || !editTitle.trim() || !editCategory) return

    setItems(
      items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: editTitle.trim(),
              categoryId: editCategory,
              description: editDescription.trim() || undefined,
            }
          : item
      )
    )
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    setDeleteConfirm(null)
  }

  const handleToggleDone = (id: string, done: boolean) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, done } : item))
    )
  }

  const openEditModal = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      setEditingItem(item)
      setEditTitle(item.title)
      setEditCategory(item.categoryId)
      setEditDescription(item.description || '')
    }
  }

  const getCategoryLabel = (categoryId: string) => {
    return categories.find((c) => c.value === categoryId)?.label || categoryId
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container-custom flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">FutureList</h1>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Account</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container-custom py-8">
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
                    disabled={!newTitle.trim() || !newCategory}
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
                items.length === 0
                  ? 'No items yet'
                  : 'No items match your filters'
              }
              description={
                items.length === 0
                  ? 'Add your first item to get started with FutureList!'
                  : 'Try adjusting your filters or add a new item.'
              }
              action={
                items.length === 0
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
                      done={item.done}
                      description={item.description}
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
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditItem}
              disabled={!editTitle.trim() || !editCategory}
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
