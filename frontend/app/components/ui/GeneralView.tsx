'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/app/components/ui/card";
import { DashboardCharts } from '@/app/components/charts/DashboardCharts';
import { 
  Users, PiggyBank, Bird, DollarSign, 
  TrendingUp, ShoppingCart, AlertCircle, 
  Activity, Bell, ChevronUp, ChevronDown,
  Calendar, Clock
} from 'lucide-react';
import { api } from '@/app/lib/api';
import { toast } from "@/app/components/ui/use-toast";
import { CostosLineChart } from '@/app/components/charts/CostosLineChart';

interface DashboardStats {
  usuarios: {
    total: number;
    activos: number;
    porExpirar: number;
    conectados: number;
  };
  pollos: {
    total: number;
    activos: number;
    vendidos: number;
    costoTotal: number;
    ingresoTotal: number;
  };
  chanchos: {
    total: number;
    activos: number;
    vendidos: number;
    costoTotal: number;
    ingresoTotal: number;
  };
  finanzas: {
    inversionTotal: number;
    ingresoTotal: number;
    gananciaNeta: number;
  };
  notificaciones: {
    total: number;
    noLeidas: number;
  };
}

const initialStats: DashboardStats = {
  usuarios: { total: 0, activos: 0, porExpirar: 0, conectados: 0 },
  pollos: { total: 0, activos: 0, vendidos: 0, costoTotal: 0, ingresoTotal: 0 },
  chanchos: { total: 0, activos: 0, vendidos: 0, costoTotal: 0, ingresoTotal: 0 },
  finanzas: { inversionTotal: 0, ingresoTotal: 0, gananciaNeta: 0 },
  notificaciones: { total: 0, noLeidas: 0 }
};

export const GeneralView = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [actividadData, setActividadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inversionTotal, setInversionTotal] = useState(0);
  const [costosData, setCostosData] = useState([]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      // Obtener estadísticas de usuarios
      const usuariosData = await api.get('/usuarios/stats');
      
      setStats(prev => ({
        ...prev,
        usuarios: {
          total: usuariosData?.total ?? 0,
          activos: usuariosData?.activos ?? 0,
          conectados: usuariosData?.conectados ?? 0,
          porExpirar: usuariosData?.porExpirar ?? 0
        }
      }));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast({
        title: "Error",
        description: "Error al cargar estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    const interval = setInterval(cargarEstadisticas, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calcularInversion = async () => {
      try {
        const response = await api.get('/inventario/productos');
        const productos = response.data || []; // Asegurarnos de que tenemos un array
        
        // Solo sumar los costos unitarios
        let total = 0;
        if (Array.isArray(productos) && productos.length > 0) {
          productos.forEach((producto: any) => {
            if (producto.estado) {
              const precioUnitario = Number(producto.precio_unitario);
              total += precioUnitario;
              
              console.log('Precio unitario de:', producto.nombre, ':', precioUnitario);
            }
          });
        }

        console.log('Total de costos unitarios:', total);
        setInversionTotal(total);
        
        setStats(prev => ({
          ...prev,
          finanzas: {
            ...prev.finanzas,
            inversionTotal: total
          }
        }));
      } catch (error) {
        console.error('Error al calcular inversión:', error);
      }
    };

    calcularInversion();
  }, []);

  useEffect(() => {
    cargarCostosMensuales();
  }, []);

  const cargarCostosMensuales = async () => {
    try {
      const response = await api.get('/inventario/productos');
      const productos = Array.isArray(response.data) ? response.data : [];
      
      // Agrupar por mes y tipo de animal
      const costosPorMes = productos.reduce((acc: any[], producto: any) => {
        if (producto?.estado) {
          const fecha = new Date(producto.fecha_compra);
          acc.push({
            mes: fecha.getMonth(),
            tipo: producto.tipo_animal,
            monto: Number(producto.precio_unitario) || 0
          });
        }
        return acc;
      }, []);

      setCostosData(costosPorMes);
    } catch (error) {
      console.error('Error al cargar costos:', error);
      setCostosData([]); // Establecer un array vacío en caso de error
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando estadísticas...</div>;
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const costoTotal = costosData?.reduce((acc, costo) => acc + costo.monto, 0) ?? 0;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Encabezado del Dashboard */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-700 mt-2 text-lg">
          Bienvenido al panel de control de Granja Elvita
        </p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Estadísticas de Usuarios */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Usuarios</CardTitle>
            <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.usuarios.total}</div>
            <div className="flex items-center space-x-2 text-sm text-blue-100">
              <span className="flex items-center">
                <ChevronUp className="h-4 w-4" />
                {stats.usuarios.activos}
              </span>
              <span>activos</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {stats.usuarios.conectados}
              </span>
            </div>
            {stats.usuarios.porExpirar > 0 && (
              <div className="mt-2 text-sm flex items-center bg-white/20 rounded-full px-3 py-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {stats.usuarios.porExpirar} por expirar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas de Pollos */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Pollos</CardTitle>
            <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Bird className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pollos.total}</div>
            <div className="flex items-center justify-between text-sm text-emerald-100">
              <div className="flex items-center space-x-1">
                <span>{stats.pollos.activos}</span>
                <span>activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{stats.pollos.vendidos}</span>
                <span>vendidos</span>
              </div>
            </div>
            <div className="mt-3 text-sm bg-white/20 rounded-full px-3 py-1">
              {formatMoney(stats.pollos.ingresoTotal)}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Chanchos */}
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-100">Chanchos</CardTitle>
            <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.chanchos.total}</div>
            <div className="flex items-center justify-between text-sm text-rose-100">
              <div className="flex items-center space-x-1">
                <span>{stats.chanchos.activos}</span>
                <span>activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{stats.chanchos.vendidos}</span>
                <span>vendidos</span>
              </div>
            </div>
            <div className="mt-3 text-sm bg-white/20 rounded-full px-3 py-1">
              {formatMoney(stats.chanchos.ingresoTotal)}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Financieras */}
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-100">Finanzas</CardTitle>
            <div className="h-8 w-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(inversionTotal)}
            </div>
            <div className="text-sm text-violet-100">Inversión total</div>
            <div className="mt-3 flex items-center text-sm bg-white/20 rounded-full px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">+2.5%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas y Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Costos */}
        <Card className="bg-white backdrop-blur-lg bg-opacity-90 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Costos Unitarios
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Análisis mensual de costos</p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] p-4">
              <CostosLineChart data={costosData} />
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="bg-white backdrop-blur-lg bg-opacity-90 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notificaciones
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Actualizaciones recientes</p>
              </div>
              <div className="flex items-center space-x-3">
                {stats.notificaciones.noLeidas > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.notificaciones.noLeidas} nuevas
                  </span>
                )}
                <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <Calendar className="h-6 w-6 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Actualización del Sistema</p>
                  <p className="text-xs text-gray-600">Nueva versión disponible</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Alerta de Inventario</p>
                  <p className="text-xs text-gray-600">Stock bajo en alimentos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};