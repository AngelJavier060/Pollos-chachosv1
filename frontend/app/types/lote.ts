export interface Lote {
  id?: number;
  nombre: string;
  tipo_animal: 'pollo' | 'chancho';
  raza: string;
  cantidad: number;
  fecha_nacimiento: string;
  costo: number;
  created_at?: string;
  updated_at?: string;
}
