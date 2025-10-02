import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { QuinielaGameDetail } from "./QuinielaGameDetail";
import { QuinielaNacionalDetail } from "./QuinielaNacionalDetail";
import { ConfigurarHorariosModal } from "./ConfigurarHorariosModal";
import { useState, useEffect } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, ChevronRight, Zap, Target, Clock, Settings, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import apiService from "../services/apiService";

const quinielaGames = [
  { id: 1, name: "Quiniela", icon: Dice2, description: "Matutina, vespertina y nocturna" },
  { id: 2, name: "Quiniela Express", icon: Zap, description: "Jugadas rápidas y directas" },
  { id: 3, name: "Loto", icon: Dice1, description: "Sorteo tradicional de números" },
  { id: 4, name: "Quini6", icon: Target, description: "Seis números ganadores" },
  { id: 5, name: "Brinco", icon: Dice5, description: "Juego de apuestas rápidas" },
  { id: 6, name: "Loto5", icon: Dice3, description: "Cinco números ganadores" },
  { id: 7, name: "Telekino TJ", icon: Clock, description: "Juego de números instantáneo" },
];

interface Transaccion {
  id: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  fuente: string;
}

interface QuinielaMenuProps {
  onAgregarTransaccion: (transaccion: Transaccion) => Promise<void>;
  onEliminarTransaccion: (id: number) => Promise<void>;
  onEditarTransaccion: (transaccion: Transaccion) => Promise<void>;
  onAgregarTransacciones?: (transacciones: Transaccion[]) => Promise<void>;
  transacciones: Transaccion[];
  isEditable: boolean;
}

export function QuinielaMenu({ onAgregarTransaccion, onEliminarTransaccion, onEditarTransaccion, onAgregarTransacciones, transacciones, isEditable }: QuinielaMenuProps) {
  const [selectedGame, setSelectedGame] = useState<typeof quinielaGames[0] | null>(null);
  const [showQuiniela, setShowQuiniela] = useState(false);
  const [showConfiguracionHorarios, setShowConfiguracionHorarios] = useState(false);
  const [estadoModalidades, setEstadoModalidades] = useState<any[]>([]);
  const [modalidadesQuiniela, setModalidadesQuiniela] = useState([
    { id: 1, name: "La Primera", icon: Clock, description: "Disponible desde 8:00 AM", horario: "9:15 AM", horarioInicio: "08:00", horarioFin: "09:15" },
    { id: 2, name: "Matutina", icon: Clock, description: "Disponible desde 8:00 AM", horario: "11:45 AM", horarioInicio: "08:00", horarioFin: "11:45" },
    { id: 3, name: "Vespertina", icon: Clock, description: "Disponible desde 8:00 AM", horario: "1:15 PM", horarioInicio: "08:00", horarioFin: "13:15" },
    { id: 4, name: "De la Tarde", icon: Clock, description: "Disponible desde 8:00 AM", horario: "6:45 PM", horarioInicio: "08:00", horarioFin: "18:45" },
    { id: 5, name: "Nocturna", icon: Clock, description: "Disponible desde 8:00 AM", horario: "8:45 PM", horarioInicio: "08:00", horarioFin: "20:45" },
  ]);

  // Cargar estado de modalidades al montar el componente
  useEffect(() => {
    const cargarEstadoModalidades = async () => {
      if (isEditable) {
        try {
          console.log('🔄 Intentando cargar estado de modalidades...');
          
          // Primero verificar si el backend está disponible
          try {
            const healthResponse = await fetch('http://localhost:4000/health');
            if (healthResponse.ok) {
              console.log('✅ Backend está funcionando');
            } else {
              console.warn('⚠️ Backend responde pero con error:', healthResponse.status);
            }
          } catch (healthError) {
            console.error('❌ Backend no está disponible:', healthError);
            throw new Error('Backend no disponible');
          }
          
          const estado = await apiService.obtenerEstadoModalidades();
          console.log('📊 Estado modalidades obtenido exitosamente:', estado);
          console.log('🕒 Hora actual del sistema:', new Date().toLocaleTimeString());
          console.log('🕒 Hora actual completa:', new Date().toISOString());
          
          // 🔧 DEBUG: Analizar cada modalidad recibida
          const modalidadesAbiertas = estado.filter((m: any) => m.esta_abierta).length;
          console.log(`📊 FRONTEND - ${modalidadesAbiertas}/${estado.length} modalidades abiertas según backend`);
          
          estado.forEach((modalidad: any) => {
            console.log(`🔍 Modalidad ${modalidad.nombre_modalidad}:`, {
              horario_fin: modalidad.horario_fin,
              esta_abierta: modalidad.esta_abierta,
              hora_actual: modalidad.hora_actual,
              minutos_restantes: modalidad.minutos_restantes
            });
          });
          
          // 🔧 COMENTADO: Toast de conexión restablecida que molesta al usuario
          // if (estadoModalidades.length === 0 && estado.length > 0) {
          //   toast.success("Conexión restablecida", {
          //     description: "Horarios y estados actualizados desde el servidor",
          //     duration: 3000,
          //   });
          // }
          
          setEstadoModalidades(estado);
          
          // Actualizar modalidades con horarios personalizados si existen
          if (estado.length > 0) {
            const modalidadesActualizadas = estado.map((modalidad: any) => ({
              id: modalidad.modalidad_id,
              name: modalidad.nombre_modalidad,
              icon: Clock,
              description: `${modalidad.horario_inicio?.slice(0,5) || '00:00'} - ${modalidad.horario_fin?.slice(0,5) || '00:00'}`,
              horario: formatearHorarioDisplay(modalidad.horario_fin?.slice(0,5) || modalidadesQuiniela.find(m => m.id === modalidad.modalidad_id)?.horarioFin || '12:00'),
              horarioInicio: modalidad.horario_inicio?.slice(0,5) || '00:00',
              horarioFin: modalidad.horario_fin?.slice(0,5) || '00:00',
              esta_abierta: modalidad.esta_abierta !== undefined ? modalidad.esta_abierta : false
            }));
            setModalidadesQuiniela(modalidadesActualizadas);
          }
        } catch (error) {
          console.error("Error cargando estado de modalidades:", error);
          
          // Crear modalidades de fallback con horarios por defecto y estado calculado según la hora
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentMinutos = currentHour * 60 + currentMinute;
          
          const modalidadesFallback = modalidadesQuiniela.map(modalidad => {
            const [finHour, finMinute] = modalidad.horarioFin.split(':').map(Number);
            const finMinutos = finHour * 60 + finMinute;
            // ✅ LÓGICA CORREGIDA: Disponible todo el día hasta la hora de cierre
            const estaAbierta = currentMinutos < finMinutos;
            
            console.log(`🔍 FALLBACK Modalidad ${modalidad.name}: ${currentHour}:${currentMinute.toString().padStart(2, '0')} vs cierre ${modalidad.horarioFin} = ${estaAbierta ? 'ABIERTA' : 'CERRADA'}`);
            
            return {
              modalidad_id: modalidad.id,
              nombre_modalidad: modalidad.name,
              horario_inicio: modalidad.horarioInicio + ':00',
              horario_fin: modalidad.horarioFin + ':00',
              esta_abierta: estaAbierta,
              hora_actual: new Date().toTimeString().slice(0,8),
              minutos_restantes: estaAbierta ? Math.max(0, finMinutos - currentMinutos) : 0
            };
          });
          
          console.log('⚠️ Usando modalidades de fallback:', modalidadesFallback);
          setEstadoModalidades(modalidadesFallback);
          
          // Solo mostrar toast si el error no es de conexión
          if (!error?.message?.includes('Backend no disponible')) {
            toast.warning("Modo sin conexión", {
              description: "Usando configuración predeterminada de modalidades",
              duration: 4000,
            });
          } else {
            console.log('🔌 Backend desconectado, funcionando en modo offline');
          }
        }
      }
    };

    cargarEstadoModalidades();
    
    // Actualizar estado cada minuto (más frecuente si estamos en modo offline)
    const intervaloActualizacion = estadoModalidades.length === 0 ? 10000 : 60000; // 10s si offline, 60s si online
    const interval = setInterval(cargarEstadoModalidades, intervaloActualizacion);
    return () => clearInterval(interval);
  }, [isEditable]);

  // Helper para formatear horario de 24h a formato display (HH:MM AM/PM)
  const formatearHorarioDisplay = (horario24: string): string => {
    const [horas, minutos] = horario24.split(':').map(Number);
    const periodo = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
    return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
  };

  if (showQuiniela) {
    return (
      <QuinielaNacionalDetail 
        onVolver={() => setShowQuiniela(false)} 
        onAgregarTransaccion={onAgregarTransaccion}
        onEliminarTransaccion={onEliminarTransaccion}
        onEditarTransaccion={onEditarTransaccion}
        transacciones={transacciones}
        isEditable={isEditable}
        modalidades={estadoModalidades}
      />
    );
  }

  if (selectedGame) {
    return (
      <QuinielaGameDetail 
        game={selectedGame} 
        onVolver={() => setSelectedGame(null)} 
        onAgregarTransaccion={onAgregarTransaccion}
        onEliminarTransaccion={onEliminarTransaccion}
        onEditarTransaccion={onEditarTransaccion}
        transacciones={transacciones}
        isEditable={isEditable}
      />
    );
  }

  const handleGameClick = (game: typeof quinielaGames[0]) => {
    // Permitir navegación siempre para ver transacciones
    if (game.name === "Quiniela") {
      setShowQuiniela(true);
    } else {
      setSelectedGame(game);
    }
  };

  const handleGuardarHorarios = (horariosActualizados: any) => {
    // Actualizar las modalidades con los nuevos horarios
    setModalidadesQuiniela(horariosActualizados);
    
    // Recargar estado de modalidades para obtener estados actualizados
    const cargarEstado = async () => {
      try {
        const estado = await apiService.obtenerEstadoModalidades();
        setEstadoModalidades(estado);
      } catch (error) {
        console.error("Error recargando estado:", error);
      }
    };
    
    cargarEstado();
  };

  // Función para obtener el número de transacciones por juego
  const getTransaccionesPorJuego = (gameName: string) => {
    if (gameName === "Quiniela") {
      return transacciones.filter(t => t.fuente === "Quiniela").length;
    }
    return transacciones.filter(t => t.fuente === gameName).length;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {quinielaGames.map((game) => (
          <Card 
            key={game.id} 
            className="transition-colors cursor-pointer hover:bg-accent"
            onClick={() => handleGameClick(game)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <game.icon className="h-6 w-6 text-primary" />
                  <div>
                    <h4>{game.name}</h4>
                    <p className="text-muted-foreground">{game.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getTransaccionesPorJuego(game.name) > 0 ? "default" : "outline"} 
                    className={getTransaccionesPorJuego(game.name) > 0 ? "bg-green-100 text-green-800" : "text-orange-600 border-orange-200"}
                  >
                    {getTransaccionesPorJuego(game.name) > 0 ? "✓ Cierre realizado" : "Pendiente cierre"}
                  </Badge>
                  <Badge variant={isEditable ? "outline" : "secondary"}>
                    {isEditable ? "Activo" : "Cerrado"}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="pt-4 border-t space-y-3">
        {isEditable && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowConfiguracionHorarios(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Horarios
          </Button>
        )}
        
        <Button className="w-full" disabled={!isEditable}>
          Agregar Nueva Quiniela
        </Button>
      </div>

      {/* Modal de configuración de horarios */}
      <ConfigurarHorariosModal
        isOpen={showConfiguracionHorarios}
        onClose={() => setShowConfiguracionHorarios(false)}
        modalidades={modalidadesQuiniela}
        onGuardarHorarios={handleGuardarHorarios}
      />
    </div>
  );
}