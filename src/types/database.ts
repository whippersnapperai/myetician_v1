export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_first_name: string
          user_goal: string
          user_current_activity_level: string
          user_activity_factor_value: number
          user_gender: string
          user_dob: string
          user_age: number
          user_height: number
          user_height_unit: string
          user_current_weight: number
          user_current_weight_unit: string
          user_goal_weight: number
          user_goal_weight_unit: string
          user_caloric_goal_intensity_value: number
          user_calculated_bmr: number
          user_calculated_tdee: number
          user_caloric_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_first_name: string
          user_goal: string
          user_current_activity_level: string
          user_activity_factor_value: number
          user_gender: string
          user_dob: string
          user_age: number
          user_height: number
          user_height_unit: string
          user_current_weight: number
          user_current_weight_unit: string
          user_goal_weight: number
          user_goal_weight_unit: string
          user_caloric_goal_intensity_value: number
          user_calculated_bmr: number
          user_calculated_tdee: number
          user_caloric_goal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_first_name?: string
          user_goal?: string
          user_current_activity_level?: string
          user_activity_factor_value?: number
          user_gender?: string
          user_dob?: string
          user_age?: number
          user_height?: number
          user_height_unit?: string
          user_current_weight?: number
          user_current_weight_unit?: string
          user_goal_weight?: number
          user_goal_weight_unit?: string
          user_caloric_goal_intensity_value?: number
          user_calculated_bmr?: number
          user_calculated_tdee?: number
          user_caloric_goal?: number
          created_at?: string
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          name: string
          calories: number
          protein: number
          carbohydrates: number
          fat: number
          meal_type: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          calories: number
          protein: number
          carbohydrates: number
          fat: number
          meal_type?: string | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          calories?: number
          protein?: number
          carbohydrates?: number
          fat?: number
          meal_type?: string | null
          date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}