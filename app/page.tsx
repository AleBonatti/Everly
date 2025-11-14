'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, AlertCircle } from 'lucide-react';
import { useItems } from '@/lib/hooks/useItems';
import { useCategories } from '@/lib/hooks/useCategories';
import { useActions } from '@/lib/hooks/useActions';
import { useItemStats } from '@/lib/hooks/useItemStats';
import { useItemActions } from '@/lib/hooks/useItemActions';
import { useItemFilters } from '@/lib/hooks/useItemFilters';
import { getCategoryLabel, getCategoryIcon, getActionLabel } from '@/lib/utils/item-helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Dialog from '@/components/ui/Dialog';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import ListItem from '@/components/ui/ListItem';
import ItemDetailPanel from '@/components/ui/ItemDetailPanel';
import Loader from '@/components/ui/Loader';
import ItemStats from '@/components/features/ItemStats';
import ItemFilters from '@/components/features/ItemFilters';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function HomePage() {
  // Fetch data from Supabase
  const {
    items: allItems,
    loading,
    error,
    createNewItem,
    updateExistingItem,
    deleteExistingItem,
    toggleStatus,
  } = useItems();

  const {
    categories: dbCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    actions: dbActions,
    loading: actionsLoading,
    error: actionsError,
  } = useActions();

  // Transform categories and actions for Select components
  const categories = useMemo(() => {
    return dbCategories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [dbCategories]);

  const actions = useMemo(() => {
    return dbActions.map((action) => ({
      value: action.id,
      label: action.name,
    }));
  }, [dbActions]);

  // Use custom hooks for item actions and filters
  const itemActions = useItemActions({
    createNewItem,
    updateExistingItem,
    deleteExistingItem,
    toggleStatus,
    allItems,
  });

  const {
    hideDone,
    selectedCategories,
    selectedPriorities,
    setHideDone,
    setSelectedCategories,
    setSelectedPriorities,
    filteredItems,
  } = useItemFilters(allItems);

  // Calculate stats
  const stats = useItemStats(allItems);

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
              <ItemStats stats={stats} />

              {/* Divider */}
              <div className="divider" />

              {/* Filters and Actions section */}
              <ItemFilters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                hideDone={hideDone}
                onHideDoneChange={setHideDone}
                selectedPriorities={selectedPriorities}
                onPriorityChange={setSelectedPriorities}
                onAddClick={itemActions.openAddModal}
              />

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
                          onClick: itemActions.openAddModal,
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
                          action={getActionLabel(item.actionId, dbActions)}
                          category={getCategoryLabel(item.categoryId, dbCategories)}
                          categoryIcon={getCategoryIcon(item.categoryId, dbCategories)}
                          done={item.status === 'done'}
                          description={item.description || undefined}
                          priority={item.priority}
                          onClick={itemActions.handleItemClick}
                          onToggleDone={itemActions.handleToggleDone}
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
        open={itemActions.isModalOpen}
        onClose={itemActions.closeModal}
        title={itemActions.editingItem ? 'Edit Item' : 'Add New Item'}
        size="lg"
      >
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="space-y-4 px-1">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Action (optional)"
                  value={itemActions.formAction}
                  onChange={(e) => itemActions.setFormAction(e.target.value)}
                  options={[{ value: '', label: 'None' }, ...actions]}
                  fullWidth
                />
                <Input
                  label="Title"
                  placeholder="What do you want to do?"
                  value={itemActions.formTitle}
                  onChange={(e) => itemActions.setFormTitle(e.target.value)}
                  required
                  fullWidth
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={itemActions.formCategory}
                  onChange={(e) => itemActions.setFormCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Select a category...' },
                    ...categories,
                  ]}
                  required
                  fullWidth
                />
                <Select
                  label="Status"
                  value={itemActions.formStatus}
                  onChange={(e) =>
                    itemActions.setFormStatus(e.target.value as 'todo' | 'done')
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
                value={itemActions.formDescription}
                onChange={(e) => itemActions.setFormDescription(e.target.value)}
                rows={2}
                fullWidth
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Priority (optional)"
                  value={itemActions.formPriority}
                  onChange={(e) =>
                    itemActions.setFormPriority(
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
                  value={itemActions.formTargetDate}
                  onChange={(e) => itemActions.setFormTargetDate(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="URL (optional)"
                  type="url"
                  placeholder="https://example.com"
                  value={itemActions.formUrl}
                  onChange={(e) => itemActions.setFormUrl(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Location (optional)"
                  placeholder="Where is this?"
                  value={itemActions.formLocation}
                  onChange={(e) => itemActions.setFormLocation(e.target.value)}
                  fullWidth
                />
              </div>
              <Textarea
                label="Note (optional)"
                placeholder="Additional notes..."
                value={itemActions.formNote}
                onChange={(e) => itemActions.setFormNote(e.target.value)}
                rows={2}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="mt-6 flex justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={itemActions.closeModal}
            disabled={itemActions.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={itemActions.handleSubmitForm}
            disabled={!itemActions.formTitle.trim() || !itemActions.formCategory || itemActions.isSubmitting}
            loading={itemActions.isSubmitting}
          >
            {itemActions.editingItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!itemActions.deleteConfirm}
        onClose={() => itemActions.setDeleteConfirm(null)}
        onConfirm={() =>
          itemActions.deleteConfirm &&
          itemActions.handleDeleteItem(itemActions.deleteConfirm)
        }
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Item Detail Panel */}
      <ItemDetailPanel
        open={!!itemActions.detailPanelItem}
        onClose={itemActions.closeDetailPanel}
        item={
          itemActions.detailPanelItem
            ? {
                id: itemActions.detailPanelItem.id,
                title: itemActions.detailPanelItem.title,
                action: getActionLabel(itemActions.detailPanelItem.actionId, dbActions),
                category: getCategoryLabel(itemActions.detailPanelItem.categoryId, dbCategories),
                categoryIcon: getCategoryIcon(itemActions.detailPanelItem.categoryId, dbCategories),
                done: itemActions.detailPanelItem.status === 'done',
                description: itemActions.detailPanelItem.description,
                priority: itemActions.detailPanelItem.priority,
                url: itemActions.detailPanelItem.url,
                location: itemActions.detailPanelItem.location,
                note: itemActions.detailPanelItem.note,
                targetDate: itemActions.detailPanelItem.targetDate,
                createdAt: itemActions.detailPanelItem.createdAt,
                updatedAt: itemActions.detailPanelItem.updatedAt,
              }
            : null
        }
        onEdit={itemActions.handleEditFromPanel}
        onDelete={itemActions.handleDeleteFromPanel}
      />
    </AuthenticatedLayout>
  );
}
