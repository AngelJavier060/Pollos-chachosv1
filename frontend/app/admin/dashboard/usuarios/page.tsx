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
import { validarCedula, validarCorreo, validarContraseña } from '@/app/lib/validations';
import { registrarCambio } from '@/app/lib/audit';
import { Tooltip } from '@/app/components/ui/tooltip';

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
  const [isEditing, setIsEditing] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  
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

  // Añadir estado para validación en tiempo real
  const [errores, setErrores] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    usuario: '',
    correo: '',
    password: ''
  });

  // Función para validación en tiempo real
  const validarCampo = (campo: string, valor: string) => {
    switch (campo) {
      case 'cedula':
        if (!validarCedula(valor)) {
          setErrores(prev => ({...prev, cedula: 'Cédula inválida'}));
        } else {
          setErrores(prev => ({...prev, cedula: ''}));
        }
        break;
      case 'correo':
        if (!validarCorreo(valor)) {
          setErrores(prev => ({...prev, correo: 'Correo inválido'}));
        } else {
          setErrores(prev => ({...prev, correo: ''}));
        }
        break;
      case 'password':
        const validacion = validarContraseña(valor);
        setErrores(prev => ({...prev, password: validacion.mensaje}));
        break;
      // Añadir más validaciones según necesidad
    }
  };

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
      // Validaciones previas
      if (!validarCedula(nuevoUsuario.cedula)) {
        toast({
          title: "Error",
          description: "La cédula ingresada no es válida",
          variant: "destructive"
        });
        return;
      }

      // Primero verificar si la cédula ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('cedula')
        .eq('cedula', nuevoUsuario.cedula)
        .single();

      if (existingUser) {
        toast({
          title: "Error",
          description: "La cédula ingresada ya está registrada en el sistema",
          variant: "destructive"
        });
        return;
      }

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
        password: nuevoUsuario.password,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
        vigencia: nuevoUsuario.rol === 'admin' ? 0 : nuevoUsuario.vigencia,
        fecha_registro: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert([usuarioData])
        .select()
        .single();

      if (error) throw error;

      // Registrar el cambio en el historial
      await registrarCambio('crear', data.id, usuarioData);

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
      console.error('Error al crear usuario:', error);
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
      console.error('Error completo:', error);
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

  const handleActualizarUsuario = async () => {
    try {
      if (!usuarioEditando) {
        throw new Error('No se ha seleccionado ningún usuario para actualizar');
      }
  
      // Validar campos obligatorios
      if (!nuevoUsuario.nombres || !nuevoUsuario.apellidos || 
          !nuevoUsuario.usuario || !nuevoUsuario.correo) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive"
        });
        return;
      }
  
      const actualizaciones = {
        nombres: nuevoUsuario.nombres,
        apellidos: nuevoUsuario.apellidos,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado,
        vigencia: nuevoUsuario.rol === 'admin' ? 0 : nuevoUsuario.vigencia,
        usuario: nuevoUsuario.usuario,
        correo: nuevoUsuario.correo,
      };
  
      const { error } = await supabase
        .from('usuarios')
        .update(actualizaciones)
        .eq('id', usuarioEditando.id)
        .select();
  
      if (error) throw error;
  
      // Actualizar estado local
      setUsuarios(usuarios.map(u => 
        u.id === usuarioEditando.id ? { ...u, ...actualizaciones } : u
      ));
  
      toast({
        title: "Éxito",
        description: "Usuario actualizado exitosamente",
      });
  
      setIsDialogOpen(false);
      setUsuarioEditando(null);
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
    setUsuarioEditando(usuario);
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
    setIsEditing(true); // Marcamos que estamos editando
    setIsDialogOpen(true);
  };

  const abrirDialogoCrear = () => {
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
    setIsEditing(false); // Marcamos que estamos creando
    setIsDialogOpen(true);
  };

  const cerrarDialogo = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setUsuarioEditando(null);
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
    <div className={`min-h-screen p-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-7xl mx-auto rounded-xl shadow-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } overflow-hidden`}>
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Gestión de Usuarios
              </h1>
              <p className={`mt-1 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Administre los usuarios del sistema y sus permisos
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setIsEditing(false); // Reset editing state when closing
            }}>
              <DialogTrigger asChild>
                <Button onClick={abrirDialogoCrear} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg
                  transition-all duration-200 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Nuevo Usuario</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? 'Actualizar Usuario' : 'Crear Nuevo Usuario'}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing ? 
                      'Modifique los datos del usuario. La cédula no se puede editar.' :
                      'Complete los datos del usuario. Todos los campos son obligatorios.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nombres" className="text-right">
                      Nombres *
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
                      Apellidos *
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
                    <Tooltip content="La cédula debe ser válida y única en el sistema">
                      <Label htmlFor="cedula" className="text-right">
                        Cédula *
                      </Label>
                    </Tooltip>
                    <Input
                      id="cedula"
                      className={`col-span-3 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      value={nuevoUsuario.cedula}
                      onChange={(e) => {
                        if (!isEditing) {
                          setNuevoUsuario({...nuevoUsuario, cedula: e.target.value});
                          validarCampo('cedula', e.target.value);
                        }
                      }}
                      disabled={isEditing}
                      required
                    />
                    {errores.cedula && (
                      <span className="text-red-500 text-xs mt-1">{errores.cedula}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="usuario" className="text-right">
                      Usuario *
                    </Label>
                    <Input
                      id="usuario"
                      className="col-span-3"
                      value={nuevoUsuario.usuario}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="correo" className="text-right">
                      Correo *
                    </Label>
                    <Input
                      id="correo"
                      type="email"
                      className="col-span-3"
                      value={nuevoUsuario.correo}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})}
                      required
                    />
                  </div>
                  {!isEditing && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Contraseña *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        className="col-span-3"
                        value={nuevoUsuario.password}
                        onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                        required={!isEditing}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rol" className="text-right">
                      Rol *
                    </Label>
                    <Select
                      value={nuevoUsuario.rol}
                      onValueChange={handleRolChange}
                      disabled={isEditing && nuevoUsuario.rol === 'admin'} // No permitir cambios de rol para admins
                    >
                      <SelectTrigger className={`col-span-3 ${
                        isEditing && nuevoUsuario.rol === 'admin' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}>
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
                        Días de Vigencia *
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
                        required
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="estado" className="text-right">
                      Estado *
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
                  <Button variant="outline" onClick={cerrarDialogo}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={isEditing ? handleActualizarUsuario : handleCrearUsuario}
                    className={isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-6">
          <AlertasResumen />
        </div>
        <div className="p-6">
          <div className={`overflow-x-auto rounded-lg border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
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
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} 
                      className={`transition-colors duration-200 ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      }`}>
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
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    } italic`}>
                      {usuario.cedula} <span className="text-xs text-gray-400">(no editable)</span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`inline-flex items-center px-3 py-1 rounded-md ${
                            theme === 'dark' 
                              ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          onClick={() => abrirDialogoActualizar(usuario)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`inline-flex items-center px-3 py-1 rounded-md ${
                            theme === 'dark'
                              ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                          onClick={() => {
                            if (window.confirm('¿Está seguro de eliminar este usuario?')) {
                              handleEliminarUsuario(usuario.id);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}