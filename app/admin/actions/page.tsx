'use client';

/**
 * Admin Actions Management Page
 *
 * Displays a modern card-based list of all actions with CRUD operations and drag-and-drop sorting.
 * Only accessible to admin users.
 */

import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { SortableList } from '@/components/ui/SortableList';
import { ActionListItem } from '@/components/admin/ActionListItem';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAdminActions } from '@/lib/hooks/useAdminActions';
import type {
  AdminAction,
  CreateActionInput,
} from '@/lib/services/admin-actions';

export default function AdminActionsPage() {
  const {
    actions,
    isLoading,
    error,
    createNewAction,
    updateAction,
    removeAction,
    reorderActions,
  } = useAdminActions();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<AdminAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormDisplayOrder('0');
    setEditingAction(null);
  };

  // Open modal for adding new action
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing action
  const openEditModal = (action: AdminAction) => {
    setEditingAction(action);
    setFormName(action.name);
    setFormDisplayOrder(action.displayOrder.toString());
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formName.trim()) return;

    try {
      setIsSubmitting(true);

      if (editingAction) {
        // Update existing action
        await updateAction(editingAction.id, {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        });
      } else {
        // Create new action
        const input: CreateActionInput = {
          name: formName.trim(),
          displayOrder: parseInt(formDisplayOrder) || 0,
        };
        await createNewAction(input);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (actionId: string) => {
    try {
      setIsDeleting(true);
      await removeAction(actionId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete action:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle reorder
  const handleReorder = async (reorderedActions: AdminAction[]) => {
    // Update display order for all actions in a single batch request
    try {
      await reorderActions(reorderedActions);
    } catch (err) {
      console.error('Failed to reorder actions:', err);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Action Management
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage actions that can be associated with items (e.g.,
            &quot;watch&quot;, &quot;listen to&quot;, &quot;visit&quot;)
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-danger-50 border border-danger-200 p-4 text-danger-800 dark:bg-danger-950 dark:border-danger-800 dark:text-danger-200">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Add action button */}
        <div className="mb-6">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Add New Action
          </Button>
        </div>

        {/* Actions list */}
        {actions.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No actions found"
            description="Get started by creating your first action."
            action={{
              label: 'Add New Action',
              onClick: openAddModal,
            }}
          />
        ) : (
          <SortableList
            items={actions}
            onReorder={handleReorder}
            getItemId={(action) => action.id}
            renderItem={(action) => (
              <ActionListItem
                action={action}
                onEdit={openEditModal}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                deleteConfirm={deleteConfirm}
                onDeleteConfirm={setDeleteConfirm}
              />
            )}
            className="space-y-3"
          />
        )}

        {/* Add/Edit Modal */}
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={editingAction ? 'Edit Action' : 'Add New Action'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Action Name"
              type="text"
              placeholder="e.g., watch, listen to, visit"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
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

            <p className="text-xs text-neutral-500">
              Lower numbers appear first. Actions will be used to describe what
              to do with items.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button
              variant="ghost"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              disabled={isSubmitting || !formName.trim()}
              loading={isSubmitting}
            >
              {editingAction ? 'Save Changes' : 'Create Action'}
            </Button>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
