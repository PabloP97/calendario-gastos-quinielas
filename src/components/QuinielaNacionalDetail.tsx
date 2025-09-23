import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CierreDiaModal } from "./CierreDiaModal";
import { EditTransactionModal } from "./EditTransactionModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { ConfigurarHorariosModal } from "./ConfigurarHorariosModal";
import { useConfirmation } from "./ui/use-confirmation";
import { useState, useEffect } from "react";
import { QuinielaModalidad, TransaccionQuiniela } from "../types";
import { 
  ArrowLeft, 
  ChevronRight,
  Sunrise,
  Sun,
  Sunset,
  SunMedium,
  Moon,
  Clock,
  Lock,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2
} from "lucide-react";

const modalidadesQuiniela: QuinielaModalidad[] = [
  { 
    id: 1, 
    name: "La Primera", 
    icon: Sunrise, 
    description: "Primer sorteo del día",
    horario: "11:30 AM",
    horarioInicio: "09:00",
    horarioFin: "11:30"
  },
  { 
    id: 2, 
    name: "Matutina", 
    icon: Sun, 
    description: "Sorteo matutino",
    horario: "14:00 PM",
    horarioInicio: "12:00",
    horarioFin: "14:00"
  },
  { 
    id: 3, 
    name: "Vespertina", 
    icon: Sunset, 
    description: "Sorteo vespertino",
    horario: "17:30 PM",
    horarioInicio: "15:30",
    horarioFin: "17:30"
  },
  { 
    id: 4, 
    name: "De la Tarde", 
    icon: SunMedium, 
    description: "Sorteo de la tarde",
    horario: "20:00 PM",
    horarioInicio: "18:00",
    horarioFin: "20:00"
  },
  { 
    id: 5, 
    name: "Nocturna", 
    icon: Moon, 
    description: "Sorteo nocturno",
    horario: "21:30 PM",
    horarioInicio: "20:30",
    horarioFin: "21:30"
  },
];

interface QuinielaNacionalDetailProps {
  onVolver: () => void;
  onAgregarTransaccion: (transaccion: TransaccionQuiniela) => Promise<void>;
  onEliminarTransaccion: (id: number) => Promise<void>;
  onEditarTransaccion: (transaccion: TransaccionQuiniela) => Promise<void>;
  transacciones: TransaccionQuiniela[];
  isEditable: boolean;
}

export function QuinielaNacionalDetail({ onVolver, onAgregarTransaccion, onEliminarTransaccion, onEditarTransaccion, transacciones, isEditable }: QuinielaNacionalDetailProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showHorariosModal, setShowHorariosModal] = useState(false);
  const [modalidadesActuales, setModalidadesActuales] = useState<QuinielaModalidad[]>(modalidadesQuiniela);
  const [transaccionAEditar, setTransaccionAEditar] = useState<TransaccionQuiniela | null>(null);
  const { isOpen, currentAction, showConfirmation, hideConfirmation } = useConfirmation();

  // Función para convertir a número de forma segura
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Actualizar la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Función para verificar si una modalidad está disponible
  const isModalidadDisponible = (modalidad: QuinielaModalidad): boolean => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convertir horarios a formato 24h para comparación
    const [inicioHour, inicioMinute] = modalidad.horarioInicio.split(':').map(Number);
    const [finHour, finMinute] = modalidad.horarioFin.split(':').map(Number);
    
    const inicioMinutos = inicioHour * 60 + inicioMinute;
    const finMinutos = finHour * 60 + finMinute;
    const currentMinutos = currentHour * 60 + currentMinute;
    
    return currentMinutos >= inicioMinutos && currentMinutos <= finMinutos;
  };

  // Obtener próxima modalidad disponible
  const getProximaModalidad = (): QuinielaModalidad | null => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutos = currentHour * 60 + currentMinute;
    
    for (const modalidad of modalidadesActuales) {
      const [inicioHour, inicioMinute] = modalidad.horarioInicio.split(':').map(Number);
      const inicioMinutos = inicioHour * 60 + inicioMinute;
      
      if (currentMinutos < inicioMinutos) {
        return modalidad;
      }
    }
    
    // Si ya pasaron todas las modalidades del día, la próxima es La Primera del día siguiente
    return modalidadesActuales[0];
  };

  const proximaModalidad = getProximaModalidad();

  // Contar modalidades disponibles
  const modalidadesDisponibles = modalidadesActuales.filter(modalidad => 
    isModalidadDisponible(modalidad)
  ).length;

  const getEstadoGeneral = () => {
    const modalidadesActivas = modalidadesActuales.filter(modalidad => 
      isModalidadDisponible(modalidad)
    );
    
    if (modalidadesDisponibles === 0) {
      return { 
        texto: "Todas Cerradas", 
        variant: "destructive" as const, 
        className: "bg-red-100 text-red-800 border-red-200 font-medium" 
      };
    } else if (modalidadesDisponibles === modalidadesActuales.length) {
      return { 
        texto: "Todas Activas", 
        variant: "default" as const, 
        className: "bg-green-100 text-green-800 border-green-200 font-medium" 
      };
    } else {
      // Mostrar cuál modalidad específica está activa
      const nombresActivas = modalidadesActivas.map(m => m.name).join(" y ");
      return { 
        texto: `${nombresActivas} Activa${modalidadesActivas.length > 1 ? 's' : ''}`, 
        variant: "outline" as const, 
        className: "bg-orange-100 text-orange-800 border-orange-200 font-medium" 
      };
    }
  };

  const estadoGeneral = getEstadoGeneral();

  // Funciones para el cierre del día
  const handleCierreDia = () => {
    setShowCierreModal(true);
  };

  const handleConfirmarCierre = async (transacciones: TransaccionQuiniela[]) => {
    // Agregar todas las transacciones del cierre
    for (const transaccion of transacciones) {
      await onAgregarTransaccion(transaccion);
    }
    setShowCierreModal(false);
  };

  const handleEditarTransaccion = (transaccion: TransaccionQuiniela) => {
    // Abrir directamente el modal de edición
    setTransaccionAEditar(transaccion);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (transaccionEditada: TransaccionQuiniela) => {
    // Cerrar el modal de edición primero
    setIsEditModalOpen(false);
    setTransaccionAEditar(null);
    
    // Mostrar el modal de confirmación para guardar
    showConfirmation({
      type: 'edit',
      title: 'Confirmar Cambios',
      description: '¿Estás seguro de que quieres guardar los cambios realizados?',
      data: transaccionEditada,
      onConfirm: async () => {
        await onEditarTransaccion(transaccionEditada);
      }
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransaccionAEditar(null);
  };

  const eliminarTransaccion = (transaccion: TransaccionQuiniela) => {
    showConfirmation({
      type: 'delete',
      title: 'Eliminar Transacción',
      description: '¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.',
      data: transaccion,
      onConfirm: async () => await onEliminarTransaccion(transaccion.id)
    });
  };

  // Funciones para configurar horarios
  const handleConfigurarHorarios = () => {
    setShowHorariosModal(true);
  };

  const handleGuardarHorarios = (nuevasModalidades: QuinielaModalidad[]) => {
    setModalidadesActuales(nuevasModalidades);
    setShowHorariosModal(false);
  };

  // Filtrar transacciones específicas para Quiniela Nacional
  const transaccionesHoy = transacciones.filter(t => t.fuente === 'Quiniela');

  // Obtener fecha actual en formato string
  const fechaActual = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });



  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onVolver}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Quiniela Nacional
              </CardTitle>
              <p className="text-muted-foreground">Información de sorteos. Usa "Cerrar Día" para registrar transacciones</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Información general */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4>Sorteos Diarios</h4>
              <p className="text-muted-foreground">5 modalidades</p>
            </div>
            <div>
              <h4>Horarios</h4>
              <p className="text-muted-foreground">11:30 - 14:00 - 17:30 - 20:00 - 21:30</p>
            </div>
            <div>
              <h4>Estado Actual</h4>
              <Badge variant={estadoGeneral.variant} className={estadoGeneral.className}>
                {estadoGeneral.texto}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalidades de sorteo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3>Horarios de Sorteo (Solo Informativo)</h3>
          <p className="text-muted-foreground">
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {modalidadesActuales.map((modalidad) => {
          const disponible = isModalidadDisponible(modalidad);
          return (
            <Card 
              key={modalidad.id} 
              className="transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      disponible ? 'bg-primary/10' : 'bg-muted/50'
                    }`}>
                      {disponible ? (
                        <modalidad.icon className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className={disponible ? '' : 'text-muted-foreground'}>
                        {modalidad.name}
                      </h4>
                      <p className="text-muted-foreground">{modalidad.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {disponible 
                            ? `Disponible hasta ${modalidad.horario}`
                            : `Disponible ${modalidad.horarioInicio} - ${modalidad.horario}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={disponible ? "default" : "outline"}
                      className={disponible ? "bg-green-500 text-white" : "text-muted-foreground"}
                    >
                      {disponible ? "Disponible" : "Cerrado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Transacciones</CardTitle>
          <p className="text-muted-foreground">
            Usa el cierre del día para registrar todos los ingresos y egresos de quiniela
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="default" 
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" 
            disabled={!isEditable}
            onClick={handleCierreDia}
          >
            <Clock className="h-4 w-4 mr-2" />
            Cerrar Día de Quiniela
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            disabled={!isEditable}
            onClick={handleConfigurarHorarios}
          >
            <Clock className="h-4 w-4 mr-2" />
            Configurar Horarios
          </Button>
          <Button variant="secondary" className="w-full" disabled={!isEditable}>
            Generar Reporte Consolidado
          </Button>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="mb-2">Próximo Sorteo</h4>
            {proximaModalidad && (
              <div className="flex items-center justify-center gap-2">
                <proximaModalidad.icon className="h-4 w-4 text-orange-500" />
                <p className="text-muted-foreground">
                  {proximaModalidad.name} - {proximaModalidad.horario}
                  {proximaModalidad === modalidadesActuales[0] && 
                   currentTime.getHours() >= 21 && " (mañana)"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de transacciones */}
      {transaccionesHoy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transacciones del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transaccionesHoy.map((transaccion, index) => (
                <div key={transaccion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      transaccion.tipo === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaccion.tipo === 'ingreso' ? 
                        <TrendingUp className="h-4 w-4" /> : 
                        <TrendingDown className="h-4 w-4" />
                      }
                    </div>
                    <div className="flex-1">
                      <p>{transaccion.categoria}</p>
                      <p className="text-muted-foreground">{transaccion.descripcion}</p>
                      <p className="text-muted-foreground">{transaccion.fecha}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-destructive'}
                    >
                      {transaccion.tipo === 'ingreso' ? '+' : '-'}${toNumber(transaccion.monto).toFixed(2)}
                    </Badge>
                    {isEditable && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarTransaccion(transaccion)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          title="Editar transacción"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarTransaccion(transaccion)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Eliminar transacción"
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
      )}

      {/* Modal de Cierre del Día */}
      <CierreDiaModal
        isOpen={showCierreModal}
        onClose={() => setShowCierreModal(false)}
        onConfirmar={handleConfirmarCierre}
        fecha={fechaActual}
        juegoNombre="Quiniela"
      />

      {/* Modal de Edición de Transacciones */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={transaccionAEditar}
        type="transaccion"
        onSave={handleSaveEdit}
      />

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={isOpen}
        action={currentAction}
        onClose={hideConfirmation}
      />

      {/* Modal de Configurar Horarios */}
      <ConfigurarHorariosModal
        isOpen={showHorariosModal}
        onClose={() => setShowHorariosModal(false)}
        modalidades={modalidadesActuales}
        onGuardarHorarios={handleGuardarHorarios}
      />
    </div>
  );
}