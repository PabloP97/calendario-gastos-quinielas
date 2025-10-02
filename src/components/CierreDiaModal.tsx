import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TransaccionQuiniela } from "../types";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface CierreDiaData {
  recaudacion: number;
  retencion: number;
  caducos: number;
  comision: number;
  premios: number;
}

interface CierreDiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (transacciones: TransaccionQuiniela[]) => Promise<void>;
  fecha: string;
  juegoNombre: string;
}

export function CierreDiaModal({ isOpen, onClose, onConfirmar, fecha, juegoNombre }: CierreDiaModalProps) {
  const [datos, setDatos] = useState<CierreDiaData>({
    recaudacion: 0,
    retencion: 0,
    caducos: 0,
    comision: 0,
    premios: 0
  });

  const [errors, setErrors] = useState<Partial<CierreDiaData>>({});

  const handleInputChange = (field: keyof CierreDiaData, value: string) => {
    // Manejar valor vacío
    if (value === '' || value === '-') {
      setDatos(prev => ({
        ...prev,
        [field]: 0
      }));
      return;
    }
    
    // Convertir a número, permitiendo negativos
    const numericValue = parseFloat(value);
    
    // Solo actualizar si es un número válido
    if (!isNaN(numericValue)) {
      setDatos(prev => ({
        ...prev,
        [field]: numericValue
      }));
    }
    
    // Limpiar error del campo al editarlo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CierreDiaData> = {};
    
    // La recaudación puede ser cualquier número (positivo, negativo o cero)
    // Solo verificamos que sea un número válido
    if (isNaN(datos.recaudacion)) {
      newErrors.recaudacion = 0;
    }
    
    // Los egresos pueden ser 0, pero no negativos
    if (datos.retencion < 0) newErrors.retencion = 0;
    if (datos.caducos < 0) newErrors.caducos = 0;
    if (datos.comision < 0) newErrors.comision = 0;
    if (datos.premios < 0) newErrors.premios = 0;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularBalance = (): number => {
    const totalEgresos = datos.retencion + datos.caducos + datos.comision + datos.premios;
    return datos.recaudacion - totalEgresos;
  };

  const calcularTotalEgresos = (): number => {
    return datos.retencion + datos.caducos + datos.comision + datos.premios;
  };

  const handleConfirmar = async () => {
    if (!validateForm()) {
      return;
    }


    const transacciones: TransaccionQuiniela[] = [];
    const baseId = Date.now();
    let idCounter = 0;

    // Agregar ingreso de recaudación (puede ser positivo, negativo o cero)
    if (datos.recaudacion !== 0) {
      transacciones.push({
        id: baseId + (idCounter++),
        tipo: datos.recaudacion >= 0 ? 'ingreso' : 'egreso',
        categoria: 'Recaudación',
        monto: Math.abs(datos.recaudacion),
        descripcion: `Cierre del día - Recaudación ${datos.recaudacion >= 0 ? 'total' : '(pérdida)'}`,
        fecha,
        fuente: juegoNombre
      });
    }

    // Agregar egresos (solo si son mayores a 0)
    if (datos.retencion > 0) {
      transacciones.push({
        id: baseId + (idCounter++),
        tipo: 'egreso',
        categoria: 'Retención',
        monto: datos.retencion,
        descripcion: 'Cierre del día - Retención',
        fecha,
        fuente: juegoNombre
      });
    }

    if (datos.caducos > 0) {
      transacciones.push({
        id: baseId + (idCounter++),
        tipo: 'egreso',
        categoria: 'Caducos',
        monto: datos.caducos,
        descripcion: 'Cierre del día - Caducos',
        fecha,
        fuente: juegoNombre
      });
    }

    if (datos.comision > 0) {
      transacciones.push({
        id: baseId + (idCounter++),
        tipo: 'egreso',
        categoria: 'Comisión',
        monto: datos.comision,
        descripcion: 'Cierre del día - Comisión',
        fecha,
        fuente: juegoNombre
      });
    }

    if (datos.premios > 0) {
      transacciones.push({
        id: baseId + (idCounter++),
        tipo: 'egreso',
        categoria: 'Premios',
        monto: datos.premios,
        descripcion: 'Cierre del día - Premios pagados',
        fecha,
        fuente: juegoNombre
      });
    }


    // TODO: SP_INSERT_BULK - Las transacciones se insertan en DayDetailsPanel.agregarTransaccionesQuiniela
    // que llamará a EXEC SP_InsertTransaccionesQuiniela @transacciones_json = ?, @usuario_id = ?
    
    await onConfirmar(transacciones);
    handleClose();
  };

  const handleClose = () => {
    // Resetear el formulario
    setDatos({
      recaudacion: 0,
      retencion: 0,
      caducos: 0,
      comision: 0,
      premios: 0
    });
    setErrors({});
    onClose();
  };

  const balance = calcularBalance();
  const totalEgresos = calcularTotalEgresos();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-green-600" />
            Cierre del Día - {juegoNombre}
          </DialogTitle>
          <DialogDescription>
            Registra los ingresos y egresos del cierre diario de {juegoNombre}. Solo ingresa los montos que correspondan al día.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen Superior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Resumen del Cierre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Ingresos</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${datos.recaudacion.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">Egresos</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    ${totalEgresos.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calculator className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">Balance</span>
                  </div>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balance.toLocaleString()}
                  </p>
                  <Badge 
                    variant={balance >= 0 ? "default" : "destructive"}
                    className={balance >= 0 ? "bg-green-500" : ""}
                  >
                    {balance >= 0 ? "Positivo" : "Déficit"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Ingresos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recaudacion" className="mb-2 block">Recaudación Total *</Label>
                  <Input
                    id="recaudacion"
                    type="number"
                    step="0.01"
                    value={datos.recaudacion}
                    onChange={(e) => handleInputChange('recaudacion', e.target.value)}
                    placeholder="Ingrese la recaudación (puede ser negativa)"
                    className={errors.recaudacion !== undefined ? "border-red-500" : ""}
                  />
                  {errors.recaudacion !== undefined && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Ingrese un valor numérico válido
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Egresos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-5 w-5" />
                Egresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retencion" className="mb-2 block">Retención</Label>
                  <Input
                    id="retencion"
                    type="number"
                    min="0"
                    step="0.01"
                    value={datos.retencion}
                    onChange={(e) => handleInputChange('retencion', e.target.value)}
                    placeholder="0.00"
                    className={errors.retencion !== undefined ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="caducos" className="mb-2 block">Caducos</Label>
                  <Input
                    id="caducos"
                    type="number"
                    min="0"
                    step="0.01"
                    value={datos.caducos}
                    onChange={(e) => handleInputChange('caducos', e.target.value)}
                    placeholder="0.00"
                    className={errors.caducos !== undefined ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="comision" className="mb-2 block">Comisión</Label>
                  <Input
                    id="comision"
                    type="number"
                    min="0"
                    step="0.01"
                    value={datos.comision}
                    onChange={(e) => handleInputChange('comision', e.target.value)}
                    placeholder="0.00"
                    className={errors.comision !== undefined ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="premios" className="mb-2 block">Premios</Label>
                  <Input
                    id="premios"
                    type="number"
                    min="0"
                    step="0.01"
                    value={datos.premios}
                    onChange={(e) => handleInputChange('premios', e.target.value)}
                    placeholder="0.00"
                    className={errors.premios !== undefined ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                * Los campos de egresos son opcionales. Ingrese solo los que correspondan.
              </p>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmar}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Cierre
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}