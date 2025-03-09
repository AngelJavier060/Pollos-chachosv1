'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { DatePickerWithRange } from "@/app/components/ui/date-range-picker";
import { ScrollArea } from "@/app/components/ui/scroll-area";

interface HistoryEntry {
  id: string;
  productId: string;
  productName: string;
  action: 'entrada' | 'salida' | 'ajuste' | 'cierre_ciclo' | 'inicio_ciclo';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
  userId: string;
  userName: string;
}

export const InventoryHistory = () => {
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>();
  const [filterType, setFilterType] = React.useState<string>("all");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historial de Inventario</CardTitle>
        <CardDescription>
          Registro histórico de movimientos y ciclos de inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <DatePickerWithRange 
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
              <SelectItem value="cierre_ciclo">Cierre de Ciclo</SelectItem>
              <SelectItem value="inicio_ciclo">Inicio de Ciclo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Exportar
          </Button>
        </div>

        <ScrollArea className="h-[500px] rounded-md border p-4">
          <div className="space-y-4">
            {/* Aquí irían los registros del historial */}
            <HistoryCard
              entry={{
                id: "1",
                productId: "1",
                productName: "Arrocillo",
                action: "cierre_ciclo",
                quantity: 0,
                previousStock: 100,
                newStock: 0,
                date: new Date().toISOString(),
                reason: "Fin de ciclo de producción",
                userId: "1",
                userName: "Admin"
              }}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const HistoryCard = ({ entry }: { entry: HistoryEntry }) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'entrada': return 'text-green-600';
      case 'salida': return 'text-red-600';
      case 'cierre_ciclo': return 'text-orange-600';
      case 'inicio_ciclo': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{entry.productName}</h4>
          <p className={`text-sm ${getActionColor(entry.action)}`}>
            {entry.action.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>Razón: {entry.reason}</p>
        <p>Stock anterior: {entry.previousStock} → Nuevo stock: {entry.newStock}</p>
        <p className="text-xs text-gray-500 mt-1">Realizado por: {entry.userName}</p>
      </div>
    </div>
  );
};

export default InventoryHistory;
