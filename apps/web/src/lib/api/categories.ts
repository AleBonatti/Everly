import { z } from 'zod';
import { categorySchema, errorResponseSchema, type CreateCategoryInput, type UpdateCategoryInput } from '@everly/shared';
import { request } from '../api-client';

export function getCategories() {
    return request('/categories', z.array(categorySchema));
}

export function createCategory(input: CreateCategoryInput) {
    return request('/categories', categorySchema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export function updateCategory(id: string, input: UpdateCategoryInput) {
    return request(`/categories/${id}`, categorySchema, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });
}

export function deleteCategory(id: string) {
    return request(`/categories/${id}`, errorResponseSchema, { method: 'DELETE' });
}
