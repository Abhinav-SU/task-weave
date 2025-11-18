import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema-simple';
import { eq } from 'drizzle-orm';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });

      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      // Hash password
      const password = await bcrypt.hash(body.password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: body.email,
          password,
          name: body.name,
        })
        .returning();

      // Generate token
      const token = fastify.jwt.sign(
        { userId: newUser.id, email: newUser.email },
        { expiresIn: '7d' }
      );

      return reply.code(201).send({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });

      if (!user || !user.password) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(body.password, user.password);

      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '7d' }
      );

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Refresh token (placeholder - client-side token management for now)
  fastify.post('/refresh', async (request, reply) => {
    return reply.code(501).send({ error: 'Refresh tokens not implemented yet. Use long-lived tokens for now.' });
  });

  // Logout (placeholder - client-side token management for now)
  fastify.post('/logout', async (request, reply) => {
    return reply.send({ message: 'Logged out successfully. Clear token on client side.' });
  });

  // Get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default authRoutes;

