import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem, deleteItem, getItems, updateItem, uploadItemImage, type ItemsFilters } from '../lib/api/items';
import { withDelay } from '../lib/with-delay';
import type { CreateItemInput, UpdateItemInput } from '@everly/shared';

export function useItems(filters: ItemsFilters) {
    return useQuery({
        queryKey: ['items', filters],
        queryFn: () => getItems(filters),
    });
}

export function useCreateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: withDelay((input: CreateItemInput) => createItem(input)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
}

export function useUpdateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: withDelay(({ id, input }: { id: string; input: UpdateItemInput }) => updateItem(id, input)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
}

export function useToggleItemArchived() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) => updateItem(id, { isArchived }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
}

export function useUploadItemImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => uploadItemImage(id, file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
}

export function useDeleteItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteItem(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
    });
}
