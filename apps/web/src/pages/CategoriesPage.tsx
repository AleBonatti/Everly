import { useState } from 'react';
import { Link } from 'react-router';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { CategoryModal } from '../components/CategoryModal';
import { Button } from '../components/Button';
import { ApiError } from '../lib/api-client';
import type { Category, CreateCategoryInput } from '@everly/shared';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function CategoriesPage() {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [formError, setFormError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState<Category | undefined>(undefined);

    function openAdd() {
        setEditingCategory(undefined);
        setFormError('');
        setModalOpen(true);
    }

    function openEdit(category: Category) {
        setEditingCategory(category);
        setFormError('');
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingCategory(undefined);
    }

    function handleSubmit(input: CreateCategoryInput) {
        setFormError('');
        const mutation = editingCategory ? updateCategory.mutateAsync({ id: editingCategory.id, input }) : createCategory.mutateAsync(input);

        mutation.then(closeModal).catch((error) => {
            setFormError(error instanceof ApiError ? error.message : 'Something went wrong');
        });
    }

    function handleConfirmDelete() {
        if (!confirmingDelete) return;
        deleteCategory.mutate(confirmingDelete.id, {
            onSuccess: () => setConfirmingDelete(undefined),
            onError: (error) => {
                setDeleteError(error instanceof ApiError ? error.message : 'Something went wrong');
                setConfirmingDelete(undefined);
            },
        });
    }

    return (
        <div className="max-w-5xl mx-auto px-8 py-11">
            <div className="flex items-center justify-between mb-7 gap-3 flex-wrap">
                <div>
                    <Link to="/" className="text-xs text-muted-foreground block mb-4">
                        ← Back to list
                    </Link>
                    <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
                </div>
                <Button onClick={openAdd}>+ Add category</Button>
            </div>

            {deleteError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg mb-4 max-w-xl">{deleteError}</div>}

            {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

            <div className="flex flex-col gap-2.5 max-w-xl">
                {categories?.map((category) => (
                    <div key={category.id} className="flex items-center gap-3.5 px-4 py-3.5 bg-surface border border-border rounded-lg">
                        <span className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: category.color }} />
                        <span className="flex-1 text-sm font-semibold text-foreground">{category.name}</span>
                        <button onClick={() => openEdit(category)} className="text-xs text-foreground/80 cursor-pointer px-3 py-1.5 rounded-md border border-border hover:bg-surface-inset">
                            Edit
                        </button>
                        <button onClick={() => setConfirmingDelete(category)} className="text-xs text-destructive cursor-pointer px-3 py-1.5 rounded-md border border-border hover:bg-destructive-bg">
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <CategoryModal category={editingCategory} onClose={closeModal} onSubmit={handleSubmit} isSubmitting={createCategory.isPending || updateCategory.isPending} error={formError} />
            )}

            {confirmingDelete && (
                <ConfirmDialog
                    title="Delete category?"
                    message={`Are you sure you want to delete "${confirmingDelete.name}"? This can't be undone.`}
                    isConfirming={deleteCategory.isPending}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmingDelete(undefined)}
                />
            )}
        </div>
    );
}
