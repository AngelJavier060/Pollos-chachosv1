import { supabase } from './supabase';

export const registrarCambio = async (
  tipoOperacion: 'crear' | 'actualizar' | 'eliminar',
  usuarioId: number,
  detalles: any
) => {
  try {
    await supabase.from('historial_cambios').insert([{
      tipo_operacion: tipoOperacion,
      usuario_id: usuarioId,
      detalles: JSON.stringify(detalles),
      fecha: new Date().toISOString()
    }]);
  } catch (error) {
    console.error('Error al registrar cambio:', error);
  }
};
