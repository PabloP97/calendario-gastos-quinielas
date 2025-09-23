import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useConfirmation } from "./ui/use-confirmation";
import { ConfirmationModal } from "./ConfirmationModal";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Receipt,
  Award,
  Percent,
  Minus,
  Plus
} from "lucide-react";

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
  fuente: string; // 'quiniela' | 'caja-interna'
}

interface ResumenFinancieroProps {
  gastos: Gasto[];
  transaccionesQuiniela: Transaccion[];
  saldoAnterior: number;
  isEditable?: boolean;
  onFinalizarDia?: () => void;
}

export function ResumenFinanciero({ gastos, transaccionesQuiniela, saldoAnterior, isEditable, onFinalizarDia }: ResumenFinancieroProps) {
  const { isOpen, currentAction, showConfirmation, hideConfirmation } = useConfirmation();

  // Función para convertir a número seguro
  const toNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Función para obtener el nombre completo de la categoría
  const getCategoriaCompleta = (gasto: Gasto) => {
    const categorias = {
      sueldo: 'Sueldo',
      servicios: 'Servicios',
      otros: 'Otros'
    };

    const nombreCategoria = categorias[gasto.categoria as keyof typeof categorias] || gasto.categoria;

    if (gasto.subcategoria) {
      const subcategorias = {
        luz: 'Luz',
        agua: 'Agua',
        internet: 'Internet',
        alquiler: 'Alquiler'
      };
      const nombreSubcategoria = subcategorias[gasto.subcategoria as keyof typeof subcategorias] || gasto.subcategoria;
      return `${nombreCategoria} - ${nombreSubcategoria}`;
    }

    return nombreCategoria;
  };

  // Convertir gastos de caja interna a formato de transacciones
  const gastosComoTransacciones: Transaccion[] = gastos.map(gasto => ({
    id: gasto.id,
    tipo: 'egreso' as const,
    categoria: getCategoriaCompleta(gasto),
    monto: toNumber(gasto.monto),
    descripcion: gasto.descripcion,
    fecha: gasto.fecha,
    fuente: 'caja-interna'
  }));

  // Combinar todas las transacciones
  const todasLasTransacciones = [...transaccionesQuiniela, ...gastosComoTransacciones];

  // Filtrar ingresos y egresos
  const ingresos = todasLasTransacciones.filter(t => t.tipo === 'ingreso');
  const egresos = todasLasTransacciones.filter(t => t.tipo === 'egreso');

  // Calcular totales asegurando que son números
  const totalIngresos = ingresos.reduce((sum, t) => sum + toNumber(t.monto), 0);
  const totalEgresos = egresos.reduce((sum, t) => sum + toNumber(t.monto), 0);
  const balanceDia = totalIngresos - totalEgresos;
  const saldoAnterior_num = toNumber(saldoAnterior);
  const saldoFinal = saldoAnterior_num + balanceDia;

  // Agrupar por tipo de juego (fuente)
  const ingresosPorJuego = ingresos.reduce((acc, t) => {
    const juego = t.fuente === 'caja-interna' ? 'Caja Interna' : t.fuente;
    acc[juego] = (acc[juego] || 0) + toNumber(t.monto);
    return acc;
  }, {} as Record<string, number>);

  const egresosPorJuego = egresos.reduce((acc, t) => {
    const juego = t.fuente === 'caja-interna' ? 'Caja Interna' : t.fuente;
    acc[juego] = (acc[juego] || 0) + toNumber(t.monto);
    return acc;
  }, {} as Record<string, number>);

  const getIconForJuego = (juego: string, tipo: 'ingreso' | 'egreso') => {
    if (tipo === 'ingreso') {
      if (juego === 'Caja Interna') return Receipt;
      if (juego.includes('Quiniela Nacional')) return DollarSign;
      if (juego.includes('Express')) return DollarSign;
      if (juego.includes('Loto') || juego.includes('Brinco') || juego.includes('Telekino') || juego.includes('Poceada') || juego.includes('Quini')) return Receipt;
      return Plus;
    } else {
      if (juego === 'Caja Interna') return Receipt;
      if (juego.includes('Quiniela Nacional')) return Award;
      if (juego.includes('Express')) return Award;
      if (juego.includes('Loto') || juego.includes('Brinco') || juego.includes('Telekino') || juego.includes('Poceada') || juego.includes('Quini')) return Award;
      return Minus;
    }
  };

  return (
    <div className="space-y-6">
      {/* Saldo Inicial del Día */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Saldo Inicial del Día</span>
            </div>
            <div className={`text-2xl mb-1 ${saldoAnterior_num >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(saldoAnterior_num).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-sm">
              {saldoAnterior_num >= 0 ? '💰 Saldo positivo' : '📉 Saldo negativo'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-muted-foreground">Total Ingresos</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-green-500">${totalIngresos.toFixed(2)}</p>
              <p className="text-muted-foreground">{ingresos.length} transacciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <span className="text-muted-foreground">Total Egresos</span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-destructive">${totalEgresos.toFixed(2)}</p>
              <p className="text-muted-foreground">{egresos.length} transacciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Balance del Día</span>
              </div>
            </div>
            <div className="mt-2">
              <p className={`text-2xl ${balanceDia >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                ${balanceDia.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                {balanceDia >= 0 ? 'Ganancia hoy' : 'Pérdida hoy'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Desglose de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(ingresosPorJuego).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(ingresosPorJuego).map(([juego, monto]) => {
                const IconComponent = getIconForJuego(juego, 'ingreso');
                const transaccionesJuego = ingresos.filter(t => {
                  const juegoTransaccion = t.fuente === 'caja-interna' ? 'Caja Interna' : t.fuente;
                  return juegoTransaccion === juego;
                });

                return (
                  <div key={juego} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p>{juego}</p>
                        <p className="text-muted-foreground">
                          {transaccionesJuego.length} transacciones
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      +${toNumber(monto).toFixed(2)}
                    </Badge>
                  </div>
                );
              })}

              <Separator />
              <div className="flex items-center justify-between p-2">
                <span>Total Ingresos</span>
                <Badge className="bg-green-500">
                  +${totalIngresos.toFixed(2)}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay ingresos registrados hoy</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desglose de Egresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Desglose de Egresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(egresosPorJuego).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(egresosPorJuego).map(([juego, monto]) => {
                const IconComponent = getIconForJuego(juego, 'egreso');
                const transaccionesJuego = egresos.filter(t => {
                  const juegoTransaccion = t.fuente === 'caja-interna' ? 'Caja Interna' : t.fuente;
                  return juegoTransaccion === juego;
                });

                // Agrupar transacciones por categoría para este juego
                const transaccionesPorCategoria = transaccionesJuego.reduce((acc, t) => {
                  acc[t.categoria] = (acc[t.categoria] || 0) + toNumber(t.monto);
                  return acc;
                }, {} as Record<string, number>);

                return (
                  <div key={juego} className="border rounded-lg overflow-hidden">
                    {/* Header del juego */}
                    <div className="flex items-center justify-between p-3 bg-red-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p>{juego}</p>
                          <p className="text-muted-foreground">
                            {transaccionesJuego.length} transacciones
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-destructive">
                        -${toNumber(monto).toFixed(2)}
                      </Badge>
                    </div>

                    {/* Desglose por categorías */}
                    <div className="p-2 space-y-1">
                      {Object.entries(transaccionesPorCategoria).map(([categoria, montoCategoria]) => (
                        <div key={categoria} className="flex items-center justify-between px-3 py-2 rounded bg-background">
                          <span className="text-muted-foreground">{categoria}</span>
                          <span className="text-destructive">-${toNumber(montoCategoria).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Separator />
              <div className="flex items-center justify-between p-2">
                <span>Total Egresos</span>
                <Badge variant="destructive">
                  -${totalEgresos.toFixed(2)}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay egresos registrados hoy</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saldo Final del Día */}
      <Card className={`border-2 ${saldoFinal >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calculator className="h-6 w-6" />
              <h3>Saldo Final del Día</h3>
            </div>

            {/* Cálculo Visual */}
            <div className="bg-white/50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Saldo inicial:</span>
                <span className={saldoAnterior_num >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${saldoAnterior_num.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>+ Ingresos del día:</span>
                <span className="text-green-600">+${totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>- Egresos del día:</span>
                <span className="text-red-600">-${totalEgresos.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Balance del día:</span>
                  <span className={balanceDia >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    ${balanceDia.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`text-4xl mb-2 ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(saldoFinal).toFixed(2)}
            </div>
            <p className="text-muted-foreground mb-2">
              {saldoFinal >= 0 ? '🎉 Saldo Final Positivo' : '⚠️ Saldo Final Negativo'}
            </p>
            <p className="text-muted-foreground text-sm">
              {saldoFinal >= 0
                ? 'Este saldo se arrastrará al día siguiente'
                : 'Deuda que se arrastrará al día siguiente'}
            </p>

            {/* Botón Finalizar Día */}
            {isEditable && onFinalizarDia && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  ⚠️ Una vez finalizado, no podrás realizar más cambios en este día
                </p>
                <button
                  onClick={() => showConfirmation({
                    title: "¿Finalizar este día?",
                    description: "Una vez finalizado, no podrás realizar más cambios en este día. Esta acción no se puede deshacer.",
                    onConfirm: () => {
                      onFinalizarDia?.();
                      hideConfirmation();
                    },
                    onCancel: hideConfirmation,
                    confirmText: "Sí, Finalizar Día",
                    cancelText: "Cancelar",
                    variant: "destructive"
                  })}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Finalizar Día
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={isOpen}
        action={currentAction}
        onClose={hideConfirmation}
      />
    </div>
  );
}
