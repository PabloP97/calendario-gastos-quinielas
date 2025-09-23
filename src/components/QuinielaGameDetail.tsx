import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { EditTransactionModal } from "./EditTransactionModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { CierreDiaModal } from "./CierreDiaModal";
import { useConfirmation } from "./ui/use-confirmation";
import { useState, useEffect } from "react";
import { QuinielaGame, TransaccionQuiniela } from "../types";
import { 
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowLeft,
  Receipt,
  Award,
  Percent,
  Edit,
  Trash2,
  Clock
} from "lucide-react";

interface QuinielaGameDetailProps {
  game: QuinielaGame;
  onVolver: () => void;
  onAgregarTransaccion: (transaccion: TransaccionQuiniela) => Promise<void>;
  onEliminarTransaccion: (id: number) => Promise<void>;
  onEditarTransaccion: (transaccion: TransaccionQuiniela) => Promise<void>;
  transacciones: TransaccionQuiniela[];
  isEditable: boolean;
}

export function QuinielaGameDetail({ game, onVolver, onAgregarTransaccion, onEliminarTransaccion, onEditarTransaccion, transacciones: allTransacciones, isEditable }: QuinielaGameDetailProps) {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'egreso'>('ingreso');
  const [categoria, setCategoria] = useState("");
  const [transaccionAEditar, setTransaccionAEditar] = useState<TransaccionQuiniela | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
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

  // Filtrar transacciones específicas para este juego
  const transacciones = allTransacciones.filter(t => t.fuente === game.name);

  const totalIngresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + toNumber(t.monto), 0);

  const totalEgresos = transacciones
    .filter(t => t.tipo === 'egreso')
    .reduce((sum, t) => sum + toNumber(t.monto), 0);

  const balance = totalIngresos - totalEgresos;

  // Función para obtener las categorías de ingreso según el tipo de juego
  const getCategoriasIngreso = (gameName: string): string[] => {
    // Juegos poceados
    const juegosPoceados = ["Quini 6", "Brinco", "Loto", "Poceada", "Telekino", "Loto Plus"];
    
    if (juegosPoceados.some(juego => gameName.toLowerCase().includes(juego.toLowerCase()))) {
      return ["Venta de Tickets"];
    }
    
    // Quiniela (tradicional)
    if (gameName.toLowerCase().includes("quiniela") && !gameName.toLowerCase().includes("express")) {
      return ["Apuestas Nuevas"];
    }
    
    // Quiniela Express
    if (gameName.toLowerCase().includes("express")) {
      return ["Valor de Jugada"];
    }
    
    // Otros juegos (por defecto - quiniela tradicional)
    return ["Apuestas Nuevas"];
  };

  const categoriasIngreso = getCategoriasIngreso(game.name);
  const categoriasEgreso = ["Premio Pagado", "Comisión Pagada", "Devolución"];

  // Función para generar descripción por defecto
  const getDescripcionDefault = (): string => {
    if (game.name.toLowerCase().includes("quiniela") && game.name.includes(" - ")) {
      const modalidad = game.name.split(" - ")[1] || "General";
      return tipoTransaccion === 'ingreso' 
        ? `Total jugadas ${modalidad}` 
        : `${categoria} - ${modalidad}`;
    }
    
    return tipoTransaccion === 'ingreso' 
      ? `${categoria} - ${game.name}`
      : `${categoria} - ${game.name}`;
  };

  // Verificar si es Quiniela para mostrar interfaz especial
  const isQuiniela = game.name.toLowerCase().includes("quiniela") && game.name.includes(" - ");

  const handleAgregarTransaccion = () => {
    if (monto && categoria) {
      const nuevaTransaccion: TransaccionQuiniela = {
        id: Date.now(),
        tipo: tipoTransaccion,
        categoria: categoria,
        monto: parseFloat(monto),
        descripcion: descripcion || getDescripcionDefault(),
        fecha: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fuente: game.name
      };

      showConfirmation({
        type: tipoTransaccion === 'ingreso' ? 'add-ingreso' : 'add-egreso',
        title: `Confirmar ${tipoTransaccion === 'ingreso' ? 'Ingreso' : 'Egreso'}`,
        description: `¿Estás seguro de que quieres registrar este ${tipoTransaccion} en ${game.name}?`,
        data: nuevaTransaccion,
        onConfirm: async () => {
          await onAgregarTransaccion(nuevaTransaccion);
          setMonto("");
          setDescripcion("");
          // Solo resetear categoría si es egreso o si hay múltiples opciones de ingreso
          if (tipoTransaccion === 'egreso' || categoriasIngreso.length > 1) {
            setCategoria("");
          }
        }
      });
    }
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

  // Obtener fecha actual en formato string
  const fechaActual = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const categoriesOptions = tipoTransaccion === 'ingreso' ? categoriasIngreso : categoriasEgreso;

  // Auto-seleccionar la categoría cuando cambia el tipo de transacción
  useEffect(() => {
    if (tipoTransaccion === 'ingreso' && categoriasIngreso.length === 1) {
      setCategoria(categoriasIngreso[0]);
    } else if (tipoTransaccion === 'egreso') {
      // Para egresos, resetear pero no interferir con selecciones manuales posteriores
      setCategoria("");
    }
    // Resetear campos cuando cambia el tipo de transacción
    setMonto("");
    setDescripcion("");
  }, [tipoTransaccion]);

  // Auto-seleccionar categoría al inicializar si es ingreso con una sola opción
  useEffect(() => {
    if (categoriasIngreso.length === 1 && tipoTransaccion === 'ingreso' && categoria === "") {
      setCategoria(categoriasIngreso[0]);
    }
  }, [categoriasIngreso, categoria, tipoTransaccion]);

  return (
    <div className="space-y-4">
      {/* Header del juego */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onVolver}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <game.icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{game.name}</CardTitle>
              <p className="text-muted-foreground">{game.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Ingresos</span>
            </div>
            <p className="text-green-500">${totalIngresos.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Egresos</span>
            </div>
            <p className="text-destructive">${totalEgresos.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Balance</span>
            </div>
            <p className={balance >= 0 ? "text-green-500" : "text-destructive"}>
              ${balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de transacciones */}
      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Cierre del Día</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="default" 
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white" 
            disabled={!isEditable}
            onClick={handleCierreDia}
          >
            <Clock className="h-4 w-4 mr-2" />
            Cerrar Día de {game.name}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de transacciones */}
      {transacciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transacciones del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transacciones.map((transaccion, index) => (
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
      
      {/* Modal de edición */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        item={transaccionAEditar}
        type="transaccion"
        onSave={handleSaveEdit}
      />
      
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={isOpen}
        action={currentAction}
        onClose={hideConfirmation}
      />
      
      {/* Modal de Cierre del Día */}
      <CierreDiaModal
        isOpen={showCierreModal}
        onClose={() => setShowCierreModal(false)}
        onConfirmar={handleConfirmarCierre}
        fecha={fechaActual}
        juegoNombre={game.name}
      />
    </div>
  );
}