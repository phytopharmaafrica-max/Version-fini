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
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string;
          description: string;
          price: number;
          currency: string;
          image_url: string;
          badge: string | null;
          rating: number;
          category_id: string;
          stock: number;
          active: boolean;
          featured: boolean;
          benefits: string[];
          ingredients: string[];
          usage_instructions: string;
          contraindications: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_phone?: string;
          customer_email?: string;
          customer_address?: string;
          total: number;
          currency: string;
          items: Json;
          status: string;
          payment_method?: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          active: boolean;
          uses_count: number;
          min_order_amount: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]>;
      };
      user_roles: {
        Row: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Insert: { user_id: string; role: string };
        Update: { role?: string };
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          rate: number;
          balance: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["affiliates"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["affiliates"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
    };
  };
}
