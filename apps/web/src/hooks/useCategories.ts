import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../lib/api/categories';
import type { CreateCategoryInput, UpdateCategoryInput } from '@everly/shared';
import { withDelay } from '../lib/with-delay';

export function useCategories() {
    return useQuery({ queryKey: ['categories'], queryFn: getCategories, select: (categories) => [...categories].sort((a, b) => a.name.localeCompare(b.name)) });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: withDelay((input: CreateCategoryInput) => createCategory(input)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: withDelay(({ id, input }: { id: string; input: UpdateCategoryInput }) => updateCategory(id, input)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    });
}
