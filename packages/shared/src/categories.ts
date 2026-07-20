import { z } from 'zod';

export const CATEGORY_COLORS = [
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Pink', value: '#ec4899' },
] as const;

const colorValues = CATEGORY_COLORS.map((c) => c.value) as [string, ...string[]];

export const categoryColorSchema = z.enum(colorValues);
export type CategoryColor = z.infer<typeof categoryColorSchema>;

export const createCategoryInputSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    color: categoryColorSchema,
});
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = createCategoryInputSchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

export const categorySchema = z.object({
    id: z.uuid(),
    name: z.string(),
    color: categoryColorSchema,
    isDefault: z.boolean(),
});
export type Category = z.infer<typeof categorySchema>;
