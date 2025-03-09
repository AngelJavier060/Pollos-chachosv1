'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { api } from '@/app/lib/api';

interface LoteFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel: () => void;
}

const LoteForm = ({ onSubmit, initialData, onCancel }: LoteFormProps) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    tipo_animal: initialData?.tipo_animal || '',
    raza: initialData?.raza || '',
    cantidad: initialData?.cantidad?.toString() || '',
    fecha_nacimiento: initialData?.fecha_nacimiento || '',
    costo: initialData?.costo?.toString() || ''
  });

  useEffect(() => {
    if (initialData) {
      console.log('Cargando datos iniciales:', initialData);
      setFormData({
        nombre: initialData.nombre || '',
        tipo_animal: initialData.tipo_animal || '',
        raza: initialData.raza || '',
        cantidad: String(initialData.cantidad || ''),
        fecha_nacimiento: initialData.fecha_nacimiento || '',
        costo: String(initialData.costo || '')
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos requeridos estén llenos
    if (!formData.nombre || !formData.tipo_animal || !formData.raza || 
        !formData.cantidad || !formData.fecha_nacimiento || !formData.costo) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const submissionData = {
      ...formData,
      id: initialData?.id,
      cantidad: Number(formData.cantidad),
      costo: Number(formData.costo)
    };

    console.log('Enviando datos:', submissionData);
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Código de Lote</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ingrese el código del lote (ej: P202502-001)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo_animal">Tipo de Animal</Label>
        <Select
          value={formData.tipo_animal}
          onValueChange={(value) => setFormData({ ...formData, tipo_animal: value })}
        >
          <SelectTrigger id="tipo_animal">
            <SelectValue placeholder="Seleccione el tipo de animal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pollo">Pollo</SelectItem>
            <SelectItem value="chancho">Chancho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="raza">Raza</Label>
        <Input
          id="raza"
          value={formData.raza}
          onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
          placeholder="Ingrese la raza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cantidad">Cantidad</Label>
        <Input
          id="cantidad"
          type="number"
          min="1"
          value={formData.cantidad}
          onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
          placeholder="Ingrese la cantidad"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
        <Input
          id="fecha_nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="costo">Costo (USD)</Label>
        <Input
          id="costo"
          type="number"
          min="0"
          step="0.01"
          value={formData.costo}
          onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
          placeholder="Ingrese el costo en dólares"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

export default LoteForm;
