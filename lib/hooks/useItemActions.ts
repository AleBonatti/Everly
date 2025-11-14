import { useState, useMemo } from 'react';
import type { Item } from '@/lib/services/items';
import { useToast } from './useToast';
import { useUnsavedChanges } from './useUnsavedChanges';

export interface ItemFormData {
  categoryId?: string;
  actionId?: string | null;
  title: string;
  description?: string | null;
  status: 'todo' | 'done';
  priority?: 'low' | 'medium' | 'high' | null;
  url?: string | null;
  location?: string | null;
  note?: string | null;
  targetDate?: string | null;
}

export interface UseItemActionsProps {
  createNewItem: (data: any) => Promise<any>;
  updateExistingItem: (id: string, data: any) => Promise<any>;
  deleteExistingItem: (id: string) => Promise<any>;
  toggleStatus: (id: string) => Promise<any>;
  allItems: Item[];
}

export function useItemActions({
  createNewItem,
  updateExistingItem,
  deleteExistingItem,
  toggleStatus,
  allItems,
}: UseItemActionsProps) {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailPanelItem, setDetailPanelItem] = useState<Item | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAction, setFormAction] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'todo' | 'done'>('todo');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  const [formUrl, setFormUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!isModalOpen) return false;

    if (editingItem) {
      // Check if any field has been modified from the original item
      return (
        formTitle !== editingItem.title ||
        formCategory !== editingItem.categoryId ||
        (formAction || '') !== (editingItem.actionId || '') ||
        (formDescription || '') !== (editingItem.description || '') ||
        formStatus !== editingItem.status ||
        (formPriority || '') !== (editingItem.priority || '') ||
        (formUrl || '') !== (editingItem.url || '') ||
        (formLocation || '') !== (editingItem.location || '') ||
        (formNote || '') !== (editingItem.note || '') ||
        (formTargetDate || '') !== (editingItem.targetDate || '')
      );
    } else {
      // For new items, check if any field has been filled
      return !!(
        formTitle.trim() ||
        formCategory ||
        formAction ||
        formDescription.trim() ||
        formPriority ||
        formUrl.trim() ||
        formLocation.trim() ||
        formNote.trim() ||
        formTargetDate
      );
    }
  }, [
    isModalOpen,
    editingItem,
    formTitle,
    formCategory,
    formAction,
    formDescription,
    formStatus,
    formPriority,
    formUrl,
    formLocation,
    formNote,
    formTargetDate,
  ]);

  // Reset form
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

  // Actual close function (without confirmation)
  const performClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Use unsaved changes hook
  const { confirmClose } = useUnsavedChanges(hasUnsavedChanges, performClose);

  // Open modal for adding new item
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
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

  // Close modal with unsaved changes confirmation
  const closeModal = () => {
    confirmClose();
  };

  // Submit form (add or edit)
  const handleSubmitForm = async () => {
    if (!formTitle.trim() || !formCategory) return;

    try {
      setIsSubmitting(true);

      if (editingItem) {
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
        toast.success('Item updated successfully');
      } else {
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
        toast.success('Item created successfully');
      }

      // Close without confirmation since we just saved
      performClose();
    } catch (err) {
      console.error('Failed to save item:', err);
      toast.error(editingItem ? 'Failed to update item' : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteExistingItem(id);
      setDeleteConfirm(null);
      toast.success('Item deleted successfully');
    } catch (err) {
      console.error('Failed to delete item:', err);
      toast.error('Failed to delete item');
    }
  };

  // Toggle item status
  const handleToggleDone = async (id: string) => {
    try {
      await toggleStatus(id);
    } catch (err) {
      console.error('Failed to toggle item status:', err);
      toast.error('Failed to toggle item status');
    }
  };

  // Detail panel handlers
  const handleItemClick = (id: string) => {
    const item = allItems.find((i) => i.id === id);
    if (item) {
      setDetailPanelItem(item);
    }
  };

  const closeDetailPanel = () => {
    setDetailPanelItem(null);
  };

  const handleEditFromPanel = () => {
    if (detailPanelItem) {
      openEditModal(detailPanelItem.id);
      closeDetailPanel();
    }
  };

  const handleDeleteFromPanel = () => {
    if (detailPanelItem) {
      setDeleteConfirm(detailPanelItem.id);
      closeDetailPanel();
    }
  };

  return {
    // Modal state
    isModalOpen,
    editingItem,
    deleteConfirm,
    isSubmitting,
    detailPanelItem,

    // Form state
    formTitle,
    formCategory,
    formAction,
    formDescription,
    formStatus,
    formPriority,
    formUrl,
    formLocation,
    formNote,
    formTargetDate,

    // Form setters
    setFormTitle,
    setFormCategory,
    setFormAction,
    setFormDescription,
    setFormStatus,
    setFormPriority,
    setFormUrl,
    setFormLocation,
    setFormNote,
    setFormTargetDate,

    // Modal actions
    openAddModal,
    openEditModal,
    closeModal,

    // CRUD actions
    handleSubmitForm,
    handleDeleteItem,
    handleToggleDone,

    // Detail panel actions
    handleItemClick,
    closeDetailPanel,
    handleEditFromPanel,
    handleDeleteFromPanel,

    // Delete confirmation
    setDeleteConfirm,
  };
}
