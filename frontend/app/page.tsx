"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu";
import { Bird, Rat, Search, Lock, Menu, X } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = (type?: string) => {
    if (type) {
      localStorage.setItem('userType', type);
    }
    
    if (type === "pollos") {
      router.push('/auth/pollo');
    } else if (type === "chanchos") {
      router.push('/auth/chancho');
    } else {
      router.push('/auth/admin');
    }
  };

  const navItems = [
    { label: "Programas y Soluciones", href: "#" },
    { label: "Sectores", href: "#" },
    { label: "Investigación e Innovación", href: "#" },
    { label: "Soporte", href: "#" },
    { label: "Mail", href: "#" },
  ];

  return (
    <div className="min-h-screen">
      {/* Barra superior - Actualizada */}
      <div className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-blue-900/95 backdrop-blur-sm shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <img
                src="/images/logo1.webp"
                alt="Logo"
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold text-white">
                Granja Elvita
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-white hover:text-yellow-300 transition-colors duration-200 text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
              <div className="relative">
                <Button
                  onClick={() => setShowDropdown(!showDropdown)}
                  variant="ghost"
                  className="text-white hover:text-yellow-300 hover:bg-blue-700/50"
                >
                  Intranet
                </Button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-2 text-black z-50 min-w-[200px]">
                    <Button
                      onClick={() => handleLoginClick("admin")}
                      variant="ghost"
                      className="w-full justify-start mb-1 hover:bg-gray-100"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Administrador
                    </Button>
                    <Button
                      onClick={() => handleLoginClick("pollos")}
                      variant="ghost"
                      className="w-full justify-start mb-1 hover:bg-gray-100"
                    >
                      <Bird className="mr-2 h-4 w-4" />
                      Pollos
                    </Button>
                    <Button
                      onClick={() => handleLoginClick("chanchos")}
                      variant="ghost"
                      className="w-full justify-start hover:bg-gray-100"
                    >
                      <Rat className="mr-2 h-4 w-4" />
                      Chanchos
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-96 border-t border-blue-700' : 'max-h-0'
            }`}
          >
            <div className="px-4 py-2 space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.label}
                </a>
              ))}
              <Button
                onClick={() => handleLoginClick("admin")}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-blue-700"
              >
                <Lock className="mr-2 h-4 w-4" />
                Administrador
              </Button>
              <Button
                onClick={() => handleLoginClick("pollos")}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-blue-700"
              >
                <Bird className="mr-2 h-4 w-4" />
                Pollos
              </Button>
              <Button
                onClick={() => handleLoginClick("chanchos")}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-blue-700"
              >
                <Rat className="mr-2 h-4 w-4" />
                Chanchos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Mejorado */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/cerdito1.jpg"
            alt="Producción de Cerdos"
            className="w-full h-full object-cover scale-105"
          />
          <div className="hero-overlay" />
        </div>
        <div className="relative h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-up">
              Granja Elvita
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-12 animate-fade-up animate-delay-150">
              Innovación y Excelencia en la 
              <span className="text-yellow-400 font-semibold"> Producción Agropecuaria</span>
            </p>
            <div className="flex gap-4 justify-center animate-fade-up animate-delay-300">
              <Button 
                onClick={() => handleLoginClick("pollos")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Comenzar Ahora
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Saber Más
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Características principales - Actualizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Nuestras Características</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Gestión Eficiente</h3>
              <p className="text-gray-600">Control total de inventario y seguimiento detallado de la producción animal.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Análisis Avanzado</h3>
              <p className="text-gray-600">Estadísticas detalladas y reportes personalizados para optimizar la producción.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 card-hover">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Control Total</h3>
              <p className="text-gray-600">Monitoreo en tiempo real de alimentación, peso y salud de los animales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de tarjetas */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Tarjeta de Cerdos */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
              <img
                src="/images/cerdito2.jpg"
                alt="Producción de Cerdos"
                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-4">Producción de Cerdos</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Gestiona toda la información sobre la producción de cerdos: inventarios,
                  alimentación, y datos de crecimiento con precisión y eficiencia.
                </p>
                <Button 
                  onClick={() => handleLoginClick("chanchos")}
                  className="mt-6 bg-white text-gray-900 hover:bg-gray-100"
                >
                  Acceder al Sistema
                </Button>
              </div>
            </div>

            {/* Tarjeta de Pollos */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
              <img
                src="/images/pollo1.jpg"
                alt="Producción de Pollos"
                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-4">Producción de Pollos</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Administra toda la producción de pollos con herramientas avanzadas
                  diseñadas para maximizar el rendimiento y la eficiencia.
                </p>
                <Button 
                  onClick={() => handleLoginClick("pollos")}
                  className="mt-6 bg-white text-gray-900 hover:bg-gray-100"
                >
                  Acceder al Sistema
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas */}
      <section className="bg-gradient-to-br from-gray-900 to-blue-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
            <div className="p-6">
              <h2 className="text-5xl font-bold text-white mb-4">575</h2>
              <p className="text-gray-300 text-lg">Personal Activo / Calificado</p>
            </div>
            <div className="p-6">
              <h2 className="text-5xl font-bold text-white mb-4">457</h2>
              <p className="text-gray-300 text-lg">Equipos & Maquinaria</p>
            </div>
            <div className="p-6">
              <h2 className="text-5xl font-bold text-white mb-4">688</h2>
              <p className="text-gray-300 text-lg">Clientes Satisfechos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer con información de contacto */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img src="/images/logo1.webp" alt="Logo" className="h-10 w-auto" />
                <h4 className="text-xl font-bold text-white">Granja Elvita</h4>
              </div>
              <p className="text-gray-400 mb-4">
                Liderando la innovación en la gestión agropecuaria con soluciones
                tecnológicas avanzadas para el control y optimización de la producción.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@granjaelvita.com
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (123) 456-7890
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Soporte Técnico
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p> 2025 Granja Elvita. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
