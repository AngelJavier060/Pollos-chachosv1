export interface PlanAlimentacion {
  id: number;  // Cambiado de string a number
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  edad_inicio: number;
  edad_fin: number;
  alimento_id: number;  // Cambiado de string a number
  alimento?: {
    id: number;  // Cambiado de string a number
    nombre: string;
  };
  consumo_diario: number;
  temperatura?: number;
  observaciones?: string;
  created_at?: string;
}

export interface PlanMedicacion {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  medicina_id: string;
  medicina: {
    id: string;
    nombre: string;
  };
  dosis_ml: number;
  dias_aplicacion: number;
  via_administracion: string;
  observaciones?: string;
}

export interface ProgramacionDiaria {
  id: string;
  tipo_animal: string;
  rango_edad: string;
  dia_semana: string;
  hora_manana: string;
  alimento_manana: string;
  cantidad_manana: number;
  hora_tarde: string;
  alimento_tarde: string;
  cantidad_tarde: number;
  medicina_id?: string;
  dosis_medicina?: number;
  hora_medicina?: string;
}

export interface PlanNutricional {
  id: number;
  tipo_animal: 'pollos' | 'chanchos';
  etapa: string;
  edad_inicio: number;
  edad_fin: number;
  producto_id: number;
  consumo_diario: number;
  temperatura: number;
  dosis_ml?: number | null;
  dias_aplicaci?: number | null;
  via_administr?: string | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
  producto_nombre?: string;
}
