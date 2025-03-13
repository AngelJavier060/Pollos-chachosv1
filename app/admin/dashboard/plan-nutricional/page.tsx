'use client';

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { toast } from "@/app/components/ui/use-toast";
import Link from 'next/link';
import { authService } from '@/app/lib/auth';
import { User, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RangoEdad {
  inicio: number;
  fin: number;
}

export default function PlanNutricionalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rangoEdad, setRangoEdad] = useState<string>('');
  const [editandoDia, setEditandoDia] = useState(false);

  const rangoExiste = (inicio: number, fin: number): boolean => {
    // Tu lógica de validación aquí
    return false;
  };

  const procesarRango = (rango: string) => {
    try {
      if (!rango.includes('-')) return null;
      const [inicio, fin] = rango.split('-').map(Number);
      if (isNaN(inicio) || isNaN(fin)) return null;
      return { inicio, fin };
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!editandoDia) {
        const resultado = procesarRango(rangoEdad || '');
        if (!resultado) {
          toast({
            title: "Error",
            description: "El rango de edad no es válido",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (rangoExiste(resultado.inicio, resultado.fin)) {
          toast({
            title: "Error",
            description: "Este rango ya existe",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (!formData.email || !formData.password) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await authService.login(formData.email, formData.password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "Credenciales incorrectas",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: `Inicio de sesión exitoso, ${data.user?.email}`,
      });
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar el rango de edad",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acceso Administrativo</h1>
          <p className="text-gray-600 mt-2">Ingrese sus credenciales para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
        
        <div className="text-center space-y-4">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="border-t pt-4">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}