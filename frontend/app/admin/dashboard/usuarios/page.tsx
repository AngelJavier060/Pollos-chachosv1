'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { toast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useTheme } from "next-themes";

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  usuario: string;
  correo: string;
  rol: string;
  estado: number;
  vigencia: number;
  fecha_registro: string;
}

// Primero, actualicemos la interfaz Usuario para manejar correctamente la vigencia
interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  usuario: string;
  correo: string;
  rol: string;
  estado: number;
  vigencia: number;  // Cambiamos de number | null a number
  fecha_registro: string;
}

// Función auxiliar para calcular días restantes con manejo de nulos
const calcularDiasRestantes = (fechaRegistro: string, vigenciaDias: number): number => {
  if (vigenciaDias === 0) return 0;
  
  const fechaInicio = new Date(fechaRegistro);
  const fechaVencimiento = new Date(fechaInicio);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);
  const hoy = new Date();
  
  const diferencia = fechaVencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Función para obtener el estilo de alerta según los días restantes
const getAlertStyle = (diasRestantes: number | null, rol: string) => {
  if (rol === 'admin' || diasRestantes === null) {
    return 'text-gray-500';
  }
  
  if (diasRestantes <= 0) {
    return 'bg-red-100 text-red-800';
  }
  if (diasRestantes <= 5) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (diasRestantes <= 15) {
    return 'bg-green-100 text-green-800';
  }
  return 'text-gray-500';
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estado para el formulario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    usuario: '',
    correo: '',
    password: '',
    rol: 'pollos',
    vigencia: 30, // Valor por defecto
    estado: 1
  });

  const { theme } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        setUsuarios(data || []);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCrearUsuario = async () => {
    try {
      console.log('Iniciando creación de usuario...');
      console.log('URL de Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      // Validación de campos obligatorios
      if (!nuevoUsuario.nombres || !nuevoUsuario.apellidos || !nuevoUsuario.cedula || 
          !nuevoUsuario.usuario || !nuevoUsuario.correo || !nuevoUsuario.password) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive"
        });
        return;
      }

      const usuarioData = {
        nombres: nuevoUsuario.nombres,
        apellidos: nuevoUsuario.apellidos,
        cedula: nuevoUsuario.cedula,
        usuario: nuevoUsuario.usuario,
        correo: nuevoUsuario.correo,
        password: nuevoUsuario.password, // Nota: En producción, esto debería manejarse de forma segura
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
        vigencia: nuevoUsuario.rol === 'admin' ? 0 : nuevoUsuario.vigencia,
        fecha_registro: new Date().toISOString()
      };

      console.log('Intentando crear usuario:', usuarioData);
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert([usuarioData])
        .select()
        .single();

      console.log('Respuesta:', { data, error });

      if (error) throw error;

      setUsuarios([...usuarios, data]);
      toast({
        title: "Éxito",
        description: "Usuario creado exitosamente",
      });
      setIsDialogOpen(false);
      
      // Limpiar formulario
      setNuevoUsuario({
        nombres: '',
        apellidos: '',
        cedula: '',
        usuario: '',
        correo: '',
        password: '',
        rol: 'pollos',
        vigencia: 30,
        estado: 1
      });

    } catch (error: any) {
      console.error('Error completo:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive"
      });
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsuarios(usuarios.filter(usuario => usuario.id !== id));
      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleActualizarUsuario = async (usuario: Usuario) => {
    try {
      // Solo actualizamos campos no únicos por defecto
      const actualizaciones: Partial<Usuario> = {
        nombres: nuevoUsuario.nombres,
        apellidos: nuevoUsuario.apellidos,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
        vigencia: nuevoUsuario.rol === 'admin' ? 0 : nuevoUsuario.vigencia,
      };

      // Solo incluimos campos únicos si realmente cambiaron
      if (nuevoUsuario.cedula !== usuario.cedula) {
        // Verificar si la nueva cédula no existe en otro usuario
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('cedula', nuevoUsuario.cedula)
          .neq('id', usuario.id)
          .single();

        if (!existingUser) {
          actualizaciones.cedula = nuevoUsuario.cedula;
        } else {
          throw new Error('La cédula ya está en uso por otro usuario');
        }
      }

      // Similar para usuario y correo
      if (nuevoUsuario.usuario !== usuario.usuario) {
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('usuario', nuevoUsuario.usuario)
          .neq('id', usuario.id)
          .single();

        if (!existingUser) {
          actualizaciones.usuario = nuevoUsuario.usuario;
        } else {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      if (nuevoUsuario.correo !== usuario.correo) {
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('correo', nuevoUsuario.correo)
          .neq('id', usuario.id)
          .single();

        if (!existingUser) {
          actualizaciones.correo = nuevoUsuario.correo;
        } else {
          throw new Error('El correo ya está en uso');
        }
      }

      console.log('Actualizaciones a realizar:', actualizaciones);

      const { error } = await supabase
        .from('usuarios')
        .update(actualizaciones)
        .eq('id', usuario.id);

      if (error) throw error;

      // Actualizar estado local
      const usuariosActualizados = usuarios.map(u => 
        u.id === usuario.id ? {...u, ...actualizaciones} : u
      );
      setUsuarios(usuariosActualizados);
      
      toast({
        title: "Éxito",
        description: "Usuario actualizado exitosamente",
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleRolChange = (value: string) => {
    setNuevoUsuario({
      ...nuevoUsuario,
      rol: value,
      vigencia: value === 'admin' ? 0 : 30 // Usamos 0 en lugar de null para admin
    });
  };

  const abrirDialogoActualizar = (usuario: Usuario) => {
    setNuevoUsuario({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      cedula: usuario.cedula,
      usuario: usuario.usuario,
      correo: usuario.correo,
      password: '', // No actualizamos la contraseña al editar
      rol: usuario.rol,
      vigencia: usuario.vigencia,
      estado: usuario.estado
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Cargando usuarios...</div>;
  }

  // Agregar un resumen de alertas en la parte superior de la tabla
  const AlertasResumen = () => {
    const { theme } = useTheme();
    const usuariosProximosACaducar = usuarios.filter(usuario => {
      if (usuario.rol === 'admin') return false;
      const diasRestantes = calcularDiasRestantes(usuario.fecha_registro, usuario.vigencia);
      return diasRestantes !== null && diasRestantes <= 15;
    });

    if (usuariosProximosACaducar.length === 0) return null;

    return (
      <div className="mb-6">
        <div className={`rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        } p-4`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Alertas de Vigencia
          </h3>
          <div className="space-y-2">
            {usuariosProximosACaducar.map(usuario => {
              const diasRestantes = calcularDiasRestantes(usuario.fecha_registro, usuario.vigencia);
              return (
                <div 
                  key={usuario.id}
                  className={`p-3 rounded-md border ${
                    theme === 'dark' 
                      ? 'border-gray-700 bg-gray-700/50' 
                      : 'border-gray-200'
                  } ${getAlertStyle(diasRestantes, usuario.rol)}`}
                >
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {usuario.nombres} {usuario.apellidos}
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {' - '}
                    {diasRestantes !== null && diasRestantes <= 0 
                      ? 'Usuario caducado'
                      : `${diasRestantes} días para caducar`
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className={`rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } p-6`}>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Usuarios del Sistema
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Complete los datos del usuario. Todos los campos marcados son obligatorios.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombres" className="text-right">
                    Nombres
                  </Label>
                  <Input
                    id="nombres"
                    className="col-span-3"
                    value={nuevoUsuario.nombres}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombres: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apellidos" className="text-right">
                    Apellidos
                  </Label>
                  <Input
                    id="apellidos"
                    className="col-span-3"
                    value={nuevoUsuario.apellidos}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, apellidos: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cedula" className="text-right">
                    Cédula
                  </Label>
                  <Input
                    id="cedula"
                    className="col-span-3"
                    value={nuevoUsuario.cedula}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, cedula: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="usuario" className="text-right">
                    Usuario
                  </Label>
                  <Input
                    id="usuario"
                    className="col-span-3"
                    value={nuevoUsuario.usuario}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="correo" className="text-right">
                    Correo
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    className="col-span-3"
                    value={nuevoUsuario.correo}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    value={nuevoUsuario.password}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rol" className="text-right">
                    Rol
                  </Label>
                  <Select
                    value={nuevoUsuario.rol}
                    onValueChange={handleRolChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="pollos">Pollos</SelectItem>
                      <SelectItem value="chanchos">Chanchos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {nuevoUsuario.rol !== 'admin' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="vigencia" className="text-right">
                      Días de Vigencia
                    </Label>
                    <Input
                      id="vigencia"
                      type="number"
                      min="1"
                      className="col-span-3"
                      value={nuevoUsuario.vigencia || 30}
                      onChange={(e) => {
                        const valor = e.target.value ? Math.max(1, parseInt(e.target.value)) : 30;
                        setNuevoUsuario({
                          ...nuevoUsuario,
                          vigencia: valor
                        });
                      }}
                      placeholder="Ingrese los días de vigencia"
                      required
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={nuevoUsuario.estado.toString()}
                    onValueChange={(value) => setNuevoUsuario({...nuevoUsuario, estado: Number(value)})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Activo</SelectItem>
                      <SelectItem value="0">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearUsuario}>
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <AlertasResumen />
        
        <div className={`rounded-lg border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } overflow-hidden`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Nombres
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Apellidos
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Cédula
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Usuario
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Correo
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Rol
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Vigencia (días)
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Estado
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${
              theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className={`
                  ${theme === 'dark' ? 
                    'hover:bg-gray-700 border-gray-700' : 
                    'hover:bg-gray-50 border-gray-200'
                  }
                  ${usuario.rol !== 'admin' && 
                    calcularDiasRestantes(usuario.fecha_registro, usuario.vigencia) <= 5 && 
                    calcularDiasRestantes(usuario.fecha_registro, usuario.vigencia) > 0
                      ? theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50' 
                      : ''
                  }
                  border-b
                `}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {usuario.nombres}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {usuario.apellidos}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {usuario.cedula}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {usuario.usuario}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {usuario.correo}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : usuario.rol === 'pollos' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {usuario.rol === 'admin' ? (
                      <span className="text-gray-500">Sin caducidad</span>
                    ) : (
                      <>
                        {(() => {
                          const diasRestantes = calcularDiasRestantes(usuario.fecha_registro, usuario.vigencia);
                          const estilo = getAlertStyle(diasRestantes, usuario.rol);
                          
                          return (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estilo}`}>
                              {diasRestantes !== null ? (
                                diasRestantes <= 0 ? 
                                  'Caducado' : 
                                  `${diasRestantes} días restantes`
                              ) : (
                                'Sin vigencia'
                              )}
                            </span>
                          );
                        })()}
                      </>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm space-x-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`
                        ${theme === 'dark' 
                          ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }
                        border border-current
                      `}
                      onClick={() => abrirDialogoActualizar(usuario)}
                    >
                      Actualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`
                        ${theme === 'dark'
                          ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }
                        border border-current
                      `}
                      onClick={() => {
                        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
                          handleEliminarUsuario(usuario.id);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}