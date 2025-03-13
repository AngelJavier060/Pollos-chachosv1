'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { toast } from "@/app/components/ui/use-toast";

export default function UsersView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      // Primero verificar la sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Usar la API de administración de auth
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      console.log('Usuarios obtenidos:', users);
      setUsers(users || []);
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      await fetchUsers(); // Recargar usuarios después de crear uno nuevo
      return data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: any) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchUsers(); // Recargar usuarios después de actualizar
      return data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchUsers(); // Recargar usuarios después de eliminar
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ...resto del código existente...
}