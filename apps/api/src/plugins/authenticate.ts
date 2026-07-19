import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { sub: string };
        user: { sub: string };
    }
}

export default fp(async (app: FastifyInstance) => {
    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch {
            reply.status(401).send({ message: 'Unauthorized' });
        }
    });
});
