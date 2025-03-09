export type TipoProducto = 'alimento' | 'medicina';
export type TipoAnimal = 'pollos' | 'chanchos';
export type EstadoProducto = 'active' | 'low_stock' | 'critical' | 'cycle_ended';

export interface Producto {
  id: number;
  nombre: string;
  detalle?: string;
  tipo: TipoProducto;
  tipo_animal: TipoAnimal;
  forma_alimento?: string;
  cantidad: number;
  unidad_medida: string;
  precio_unitario: number;
  proveedor: string;
  numero_factura: string;
  fecha_compra: string;
  nivel_minimo: number;
  nivel_critico: number;
  estado?: EstadoProducto;
}

export interface MovimientoInventario {
  id: number;
  producto_id: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'cierre_ciclo' | 'inicio_ciclo';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  fecha: string;
  motivo: string;
  usuario_id: number;
}
