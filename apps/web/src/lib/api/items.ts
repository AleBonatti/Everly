import { paginatedItemsSchema, itemSchema, errorResponseSchema, type CreateItemInput, type UpdateItemInput } from '@everly/shared';
import { request } from '../api-client';

export interface ItemsFilters {
    categories?: string[];
    q?: string;
    archived?: boolean;
    sort?: 'newest' | 'importance';
    page?: number;
    pageSize?: number;
}

export function getItems(filters: ItemsFilters) {
    const params = new URLSearchParams();
    if (filters.categories && filters.categories.length > 0) params.set('category', filters.categories.join(','));
    if (filters.q) params.set('q', filters.q);
    if (filters.archived !== undefined) params.set('archived', String(filters.archived));
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

    const query = params.toString();
    return request(`/items${query ? `?${query}` : ''}`, paginatedItemsSchema);
}

export function createItem(input: CreateItemInput) {
    return request('/items', itemSchema, { method: 'POST', body: JSON.stringify(input) });
}

export function updateItem(id: string, input: UpdateItemInput) {
    return request(`/items/${id}`, itemSchema, { method: 'PATCH', body: JSON.stringify(input) });
}

export function uploadItemImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return request(`/items/${id}/image`, itemSchema, {
        method: 'POST',
        body: formData,
    });
}

export function deleteItem(id: string) {
    return request(`/items/${id}`, errorResponseSchema, { method: 'DELETE' });
}
