# Data Model: FutureList

**Date**: 2025-11-06
**Feature**: 001-future-list-app
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the database schema, entities, relationships, and validation rules for FutureList. The data model is implemented in PostgreSQL via Supabase with Row-Level Security (RLS) for user data isolation.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│ users           │ (Supabase Auth - managed)
│─────────────────│
│ id (uuid) PK    │
│ email (text)    │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ├───────────────────┐
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌──────────────────┐
│ categories      │  │ items            │
│─────────────────│  │──────────────────│
│ id (uuid) PK    │  │ id (uuid) PK     │
│ user_id FK      │  │ user_id FK       │
│ name (text)     │  │ category_id FK   │
│ type (enum)     │  │ title (text)     │
│ created_at      │  │ description      │
│ updated_at      │  │ status (enum)    │
└────────┬────────┘  │ priority (enum)  │
         │           │ url (text)       │
         │ 1:N       │ location (text)  │
         └───────────► note (text)      │
                     │ target_date      │
                     │ created_at       │
                     │ updated_at       │
                     └──────────────────┘
```

---

## Table: users (Supabase Auth)

**Description**: User accounts managed by Supabase Auth. This table is automatically created and managed by Supabase.

**Schema**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | User unique identifier (auto-generated) |
| email | text | UNIQUE, NOT NULL | User email address |
| encrypted_password | text | NOT NULL | Hashed password (bcrypt) |
| email_confirmed_at | timestamptz | | Email verification timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Account creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Notes**:
- Managed by Supabase Auth - do not create manually
- Password validation: minimum 6 characters (per clarification)
- Supabase handles password hashing, session management, and email verification

**Access Control**:
- All users can create accounts (signup)
- Users can only access their own profile data
- No public access to user table

---

## Table: categories

**Description**: User-defined categories for organizing items. Includes 4 default categories (Movies, Restaurants, Trips, Books) plus user custom categories.

**Schema**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Category unique identifier |
| user_id | uuid | FOREIGN KEY (auth.users.id), NOT NULL | Owner of category (null for default categories) |
| name | text | NOT NULL, CHECK (length(name) BETWEEN 1 AND 50) | Category name (1-50 characters) |
| type | category_type | NOT NULL, DEFAULT 'custom' | Category type: 'default' or 'custom' |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Enums**:

```sql
CREATE TYPE category_type AS ENUM ('default', 'custom');
```

**Indexes**:

```sql
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE UNIQUE INDEX idx_categories_name_user ON categories(user_id, LOWER(name)); -- Case-insensitive unique constraint per user
```

**Constraints**:

- **Unique category names per user** (case-insensitive): A user cannot have two categories with the same name
- **Name length**: 1-50 characters
- **Default categories**: Created during user signup (Movies, Restaurants, Trips, Books) with `type = 'default'` and `user_id` set to the user

**Validation Rules** (from spec):

- **FR-010**: Users can create custom categories with unique name (1-50 characters)
- **FR-011**: Cannot delete categories that contain items
- **FR-012**: Can delete empty custom categories
- **FR-013**: Case-insensitive checks to prevent duplicate category names

**Default Data**:

Default categories are created for each user on signup:

```sql
-- Trigger to create default categories on user signup
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, type) VALUES
    (NEW.id, 'Movies', 'default'),
    (NEW.id, 'Restaurants', 'default'),
    (NEW.id, 'Trips', 'default'),
    (NEW.id, 'Books', 'default');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
```

**State Transitions**:

1. **Created** (custom): User creates new category
2. **In Use**: Category has items assigned to it
3. **Empty**: All items removed from category
4. **Deleted** (custom only): User deletes empty custom category

---

## Table: items

**Description**: User's wishlist items (movies, restaurants, trips, etc.) with optional enrichment fields.

**Schema**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Item unique identifier |
| user_id | uuid | FOREIGN KEY (auth.users.id), NOT NULL | Owner of item |
| category_id | uuid | FOREIGN KEY (categories.id), NOT NULL | Category reference |
| title | text | NOT NULL, CHECK (length(title) BETWEEN 1 AND 200) | Item title (1-200 characters) |
| description | text | CHECK (length(description) <= 1000) | Optional description (0-1000 characters) |
| status | item_status | NOT NULL, DEFAULT 'todo' | Item status: 'todo' or 'done' |
| priority | item_priority | DEFAULT 'medium' | Optional priority: 'high', 'medium', 'low' |
| url | text | | Optional URL (e.g., menu link, movie trailer) |
| location | text | | Optional location (e.g., restaurant address) |
| note | text | | Optional personal note |
| target_date | date | | Optional target completion date |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Enums**:

```sql
CREATE TYPE item_status AS ENUM ('todo', 'done');
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');
```

**Indexes**:

```sql
-- Primary queries
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);

-- Composite index for combined filters (user + category + status)
CREATE INDEX idx_items_combined ON items(user_id, category_id, status);

-- Sorting (newest first by default)
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Full-text search (case-insensitive, partial matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_items_title_trgm ON items USING gin(title gin_trgm_ops);
CREATE INDEX idx_items_description_trgm ON items USING gin(description gin_trgm_ops);
```

**Constraints**:

- **Title required**: 1-200 characters
- **Category required**: Must reference existing category
- **Description optional**: 0-1000 characters if provided
- **Status default**: 'todo' (can toggle to 'done')
- **Priority default**: 'medium' if set (High/Medium/Low per clarification)

**Validation Rules** (from spec):

- **FR-001**: Title (1-200 chars) and category required
- **FR-002**: Optional fields: description (0-1000 chars), URL, location, note, priority, target_date
- **FR-003**: Validate title and category before saving
- **FR-004**: Display sorted by created_at DESC (newest first) by default
- **FR-007**: Toggle status between 'todo' and 'done' with single action
- **FR-008**: Visually distinguish 'done' items from 'todo' items

**State Transitions**:

```
┌──────┐ mark done  ┌──────┐
│ todo │───────────►│ done │
└──────┘◄───────────└──────┘
         undo
```

1. **Created**: Item starts as 'todo' status
2. **Todo ⇆ Done**: User can toggle status bidirectionally
3. **Edited**: Any field can be updated while in either status
4. **Deleted**: User can delete item (with confirmation)

**Search & Filter Behavior** (from clarifications):

- **Case-insensitive**: Searching "sushi" matches "Sushi", "SUSHI", "sushirestaurant"
- **Partial matching**: Searching "sush" matches "Sushi Restaurant"
- **Combinable filters**: Category + status + search can all be active simultaneously
- **Search fields**: Title and description

---

## Database Triggers

### Auto-update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Row-Level Security (RLS) Policies

### Categories Table

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom categories
CREATE POLICY "Users can update own custom categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND type = 'custom')
  WITH CHECK (auth.uid() = user_id AND type = 'custom');

-- Users can delete their own empty custom categories
CREATE POLICY "Users can delete own empty custom categories"
  ON categories FOR DELETE
  USING (
    auth.uid() = user_id
    AND type = 'custom'
    AND NOT EXISTS (SELECT 1 FROM items WHERE items.category_id = categories.id)
  );
```

### Items Table

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Users can view their own items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own items
CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

---

## TypeScript Types (Generated)

Supabase CLI generates TypeScript types from database schema:

```typescript
// lib/supabase/types.ts (generated by `supabase gen types typescript`)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'default' | 'custom'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: 'default' | 'custom'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'default' | 'custom'
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string | null
          status: 'todo' | 'done'
          priority: 'low' | 'medium' | 'high' | null
          url: string | null
          location: string | null
          note: string | null
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'done'
          priority?: 'low' | 'medium' | 'high' | null
          url?: string | null
          location?: string | null
          note?: string | null
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'done'
          priority?: 'low' | 'medium' | 'high' | null
          url?: string | null
          location?: string | null
          note?: string | null
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

---

## Domain Types (Application Layer)

```typescript
// features/todos/types.ts

export type ItemStatus = 'todo' | 'done';
export type ItemPriority = 'low' | 'medium' | 'high';
export type CategoryType = 'default' | 'custom';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority?: ItemPriority;
  url?: string;
  location?: string;
  note?: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemWithCategory extends Item {
  category: Category;
}

export interface FilterState {
  search: string;
  categoryId: string | null;
  status: ItemStatus | null;
}
```

---

## Data Migration Strategy

### Initial Schema Setup

1. Run `contracts/supabase.sql` to create tables, enums, indexes, triggers, and RLS policies
2. Generate TypeScript types: `supabase gen types typescript --local > lib/supabase/types.ts`
3. Seed default categories for existing users (if any)

### Future Migrations

For schema changes (e.g., adding fields, changing constraints):

1. Create migration file in Supabase dashboard or via CLI
2. Test migration locally with `supabase db reset`
3. Apply to production via Supabase dashboard
4. Regenerate TypeScript types
5. Update application code to handle new schema

**Note**: No automated migration tooling per constitution - migrations are manual and reviewed before applying to production.

---

## Performance Considerations

### Indexing Strategy

- **Primary indexes**: user_id, category_id, status for fast filtering
- **Composite index**: (user_id, category_id, status) for combined filters
- **Search indexes**: Trigram indexes for case-insensitive partial matching
- **Sort index**: created_at DESC for newest-first ordering

### Query Optimization

- **Limit results**: Pagination for large item lists (e.g., 50 items per page)
- **Select specific columns**: Don't fetch unused columns (especially large text fields)
- **Use RLS**: Database-level filtering is faster than application-level filtering

### Scalability

- **No hard limits**: Per clarification, users can create unlimited items and categories
- **Database handles scale**: Postgres with proper indexing can handle millions of rows
- **Monitor performance**: Use Supabase dashboard to identify slow queries

---

## Validation Summary

| Requirement | Implementation |
|-------------|----------------|
| FR-001: Title (1-200 chars) + category required | CHECK constraints + NOT NULL |
| FR-002: Optional fields with limits | nullable columns + CHECK constraints |
| FR-003: Validate before saving | Database constraints + client-side validation |
| FR-009: Default categories | Trigger creates 4 defaults on user signup |
| FR-010: Custom categories (1-50 chars, unique) | CHECK constraint + unique index |
| FR-011: Prevent deletion of categories with items | RLS policy with EXISTS check |
| FR-013: Case-insensitive duplicate check | Unique index on LOWER(name) |
| FR-015: Case-insensitive partial search | Trigram indexes on title/description |
| Clarification: Priority values (High/Medium/Low) | item_priority enum |
| Clarification: No hard limits on items/categories | No row limits, rely on indexing |

---

## Next Steps

With data model complete, proceed to:

1. Generate `contracts/supabase.sql` with full table definitions
2. Generate `quickstart.md` with local development setup
3. Update agent context file with technology stack

