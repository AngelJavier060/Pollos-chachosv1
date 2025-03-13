'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/app/components/ui/button";
import { Plus, ListPlus, Info, Search } from 'lucide-react';
import LoteForm from './LoteForm';
import LotesTable from './LotesTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/app/components/ui/select";
import { supabase, checkConnection, testQuery } from '../lib/supabase';
import { toast } from "@/app/components/ui/use-toast"; // Añadir esta importación

interface LotesViewProps {
  lotes: any[];
  setLotes?: (lotes: any[]) => void;
}

export function LotesView({ lotes: initialLotes = [], setLotes: setParentLotes }: LotesViewProps) {
  const router = useRouter();
  const [localLotes, setLocalLotes] = useState<any[]>(initialLotes || []);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'pollo' | 'chancho'>('todos');

  const syncLotes = useCallback((lotes: any[]) => {
    setLocalLotes(lotes);
    if (setParentLotes) {
      setParentLotes(lotes);
    }
  }, [setParentLotes]);

  useEffect(() => {
    if (initialLotes?.length > 0) {
      syncLotes(initialLotes);
    }
  }, [initialLotes, syncLotes]);

  useEffect(() => {
    const initConnection = async () => {
      try {
        // Verificar la sesión primero
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          toast({
            title: "Error de autenticación",
            description: "Por favor inicie sesión nuevamente",
            variant: "destructive",
          });
          router.push('/auth/admin');
          return;
        }

        // Verificar conexión después de autenticación
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.error('No se pudo conectar a Supabase');
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar a la base de datos",
            variant: "destructive",
          });
          return;
        }

        // Cargar datos iniciales
        const { data: lotesData, error: lotesError } = await supabase
          .from('lotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (lotesError) throw lotesError;
        
        syncLotes(lotesData || []);
        
      } catch (error) {
        console.error('Error al inicializar:', error);
        toast({
          title: "Error",
          description: "Error al cargar los datos",
          variant: "destructive",
        });
      }
    };

    initConnection();
  }, [router, syncLotes]);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingLote) {
        // Actualizar lote existente
        const { error } = await supabase
          .from('lotes')
          .update({
            nombre: formData.nombre,
            tipo_animal: formData.tipo_animal,
            raza: formData.raza,
            cantidad: formData.cantidad,
            fecha_nacimiento: formData.fecha_nacimiento,
            costo: formData.costo,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLote.id);

        if (error) throw error;
      } else {
        // Crear nuevo lote - sin incluir el id
        const { error } = await supabase
          .from('lotes')
          .insert([{
            nombre: formData.nombre,
            tipo_animal: formData.tipo_animal,
            raza: formData.raza,
            cantidad: formData.cantidad,
            fecha_nacimiento: formData.fecha_nacimiento,
            costo: formData.costo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      // Recargar los lotes
      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      syncLotes(data || []);
      setIsOpen(false);
      setEditingLote(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar los datos. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (lote: any) => {
    setEditingLote(lote);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      if (confirm('¿Está seguro de que desea eliminar este lote?')) {
        const { error } = await supabase
          .from('lotes')
          .delete()
          .eq('id', id);

        if (error) throw error;

        syncLotes(localLotes.filter(lote => lote.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el lote. Por favor, intente nuevamente.');
    }
  };

  // Filtrar lotes basado en búsqueda y tipo
  const filteredLotes = (localLotes || []).filter(lote => {
    if (!lote?.nombre || !lote?.raza) return false;
    const matchesSearch = lote.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lote.raza.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || lote.tipo_animal === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Registro de Lotes
          </h2>
          <p className="mt-1 text-gray-600">
            Gestiona los lotes de pollos y chanchos de la granja
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingLote(null);
            setIsOpen(true);
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all duration-200 hover:shadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Lote
        </Button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o raza..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={tipoFilter} onValueChange={(value: 'todos' | 'pollo' | 'chancho') => setTipoFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="pollo">Solo Pollos</SelectItem>
              <SelectItem value="chancho">Solo Chanchos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Aquí puedes ver y gestionar todos los lotes de animales registrados en el sistema.
          </p>
        </div>

        <LotesTable 
          lotes={filteredLotes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingLote ? 'Editar Lote' : 'Crear Nuevo Lote'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete el formulario para {editingLote ? 'editar el' : 'crear un nuevo'} lote.
              Todos los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <LoteForm
            initialData={editingLote}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsOpen(false);
              setEditingLote(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
