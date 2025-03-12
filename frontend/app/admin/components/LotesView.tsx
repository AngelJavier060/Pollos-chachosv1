'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface Lote {
  id: string;
  tipo_animal: 'pollos' | 'chanchos';
  fecha_ingreso: string;
  cantidad: number;
  peso_inicial: number;
  estado: 'activo' | 'finalizado';
}

interface LotesViewProps {
  lotes: Lote[];
  onEdit?: (lote: Lote) => void;
  onDelete?: (id: string) => void;
}

function LotesView({ lotes, onEdit, onDelete }: LotesViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha Ingreso</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Peso Inicial</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell className="capitalize">{lote.tipo_animal}</TableCell>
              <TableCell>{new Date(lote.fecha_ingreso).toLocaleDateString()}</TableCell>
              <TableCell>{lote.cantidad}</TableCell>
              <TableCell>{lote.peso_inicial} kg</TableCell>
              <TableCell className="capitalize">{lote.estado}</TableCell>
              <TableCell className="space-x-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(lote)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(lote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Asegurarse que la exportación sea por defecto
export default LotesView;
