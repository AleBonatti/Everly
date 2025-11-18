/**
 * Drizzle ORM Schema Definitions
 *
 * Defines the database schema for PostgreSQL using Drizzle ORM.
 * This schema mirrors the existing Supabase tables.
 */

import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Enums
export const categoryTypeEnum = pgEnum('category_type', ['default', 'custom'])
export const itemStatusEnum = pgEnum('item_status', ['todo', 'done'])
export const itemPriorityEnum = pgEnum('item_priority', ['low', 'medium', 'high'])
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  type: categoryTypeEnum('type').notNull().default('default'),
  contentType: text('content_type').notNull().default('generic'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Actions table
export const actions = pgTable('actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Items table
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  actionId: uuid('action_id').references(() => actions.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: itemStatusEnum('status').notNull().default('todo'),
  priority: itemPriorityEnum('priority'),
  url: text('url'),
  location: text('location'),
  note: text('note'),
  targetDate: text('target_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// User Roles table
export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').primaryKey(), // References auth.users in Supabase
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Types for TypeScript
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Action = typeof actions.$inferSelect
export type NewAction = typeof actions.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert
