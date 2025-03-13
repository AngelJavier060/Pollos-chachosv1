import { Producto, MovimientoInventario } from '../admin/types/inventario'
import { supabase } from './supabase'

export const api = {
  async get(url: string) {
    try {
      if (url.includes('/api/inventario/productos')) {
        console.log('Intentando obtener productos...')
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error de Supabase:', error)
          throw error
        }
        console.log('Productos obtenidos:', data)
        return { success: true, data: data || [] }
      }

      if (url.includes('/api/inventario/movimientos')) {
        const { data, error } = await supabase
          .from('movimientos_inventario')
          .select(`
            *,
            productos (
              id,
              nombre
            )
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data }
      }

      return { success: false, error: 'Endpoint no encontrado' }
    } catch (error: any) {
      console.error('Error detallado:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return { success: false, error: error.message }
    }
  },

  async post(url: string, data: Partial<Producto>) {
    try {
      if (url.includes('/api/inventario/productos')) {
        // Asegurarse de que tipo_animal sea válido
        if (!['pollos', 'chanchos'].includes(data.tipo_animal as string)) {
          throw new Error('Tipo de animal no válido');
        }
        
        // Adaptar los datos al esquema de la tabla
        const productoData = {
          nombre: data.nombre,
          detalle: data.detalle || null,
          tipo: data.tipo,
          tipo_animal: data.tipo_animal, // Usar el valor normalizado
          cantidad: Number(data.cantidad),
          unidad_medida: data.unidad_medida,
          precio_unitario: Number(data.precio_unitario),
          proveedor: data.proveedor,
          numero_factura: data.numero_factura,
          fecha_compra: data.fecha_compra,
          nivel_minimo: Number(data.nivel_minimo),
          nivel_critico: Number(data.nivel_critico),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: newProduct, error } = await supabase
          .from('productos')
          .insert([productoData])
          .select()
          .single()
        
        if (error) {
          console.error('Error Supabase:', error)
          throw error
        }

        return { success: true, data: newProduct }
      }

      return { success: false, error: 'Endpoint no encontrado' }
    } catch (error: any) {
      console.error('Error en POST:', error.message)
      return { success: false, error: error.message }
    }
  },

  async put(url: string, id: number, data: Partial<Producto>) {
    try {
      if (url.includes('/api/inventario/productos')) {
        // Remover campos que no existen en la base de datos
        const {
          forma_alimento,
          estado,
          ...updateData
        } = {
          ...data,
          cantidad: data.cantidad ? Number(data.cantidad) : undefined,
          precio_unitario: data.precio_unitario ? Number(data.precio_unitario) : undefined,
          nivel_minimo: data.nivel_minimo ? Number(data.nivel_minimo) : undefined,
          nivel_critico: data.nivel_critico ? Number(data.nivel_critico) : undefined,
          updated_at: new Date().toISOString()
        };

        const { data: updatedProduct, error } = await supabase
          .from('productos')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          console.error('Error Supabase:', error)
          throw error
        }
        return { success: true, data: updatedProduct }
      }
      return { success: false, error: 'Endpoint no encontrado' }
    } catch (error: any) {
      console.error('Error en PUT:', error.message)
      return { success: false, error: error.message }
    }
  },

  async delete(url: string, id: number) {
    try {
      if (url.includes('/api/inventario/productos')) {
        const { error } = await supabase
          .from('productos')
          .delete()
          .eq('id', id)
        
        if (error) {
          console.error('Error Supabase:', error)
          throw error
        }
        return { success: true }
      }
      return { success: false, error: 'Endpoint no encontrado' }
    } catch (error: any) {
      console.error('Error en DELETE:', error.message)
      return { success: false, error: error.message }
    }
  }
}
