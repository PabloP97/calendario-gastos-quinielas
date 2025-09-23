import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { DollarSign, Save, X } from "lucide-react";
import { Gasto, TransaccionQuiniela } from "../types";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Gasto | TransaccionQuiniela | null;
  type: 'gasto' | 'transaccion';
  onSave: (item: Gasto | TransaccionQuiniela) => void;
}

export function EditTransactionModal({ isOpen, onClose, item, type, onSave }: EditTransactionModalProps) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Función para convertir a número de forma segura
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  useEffect(() => {
    if (item) {
      setMonto(toNumber(item.monto).toString());
      setDescripcion(item.descripcion);
    } else {
      setMonto("");
      setDescripcion("");
    }
  }, [item]);

  const handleSave = () => {
    if (!item || !monto || !descripcion) return;

    const updatedItem = {
      ...item,
      monto: parseFloat(monto),
      descripcion: descripcion.trim()
    };

    onSave(updatedItem);
    // No cerrar aquí - el componente padre se encarga de cerrar y mostrar confirmación
  };

  const handleClose = () => {
    setMonto("");
    setDescripcion("");
    onClose();
  };

  if (!item) return null;

  const isTransaccion = type === 'transaccion';
  const transaccion = isTransaccion ? item as TransaccionQuiniela : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Editar {isTransaccion ? 'Transacción' : 'Gasto'}
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del {isTransaccion ? 'registro de transacción' : 'gasto'} seleccionado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isTransaccion && transaccion && (
            <div className="space-y-2">
              <Label>Información de la transacción</Label>
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Tipo:</span> {transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Categoría:</span> {transaccion.categoria}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Fuente:</span> {transaccion.fuente}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Fecha:</span> {transaccion.fecha}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-monto">Monto ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-monto"
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="pl-10"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-descripcion">Descripción</Label>
            <Textarea
              id="edit-descripcion"
              placeholder="Descripción del gasto o transacción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!monto || !descripcion}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}