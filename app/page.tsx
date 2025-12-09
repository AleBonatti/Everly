'use client';

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, AlertCircle } from 'lucide-react';
import { useItems } from '@/lib/hooks/useItems';
import { useCategories } from '@/lib/hooks/useCategories';
import { useActions } from '@/lib/hooks/useActions';
import { useItemActions } from '@/lib/hooks/useItemActions';
import { useItemFilters } from '@/lib/hooks/useItemFilters';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import {
  getCategoryLabel,
  getCategoryIcon,
  getActionLabel,
} from '@/lib/utils/item-helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Dialog from '@/components/ui/Dialog';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import ListItem from '@/components/ui/ListItem';
import ItemDetailPanel from '@/components/ui/ItemDetailPanel';
import ListItemSkeleton from '@/components/ui/ListItemSkeleton';
import KeyboardShortcutsHelp from '@/components/ui/KeyboardShortcutsHelp';
import ItemFilters from '@/components/features/ItemFilters';
import AIAssistantModal from '@/components/features/AIAssistantModal';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function HomePage() {
  // Fetch data from Supabase
  const {
    items: allItems,
    loading,
    error,
    refresh,
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
    sortBy,
    setHideDone,
    setSelectedCategories,
    setSelectedPriorities,
    setSortBy,
    filteredItems,
  } = useItemFilters(allItems);

  // Infinite scroll pagination
  const ITEMS_PER_PAGE = 8;
  const [displayedItemsCount, setDisplayedItemsCount] =
    useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // AI Assistant modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Reset displayed items when filters or sort change
  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  }, [filteredItems, sortBy]);

  // Get currently displayed items
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, displayedItemsCount);
  }, [filteredItems, displayedItemsCount]);

  const hasMore = displayedItemsCount < filteredItems.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate a small delay for smooth UX
          setTimeout(() => {
            setDisplayedItemsCount((prev) => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Trigger 100px before the element comes into view
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, displayedItemsCount]);

  // Keyboard shortcuts
  useKeyboardShortcut(itemActions.openAddModal, {
    key: 'n',
    meta: true, // Cmd+N on Mac, Win+N on Windows
    enabled: !itemActions.isModalOpen,
  });

  useKeyboardShortcut(() => setHideDone(!hideDone), {
    key: 'h',
    meta: true, // Cmd+H on Mac, Win+H on Windows
    enabled: !itemActions.isModalOpen,
  });

  return (
    <AuthenticatedLayout>
      {/* Main content */}
      <div>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ListItemSkeleton key={index} />
              ))}
            </div>
          </motion.div>
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
              {/* Filters and Actions section */}
              <ItemFilters
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                hideDone={hideDone}
                onHideDoneChange={setHideDone}
                selectedPriorities={selectedPriorities}
                onPriorityChange={setSelectedPriorities}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onAddClick={itemActions.openAddModal}
                onAIAssistantClick={() => setIsAIModalOpen(true)}
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
                <>
                  <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {displayedItems.map((item, index) => (
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
                            category={getCategoryLabel(
                              item.categoryId,
                              dbCategories
                            )}
                            categoryIcon={getCategoryIcon(
                              item.categoryId,
                              dbCategories
                            )}
                            done={item.status === 'done'}
                            description={item.description || undefined}
                            priority={item.priority}
                            imageUrl={item.imageUrl}
                            onClick={itemActions.handleItemClick}
                            onToggleDone={itemActions.handleToggleDone}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Infinite scroll trigger and loading indicator */}
                  {hasMore && (
                    <div className="mt-8">
                      {isLoadingMore && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
                        >
                          {Array.from({
                            length: Math.min(
                              ITEMS_PER_PAGE,
                              filteredItems.length - displayedItemsCount
                            ),
                          }).map((_, index) => (
                            <ListItemSkeleton key={`skeleton-${index}`} />
                          ))}
                        </motion.div>
                      )}
                      {/* Invisible trigger element for intersection observer */}
                      <div
                        ref={loadMoreRef}
                        className="h-20 w-full"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </>
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
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-100 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-track]:bg-neutral-900 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
          <div className="space-y-4 px-1 pb-2">
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
                  onChange={(e) =>
                    itemActions.setFormTargetDate(e.target.value)
                  }
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
            disabled={
              !itemActions.formTitle.trim() ||
              !itemActions.formCategory ||
              itemActions.isSubmitting
            }
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
                action: getActionLabel(
                  itemActions.detailPanelItem.actionId,
                  dbActions
                ),
                category: getCategoryLabel(
                  itemActions.detailPanelItem.categoryId,
                  dbCategories
                ),
                categoryId: itemActions.detailPanelItem.categoryId,
                categoryIcon: getCategoryIcon(
                  itemActions.detailPanelItem.categoryId,
                  dbCategories
                ),
                done: itemActions.detailPanelItem.status === 'done',
                description: itemActions.detailPanelItem.description,
                priority: itemActions.detailPanelItem.priority,
                url: itemActions.detailPanelItem.url,
                location: itemActions.detailPanelItem.location,
                note: itemActions.detailPanelItem.note,
                targetDate: itemActions.detailPanelItem.targetDate,
                imageUrl: itemActions.detailPanelItem.imageUrl,
                metadata: itemActions.detailPanelItem.metadata,
                createdAt: itemActions.detailPanelItem.createdAt,
                updatedAt: itemActions.detailPanelItem.updatedAt,
              }
            : null
        }
        onEdit={itemActions.handleEditFromPanel}
        onDelete={itemActions.handleDeleteFromPanel}
        onRefresh={refresh}
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        open={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onItemAdded={refresh}
      />
    </AuthenticatedLayout>
  );
}
