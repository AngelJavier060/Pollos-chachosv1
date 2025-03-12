'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { Edit2, Plus, PlusCircle, Trash2, PencilIcon, PlusIcon, MoreVertical, Trash2Icon } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { toast } from "@/app/components/ui/use-toast";
import { planNutricionalAPI } from '@/app/lib/planNutricional';

interface PlanAlimentacion {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  edad_inicio: number;
  edad_fin: number;
  alimento_id: string;
  alimento_nombre: string;
  consumo_diario: number;
  temperatura: number;
  observaciones?: string;
}

interface PlanMedicacion {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  medicina_nombre: string;
  dosis_ml: number;
  dias_aplicacion: number;
  via_administracion: string;
  observaciones?: string;
  dias: number;
}

interface Cronograma {
  id: string;
  tipo_animal: string;
  fecha_inicio: string;
  planes_alimentacion: any[];
  planes_medicacion: any[];
  notas: string;
  rangos: {
    id: number;
    inicio: string;
    fin: string;
    descripcion: string;
  }[];
}

interface ProgramacionCiclo {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  edad_inicio: number;
  edad_fin: number;
  duracion_ciclo: number; // duración en días
  alimentacion: {
    etapa: string;
    horarios: {
      manana: {
        hora: string;
        cantidad: number;
      };
      tarde: {
        hora: string;
        cantidad: number;
      };
    };
  };
  medicacion: {
    etapa: string;
    medicina: string;
    dosis: number;
    dias_aplicacion: number; // cada cuántos días
    hora: string;
  }[];
  notas: string;
}

interface Medicacion {
  id: string;
  etapa_id: string;
  medicina_id: string;
  medicina_nombre: string;
  dosis: number;
  unidad: string;
  frecuencia: string;
  duracion: number;
  via_administracion: string;
  notas?: string;
}

interface Producto {
  id: string;
  nombre: string;
  detalle: string;
  tipo: string;
  tipo_animal: string;
  cantidad: number;
  unidad_medida: string;
  precio_unitario: number;
  proveedor: string;
}

interface Lote {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  fecha_nacimiento: string;
  cantidad: number;
  estado: string;
}

export default function PlanNutricionalPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('plan-alimentacion');
  const [planes, setPlanes] = useState<PlanAlimentacion[]>([]);
  const [medicaciones, setMedicaciones] = useState<PlanMedicacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedTipoAnimal, setSelectedTipoAnimal] = useState<string>('pollos');
  const [rangoActual, setRangoActual] = useState<string | null>(null);
  const [programacionPorRango, setProgramacionPorRango] = useState<Record<string, any>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [showMedicacionDialog, setShowMedicacionDialog] = useState(false);
  const [showProgramacionDialog, setShowProgramacionDialog] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [selectedAlimento, setSelectedAlimento] = useState<string>('');
  const [etapasDisponibles, setEtapasDisponibles] = useState<string[]>([]);
  const [currentWeekTitle, setCurrentWeekTitle] = useState('');
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [currentRangeIndex, setCurrentRangeIndex] = useState(0);
  const [editandoDia, setEditandoDia] = useState<string | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [lotesActivos, setLotesActivos] = useState<{[key: string]: number}>({});
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [formData, setFormData] = useState({
    tipo_animal: '',
    etapa: '',
    producto_id: ''
  });

  // Modificar el estado para manejar la selección del tipo de animal y etapa
  const [formState, setFormState] = useState({
    tipo_animal: '',
    etapa: '',
    producto_id: '',
    productosFiltrados: [] as any[]
  });

  // Función para manejar el cambio de tipo de animal
  const handleTipoAnimalChange = async (value: string) => {
    console.log('Tipo animal seleccionado:', value);
    setFormState(prev => ({ ...prev, tipo_animal: value, etapa: '', producto_id: '' }));

    try {
      // Obtener productos filtrados por tipo de animal
      const { data: productos } = await supabase
        .from('productos')
        .select('*')
        .eq('tipo_animal', value)
        .eq('tipo', 'alimento');

      console.log('Productos filtrados:', productos);

      // Obtener etapas únicas para este tipo de animal
      const etapasUnicas = [...new Set(productos?.map(p => p.detalle))].filter(Boolean);
      console.log('Etapas disponibles:', etapasUnicas);

      setFormState(prev => ({
        ...prev,
        productosFiltrados: productos || [],
        etapasDisponibles: etapasUnicas
      }));
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  // Función para manejar el cambio de etapa
  const handleEtapaChange = (value: string) => {
    console.log('Etapa seleccionada:', value);
    // Encontrar el producto correspondiente a esta etapa
    const productoEtapa = formState.productosFiltrados.find(p => p.detalle === value);
    console.log('Producto encontrado:', productoEtapa);

    if (productoEtapa) {
      setFormState(prev => ({
        ...prev,
        etapa: value,
        producto_id: productoEtapa.id,
        productoSeleccionado: productoEtapa
      }));
    }
  };

  // Función para obtener las fechas de la semana actual
  const getCurrentWeekDates = () => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 1 = Lunes, ...
    const dates = [];
    
    // Comenzar desde el lunes
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      const diff = i - currentDay;
      date.setDate(today.getDate() + diff);
      dates.push({
        dayName: days[i === 7 ? 0 : i],
        date: date.getDate(),
        fullDate: date.toLocaleDateString(),
        dayKey: days[i === 7 ? 0 : i].toLowerCase()
      });
    }
    return dates;
  };

  // Efecto para actualizar las fechas cuando se monta el componente
  useEffect(() => {
    const weekDates = getCurrentWeekDates();
    setWeekDates(weekDates);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargar planes de alimentación desde Supabase
        const { data: planesData, error: planesError } = await supabase
          .from('plan_nutricional')
          .select(`
            *,
            productos (
              id,
              nombre,
              tipo,
              tipo_animal
            )
          `)
          .order('edad_inicio', { ascending: true });
  
        if (planesError) throw planesError;
        if (planesData) {
          const planesFormateados = planesData.map(plan => ({
            id: plan.id,
            tipo_animal: plan.tipo_animal,
            etapa: plan.etapa,
            edad_inicio: plan.edad_inicio,
            edad_fin: plan.edad_fin,
            alimento_id: plan.producto_id,
            alimento_nombre: plan.productos.nombre,
            consumo_diario: plan.consumo_diario,
            temperatura: plan.temperatura,
            observaciones: plan.observaciones
          }));
          setPlanes(planesFormateados);
        }
  
        // Cargar productos desde Supabase
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .order('nombre', { ascending: true });
  
        if (productosError) throw productosError;
        if (productosData) {
          setProductos(productosData);
        }
  
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        });
      }
    };
  
    cargarDatosIniciales();
  }, []);

  // Guardar planes cuando cambien
  useEffect(() => {
    if (planes.length > 0) {
      console.log('Guardando planes de alimentación:', planes);
      localStorage.setItem('planes_alimentacion', JSON.stringify(planes));
    }
  }, [planes]);

  // Guardar medicaciones cuando cambien
  useEffect(() => {
    if (medicaciones.length > 0) {
      console.log('Guardando planes de medicación:', medicaciones);
      localStorage.setItem('planes_medicacion', JSON.stringify(medicaciones));
    }
  }, [medicaciones]);

  // Guardar programación cuando cambie
  useEffect(() => {
    if (Object.keys(programacionPorRango).length > 0) {
      console.log('Guardando programación:', programacionPorRango);
      localStorage.setItem('programacion_por_rango', JSON.stringify(programacionPorRango));
    }
  }, [programacionPorRango]);

  // Actualizar etapas disponibles cuando se selecciona una medicina
  useEffect(() => {
    if (activeTab === 'medicacion') {
      // Obtener todas las etapas disponibles del inventario para medicamentos
      const etapasInventario = medicaciones
        .filter(med => med.tipo_animal === selectedTipoAnimal)
        .map(med => med.etapa)
        .filter((etapa, index, self) => 
          etapa && 
          etapa.trim() !== '' && 
          self.indexOf(etapa) === index
        );
      
      setEtapasDisponibles(etapasInventario);
    }
  }, [activeTab, medicaciones, selectedTipoAnimal]);

  // Cuando se abre el diálogo para editar, establecer el alimento seleccionado
  useEffect(() => {
    if (editando) {
      setSelectedAlimento(editando.alimento_nombre || editando.medicina_nombre);
    } else {
      setSelectedAlimento('');
    }
  }, [editando]);

  // Función para obtener el siguiente rango de edad basado en el actual
  const getNextRange = (currentRange: string) => {
    const [start, end] = currentRange.split('-').map(Number);
    const nextStart = end + 1;
    const nextEnd = nextStart + (end - start);
    return `${nextStart}-${nextEnd}`;
  };

  // Función para guardar la programación
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formElement = event.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    try {
      if (activeTab === 'plan-alimentacion') {
        // Usar el producto_id del estado formState
        const planData = {
          tipo_animal: formData.get('tipo_animal'),
          etapa: formData.get('etapa'),
          edad_inicio: Number(formData.get('edad_inicio')),
          edad_fin: Number(formData.get('edad_fin')),
          producto_id: formState.producto_id, // Usar el ID guardado en el estado
          consumo_diario: Number(formData.get('consumo_diario')),
          temperatura: Number(formData.get('temperatura')),
          observaciones: formData.get('observaciones')
        };

        // Validar que existe producto_id
        if (!planData.producto_id) {
          throw new Error('Debe seleccionar un producto');
        }

        console.log('Datos a enviar:', planData);

        const { data, error } = await supabase
          .from('plan_nutricional')
          .insert([planData])
          .select()
          .single();

        if (error) {
          console.error('Error de inserción:', error);
          throw error;
        }

        // Actualizar estado local
        const nuevoPlan = {
          ...planData,
          id: data.id,
          alimento_nombre: formState.productoSeleccionado?.nombre || ''
        };

        setPlanes([...planes, nuevoPlan]);
        setShowDialog(false);
        toast({
          title: "Éxito",
          description: "Plan nutricional creado correctamente"
        });
      } else if (activeTab === 'medicacion') {
        const nuevaMedicacion: PlanMedicacion = {
          id: editando ? editando.id : crypto.randomUUID(),
          tipo_animal: formData.get('tipo_animal') as 'pollos' | 'chanchos',
          etapa: formData.get('etapa') as string,
          medicina_nombre: formData.get('medicina') as string,
          dosis_ml: Number(formData.get('dosis_ml')),
          dias_aplicacion: Number(formData.get('dias_aplicacion')),
          via_administracion: formData.get('via_administracion') as string,
          observaciones: formData.get('observaciones') as string,
          dias: Number(formData.get('dias_aplicacion')),
        };
  
        if (editando) {
          setMedicaciones(medicaciones.map(m => m.id === editando.id ? nuevaMedicacion : m));
        } else {
          setMedicaciones([...medicaciones, nuevaMedicacion]);
        }
        setShowMedicacionDialog(false);
        setEditando(null);
      } else if (activeTab === 'programacion') {
        const dia = editandoDia || formData.get('dia') as string;
        const tipoAnimal = formData.get('tipo_animal') as string;
        // Si estamos editando, usar el rango actual, si no, el seleccionado del formulario
        const rangoEdad = editandoDia ? rangoActual : formData.get('rango_edad') as string;
  
        // Validar que el rango no exista si no estamos editando
        if (!editandoDia) {
          const [inicio, fin] = rangoEdad.split('-').map(Number);
          if (rangoExiste(inicio, fin)) {
            alert('Ya existe un rango que se sobrepone con estas edades. Por favor elija un rango diferente.');
            return;
          }
        }
        
        const nuevaProgramacion = {
          tipo_animal: tipoAnimal,
          hora_manana: formData.get('hora_manana'),
          alimento_manana: formData.get('alimento_manana'),
          alimento_extra_manana: formData.get('alimento_extra_manana'),
          hora_tarde: formData.get('hora_tarde'),
          alimento_tarde: formData.get('alimento_tarde'),
          alimento_extra_tarde: formData.get('alimento_extra_tarde'),
          hora_medicina: formData.get('hora_medicina'),
          medicina: formData.get('medicina'),
          dosis: formData.get('dosis')
        };
  
        // Actualizar la programación para el rango específico
        setProgramacionPorRango(prev => {
          const nuevoProgramacionPorRango = { ...prev };
          if (!nuevoProgramacionPorRango[rangoEdad]) {
            nuevoProgramacionPorRango[rangoEdad] = {
              titulo: `${tipoAnimal} de ${rangoEdad} dias`,
              programacion: {}
            };
          }
          nuevoProgramacionPorRango[rangoEdad].programacion[dia.toLowerCase()] = nuevaProgramacion;
          
          // Guardar en localStorage inmediatamente después de actualizar
          localStorage.setItem('programacion_por_rango', JSON.stringify(nuevoProgramacionPorRango));
          
          return nuevoProgramacionPorRango;
        });
  
        if (!editandoDia) {
          setRangoActual(rangoEdad);
        }
        
        setShowProgramacionDialog(false);
        setEditandoDia(null);
      }
    } catch (error: any) {
      console.error('Error detallado:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el plan nutricional",
        variant: "destructive"
      });
    }
  };

  // Modificar el useEffect que maneja el cambio de etapa
  useEffect(() => {
    if (formState.tipo_animal && formState.etapa) {
      const productoEtapa = formState.productosFiltrados.find(p => p.detalle === formState.etapa);
      if (productoEtapa) {
        console.log('Producto encontrado:', productoEtapa);
        setFormState(prev => ({
          ...prev,
          producto_id: productoEtapa.id,
          productoSeleccionado: productoEtapa
        }));
      }
    }
  }, [formState.tipo_animal, formState.etapa]);

  const eliminarItem = (id: string) => {
    if (activeTab === 'plan-alimentacion') {
      setPlanes(planes.filter(p => p.id !== id));
    } else {
      setMedicaciones(medicaciones.filter(m => m.id !== id));
    }
  };

  const handleEditarDia = (dia: string) => {
    setEditandoDia(dia);
    setShowProgramacionDialog(true);
  };

  // Función para validar si un rango ya existe
  const rangoExiste = (inicio: number, fin: number) => {
    return Object.keys(programacionPorRango).some(rango => {
      const [rangoInicio, rangoFin] = rango.split('-').map(Number);
      return (inicio >= rangoInicio && inicio <= rangoFin) || 
             (fin >= rangoInicio && fin <= rangoFin);
    });
  };

  // Función para manejar la eliminación de un rango
  const eliminarRango = (rango: string) => {
    const nuevaProgramacion = { ...programacionPorRango };
    delete nuevaProgramacion[rango];
    setProgramacionPorRango(nuevaProgramacion);
    localStorage.setItem('programacion_por_rango', JSON.stringify(nuevaProgramacion));
  };

  // Función para editar el título de un rango
  const editarTituloRango = (rango: string, nuevoTitulo: string) => {
    const nuevaProgramacion = { ...programacionPorRango };
    nuevaProgramacion[rango] = {
      ...nuevaProgramacion[rango],
      titulo: nuevoTitulo
    };
    setProgramacionPorRango(nuevaProgramacion);
    localStorage.setItem('programacion_por_rango', JSON.stringify(nuevaProgramacion));
  };

  // Función para obtener las medicaciones correspondientes a los días de vida
  const obtenerMedicacionesPorDias = (diasVida: number) => {
    console.log('Verificando medicaciones para día:', diasVida);
    return medicaciones.filter(med => {
      const diasMedicacion = Number(med.dias);
      console.log(`Comparando medicina ${med.medicina_nombre}: día ${diasMedicacion} con día actual ${diasVida}`);
      return diasMedicacion === diasVida;
    });
  };

  // Función para obtener los días de vida para una fecha específica
  const obtenerDiasVidaParaFecha = (fecha: Date) => {
    const fechaCalendario = new Date(fecha);
    fechaCalendario.setHours(0, 0, 0, 0);

    return lotes
      .filter(lote => lote.estado === 'activo' && lote.tipo_animal === 'pollos')
      .map(lote => {
        const fechaNacimiento = new Date(lote.fecha_nacimiento);
        fechaNacimiento.setHours(0, 0, 0, 0);
        
        const diasVida = Math.floor(
          (fechaCalendario.getTime() - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log('Calculando días de vida:', {
          loteId: lote.id,
          fechaNacimiento: fechaNacimiento.toISOString(),
          fechaCalendario: fechaCalendario.toISOString(),
          diasVida
        });

        return {
          loteId: lote.id,
          diasVida,
          tipoAnimal: lote.tipo_animal,
          fechaNacimiento: lote.fecha_nacimiento
        };
      });
  };

  // Cargar etapas cuando cambia el tipo de animal
  useEffect(() => {
    if (formData.tipo_animal) {
      const cargarEtapas = async () => {
        try {
          const etapas = await planNutricionalAPI.getEtapasPorTipoAnimal(formData.tipo_animal);
          setEtapasDisponibles(etapas);
          // Reset etapa cuando cambia tipo_animal
          setFormData(prev => ({ ...prev, etapa: '', producto_id: '' }));
        } catch (error) {
          console.error('Error al cargar etapas:', error);
        }
      };
      cargarEtapas();
    }
  }, [formData.tipo_animal]);

  // Cargar producto cuando cambia la etapa
  useEffect(() => {
    if (formData.tipo_animal && formData.etapa) {
      const cargarProducto = async () => {
        try {
          const producto = await planNutricionalAPI.getProductoPorEtapa(
            formData.tipo_animal,
            formData.etapa
          );
          if (producto) {
            setProductoSeleccionado(producto);
            setFormData(prev => ({
              ...prev,
              producto_id: producto.id
            }));
          }
        } catch (error) {
          console.error('Error al cargar producto:', error);
        }
      };
      cargarProducto();
    }
  }, [formData.tipo_animal, formData.etapa]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Plan Nutricional y Medicación</h2>
        <p className="text-muted-foreground">
          Gestiona el plan de alimentación, programación semanal y medicación
        </p>
      </div>

      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold">Planes Nutricionales</h2>
        <div className="flex gap-2">
          <Button onClick={() => {
            setActiveTab('plan-alimentacion');
            setShowDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Plan de Alimentación
          </Button>
          <Button onClick={() => {
            setActiveTab('medicacion');
            setShowMedicacionDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Plan de Medicación
          </Button>
          <Button onClick={() => {
            setActiveTab('programacion');
            setShowProgramacionDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="plan-alimentacion" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan-alimentacion">Plan de Alimentación</TabsTrigger>
          <TabsTrigger value="medicacion">Plan de Medicación</TabsTrigger>
          <TabsTrigger value="programacion">Programación</TabsTrigger>
        </TabsList>

        <TabsContent value="plan-alimentacion">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Plan de Alimentación</h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo Animal</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Edad (días)</TableHead>
                  <TableHead>Alimento</TableHead>
                  <TableHead>Consumo (kg)</TableHead>
                  <TableHead>Temperatura (°C)</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planes.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="capitalize">{plan.tipo_animal}</TableCell>
                    <TableCell>{plan.etapa}</TableCell>
                    <TableCell>{plan.edad_inicio} - {plan.edad_fin}</TableCell>
                    <TableCell>{plan.alimento_nombre}</TableCell>
                    <TableCell>{plan.consumo_diario} kg</TableCell>
                    <TableCell>{plan.temperatura}°C</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setActiveTab('plan-alimentacion');
                          setEditando(plan);
                          setShowDialog(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarItem(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="medicacion">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Plan de Medicación</h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo Animal</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Medicina</TableHead>
                  <TableHead>Dosis (ml)</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Vía</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicaciones.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="capitalize">{med.tipo_animal}</TableCell>
                    <TableCell>{med.etapa}</TableCell>
                    <TableCell>{med.medicina_nombre}</TableCell>
                    <TableCell>{med.dosis_ml} ml</TableCell>
                    <TableCell>{med.dias_aplicacion}</TableCell>
                    <TableCell>{med.via_administracion}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setActiveTab('medicacion');
                          setEditando(med);
                          setShowMedicacionDialog(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarItem(med.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="programacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  {Object.keys(programacionPorRango).map(rango => (
                    <Button
                      key={rango}
                      variant={rangoActual === rango ? "default" : "outline"}
                      onClick={() => setRangoActual(rango)}
                    >
                      {programacionPorRango[rango].titulo}
                    </Button>
                  ))}
                </div>
              </div>
              {rangoActual && programacionPorRango[rangoActual] && (
                <h2 className="text-2xl font-bold text-center my-4">
                  {programacionPorRango[rangoActual].titulo}
                </h2>
              )}
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((dayInfo, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="text-center font-bold">
                      {dayInfo.dayName}
                      <div className="text-sm text-gray-500">
                        {dayInfo.date}
                      </div>
                    </div>
                    
                    {/* Mostrar contenido solo si hay programación para este día y rango */}
                    {rangoActual && 
                     programacionPorRango[rangoActual]?.programacion[dayInfo.dayKey] ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="font-medium text-green-700">Alimentación</div>
                          <div className="text-sm text-green-600">
                            <div className="flex items-center gap-1">
                              <div className="font-semibold">Mañana</div>
                              <div className="text-xs">
                                ({programacionPorRango[rangoActual].programacion[dayInfo.dayKey].hora_manana})
                              </div>
                            </div>
                            <div className="ml-2 text-sm font-medium">
                              {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_manana}
                              {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra_manana && (
                                <div className="text-xs text-green-500 mt-1">
                                  + {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra_manana}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-green-600 mt-2">
                            <div className="flex items-center gap-1">
                              <div className="font-semibold">Tarde</div>
                              <div className="text-xs">
                                ({programacionPorRango[rangoActual].programacion[dayInfo.dayKey].hora_tarde})
                              </div>
                            </div>
                            <div className="ml-2 text-sm font-medium">
                              {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_tarde}
                              {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra_tarde && (
                                <div className="text-xs text-green-500 mt-1">
                                  + {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra_tarde}
                                </div>
                              )}
                            </div>
                          </div>

                          {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra && (
                            <div className="text-sm text-green-600 mt-2 border-t border-green-100 pt-2">
                              <div className="font-semibold">Extra</div>
                              <div className="ml-2 text-sm font-medium">
                                {programacionPorRango[rangoActual].programacion[dayInfo.dayKey].alimento_extra}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleEditarDia(dayInfo.dayKey)}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 mt-4">
                        <div>Sin programación</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleEditarDia(dayInfo.dayKey)}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    )}
                    
                    {/* Mostrar medicaciones automáticas según los días de vida */}
                    {obtenerDiasVidaParaFecha(new Date(dayInfo.date)).map(({ loteId, diasVida }) => {
                      const medicacionesDelDia = obtenerMedicacionesPorDias(diasVida);
                      return medicacionesDelDia.length > 0 ? (
                        <div key={loteId} className="mb-3 bg-red-50 rounded-lg p-2 border-2 border-red-300">
                          <div className="font-medium text-red-800">
                            ¡Vacunación Requerida! - Día {diasVida}
                          </div>
                          {medicacionesDelDia.map((med, index) => (
                            <div key={index} className="text-sm text-red-700">
                              <div className="font-semibold">
                                {med.medicina_nombre}
                              </div>
                              <div className="text-xs space-y-1">
                                <div>Etapa: {med.etapa}</div>
                                <div>Dosis: {med.dosis_ml}ml</div>
                                <div>Vía: {med.via_administracion}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rangos de edad */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Rangos de Edad</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(programacionPorRango).map(([rango, datos]) => (
                <div key={rango} className="flex items-center bg-slate-100 rounded-lg p-2 gap-2">
                  <Button
                    variant={rangoActual === rango ? "default" : "outline"}
                    onClick={() => setRangoActual(rango)}
                    className="text-sm"
                  >
                    {datos.titulo || `${rango} dias`}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        const nuevoTitulo = prompt('Ingrese el nuevo título:', datos.titulo);
                        if (nuevoTitulo) editarTituloRango(rango, nuevoTitulo);
                      }}>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Editar título
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este rango? Se perderá toda la programación asociada.')) {
                            eliminarRango(rango);
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 mr-2" />
                        Eliminar rango
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para Plan de Alimentación */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Plan de Alimentación' : 'Nuevo Plan de Alimentación'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select de Tipo Animal */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo_animal" className="text-right">Tipo Animal</Label>
              <Select 
                name="tipo_animal" 
                value={formState.tipo_animal}
                onValueChange={handleTipoAnimalChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollos">Pollos</SelectItem>
                  <SelectItem value="chanchos">Chanchos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select de Etapa (solo visible si hay tipo_animal seleccionado) */}
            {formState.tipo_animal && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etapa" className="text-right">Etapa</Label>
                <Select 
                  name="etapa"
                  value={formState.etapa}
                  onValueChange={handleEtapaChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {formState.etapasDisponibles?.map(etapa => (
                      <SelectItem key={etapa} value={etapa}>
                        {etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mostrar producto seleccionado automáticamente */}
            {formState.productoSeleccionado && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Alimento</Label>
                <div className="col-span-3 p-2 bg-muted rounded">
                  {formState.productoSeleccionado.nombre}
                </div>
              </div>
            )}

            {/* Resto de campos del formulario */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edad_inicio" className="text-right">Edad Inicio (días)</Label>
              <Input
                id="edad_inicio"
                name="edad_inicio"
                type="number"
                className="col-span-3"
                min="1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edad_fin" className="text-right">Edad Fin (días)</Label>
              <Input
                id="edad_fin"
                name="edad_fin"
                type="number"
                className="col-span-3"
                min="1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consumo_diario" className="text-right">Consumo Diario (kg)</Label>
              <Input
                id="consumo_diario"
                name="consumo_diario"
                type="number"
                className="col-span-3"
                step="0.1"
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperatura" className="text-right">Temperatura (°C)</Label>
              <Input
                id="temperatura"
                name="temperatura"
                type="number"
                className="col-span-3"
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observaciones" className="text-right">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                className="col-span-3"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {editando ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Plan de Medicación */}
      <Dialog open={showMedicacionDialog} onOpenChange={setShowMedicacionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Plan de Medicación' : 'Nuevo Plan de Medicación'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo_animal" className="text-right">Tipo Animal</Label>
              <Select name="tipo_animal">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollos">Pollos</SelectItem>
                  <SelectItem value="chanchos">Chanchos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="etapa" className="text-right">Etapa</Label>
              <Select name="etapa">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="crecimiento">Crecimiento</SelectItem>
                  <SelectItem value="engorde">Engorde</SelectItem>
                  <SelectItem value="finalizador">Finalizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicina" className="text-right">Medicina</Label>
              <Select 
                name="medicina"
                onValueChange={setSelectedAlimento}
                value={selectedAlimento}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar medicina" />
                </SelectTrigger>
                <SelectContent>
                  {productos
                    .filter(p => p.tipo === 'medicina')
                    .map(med => (
                      <SelectItem key={med.id} value={med.nombre}>
                        {med.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosis_ml" className="text-right">Dosis (ml)</Label>
              <Input
                id="dosis_ml"
                name="dosis_ml"
                type="number"
                className="col-span-3"
                step="0.1"
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dias_aplicacion" className="text-right">Días de aplicación</Label>
              <Input
                id="dias_aplicacion"
                name="dias_aplicacion"
                type="number"
                className="col-span-3"
                min="1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="via_administracion" className="text-right">Vía de administración</Label>
              <Input
                id="via_administracion"
                name="via_administracion"
                type="text"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observaciones" className="text-right">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                className="col-span-3"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {editando ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Agregar Plan */}
      <Dialog open={showProgramacionDialog} onOpenChange={(open) => {
        if (!open) setEditandoDia(null);
        setShowProgramacionDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editandoDia ? 'Editar Programación' : 'Nueva Programación'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo_animal" className="text-right">Tipo Animal</Label>
              <Select 
                name="tipo_animal"
                value={selectedTipoAnimal}
                onValueChange={setSelectedTipoAnimal}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollos">Pollos</SelectItem>
                  <SelectItem value="chanchos">Chanchos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!editandoDia && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dia" className="text-right">Día</Label>
                <Select name="dia" defaultValue="lunes">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunes">Lunes</SelectItem>
                    <SelectItem value="martes">Martes</SelectItem>
                    <SelectItem value="miercoles">Miércoles</SelectItem>
                    <SelectItem value="jueves">Jueves</SelectItem>
                    <SelectItem value="viernes">Viernes</SelectItem>
                    <SelectItem value="sabado">Sábado</SelectItem>
                    <SelectItem value="domingo">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">Alimentación</h4>
              <div className="space-y-2">
                <Label>Mañana</Label>
                <div className="space-y-2">
                  <Input
                    type="time"
                    name="hora_manana"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.hora_manana : 
                      "08:00"}
                  />
                  <Select 
                    name="alimento_manana"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.alimento_manana : 
                      undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter(p => p.tipo === 'alimento')
                        .map((alimento) => (
                          <SelectItem 
                            key={alimento.id} 
                            value={alimento.nombre}
                          >
                            {alimento.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="text" 
                    name="alimento_extra_manana" 
                    placeholder="Alimento extra mañana (opcional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tarde</Label>
                <div className="space-y-2">
                  <Input
                    type="time"
                    name="hora_tarde"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.hora_tarde : 
                      "16:00"}
                  />
                  <Select 
                    name="alimento_tarde"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.alimento_tarde : 
                      undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter(p => p.tipo === 'alimento')
                        .map((alimento) => (
                          <SelectItem 
                            key={alimento.id} 
                            value={alimento.nombre}
                          >
                            {alimento.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="text" 
                    name="alimento_extra_tarde" 
                    placeholder="Alimento extra tarde (opcional)"
                  />
                </div>
              </div>

              {/* Rango de Edad */}
              {!editandoDia && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rango_edad" className="text-right">Rango de Edad</Label>
                  <Select name="rango_edad">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar rango de edad" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(planes
                        .filter(plan => plan.tipo_animal === selectedTipoAnimal)
                        .map(plan => `${plan.edad_inicio}-${plan.edad_fin}`))]
                        .sort()
                        .map((rango) => {
                          const [inicio, fin] = rango.split('-');
                          const plan = planes.find(p => 
                            p.tipo_animal === selectedTipoAnimal && 
                            p.edad_inicio === parseInt(inicio) && 
                            p.edad_fin === parseInt(fin)
                          );
                          return (
                            <SelectItem 
                              key={rango}
                              value={rango}
                            >
                              {inicio}-{fin} días ({plan?.etapa || ''})
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Medicación</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicina" className="text-right">Medicina</Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    type="time"
                    name="hora_medicina"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.hora_medicina : 
                      "09:00"}
                  />
                  <Select 
                    name="medicina"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.medicina : 
                      undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar medicina" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter(p => p.tipo === 'medicina')
                        .map((medicina, index) => (
                          <SelectItem 
                            key={medicina.id}
                            value={medicina.nombre}
                          >
                            {medicina.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    name="dosis"
                    placeholder="Dosis en ml"
                    step="0.1"
                    min="0"
                    defaultValue={editandoDia ? 
                      programacionPorRango[rangoActual]?.programacion[editandoDia]?.dosis : 
                      ""}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {editandoDia ? 'Guardar Cambios' : 'Crear Programación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}