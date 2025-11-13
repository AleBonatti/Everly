'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  Plus,
  AlertCircle,
  ListTodo,
  CheckCircle2,
  Circle,
  TrendingUp,
  ArrowUp,
} from 'lucide-react';
import { useItems } from '@/lib/hooks/useItems';
import { useCategories } from '@/lib/hooks/useCategories';
import { useActions } from '@/lib/hooks/useActions';
import { useItemStats } from '@/lib/hooks/useItemStats';
import type { Item } from '@/lib/services/items';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Dialog from '@/components/ui/Dialog';
import MultiSelectCategoryFilter from '@/components/ui/MultiSelectCategoryFilter';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import ListItem from '@/components/ui/ListItem';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { cn } from '@/lib/utils';

export default function HomePage() {
  // Fetch items from Supabase
  const {
    items: allItems,
    loading,
    error,
    createNewItem,
    updateExistingItem,
    deleteExistingItem,
    toggleStatus,
  } = useItems();

  // Fetch categories from Supabase
  const {
    categories: dbCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // Fetch actions from Supabase
  const {
    actions: dbActions,
    loading: actionsLoading,
    error: actionsError,
  } = useActions();

  // Transform categories for CategoryPicker component
  const categories = useMemo(() => {
    return dbCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [dbCategories]);

  // Transform actions for Select component
  const actions = useMemo(() => {
    return dbActions.map((action) => ({
      value: action.id,
      label: action.name,
    }));
  }, [dbActions]);

  // UI State
  const [hideDone, setHideDone] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified form state (used for both add and edit)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'todo' | 'done'>('todo');
  const [formPriority, setFormPriority] = useState<
    'low' | 'medium' | 'high' | ''
  >('');
  const [formUrl, setFormUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');

  // Calculate stats
  const stats = useItemStats(allItems);

  // Filter items using useMemo
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (hideDone && item.status === 'done') return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.categoryId)
      )
        return false;
      if (selectedPriorities.length > 0) {
        if (!item.priority || !selectedPriorities.includes(item.priority)) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, hideDone, selectedCategories, selectedPriorities]);

  // Helper function to reset form
  const resetForm = () => {
    setFormTitle('');
    setFormCategory('');
    setFormAction('');
    setFormDescription('');
    setFormStatus('todo');
    setFormPriority('');
    setFormUrl('');
    setFormLocation('');
    setFormNote('');
    setFormTargetDate('');
    setEditingItem(null);
  };

  // Helper function to open modal for adding new item
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Helper function to open modal for editing existing item
  const openEditModal = (id: string) => {
    const item = allItems.find((i) => i.id === id);
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormCategory(item.categoryId);
      setFormAction(item.actionId || '');
      setFormDescription(item.description || '');
      setFormStatus(item.status);
      setFormPriority(item.priority || '');
      setFormUrl(item.url || '');
      setFormLocation(item.location || '');
      setFormNote(item.note || '');
      setFormTargetDate(item.targetDate || '');
      setIsModalOpen(true);
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Unified handler for both add and edit
  const handleSubmitForm = async () => {
    if (!formTitle.trim() || !formCategory) return;

    try {
      setIsSubmitting(true);

      if (editingItem) {
        // Update existing item
        await updateExistingItem(editingItem.id, {
          actionId: formAction || null,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          priority: formPriority || null,
          url: formUrl.trim() || null,
          location: formLocation.trim() || null,
          note: formNote.trim() || null,
          targetDate: formTargetDate || null,
        });
      } else {
        // Create new item
        await createNewItem({
          categoryId: formCategory,
          actionId: formAction || null,
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          priority: formPriority || null,
          url: formUrl.trim() || null,
          location: formLocation.trim() || null,
          note: formNote.trim() || null,
          targetDate: formTargetDate || null,
        });
      }

      closeModal();
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteExistingItem(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleToggleDone = async (id: string) => {
    try {
      await toggleStatus(id);
    } catch (err) {
      console.error('Failed to toggle item status:', err);
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = dbCategories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getActionLabel = (actionId: string | null | undefined) => {
    if (!actionId) return null;
    const action = dbActions.find((a) => a.id === actionId);
    return action?.name || null;
  };

  return (
    <AuthenticatedLayout>
      {/* Main content */}
      <div className="container-custom py-8">
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
        {loading || categoriesLoading || actionsLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="lg" text="Loading..." />
          </div>
        ) : categoriesError || actionsError ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                {categoriesError || actionsError}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats section */}
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-neutral-900">
                  Overview
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Items"
                    value={stats.total}
                    icon={ListTodo}
                    variant="primary"
                  />
                  <StatCard
                    title="Completed"
                    value={stats.done}
                    icon={CheckCircle2}
                    variant="success"
                  />
                  <StatCard
                    title="To Do"
                    value={stats.todo}
                    icon={Circle}
                    variant="accent"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={TrendingUp}
                    variant="neutral"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="divider" />

              {/* Filters and Actions section */}
              <div className="mb-6 space-y-4">
                {/* Top row: Category filter, Toggle, and Add button */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
                    <div className="flex-1 sm:max-w-md">
                      <MultiSelectCategoryFilter
                        categories={categories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                      />
                    </div>
                    <Toggle
                      label="Hide done items"
                      checked={hideDone}
                      onChange={(e) => setHideDone(e.target.checked)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={openAddModal}
                  >
                    Add New Item
                  </Button>
                </div>

                {/* Bottom row: Priority filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Priority:
                  </span>
                  {(['high', 'medium', 'low'] as const).map((priority) => {
                    const priorityIcons = {
                      high: AlertCircle,
                      medium: ArrowUp,
                      low: Circle,
                    };
                    const priorityVariants = {
                      high: 'danger' as const,
                      medium: 'accent' as const,
                      low: 'neutral' as const,
                    };

                    return (
                      <Badge
                        key={priority}
                        text={priority.charAt(0).toUpperCase() + priority.slice(1)}
                        variant={priorityVariants[priority]}
                        icon={priorityIcons[priority]}
                        selected={selectedPriorities.includes(priority)}
                        onClick={() => {
                          setSelectedPriorities((prev) =>
                            prev.includes(priority)
                              ? prev.filter((p) => p !== priority)
                              : [...prev, priority]
                          );
                        }}
                        className="cursor-pointer hover:opacity-80"
                      />
                    );
                  })}
                  {selectedPriorities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPriorities([])}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

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
                          onClick: openAddModal,
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
                          action={getActionLabel(item.actionId)}
                          category={getCategoryLabel(item.categoryId)}
                          done={item.status === 'done'}
                          description={item.description || undefined}
                          priority={item.priority}
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
      </div>

      {/* Unified Add/Edit modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="lg"
      >
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="space-y-4 px-1">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Action (optional)"
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  options={[{ value: '', label: 'None' }, ...actions]}
                  fullWidth
                />
                <Input
                  label="Title"
                  placeholder="What do you want to do?"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  fullWidth
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Select a category...' },
                    ...categories,
                  ]}
                  required
                  fullWidth
                />
                <Select
                  label="Status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as 'todo' | 'done')
                  }
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'done', label: 'Done' },
                  ]}
                  required
                  fullWidth
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3">
              <Textarea
                label="Description (optional)"
                placeholder="Add more details..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                fullWidth
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Priority (optional)"
                  value={formPriority}
                  onChange={(e) =>
                    setFormPriority(
                      e.target.value as 'low' | 'medium' | 'high' | ''
                    )
                  }
                  options={[
                    { value: '', label: 'None' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  fullWidth
                />
                <Input
                  label="Target Date (optional)"
                  type="date"
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="URL (optional)"
                  type="url"
                  placeholder="https://example.com"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Location (optional)"
                  placeholder="Where is this?"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  fullWidth
                />
              </div>
              <Textarea
                label="Note (optional)"
                placeholder="Additional notes..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                rows={2}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitForm}
            disabled={!formTitle.trim() || !formCategory || isSubmitting}
            loading={isSubmitting}
          >
            {editingItem ? 'Save Changes' : 'Add Item'}
          </Button>
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
    </AuthenticatedLayout>
  );
}
