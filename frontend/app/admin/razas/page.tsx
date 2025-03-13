'use client';

import { useState, useEffect } from 'react';
import { LotesView } from '@/app/components/LotesView';
import { supabase } from '@/app/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from "@/app/components/ui/use-toast";

export default function RazasPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        console.log('Iniciando carga de lotes...');
        const { data, error } = await supabase
          .from('lotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al cargar lotes:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los lotes",
            variant: "destructive",
          });
          return;
        }

        console.log('Lotes obtenidos:', data);
        setLotes(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando lotes...</span>
      </div>
    );
  }

  return <LotesView lotes={lotes} setLotes={setLotes} />;
}