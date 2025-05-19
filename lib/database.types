export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          stock: number
          initial_stock: number
          image: string
          is_limited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          category: string
          price: number
          stock: number
          initial_stock: number
          image: string
          is_limited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: number
          initial_stock?: number
          image?: string
          is_limited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bake_sale_periods: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          contact_number: string
          is_pickup: boolean
          delivery_address: string | null
          delivery_time: string | null
          total_items: number
          subtotal: number
          discount: number
          total: number
          created_at: string
          status: string
          is_paid: boolean
          payment_method: string | null
          reference_number: string | null
          bake_sale_period_id: string | null
          source_image: string | null
        }
        Insert: {
          id: string
          customer_name: string
          contact_number: string
          is_pickup: boolean
          delivery_address?: string | null
          delivery_time?: string | null
          total_items: number
          subtotal: number
          discount: number
          total: number
          created_at?: string
          status: string
          is_paid?: boolean
          payment_method?: string | null
          reference_number?: string | null
          bake_sale_period_id?: string | null
          source_image?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          contact_number?: string
          is_pickup?: boolean
          delivery_address?: string | null
          delivery_time?: string | null
          total_items?: number
          subtotal?: number
          discount?: number
          total?: number
          created_at?: string
          status?: string
          is_paid?: boolean
          payment_method?: string | null
          reference_number?: string | null
          bake_sale_period_id?: string | null
          source_image?: string | null
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_id: string
          quantity: number
          price: number
          total: number
        }
        Insert: {
          id?: number
          order_id: string
          product_id: string
          quantity: number
          price: number
          total: number
        }
        Update: {
          id?: number
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          total?: number
        }
      }
    }
  }
}
