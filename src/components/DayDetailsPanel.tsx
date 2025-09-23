import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { QuinielaMenu } from "./QuinielaMenu";
import { CajaInternaMenu } from "./CajaInternaMenu";
import { ResumenFinanciero } from "./ResumenFinanciero";
import { CalendarDays, Lock, Edit3, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "../services/apiService";
import { toast } from "sonner";

interface Gasto {
  id: number;
  monto: number;
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  fecha: string;
}

interface Transaccion {
  id: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  fuente: string;
}

interface DayDetailsPanelProps {
  selectedDate: Date;
  isEditable: boolean;
  onVolver: () => void;
  onFinalizarDia?: () => void;
}

export function DayDetailsPanel({ selectedDate, isEditable, onVolver, onFinalizarDia }: DayDetailsPanelProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [transaccionesQuiniela, setTransaccionesQuiniela] = useState<Transaccion[]>([]);
  const [saldoAnterior, setSaldoAnterior] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // TODO: SP_SELECT - Al montar el componente, cargar datos del día seleccionado
  // EXEC SP_GetDayData @fecha = selectedDate, @usuario_id = ?
  useEffect(() => {
    const cargarDatosDia = async () => {
      setIsLoadingInitial(true);
      try {
        const fechaStr = selectedDate.toISOString().split('T')[0];
        const datosDia = await apiService.obtenerDatosDia(fechaStr);
        
        setGastos(datosDia.gastos || []);
        setTransaccionesQuiniela(datosDia.transaccionesQuiniela || []);
        setSaldoAnterior(datosDia.saldoAnterior || 0);
      } catch (error) {
        console.error("Error cargando datos del día:", error);
        toast.error("Error", {
          description: "No se pudieron cargar los datos del día",
          duration: 3000,
        });
      } finally {
        setIsLoadingInitial(false);
      }
    };

    cargarDatosDia();
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const simulateLoading = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const agregarGasto = async (nuevoGasto: Gasto) => {
    await simulateLoading();
    
    try {
      // TODO: SP_INSERT - Insertar nuevo gasto
      // EXEC SP_InsertGasto @monto = ?, @categoria = ?, @subcategoria = ?, @descripcion = ?, @fecha = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      const gastoConFecha = {
        ...nuevoGasto,
        fecha: fechaStr
      };
      
      await apiService.registrarGasto(gastoConFecha);
      setGastos([...gastos, nuevoGasto]);
      
      toast.success("Gasto agregado", {
        description: `Gasto de ${nuevoGasto.monto} registrado correctamente`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error agregando gasto:", error);
      toast.error("Error", {
        description: "No se pudo agregar el gasto",
        duration: 3000,
      });
    }
  };

  const eliminarGasto = async (id: number) => {
    await simulateLoading();
    
    try {
      // TODO: SP_DELETE - Eliminar gasto por ID
      // EXEC SP_DeleteGasto @gasto_id = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      await apiService.eliminarGasto(id, fechaStr);
      setGastos(gastos.filter(gasto => gasto.id !== id));
      
      toast.success("Gasto eliminado", {
        description: "El gasto ha sido eliminado correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el gasto",
        duration: 3000,
      });
    }
  };

  const agregarTransaccionQuiniela = async (transaccion: Transaccion) => {
    await simulateLoading();
    
    try {
      // TODO: SP_INSERT - Insertar nueva transacción de quiniela
      // EXEC SP_InsertTransaccionQuiniela @tipo = ?, @categoria = ?, @monto = ?, @descripcion = ?, @fecha = ?, @fuente = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      await apiService.registrarTransaccionQuiniela({
        fecha: fechaStr,
        juego: transaccion.fuente,
        monto: transaccion.monto,
        tipo: transaccion.tipo,
        descripcion: transaccion.descripcion
      });
      
      setTransaccionesQuiniela(prev => [...prev, transaccion]);
      
      toast.success("Transacción agregada", {
        description: `${transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de ${transaccion.monto} registrado`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error agregando transacción:", error);
      toast.error("Error", {
        description: "No se pudo agregar la transacción",
        duration: 3000,
      });
    }
  };

  const agregarTransaccionesQuiniela = async (transacciones: Transaccion[]) => {
    await simulateLoading();
    
    try {
      // TODO: SP_INSERT_BULK - Insertar múltiples transacciones de quiniela (cierre de día)
      // EXEC SP_InsertTransaccionesQuiniela @transacciones_json = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      
      for (const transaccion of transacciones) {
        await apiService.registrarTransaccionQuiniela({
          fecha: fechaStr,
          juego: transaccion.fuente,
          monto: transaccion.monto,
          tipo: transaccion.tipo,
          descripcion: transaccion.descripcion
        });
      }
      
      setTransaccionesQuiniela(prev => [...prev, ...transacciones]);
      
      toast.success("Transacciones agregadas", {
        description: `${transacciones.length} transacciones registradas correctamente`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error agregando transacciones:", error);
      toast.error("Error", {
        description: "No se pudieron agregar las transacciones",
        duration: 3000,
      });
    }
  };

  const eliminarTransaccionQuiniela = async (id: number) => {
    await simulateLoading();
    
    try {
      // TODO: SP_DELETE - Eliminar transacción de quiniela por ID
      // EXEC SP_DeleteTransaccionQuiniela @transaccion_id = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      await apiService.eliminarTransaccionQuiniela(id, fechaStr);
      setTransaccionesQuiniela(transaccionesQuiniela.filter(t => t.id !== id));
      
      toast.success("Transacción eliminada", {
        description: "La transacción ha sido eliminada correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error eliminando transacción:", error);
      toast.error("Error", {
        description: "No se pudo eliminar la transacción",
        duration: 3000,
      });
    }
  };

  const editarGasto = async (gastoEditado: Gasto) => {
    await simulateLoading();
    
    try {
      // TODO: SP_UPDATE - Actualizar gasto existente
      // EXEC SP_UpdateGasto @gasto_id = ?, @monto = ?, @categoria = ?, @subcategoria = ?, @descripcion = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      const gastoConFecha = {
        ...gastoEditado,
        fecha: fechaStr
      };
      
      await apiService.editarGasto(gastoConFecha);
      setGastos(gastos.map(gasto => gasto.id === gastoEditado.id ? gastoEditado : gasto));
      
      toast.success("Gasto actualizado", {
        description: "El gasto ha sido actualizado correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error editando gasto:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el gasto",
        duration: 3000,
      });
    }
  };

  const editarTransaccionQuiniela = async (transaccionEditada: Transaccion) => {
    await simulateLoading();
    
    try {
      // TODO: SP_UPDATE - Actualizar transacción de quiniela existente
      // EXEC SP_UpdateTransaccionQuiniela @transaccion_id = ?, @tipo = ?, @categoria = ?, @monto = ?, @descripcion = ?, @usuario_id = ?
      const fechaStr = selectedDate.toISOString().split('T')[0];
      const transaccionConFecha = {
        ...transaccionEditada,
        fecha: fechaStr
      };
      
      await apiService.editarTransaccionQuiniela({
        ...transaccionEditada,
        fecha: fechaStr,
        juego: transaccionEditada.fuente
      });
      setTransaccionesQuiniela(transaccionesQuiniela.map(t => t.id === transaccionEditada.id ? transaccionEditada : t));
      
      toast.success("Transacción actualizada", {
        description: "La transacción ha sido actualizada correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error editando transacción:", error);
      toast.error("Error", {
        description: "No se pudo actualizar la transacción",
        duration: 3000,
      });
    }
  };

  // Mostrar loading inicial mientras cargan los datos
  if (isLoadingInitial) {
    return (
      <div className="w-full max-w-2xl flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-xl border-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando datos del día...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl ${isEditable ? 'day-panel-editable' : 'day-panel-readonly'} relative`}>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onVolver}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Calendario
            </Button>
            {isEditable ? (
              <span className="current-day-indicator">
                <Edit3 className="h-3 w-3" />
                Día Actual
              </span>
            ) : (
              <span className="readonly-indicator">
                <Eye className="h-3 w-3" />
                Solo Lectura
              </span>
            )}
          </div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {formatDate(selectedDate)}
          </CardTitle>
        </CardHeader>
      <CardContent>
        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="caja-interna">Caja Interna</TabsTrigger>
            <TabsTrigger value="quiniela">Quiniela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumen" className="mt-4">
            <ResumenFinanciero 
              gastos={gastos}
              transaccionesQuiniela={transaccionesQuiniela}
              saldoAnterior={saldoAnterior}
              isEditable={isEditable}
              onFinalizarDia={onFinalizarDia}
            />
          </TabsContent>

          <TabsContent value="caja-interna" className="mt-4">
            <CajaInternaMenu 
              gastos={gastos}
              onAgregarGasto={agregarGasto}
              onEliminarGasto={eliminarGasto}
              onEditarGasto={editarGasto}
              isEditable={isEditable}
            />
          </TabsContent>
          
          <TabsContent value="quiniela" className="mt-4">
            <QuinielaMenu 
              onAgregarTransaccion={agregarTransaccionQuiniela}
              onEliminarTransaccion={eliminarTransaccionQuiniela}
              onEditarTransaccion={editarTransaccionQuiniela}
              transacciones={transaccionesQuiniela}
              isEditable={isEditable}
              onAgregarTransacciones={agregarTransaccionesQuiniela}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    
    {/* Loading Overlay */}
    {isLoading && (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-xl border-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Procesando transacción...</p>
        </div>
      </div>
    )}
    </div>
  );
}