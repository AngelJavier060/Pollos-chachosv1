'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { 
  Home, Users, Package, Settings, FileText, DogIcon, LogOut,
  Utensils, ChevronDown, Bell, Search
} from 'lucide-react';
import { authService } from '@/app/lib/auth';
import { useState } from 'react';

const navigationItems = [
  { label: "General", href: "/admin/dashboard", icon: Home },
  { label: "Usuarios", href: "/admin/dashboard/usuarios", icon: Users },
  { label: "Registro de Lotes", href: "/admin/dashboard/razas", icon: DogIcon },
  { label: "Inventario", href: "/admin/dashboard/inventario", icon: Package },
  { label: "Plan Nutricional", href: "/admin/dashboard/plan-nutricional", icon: Utensils },
  { label: "Configuración", href: "/admin/dashboard/configuracion", icon: Settings },
  { label: "Reportes", href: "/admin/dashboard/reportes", icon: FileText },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [notifications] = useState(3); // Número de ejemplo para notificaciones

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/auth/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Búsqueda */}
          <div className="flex items-center flex-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">GE</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Granja Elvita
                </span>
                <span className="text-sm text-gray-500 block">Panel Administrador</span>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="ml-8 max-w-lg flex-1 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Navegación Principal */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      pathname === item.href
                        ? "text-blue-600"
                        : "text-gray-400"
                    )} />
                    <span>{item.label}</span>
                  </div>
                  {pathname === item.href && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <Button variant="ghost" className="relative p-2">
              <Bell className="h-5 w-5 text-gray-500" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Separador */}
            <div className="h-6 w-px bg-gray-200" />

            {/* Botón de Salir */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
