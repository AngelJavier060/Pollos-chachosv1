export interface PlanNutricional {
  id?: number;
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  edad_inicio: number;
  edad_fin: number;
  producto_id: number;
  consumo_diario: number;
  temperatura: number;
  created_at?: string;
  updated_at?: string;
}

export type NuevoPlanNutricional = Omit<PlanNutricional, 'id' | 'created_at' | 'updated_at'>;
