'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Producto } from '../../types/inventario';
import { toast } from "@/app/components/ui/use-toast";

interface ProductoFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Producto | null;
  onSubmit: (data: any) => Promise<void>;
}

const initialFormState = {
  nombre: '',
  detalle: '',
  tipo: 'alimento',
  tipo_animal: 'pollos',
  forma_alimento: 'Polvo',
  cantidad: '',
  unidad_medida: '',
  precio_unitario: '',
  proveedor: '',
  numero_factura: '',
  fecha_compra: new Date().toISOString().split('T')[0],
  nivel_minimo: '0',
  nivel_critico: '0'
};

export default function ProductoForm({
  isOpen,
  onClose,
  initialData,
  onSubmit
}: ProductoFormProps) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          detalle: initialData.detalle || '',
          tipo: initialData.tipo || 'alimento',
          tipo_animal: initialData.tipo_animal || 'pollos',
          forma_alimento: initialData.forma_alimento || 'Polvo',
          cantidad: initialData.cantidad?.toString() || '',
          unidad_medida: initialData.unidad_medida || '',
          precio_unitario: initialData.precio_unitario?.toString() || '',
          proveedor: initialData.proveedor || '',
          numero_factura: initialData.numero_factura || '',
          fecha_compra: initialData.fecha_compra || new Date().toISOString().split('T')[0],
          nivel_minimo: initialData.nivel_minimo?.toString() || '0',
          nivel_critico: initialData.nivel_critico?.toString() || '0'
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.tipo || !formData.tipo_animal) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = {
        ...formData,
        cantidad: parseFloat(formData.cantidad) || 0,
        precio_unitario: parseFloat(formData.precio_unitario) || 0,
        nivel_minimo: parseInt(formData.nivel_minimo) || 0,
        nivel_critico: parseInt(formData.nivel_critico) || 0,
        fecha_compra: formData.fecha_compra || new Date().toISOString().split('T')[0]
      };

      console.log('Enviando datos:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error en el formulario:', error);
      toast({
        title: "Error",
        description: "Error al procesar el formulario",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Producto</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detalle">Nombre de la etapa</Label>
              <Input
                id="detalle"
                value={formData.detalle}
                onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                placeholder="Ej: Iniciador, Crecimiento, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Producto</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimento">Alimento</SelectItem>
                  <SelectItem value="medicina">Medicina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_animal">Tipo de Animal</Label>
              <Select
                value={formData.tipo_animal}
                onValueChange={(value) => setFormData({ ...formData, tipo_animal: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollos">Pollos</SelectItem>
                  <SelectItem value="chanchos">Chanchos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo === 'alimento' && (
              <div className="space-y-2">
                <Label htmlFor="forma_alimento">Forma de alimento</Label>
                <Select
                  value={formData.forma_alimento}
                  onValueChange={(value) => setFormData({ ...formData, forma_alimento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Polvo">Polvo</SelectItem>
                    <SelectItem value="Granulado">Granulado</SelectItem>
                    <SelectItem value="Peletizado">Peletizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidad_medida">Unidad de Medida</Label>
              <Input
                id="unidad_medida"
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                placeholder="kg, g, l, ml, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_unitario">Precio Unitario ($)</Label>
              <Input
                id="precio_unitario"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_factura">Número de Factura</Label>
              <Input
                id="numero_factura"
                value={formData.numero_factura}
                onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                placeholder="Ej: FAC-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_compra">Fecha de Compra</Label>
              <Input
                id="fecha_compra"
                type="date"
                value={formData.fecha_compra}
                onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel_minimo">Nivel Mínimo</Label>
              <Input
                id="nivel_minimo"
                type="number"
                min="0"
                value={formData.nivel_minimo}
                onChange={(e) => setFormData({ ...formData, nivel_minimo: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel_critico">Nivel Crítico</Label>
              <Input
                id="nivel_critico"
                type="number"
                min="0"
                value={formData.nivel_critico}
                onChange={(e) => setFormData({ ...formData, nivel_critico: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}