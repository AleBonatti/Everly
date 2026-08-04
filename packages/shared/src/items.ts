import { z } from 'zod';

export const createItemInputSchema = z.object({
    categoryId: z.uuid(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    notes: z.string().nullable(),
    imageUrl: z.url().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationLabel: z.string().optional(),
    importance: z.number().int().min(1).max(5).optional(),
});
export type CreateItemInput = z.infer<typeof createItemInputSchema>;

export const updateItemInputSchema = createItemInputSchema.partial().extend({
    isArchived: z.boolean().optional(),
});
export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;

export const itemsQuerySchema = z.object({
    category: z
        .string()
        .optional()
        .transform((value) => (value ? value.split(',') : undefined)),
    q: z.string().optional(),
    archived: z
        .enum(['true', 'false'])
        .default('false')
        .transform((v) => v === 'true'),
    sort: z.enum(['newest', 'importance']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type ItemsQuery = z.infer<typeof itemsQuerySchema>;

export const itemSchema = z.object({
    id: z.uuid(),
    categoryId: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    notes: z.string().nullable(),
    imageUrl: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    locationLabel: z.string().nullable(),
    importance: z.number(),
    isArchived: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Item = z.infer<typeof itemSchema>;

export const paginatedItemsSchema = z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
});
export type PaginatedItems = z.infer<typeof paginatedItemsSchema>;
