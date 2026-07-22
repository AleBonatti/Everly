import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { createItemInputSchema, updateItemInputSchema, itemsQuerySchema, paginatedItemsSchema, itemSchema, errorResponseSchema } from '@everly/shared';
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

    app.get('/', { schema: { querystring: itemsQuerySchema, response: { 200: paginatedItemsSchema } } }, async (request, reply) => {
        const { category, q, archived, sort, page, pageSize } = request.query;

        const whereConditions = and(
            eq(items.userId, request.user.sub),
            eq(items.isArchived, archived),
            category ? inArray(items.categoryId, category) : undefined,
            q ? or(ilike(items.title, `%${q}%`), ilike(items.description, `%${q}%`)) : undefined,
        );

        const orderBy = sort === 'importance' ? desc(items.importance) : desc(items.createdAt);

        const [rows, totalResult] = await Promise.all([
            db
                .select()
                .from(items)
                .where(whereConditions)
                .orderBy(orderBy)
                .limit(pageSize)
                .offset((page - 1) * pageSize),
            db
                .select({ count: sql<number>`count(*)`.mapWith(Number) })
                .from(items)
                .where(whereConditions),
        ]);

        return reply.send({
            items: rows.map(serializeItem),
            total: totalResult[0]?.count ?? 0,
            page,
            pageSize,
        });
    });

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
                where: and(eq(categories.id, request.body.categoryId), eq(categories.userId, request.user.sub)),
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
                params: z.object({ id: z.uuid() }),
                body: updateItemInputSchema,
                response: { 200: itemSchema, 404: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            if (request.body.categoryId) {
                const category = await db.query.categories.findFirst({
                    where: and(eq(categories.id, request.body.categoryId), eq(categories.userId, request.user.sub)),
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
                params: z.object({ id: z.uuid() }),
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
