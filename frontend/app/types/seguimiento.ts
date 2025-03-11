export interface SeguimientoDiario {
  id: number;
  ciclo_id: number;
  fecha: string;
  consumo_alimento: number;
  peso_promedio: number;
  mortalidad: number;
  temperatura: number;
  humedad: number;
  medicacion_aplicada?: string;
  observaciones?: string;
  created_at: string;
  created_by: number;
}

export interface ResumenSeguimiento {
  consumo_total: number;
  mortalidad_total: number;
  peso_promedio: number;
  conversion_alimenticia: number;
  dias_ciclo: number;
}
