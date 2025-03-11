import { supabase } from './supabase';
import { PlanNutricional } from '../types/planNutricional';

export const planNutricionalAPI = {
  async getPlanesNutricionales() {
    try {
      const { data, error } = await supabase
        .from('plan_nutricional')
        .select(`
          *,
          producto_nombre:productos(nombre)
        `)
        .order('edad_inicio', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener planes:', error);
      throw error;
    }
  },

  async crearPlanNutricional(plan: Omit<PlanNutricional, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('plan_nutricional')
        .insert([{
          ...plan,
          dosis_ml: plan.dosis_ml || null,
          dias_aplicaci: plan.dias_aplicaci || null,
          via_administr: plan.via_administr || null,
          observaciones: plan.observaciones || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear plan:', error);
      throw error;
    }
  },

  async actualizarPlanNutricional(id: number, plan: Partial<PlanNutricional>) {
    try {
      const { data, error } = await supabase
        .from('plan_nutricional')
        .update(plan)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar plan:', error);
      throw error;
    }
  },

  async eliminarPlanNutricional(id: number) {
    try {
      const { error } = await supabase
        .from('plan_nutricional')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar plan:', error);
      throw error;
    }
  },

  async getPlanPorEtapa(tipoAnimal: string, etapa: string) {
    try {
      const { data, error } = await supabase
        .from('plan_nutricional')
        .select(`
          *,
          producto_nombre:productos(nombre)
        `)
        .eq('tipo_animal', tipoAnimal)
        .eq('etapa', etapa)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener plan por etapa:', error);
      throw error;
    }
  }
};
