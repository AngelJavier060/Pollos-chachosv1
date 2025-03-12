'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { AlertCircle, Package2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  minimo: number;
  critico: number;
  tipo: 'alimento' | 'medicina' | 'otro';
  estado: 'active' | 'low_stock' | 'critical' | 'cycle_ended';
  unidad_medida: 'kg' | 'g' | 'l' | 'ml' | 'unidad';
  fecha_vencimiento?: string;
  lote?: string;
  proveedor?: string;
  ubicacion?: string;
  ultimo_movimiento?: string;
  ciclo_actual?: {
    fecha_inicio: string;
    fecha_fin?: string;
  };
}

interface Alerta {
  producto_id: string;
  tipo: "bajo_stock" | "critico";
  mensaje: string;
  fecha: string;
}

export default function ControlStock() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [alertas, setAlertas] = useState<{
    producto_id: string;
    tipo: 'bajo_stock' | 'critico';
    mensaje: string;
    fecha: string;
  }[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [ordenarPor, setOrdenarPor] = useState<string>('nombre');

  useEffect(() => {
    fetchProductosFromSupabase();
  }, []);

  const fetchProductosFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (data) {
        setProductos(data);
        verificarNiveles(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const verificarNiveles = (productos: Producto[]) => {
    const nuevasAlertas: Array<{
      producto_id: string;
      tipo: 'bajo_stock' | 'critico';
      mensaje: string;
      fecha: string;
    }> = productos
      .filter(producto => {
        if (producto.fecha_vencimiento) {
          const diasParaVencer = Math.ceil(
            (new Date(producto.fecha_vencimiento).getTime() - new Date().getTime()) / 
            (1000 * 3600 * 24)
          );
          if (diasParaVencer <= 30) return true;
        }
        return producto.cantidad <= producto.critico || 
               (producto.cantidad <= producto.minimo && producto.estado === 'active');
      })
      .map(producto => ({
        producto_id: producto.id,
        tipo: producto.cantidad <= producto.critico ? 'critico' as const : 'bajo_stock' as const,
        mensaje: generarMensajeAlerta(producto),
        fecha: new Date().toISOString()
      }));

    setAlertas(nuevasAlertas);
  };

  const generarMensajeAlerta = (producto: Producto) => {
    let mensaje = '';
    
    if (producto.cantidad <= producto.critico) {
      mensaje = `¡CRÍTICO! ${producto.nombre} tiene ${producto.cantidad} ${producto.unidad_medida} (Nivel crítico: ${producto.critico})`;
    } else if (producto.cantidad <= producto.minimo) {
      mensaje = `Stock bajo de ${producto.nombre}: ${producto.cantidad} ${producto.unidad_medida} (Mínimo: ${producto.minimo})`;
    }

    if (producto.fecha_vencimiento) {
      const diasParaVencer = Math.ceil(
        (new Date(producto.fecha_vencimiento).getTime() - new Date().getTime()) / 
        (1000 * 3600 * 24)
      );
      if (diasParaVencer <= 30) {
        mensaje += ` | Vence en ${diasParaVencer} días`;
      }
    }

    return mensaje;
  };

  const actualizarStock = async (productoId: string, cantidad: number, tipo: 'entrada' | 'salida') => {
    try {
      const producto = productos.find(p => p.id === productoId);
      if (!producto) return;

      const nuevaCantidad = tipo === 'entrada' ? 
        producto.cantidad + cantidad : 
        producto.cantidad - cantidad;

      const { error } = await supabase
        .from('productos')
        .update({ 
          cantidad: nuevaCantidad,
          ultimo_movimiento: new Date().toISOString()
        })
        .eq('id', productoId);

      if (error) throw error;

      // Registrar movimiento en historial
      await supabase.from('movimientos_inventario').insert({
        producto_id: productoId,
        tipo_movimiento: tipo,
        cantidad: cantidad,
        fecha: new Date().toISOString(),
        usuario_id: '1' // Reemplazar con el ID del usuario actual
      });

      // Actualizar estado local
      fetchProductosFromSupabase();
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    }
  };

  const calcularPorcentajeStock = (cantidad: number, minimo: number) => {
    return Math.min((cantidad / minimo) * 100, 100);
  };

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje <= 25) return "bg-red-500";
    if (porcentaje <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getEstadoLabel = (estado: string) => {
    const labels = {
      'active': 'Activo',
      'low_stock': 'Stock Bajo',
      'critical': 'Crítico',
      'cycle_ended': 'Ciclo Finalizado'
    };
    return labels[estado as keyof typeof labels] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      'active': 'text-green-600',
      'low_stock': 'text-yellow-600',
      'critical': 'text-red-600',
      'cycle_ended': 'text-gray-600'
    };
    return colors[estado as keyof typeof colors] || 'text-gray-600';
  };

  const verificarStock = () => {
    const nuevasAlertas = productos.flatMap((producto): Alerta[] => {
      const alertas: Alerta[] = [];
      
      if (producto.cantidad <= producto.critico) { // Cambiar nivel_critico por critico
        alertas.push({
          producto_id: producto.id,
          tipo: "critico" as const,
          mensaje: `Stock crítico: ${producto.cantidad} ${producto.unidad_medida}`,
          fecha: new Date().toISOString()
        });
      } else if (producto.cantidad <= producto.minimo) { // Cambiar nivel_minimo por minimo
        alertas.push({
          producto_id: producto.id,
          tipo: "bajo_stock" as const,
          mensaje: `Stock bajo: ${producto.cantidad} ${producto.unidad_medida}`,
          fecha: new Date().toISOString()
        });
      }
      
      return alertas;
    });
  
    setAlertas(nuevasAlertas);
  };

  return (
    <div className="space-y-6">
      {/* Filtros y Ordenamiento */}
      <div className="flex gap-4 mb-4">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="alimento">Alimento</SelectItem>
            <SelectItem value="medicina">Medicina</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ordenarPor} onValueChange={setOrdenarPor}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="cantidad">Cantidad</SelectItem>
            <SelectItem value="vencimiento">Fecha de vencimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alertas de Stock */}
      {alertas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Alertas de Stock</h3>
          </div>
          <div className="grid gap-3">
            {alertas.map((alerta) => (
              <Alert
                key={`${alerta.producto_id}-${alerta.fecha}`}
                variant={alerta.tipo === 'critico' ? "destructive" : "warning"}
                className={alerta.tipo === 'critico' ? 
                  'border-red-200 bg-red-50 text-red-800' : 
                  'border-yellow-200 bg-yellow-50 text-yellow-800'
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  {alerta.tipo === 'critico' ? 'Nivel Crítico' : 'Stock Bajo'}
                </AlertTitle>
                <AlertDescription>{alerta.mensaje}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <Card key={producto.id} className="bg-white border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Package2 className={`h-4 w-4 ${getEstadoColor(producto.estado)}`} />
                <CardTitle className="text-sm font-medium">
                  {producto.nombre}
                </CardTitle>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                producto.estado === 'active' ? 'bg-green-50 text-green-700' :
                producto.estado === 'low_stock' ? 'bg-yellow-50 text-yellow-700' :
                producto.estado === 'critical' ? 'bg-red-50 text-red-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                {getEstadoLabel(producto.estado)}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-2">
                <div className="text-2xl font-bold">{producto.cantidad}</div>
                <div className="text-sm text-gray-500">unidades</div>
              </div>
              <Progress
                value={calcularPorcentajeStock(producto.cantidad, producto.minimo)}
                className={`h-2 ${getColorPorcentaje(calcularPorcentajeStock(producto.cantidad, producto.minimo))}`}
              />
              <div className="mt-3 flex justify-between text-sm text-gray-600">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Crítico</span>
                  <span className="font-medium">{producto.critico}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">Mínimo</span>
                  <span className="font-medium">{producto.minimo}</span>
                </div>
              </div>
              {producto.ciclo_actual && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    {producto.estado === 'cycle_ended' ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Ciclo finalizado: {new Date(producto.ciclo_actual.fecha_fin!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Ciclo iniciado: {new Date(producto.ciclo_actual.fecha_inicio).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}