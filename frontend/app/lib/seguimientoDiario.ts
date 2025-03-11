import { supabase } from './supabase';
import { SeguimientoDiario, ResumenSeguimiento } from '../types/seguimiento';

export const seguimientoDiarioAPI = {
  async crearSeguimiento(seguimiento: Omit<SeguimientoDiario, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('seguimiento_diario')
        .insert(seguimiento)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      throw error;
    }
  },

  async obtenerSeguimientoPorCiclo(cicloId: number) {
    try {
      const { data, error } = await supabase
        .from('seguimiento_diario')
        .select('*')
        .eq('ciclo_id', cicloId)
        .order('fecha', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener seguimiento:', error);
      throw error;
    }
  },

  async calcularResumen(cicloId: number): Promise<ResumenSeguimiento> {
    const seguimientos = await this.obtenerSeguimientoPorCiclo(cicloId);
    
    const consumo_total = seguimientos.reduce((sum, s) => sum + (s.consumo_alimento || 0), 0);
    const mortalidad_total = seguimientos.reduce((sum, s) => sum + (s.mortalidad || 0), 0);
    const ultimo_peso = seguimientos[seguimientos.length - 1]?.peso_promedio || 0;
    
    return {
      consumo_total,
      mortalidad_total,
      peso_promedio: ultimo_peso,
      conversion_alimenticia: consumo_total / ultimo_peso,
      dias_ciclo: seguimientos.length
    };
  }
};
