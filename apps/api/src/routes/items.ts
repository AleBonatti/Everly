import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { and, eq, ilike, or } from 'drizzle-orm';
import {
    createItemInputSchema,
    updateItemInputSchema,
    itemsQuerySchema,
    itemSchema,
    errorResponseSchema,
} from '@everly/shared';
import { db } from '../db/index.js';
import { items, categories } from '../db/schema.js';

function serializeItem(item: typeof items.$inferSelect) {
    return {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}

export const itemsRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('preHandler', app.authenticate);

    app.get(
        '/',
        { schema: { querystring: itemsQuerySchema, response: { 200: z.array(itemSchema) } } },
        async (request, reply) => {
            const { category, q } = request.query;

            const whereConditions = and(
                eq(items.userId, request.user.sub),
                category ? eq(items.categoryId, category) : undefined,
                q
                    ? or(ilike(items.title, `%${q}%`), ilike(items.description, `%${q}%`))
                    : undefined,
            );

            const userItems = await db.query.items.findMany({ where: whereConditions });

            return reply.send(userItems.map(serializeItem));
        },
    );

    app.post(
        '/',
        {
            schema: {
                body: createItemInputSchema,
                response: { 201: itemSchema, 404: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const category = await db.query.categories.findFirst({
                where: and(
                    eq(categories.id, request.body.categoryId),
                    eq(categories.userId, request.user.sub),
                ),
            });

            if (!category) {
                return reply.status(404).send({ message: 'Category not found' });
            }

            const [item] = await db
                .insert(items)
                .values({ ...request.body, userId: request.user.sub })
                .returning();

            if (!item) {
                throw new Error('Failed to create item');
            }

            return reply.status(201).send(serializeItem(item));
        },
    );

    app.patch(
        '/:id',
        {
            schema: {
                params: z.object({ id: z.string().uuid() }),
                body: updateItemInputSchema,
                response: { 200: itemSchema, 404: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            if (request.body.categoryId) {
                const category = await db.query.categories.findFirst({
                    where: and(
                        eq(categories.id, request.body.categoryId),
                        eq(categories.userId, request.user.sub),
                    ),
                });

                if (!category) {
                    return reply.status(404).send({ message: 'Category not found' });
                }
            }

            const [item] = await db
                .update(items)
                .set({ ...request.body, updatedAt: new Date() })
                .where(and(eq(items.id, id), eq(items.userId, request.user.sub)))
                .returning();

            if (!item) {
                return reply.status(404).send({ message: 'Item not found' });
            }

            return reply.send(serializeItem(item));
        },
    );

    app.delete(
        '/:id',
        {
            schema: {
                params: z.object({ id: z.string().uuid() }),
                response: { 200: errorResponseSchema, 404: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            const [deleted] = await db
                .delete(items)
                .where(and(eq(items.id, id), eq(items.userId, request.user.sub)))
                .returning();

            if (!deleted) {
                return reply.status(404).send({ message: 'Item not found' });
            }

            return reply.send({ message: 'Item deleted' });
        },
    );
};
