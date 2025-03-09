import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjrtsgsbdkflnbvlsrtd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcnRzZ3NiZGtmbG5idmxzcnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0Njg3NTIsImV4cCI6MjA1NzA0NDc1Mn0.sZ-WOWPQWL92yJyegFn94SdrYvwCwiEXps4-HAQvw1w'

const supabase = createClient(supabaseUrl, supabaseKey)

export const authService = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }
}
