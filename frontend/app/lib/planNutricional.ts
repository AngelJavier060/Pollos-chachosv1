import { supabase } from './supabase';
import { PlanNutricional } from '../types/planNutricional';

export const planNutricionalAPI = {
  async getPlanesNutricionales() {
    const { data, error } = await supabase
      .from('plan_nutricional')
      .select(`
        id,
        tipo_animal,
        etapa,
        edad_inicio,
        edad_fin,
        producto_id,
        consumo_diario,
        temperatura,
        productos (id, nombre)
      `)
      .order('edad_inicio');

    console.log('Planes encontrados:', data);
    if (error) throw error;
    return data || [];
  },

  async getProductosPorTipoAnimal(tipoAnimal: 'pollos' | 'chanchos') {
    try {
      console.log('Consultando productos para tipo animal:', tipoAnimal);
      
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          tipo,
          tipo_animal
        `)
        .eq('tipo_animal', tipoAnimal) // Filtrar por tipo de animal
        .eq('tipo', 'alimento')        // Solo productos tipo alimento
        .eq('activo', true)            // Solo productos activos
        .order('nombre');

      if (error) {
        console.error('Error al obtener productos:', error);
        throw error;
      }

      // Verificar los datos filtrados
      console.log(`Productos encontrados para ${tipoAnimal}:`, data);

      // Validar que solo vengan productos del tipo animal correcto
      const productosFiltrados = data?.filter(producto => 
        producto.tipo_animal === tipoAnimal && 
        producto.tipo === 'alimento'
      ) || [];

      console.log('Productos filtrados final:', productosFiltrados);
      return productosFiltrados;
    } catch (error) {
      console.error('Error en getProductosPorTipoAnimal:', error);
      throw error;
    }
  },

  async getEtapasPorTipoAnimal(tipoAnimal: 'pollos' | 'chanchos') {
    try {
      // Obtener etapas existentes para el tipo de animal
      const { data, error } = await supabase
        .from('productos')
        .select('detalle as etapa')
        .eq('tipo_animal', tipoAnimal)
        .eq('tipo', 'alimento')
        .not('detalle', 'is', null);

      if (error) throw error;

      // Eliminar duplicados y null/undefined
      const etapas = [...new Set(data?.map(p => p.etapa).filter(Boolean))];
      console.log(`Etapas para ${tipoAnimal}:`, etapas);
      
      return etapas;
    } catch (error) {
      console.error('Error al obtener etapas:', error);
      throw error;
    }
  },

  async getProductoPorEtapa(tipoAnimal: 'pollos' | 'chanchos', etapa: string) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, detalle')
        .eq('tipo_animal', tipoAnimal)
        .eq('tipo', 'alimento')
        .eq('detalle', etapa)
        .single();

      if (error) {
        console.error('Error al obtener producto por etapa:', error);
        throw error;
      }

      console.log(`Producto encontrado para ${tipoAnimal} en etapa ${etapa}:`, data);
      return data;
    } catch (error) {
      console.error('Error en getProductoPorEtapa:', error);
      throw error;
    }
  },

  async crearPlanNutricional(plan: Omit<PlanNutricional, 'id'>) {
    try {
      // Verificar que el producto existe y corresponde al tipo de animal
      const { data: producto } = await supabase
        .from('productos')
        .select('id')
        .eq('id', plan.producto_id)
        .eq('tipo_animal', plan.tipo_animal)
        .eq('tipo', 'alimento')
        .single();

      if (!producto) {
        throw new Error('Producto no válido para este tipo de animal');
      }

      // Validaciones estrictas
      const producto_id = parseInt(String(plan.producto_id));
      if (!producto_id || isNaN(producto_id)) {
        throw new Error('producto_id es requerido y debe ser un número válido');
      }

      // Construir objeto con valores validados
      const nuevoPlan = {
        tipo_animal: plan.tipo_animal,
        etapa: plan.etapa.trim(),
        edad_inicio: parseInt(String(plan.edad_inicio)),
        edad_fin: parseInt(String(plan.edad_fin)),
        producto_id: producto_id,
        consumo_diario: parseFloat(String(plan.consumo_diario)),
        temperatura: parseFloat(String(plan.temperatura))
      };

      // Verificar que no haya valores null o undefined
      if (Object.values(nuevoPlan).some(val => val === null || val === undefined)) {
        throw new Error('Todos los campos son requeridos');
      }

      console.log('Insertando plan:', nuevoPlan);

      const { data, error } = await supabase
        .from('plan_nutricional')
        .insert([nuevoPlan])
        .select()
        .single();

      if (error) {
        console.error('Error de inserción:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error completo:', error);
      throw error;
    }
  },

  async eliminarPlanNutricional(id: number) {
    try {
      const { error } = await supabase
        .from('plan_nutricional')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error en eliminarPlanNutricional:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
};
