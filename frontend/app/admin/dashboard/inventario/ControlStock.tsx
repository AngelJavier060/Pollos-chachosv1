'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { AlertCircle, Package2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  minimo: number;
  critico: number;
  tipo: 'alimento' | 'medicina' | 'otro';
  estado: 'active' | 'low_stock' | 'critical' | 'cycle_ended';
  ciclo_actual?: {
    id: string;
    fecha_inicio: string;
    fecha_fin?: string;
  };
}

export default function ControlStock() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [alertas, setAlertas] = useState<{
    producto_id: string;
    tipo: 'bajo_stock' | 'critico';
    mensaje: string;
    fecha: string;
  }[]>([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  // Verificar niveles de stock y generar alertas automáticamente
  useEffect(() => {
    const nuevasAlertas = [];
    const productosActualizados = productos.map(producto => {
      let nuevoEstado = producto.estado;
      let registrarHistorial = false;

      // Verificar nivel crítico
      if (producto.cantidad <= producto.critico && producto.estado !== 'cycle_ended') {
        nuevoEstado = 'critical';
        nuevasAlertas.push({
          producto_id: producto.id,
          tipo: 'critico',
          mensaje: `¡CRÍTICO! ${producto.nombre} ha alcanzado el nivel crítico (${producto.cantidad} unidades)`,
          fecha: new Date().toISOString()
        });
        registrarHistorial = true;
      }
      // Verificar nivel mínimo
      else if (producto.cantidad <= producto.minimo && producto.estado === 'active') {
        nuevoEstado = 'low_stock';
        nuevasAlertas.push({
          producto_id: producto.id,
          tipo: 'bajo_stock',
          mensaje: `${producto.nombre} está por debajo del nivel mínimo (${producto.cantidad} unidades)`,
          fecha: new Date().toISOString()
        });
        registrarHistorial = true;
      }

      // Si el estado cambió, actualizar el producto
      if (nuevoEstado !== producto.estado) {
        // Registrar en el historial
        if (registrarHistorial) {
          const historialEntry = {
            id: Date.now().toString(),
            productId: producto.id,
            productName: producto.nombre,
            action: nuevoEstado === 'critical' ? 'cierre_ciclo' : 'alerta_stock',
            quantity: producto.cantidad,
            previousStock: producto.cantidad,
            newStock: producto.cantidad,
            date: new Date().toISOString(),
            reason: nuevoEstado === 'critical' ? 'Cierre automático por nivel crítico' : 'Nivel bajo de stock',
            userId: '1',
            userName: 'Sistema'
          };

          const historial = JSON.parse(localStorage.getItem('inventario_historial') || '[]');
          localStorage.setItem('inventario_historial', JSON.stringify([...historial, historialEntry]));
        }

        return {
          ...producto,
          estado: nuevoEstado,
          ciclo_actual: nuevoEstado === 'critical' ? {
            ...producto.ciclo_actual,
            fecha_fin: new Date().toISOString()
          } : producto.ciclo_actual
        };
      }

      return producto;
    });

    setAlertas(nuevasAlertas);
    if (JSON.stringify(productosActualizados) !== JSON.stringify(productos)) {
      setProductos(productosActualizados);
      localStorage.setItem('productos', JSON.stringify(productosActualizados));
    }
  }, [productos]);

  const fetchProductos = () => {
    const storedProducts = localStorage.getItem('productos');
    if (storedProducts) {
      setProductos(JSON.parse(storedProducts));
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

  return (
    <div className="space-y-6">
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
};