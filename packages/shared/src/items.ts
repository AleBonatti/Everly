import { z } from 'zod';

export const createItemInputSchema = z.object({
    categoryId: z.uuid(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    imageUrl: z.url().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationLabel: z.string().optional(),
});
export type CreateItemInput = z.infer<typeof createItemInputSchema>;

export const updateItemInputSchema = createItemInputSchema.partial();
export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;

export const itemsQuerySchema = z.object({
    category: z.uuid().optional(),
    q: z.string().optional(),
});
export type ItemsQuery = z.infer<typeof itemsQuerySchema>;

export const itemSchema = z.object({
    id: z.uuid(),
    categoryId: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    locationLabel: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Item = z.infer<typeof itemSchema>;
