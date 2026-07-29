import { useMemo, useRef, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useCreateItem, useDeleteItem, useItems, useUpdateItem, useToggleItemArchived } from '../hooks/useItems';
import { useClickOutside } from '../hooks/useClickOutside';
import { Button } from '../components/Button';
import { ItemCard } from '../components/ItemCard';
import { ItemModal } from '../components/ItemModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ApiError } from '../lib/api-client';
import type { Item, CreateItemInput } from '@everly/shared';

const PAGE_SIZE = 12;

export function ItemsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sort, setSort] = useState<'newest' | 'importance'>('newest');
    const [showArchived, setShowArchived] = useState(false);
    const [page, setPage] = useState(1);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
    const [formError, setFormError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState<Item | undefined>(undefined);
    const [deleteError, setDeleteError] = useState('');
    const [confirmingArchive, setConfirmingArchive] = useState<Item | undefined>(undefined);

    const createItem = useCreateItem();
    const deleteItemMutation = useDeleteItem();

    useClickOutside(categoryMenuRef, () => setCategoryMenuOpen(false));

    const { data: categories } = useCategories();
    const { data, isLoading } = useItems({
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        q: search || undefined,
        archived: showArchived,
        sort,
        page,
        pageSize: PAGE_SIZE,
    });
    const updateItem = useUpdateItem();
    const toggleArchived = useToggleItemArchived();

    const categoryById = useMemo(() => new Map(categories?.map((category) => [category.id, category])), [categories]);

    const items = data?.items ?? [];
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    function toggleCategoryFilter(categoryId: string) {
        setSelectedCategories((current) => (current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]));
        setPage(1);
    }

    function openAdd() {
        setEditingItem(undefined);
        setFormError('');
        setModalOpen(true);
    }

    function openEdit(item: Item) {
        setEditingItem(item);
        setFormError('');
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingItem(undefined);
    }

    function handleSubmit(input: CreateItemInput) {
        setFormError('');
        const mutation = editingItem ? updateItem.mutateAsync({ id: editingItem.id, input }) : createItem.mutateAsync(input);

        mutation.then(closeModal).catch((error) => {
            setFormError(error instanceof ApiError ? error.message : 'Something went wrong');
        });
    }

    function handleConfirmDelete() {
        if (!confirmingDelete) return;
        deleteItemMutation.mutate(confirmingDelete.id, {
            onSuccess: () => {
                setConfirmingDelete(undefined);
                closeModal();
                handleAfterRemovalFromPage();
            },
            onError: (error) => {
                setDeleteError(error instanceof ApiError ? error.message : 'Something went wrong');
                setConfirmingDelete(undefined);
            },
        });
    }

    function handleAfterRemovalFromPage() {
        if (items.length === 1 && page > 1) {
            setPage((current) => current - 1);
        }
    }

    function handleArchiveToggle(item: Item) {
        if (item.isArchived) {
            toggleArchived.mutate({ id: item.id, isArchived: false }, { onSuccess: handleAfterRemovalFromPage });
        } else {
            setConfirmingArchive(item);
        }
    }

    function handleConfirmArchive() {
        if (!confirmingArchive) return;
        toggleArchived.mutate({ id: confirmingArchive.id, isArchived: true }, { onSuccess: handleAfterRemovalFromPage });
        setConfirmingArchive(undefined);
    }

    const categoryButtonLabel =
        selectedCategories.length === 0
            ? 'All categories'
            : selectedCategories.length === 1
              ? (categoryById.get(selectedCategories[0])?.name ?? 'All categories')
              : `${selectedCategories.length} categories`;

    const noFiltersActive = selectedCategories.length === 0 && !search.trim() && !showArchived;

    return (
        <div>
            <div className="flex items-center gap-3 px-8 py-6.5 border-b border-border-subtle flex-wrap">
                <div className="flex items-center gap-2 bg-surface-inset border border-border rounded-lg px-3 py-2 min-w-[220px]">
                    <span className="text-sm text-muted-foreground">⌕</span>
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search your list..."
                        className="bg-transparent border-none outline-none text-sm text-foreground w-full"
                    />
                </div>

                <div ref={categoryMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setCategoryMenuOpen((open) => !open)}
                        className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg cursor-pointer bg-surface-inset text-foreground/85 border border-border"
                    >
                        <span>{categoryButtonLabel}</span>
                        <span className="text-[10px] text-muted-foreground">▾</span>
                    </button>
                    {categoryMenuOpen && (
                        <div className="absolute left-0 top-[calc(100%+8px)] w-[200px] bg-surface border border-border rounded-lg shadow-2xl overflow-hidden z-20">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setPage(1);
                                }}
                                className="w-full text-left px-3.5 py-2.5 text-sm border-b border-border hover:bg-surface-inset"
                            >
                                All categories
                            </button>
                            {categories?.map((category) => {
                                const active = selectedCategories.includes(category.id);
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => toggleCategoryFilter(category.id)}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-surface-inset text-left"
                                    >
                                        <span
                                            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px]"
                                            style={{
                                                border: `1px solid ${active ? category.color : 'var(--color-border)'}`,
                                                backgroundColor: active ? `${category.color}33` : 'transparent',
                                                color: category.color,
                                            }}
                                        >
                                            {active ? '✓' : ''}
                                        </span>
                                        <span>{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value as 'newest' | 'importance');
                            setPage(1);
                        }}
                        className="bg-surface-inset border border-border text-foreground/85 text-sm px-2.5 py-2 rounded-lg outline-none"
                    >
                        <option value="newest">Newest first</option>
                        <option value="importance">Most important</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            setShowArchived((current) => !current);
                            setSelectedCategories([]);
                            setPage(1);
                        }}
                        className={`text-sm px-3.5 py-2 rounded-lg cursor-pointer border ${
                            showArchived ? 'bg-surface-inset text-foreground border-muted-foreground/40' : 'text-muted-foreground border-border'
                        }`}
                    >
                        Archived
                    </button>
                    <Button onClick={openAdd}>+ Add item</Button>
                </div>
            </div>

            <div className="max-w-[1280px] w-full mx-auto px-8 py-11">
                {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
                        <div className="text-4xl">✧</div>
                        <h2 className="text-2xl text-foreground">{noFiltersActive ? 'Your list is empty' : 'No matches'}</h2>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            {noFiltersActive
                                ? "Heard about a great restaurant, a trip worth taking, or a show you can't miss? Add it here so you never forget."
                                : 'Try a different search or category.'}
                        </p>
                    </div>
                )}

                {deleteError && <div className="text-xs text-destructive bg-destructive-bg border border-destructive-border px-3 py-2 rounded-lg mb-4 max-w-xl">{deleteError}</div>}

                {items.length > 0 && (
                    <div className="grid gap-5.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} category={categoryById.get(item.categoryId)} onEdit={() => openEdit(item)} onArchiveToggle={() => handleArchiveToggle(item)} />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-9">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-2 rounded-lg text-sm border border-border text-foreground/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setPage(n)}
                                className={`min-w-8.5 h-8.5 rounded-lg text-sm border cursor-pointer ${
                                    n === page ? 'bg-accent text-accent-foreground border-accent font-bold' : 'bg-surface-inset text-foreground/80 border-border'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-2 rounded-lg text-sm border border-border text-foreground/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {modalOpen && (
                <ItemModal
                    item={editingItem}
                    categories={categories ?? []}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                    onDelete={editingItem ? () => setConfirmingDelete(editingItem) : undefined}
                    isSubmitting={createItem.isPending || updateItem.isPending}
                    error={formError}
                />
            )}

            {confirmingDelete && (
                <ConfirmDialog
                    title="Delete item?"
                    message={`Are you sure you want to delete "${confirmingDelete.title}"? This can't be undone.`}
                    isConfirming={deleteItemMutation.isPending}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmingDelete(undefined)}
                />
            )}

            {confirmingArchive && (
                <ConfirmDialog
                    title="Mark as done?"
                    message={`Mark "${confirmingArchive.title}" as done? You can restore it later from the Archived list.`}
                    confirmLabel="Mark done"
                    isConfirming={toggleArchived.isPending}
                    onConfirm={handleConfirmArchive}
                    onCancel={() => setConfirmingArchive(undefined)}
                />
            )}
        </div>
    );
}
