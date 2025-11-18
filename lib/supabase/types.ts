/**
 * Database types generated from Supabase schema
 *
 * To regenerate after schema changes:
 * pnpm supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
 *
 * Or if using Supabase CLI with linked project:
 * pnpm supabase gen types typescript --linked > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'default' | 'custom';
          content_type: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: 'default' | 'custom';
          content_type?: string;
          display_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'default' | 'custom';
          content_type?: string;
          display_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'done';
          priority: 'low' | 'medium' | 'high' | null;
          url: string | null;
          location: string | null;
          note: string | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'done';
          priority?: 'low' | 'medium' | 'high' | null;
          url?: string | null;
          location?: string | null;
          note?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'done';
          priority?: 'low' | 'medium' | 'high' | null;
          url?: string | null;
          location?: string | null;
          note?: string | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'items_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      category_type: 'default' | 'custom';
      item_status: 'todo' | 'done';
      item_priority: 'low' | 'medium' | 'high';
    };
  };
}
