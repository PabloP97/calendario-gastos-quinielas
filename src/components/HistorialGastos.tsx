import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { EditTransactionModal } from "./EditTransactionModal";
import { useState } from "react";
import { Gasto } from "../types";
import { 
  History,
  TrendingDown,
  Clock,
  Trash2,
  Receipt,
  Edit,
  AlertCircle
} from "lucide-react";

interface HistorialGastosProps {
  gastos: Gasto[];
  onEliminarGasto: (id: number) => Promise<void>;
  onEditarGasto: (gasto: Gasto) => Promise<void>;
  isEditable?: boolean;
  showConfirmation?: (action: any) => void;
  getEtiquetaGasto?: (gasto: Gasto) => string;
}

export function HistorialGastos({ gastos, onEliminarGasto, onEditarGasto, isEditable = true, showConfirmation, getEtiquetaGasto }: HistorialGastosProps) {
  const [gastoAEditar, setGastoAEditar] = useState<Gasto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Función para convertir a número de forma segura
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  
  const totalGastos = gastos.reduce((sum, gasto) => sum + toNumber(gasto.monto), 0);
  const cantidadGastos = gastos.length;

  const handleEditarGasto = (gasto: Gasto) => {
    // Abrir directamente el modal de edición
    setGastoAEditar(gasto);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (gastoEditado: Gasto) => {
    // Cerrar el modal de edición primero
    setIsEditModalOpen(false);
    setGastoAEditar(null);
    
    // Mostrar el modal de confirmación para guardar
    if (showConfirmation) {
      showConfirmation({
        type: 'edit',
        title: 'Confirmar Cambios',
        description: '¿Estás seguro de que quieres guardar los cambios realizados?',
        data: gastoEditado,
        onConfirm: async () => {
          await onEditarGasto(gastoEditado);
        }
      });
    } else {
      await onEditarGasto(gastoEditado);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setGastoAEditar(null);
  };

  const handleEliminarGasto = (gasto: Gasto) => {
    if (showConfirmation) {
      showConfirmation({
        type: 'delete',
        title: 'Eliminar Gasto',
        description: '¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.',
        data: gasto,
        onConfirm: async () => await onEliminarGasto(gasto.id)
      });
    } else {
      if (confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
        onEliminarGasto(gasto.id);
      }
    }
  };

  if (gastos.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="mb-2">No hay gastos registrados</h3>
        <p className="text-muted-foreground">
{isEditable 
            ? 'Ve a la pestaña "Agregar Gasto" para registrar tu primer gasto del día.'
            : 'No se registraron gastos en este día.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Total Gastado</span>
            </div>
            <p className="text-destructive">${totalGastos.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Transacciones</span>
            </div>
            <p>{cantidadGastos}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Promedio</span>
            </div>
            <p>${cantidadGastos > 0 ? (totalGastos / cantidadGastos).toFixed(2) : '0.00'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista detallada de gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gastos.map((gasto, index) => (
              <div 
                key={gasto.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{getEtiquetaGasto ? getEtiquetaGasto(gasto) : gasto.descripcion}</p>
                    {getEtiquetaGasto && gasto.descripcion !== getEtiquetaGasto(gasto) && (
                      <p className="text-muted-foreground text-sm">{gasto.descripcion}</p>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{gasto.fecha}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-destructive">
                    -${toNumber(gasto.monto).toFixed(2)}
                  </Badge>
                  {isEditable && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarGasto(gasto)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        title="Editar gasto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminarGasto(gasto)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

{/* Acciones adicionales - Solo mostrar si es editable */}
      {isEditable && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4>Gestión de Gastos</h4>
                <p className="text-muted-foreground">Acciones rápidas para el día</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (showConfirmation) {
                      showConfirmation({
                        type: 'delete',
                        title: 'Eliminar Todos los Gastos',
                        description: `¿Estás seguro de que quieres eliminar todos los ${gastos.length} gastos del día? Esta acción no se puede deshacer.`,
                        onConfirm: async () => {
          for (const gasto of gastos) {
            await onEliminarGasto(gasto.id);
          }
        }
                      });
                    } else {
                      if (confirm("¿Estás seguro de que quieres eliminar todos los gastos del día?")) {
                        for (const gasto of gastos) {
          await onEliminarGasto(gasto.id);
        }
                      }
                    }
                  }}
                  disabled={gastos.length === 0}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Todo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de edición */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={gastoAEditar}
        type="gasto"
        onSave={handleSaveEdit}
      />
    </div>
  );
}