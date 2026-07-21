import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { and, eq } from 'drizzle-orm';
import { createCategoryInputSchema, updateCategoryInputSchema, categorySchema, errorResponseSchema } from '@everly/shared';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';

function isForeignKeyViolation(err: unknown): boolean {
    return typeof err === 'object' && err !== null && 'cause' in err && typeof err.cause === 'object' && err.cause !== null && 'code' in err.cause && err.cause.code === '23503';
}

export const categoriesRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('preHandler', app.authenticate);

    app.get('/', { schema: { response: { 200: z.array(categorySchema) } } }, async (request, reply) => {
        const userCategories = await db.query.categories.findMany({
            where: eq(categories.userId, request.user.sub),
        });
        return reply.send(userCategories);
    });

    app.post('/', { schema: { body: createCategoryInputSchema, response: { 201: categorySchema } } }, async (request, reply) => {
        const { name, color } = request.body;

        const [category] = await db.insert(categories).values({ userId: request.user.sub, name, color, isDefault: false }).returning();

        if (!category) {
            throw new Error('Failed to create category');
        }

        return reply.status(201).send(category);
    });

    app.patch(
        '/:id',
        {
            schema: {
                params: z.object({ id: z.uuid() }),
                body: updateCategoryInputSchema,
                response: { 200: categorySchema, 404: errorResponseSchema },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            const [category] = await db
                .update(categories)
                .set(request.body)
                .where(and(eq(categories.id, id), eq(categories.userId, request.user.sub)))
                .returning();

            if (!category) {
                return reply.status(404).send({ message: 'Category not found' });
            }

            return reply.send(category);
        },
    );

    app.delete(
        '/:id',
        {
            schema: {
                params: z.object({ id: z.string().uuid() }),
                response: {
                    200: errorResponseSchema,
                    404: errorResponseSchema,
                    409: errorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                const [deleted] = await db
                    .delete(categories)
                    .where(and(eq(categories.id, id), eq(categories.userId, request.user.sub)))
                    .returning();

                if (!deleted) {
                    return reply.status(404).send({ message: 'Category not found' });
                }

                return reply.send({ message: 'Category deleted' });
            } catch (err) {
                if (isForeignKeyViolation(err)) {
                    return reply.status(409).send({ message: 'Cannot delete a category that still has items' });
                }
                throw err;
            }
        },
    );
};
