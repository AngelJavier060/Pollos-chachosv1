import { supabase } from './supabase'

export const authService = {
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error('Error en login:', error)
      return { data: null, error }
    }
  },

  async logout() {
    return await supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { user: session?.user || null, error }
  }
}
