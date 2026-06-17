export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      coupon_usage: {
        Row: {
          coupon_id: string;
          created_at: string;
          discount_amount: number;
          id: string;
          order_id: string;
          user_id: string;
        };
        Insert: {
          coupon_id: string;
          created_at?: string;
          discount_amount: number;
          id?: string;
          order_id: string;
          user_id: string;
        };
        Update: {
          coupon_id?: string;
          created_at?: string;
          discount_amount?: number;
          id?: string;
          order_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          active: boolean;
          code: string;
          created_at: string;
          discount_type: Database["public"]["Enums"]["discount_type"];
          discount_value: number;
          expires_at: string | null;
          id: string;
          max_uses: number | null;
          updated_at: string;
          used_count: number;
        };
        Insert: {
          active?: boolean;
          code: string;
          created_at?: string;
          discount_type: Database["public"]["Enums"]["discount_type"];
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          max_uses?: number | null;
          updated_at?: string;
          used_count?: number;
        };
        Update: {
          active?: boolean;
          code?: string;
          created_at?: string;
          discount_type?: Database["public"]["Enums"]["discount_type"];
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          max_uses?: number | null;
          updated_at?: string;
          used_count?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number;
          order_id: string;
          product_name: string;
          product_sku: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total: number;
          order_id: string;
          product_name: string;
          product_sku: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number;
          order_id?: string;
          product_name?: string;
          product_sku?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          coupon_code: string | null;
          coupon_id: string | null;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          discount: number;
          id: string;
          notes: string | null;
          order_number: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: Database["public"]["Enums"]["payment_status"];
          shipping: number;
          shipping_address: Json;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          coupon_code?: string | null;
          coupon_id?: string | null;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          shipping?: number;
          shipping_address: Json;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          coupon_code?: string | null;
          coupon_id?: string | null;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          shipping?: number;
          shipping_address?: Json;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
        ];
      };
      popup_settings: {
        Row: {
          config: Json;
          id: string;
          updated_at: string;
        };
        Insert: {
          config?: Json;
          id?: string;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_addresses: {
        Row: {
          city: string;
          country: string;
          created_at: string;
          full_name: string;
          id: string;
          is_default: boolean;
          line1: string;
          line2: string | null;
          phone: string;
          pincode: string;
          state: string;
          user_id: string;
        };
        Insert: {
          city: string;
          country?: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_default?: boolean;
          line1: string;
          line2?: string | null;
          phone: string;
          pincode: string;
          state: string;
          user_id: string;
        };
        Update: {
          city?: string;
          country?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_default?: boolean;
          line1?: string;
          line2?: string | null;
          phone?: string;
          pincode?: string;
          state?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      discount_type: "percentage" | "flat";
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
      payment_method: "cod" | "online";
      payment_status: "pending" | "paid" | "failed" | "refunded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      discount_type: ["percentage", "flat"],
      order_status: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      payment_method: ["cod", "online"],
      payment_status: ["pending", "paid", "failed", "refunded"],
    },
  },
} as const;
