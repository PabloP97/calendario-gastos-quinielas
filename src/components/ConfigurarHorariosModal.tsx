import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Clock, Save, RotateCcw } from "lucide-react";

interface QuinielaModalidad {
  id: number;
  name: string;
  icon: any;
  description: string;
  horario: string;
  horarioInicio: string;
  horarioFin: string;
}

interface ConfigurarHorariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalidades: QuinielaModalidad[];
  onGuardarHorarios: (modalidades: QuinielaModalidad[]) => void;
}

export function ConfigurarHorariosModal({
  isOpen,
  onClose,
  modalidades,
  onGuardarHorarios,
}: ConfigurarHorariosModalProps) {
  const [horariosEditados, setHorariosEditados] = useState<QuinielaModalidad[]>([]);
  const [errores, setErrores] = useState<Record<number, string>>({});

  // Inicializar con los horarios actuales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setHorariosEditados([...modalidades]);
      setErrores({});
    }
  }, [isOpen, modalidades]);

  // Validar formato de hora (HH:MM)
  const validarHorario = (horario: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(horario);
  };

  // Convertir horario string a minutos para comparación
  const horarioAMinutos = (horario: string): number => {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
  };

  // Formatear horario de 24h a formato display (HH:MM AM/PM)
  const formatearHorarioDisplay = (horario24: string): string => {
    const [horas, minutos] = horario24.split(':').map(Number);
    const periodo = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
    return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  };

  // Validar todos los horarios
  const validarHorarios = (modalidades: QuinielaModalidad[]): Record<number, string> => {
    const nuevosErrores: Record<number, string> = {};

    modalidades.forEach((modalidad) => {
      // Validar formato
      if (!validarHorario(modalidad.horarioInicio)) {
        nuevosErrores[modalidad.id] = `Horario de inicio inválido en ${modalidad.name}`;
        return;
      }
      if (!validarHorario(modalidad.horarioFin)) {
        nuevosErrores[modalidad.id] = `Horario de fin inválido en ${modalidad.name}`;
        return;
      }

      // Validar que inicio < fin
      const inicioMinutos = horarioAMinutos(modalidad.horarioInicio);
      const finMinutos = horarioAMinutos(modalidad.horarioFin);

      if (inicioMinutos >= finMinutos) {
        nuevosErrores[modalidad.id] = `En ${modalidad.name}: el horario de inicio debe ser anterior al de fin`;
      }
    });

    // Validar solapamientos entre modalidades
    for (let i = 0; i < modalidades.length; i++) {
      for (let j = i + 1; j < modalidades.length; j++) {
        const modal1 = modalidades[i];
        const modal2 = modalidades[j];

        const inicio1 = horarioAMinutos(modal1.horarioInicio);
        const fin1 = horarioAMinutos(modal1.horarioFin);
        const inicio2 = horarioAMinutos(modal2.horarioInicio);
        const fin2 = horarioAMinutos(modal2.horarioFin);

        // Verificar solapamiento
        if ((inicio1 < fin2 && fin1 > inicio2)) {
          nuevosErrores[modal1.id] = `${modal1.name} se solapa con ${modal2.name}`;
          nuevosErrores[modal2.id] = `${modal2.name} se solapa con ${modal1.name}`;
        }
      }
    }

    return nuevosErrores;
  };

  const handleHorarioChange = (modalidadId: number, campo: 'horarioInicio' | 'horarioFin', valor: string) => {
    const nuevasModalidades = horariosEditados.map((modalidad) => {
      if (modalidad.id === modalidadId) {
        const modalidadActualizada = { ...modalidad, [campo]: valor };
        
        // Si estamos cambiando el horario de fin, actualizar también el horario display
        if (campo === 'horarioFin') {
          modalidadActualizada.horario = formatearHorarioDisplay(valor);
        }
        
        return modalidadActualizada;
      }
      return modalidad;
    });

    setHorariosEditados(nuevasModalidades);
    
    // Limpiar errores existentes para esta modalidad
    const nuevosErrores = { ...errores };
    delete nuevosErrores[modalidadId];
    setErrores(nuevosErrores);
  };

  const handleGuardar = () => {
    const nuevosErrores = validarHorarios(horariosEditados);
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // TODO: SP_UPDATE - Guardar configuración de horarios en base de datos
    // EXEC SP_UpdateHorariosQuiniela @horarios_json = ?, @usuario_id = ?
    
    onGuardarHorarios(horariosEditados);
    onClose();
  };

  const handleRestaurarDefecto = () => {
    const horariosDefecto: QuinielaModalidad[] = [
      { ...modalidades[0], horarioInicio: "09:00", horarioFin: "11:30", horario: "11:30 AM" },
      { ...modalidades[1], horarioInicio: "12:00", horarioFin: "14:00", horario: "2:00 PM" },
      { ...modalidades[2], horarioInicio: "15:30", horarioFin: "17:30", horario: "5:30 PM" },
      { ...modalidades[3], horarioInicio: "18:00", horarioFin: "20:00", horario: "8:00 PM" },
      { ...modalidades[4], horarioInicio: "20:30", horarioFin: "21:30", horario: "9:30 PM" },
    ];
    
    setHorariosEditados(horariosDefecto);
    setErrores({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Configurar Horarios de Quiniela
          </DialogTitle>
          <DialogDescription>
            Ajusta los horarios de apertura y cierre para cada modalidad de sorteo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {horariosEditados.map((modalidad) => (
            <Card key={modalidad.id} className={errores[modalidad.id] ? "border-destructive" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <modalidad.icon className="h-5 w-5 text-primary" />
                  {modalidad.name}
                  <span className="text-muted-foreground text-sm font-normal">
                    ({modalidad.description})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`inicio-${modalidad.id}`}>
                      Horario de Apertura
                    </Label>
                    <Input
                      id={`inicio-${modalidad.id}`}
                      type="time"
                      value={modalidad.horarioInicio}
                      onChange={(e) => handleHorarioChange(modalidad.id, 'horarioInicio', e.target.value)}
                      className={errores[modalidad.id] ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fin-${modalidad.id}`}>
                      Horario de Cierre
                    </Label>
                    <Input
                      id={`fin-${modalidad.id}`}
                      type="time"
                      value={modalidad.horarioFin}
                      onChange={(e) => handleHorarioChange(modalidad.id, 'horarioFin', e.target.value)}
                      className={errores[modalidad.id] ? "border-destructive" : ""}
                    />
                  </div>
                </div>
                
                {errores[modalidad.id] && (
                  <p className="text-destructive text-sm mt-2">
                    {errores[modalidad.id]}
                  </p>
                )}
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Horario resultante:</strong> Disponible desde {modalidad.horarioInicio} hasta {modalidad.horario}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(errores).length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="text-destructive font-medium mb-2">Hay errores que corregir:</h4>
            <ul className="text-sm text-destructive space-y-1">
              {Object.values(errores).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleRestaurarDefecto}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Horarios por Defecto
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardar}
              disabled={Object.keys(errores).length > 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}