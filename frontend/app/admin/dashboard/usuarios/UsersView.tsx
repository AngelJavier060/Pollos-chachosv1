import { supabase } from '@/app/lib/supabase';

const fetchUsers = async () => {
  try {
    console.log('Iniciando fetchUsers...');
    console.log('URL de Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id', { ascending: true });

    console.log('Respuesta de Supabase:', { data, error });

    if (error) {
      throw error;
    }

    if (data) {
      console.log('Usuarios encontrados:', data.length);
      setUsers(data);
    } else {
      console.log('No se encontraron usuarios');
    }

  } catch (error) {
    console.error('Error detallado:', error);
    toast({
      title: "Error",
      description: "No se pudieron cargar los usuarios",
      variant: "destructive",
    });
  }
};

// Crear usuario
const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar usuario
const updateUser = async (id, userData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
const deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};