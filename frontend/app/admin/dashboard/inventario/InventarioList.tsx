'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Search, Pencil, Trash2, Plus, PackageSearch } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Producto } from '../../types/inventario';
import ProductoForm from './ProductoForm';
import { api } from '@/app/lib/api';
import { useToast } from "@/app/components/ui/use-toast";
import { useDebounce } from "@/app/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export default function InventarioList() {
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<'nombre' | 'etapa' | 'tipo' | 'animal' | 'proveedor'>('nombre');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventario/productos');
      if (response.success) {
        setProductos(response.data);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast({
        title: "Error de conexión",
        description: "Verifica tu conexión a internet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleSubmit = useCallback(async (data: Partial<Producto>) => {
    try {
      if (editingProduct) {
        const response = await api.put(`/api/inventario/productos`, editingProduct.id, data);
        if (response.success) {
          toast({
            title: "Éxito",
            description: "Producto actualizado correctamente",
          });
          fetchProductos(); // Recargar la lista
        }
      } else {
        const response = await api.post('/api/inventario/productos', data);
        if (response.success) {
          toast({
            title: "Éxito",
            description: "Producto agregado correctamente",
          });
          fetchProductos(); // Recargar la lista
        }
      }
      setIsOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
  }, [editingProduct, fetchProductos, toast]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const response = await api.delete(`/api/inventario/productos`, id);
      if (response.success) {
        toast({
          title: "Éxito",
          description: "Producto eliminado correctamente",
        });
        fetchProductos(); // Recargar la lista
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  }, [fetchProductos, toast]);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) return productos;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return productos.filter(producto => {
      switch (searchType) {
        case 'nombre':
          return producto.nombre.toLowerCase().includes(searchLower);
        case 'etapa':
          return producto.detalle?.toLowerCase().includes(searchLower) || false;
        case 'tipo':
          return producto.tipo.toLowerCase().includes(searchLower);
        case 'animal':
          return producto.tipo_animal.toLowerCase().includes(searchLower);
        case 'proveedor':
          return producto.proveedor.toLowerCase().includes(searchLower);
        default:
          return false;
      }
    });
  }, [productos, debouncedSearchTerm, searchType]);

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'nombre': return 'Buscar por nombre del producto...';
      case 'etapa': return 'Buscar por etapa (inicial, crecimiento...)';
      case 'tipo': return 'Buscar por tipo (alimento, medicina...)';
      case 'animal': return 'Buscar por animal (pollos, chanchos)';
      case 'proveedor': return 'Buscar por nombre del proveedor...';
      default: return 'Buscar...';
    }
  };

  const renderSearchSection = () => (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <div className="flex-1 sm:w-[500px] flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={getSearchPlaceholder()}
            className="pl-8 bg-white w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={searchType}
          onValueChange={(value: 'nombre' | 'etapa' | 'tipo' | 'animal' | 'proveedor') => {
            setSearchType(value);
            setSearchTerm('');
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="etapa">Etapa</SelectItem>
            <SelectItem value="tipo">Tipo</SelectItem>
            <SelectItem value="animal">Animal</SelectItem>
            <SelectItem value="proveedor">Proveedor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-gray-600">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {renderSearchSection()}
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsOpen(true);
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all duration-200 hover:shadow w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-600">Nombre</TableHead>
              <TableHead className="font-semibold text-gray-600">Etapa</TableHead>
              <TableHead className="font-semibold text-gray-600">Tipo</TableHead>
              <TableHead className="font-semibold text-gray-600">Para</TableHead>
              <TableHead className="font-semibold text-gray-600 text-right">Cantidad</TableHead>
              <TableHead className="font-semibold text-gray-600">Unidad</TableHead>
              <TableHead className="font-semibold text-gray-600 text-right">Precio Unit.</TableHead>
              <TableHead className="font-semibold text-gray-600">Proveedor</TableHead>
              <TableHead className="font-semibold text-gray-600 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <PackageSearch className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No hay productos en el inventario</p>
                    <p className="text-gray-500 text-sm">Agrega un nuevo producto usando el botón "Nuevo Producto"</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((producto) => (
                <TableRow key={producto.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.detalle}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {producto.tipo}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      producto.tipo_animal?.toLowerCase() === 'pollos' 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-purple-200 bg-purple-50 text-purple-700'
                    }`}>
                      {producto.tipo_animal?.toLowerCase() === 'pollos' ? '🐔 Pollos' : '🐷 Chanchos'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat('es-PE').format(producto.cantidad)}
                  </TableCell>
                  <TableCell>{producto.unidad_medida}</TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat('es-PE', {
                      style: 'currency',
                      currency: 'PEN'
                    }).format(producto.precio_unitario)}
                  </TableCell>
                  <TableCell>{producto.proveedor}</TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(producto);
                          setIsOpen(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(producto.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductoForm
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
}