'use client';

import { useEffect, useState } from 'react';
import { Users, Package, BarChart, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    usuarios: 150,
    lotes: 45,
    inventario: 892,
    produccion: 1234
  });

  const cards = [
    {
      title: 'Usuarios Activos',
      value: stats.usuarios,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      changeValue: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Lotes Activos',
      value: stats.lotes,
      icon: <Package className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
      changeValue: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Items en Inventario',
      value: stats.inventario,
      icon: <BarChart className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      changeValue: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Producción Total',
      value: stats.produccion,
      icon: <Activity className="h-6 w-6 text-orange-600" />,
      bgColor: 'bg-orange-50',
      changeValue: '+15%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500">Bienvenido de vuelta, Admin</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Sistema Actualizado
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`${card.bgColor} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600">
                  {card.title}
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    {card.value.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.changeValue}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel de Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividades Recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {/* Lista de actividades */}
          </div>
        </div>

        {/* Panel de Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notificaciones
          </h3>
          <div className="space-y-4">
            {/* Lista de notificaciones */}
          </div>
        </div>
      </div>
    </div>
  );
}
