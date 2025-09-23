import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { QuinielaGameDetail } from "./QuinielaGameDetail";
import { QuinielaNacionalDetail } from "./QuinielaNacionalDetail";
import { useState } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, ChevronRight, Zap, Target, Clock } from "lucide-react";

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

  // TODO: SP_SELECT - Al cargar el menú, obtener configuraciones de horarios
  // EXEC SP_GetHorariosQuiniela @usuario_id = ?
  // EXEC SP_GetConfiguracionJuegos @usuario_id = ?

  if (showQuiniela) {
    return (
      <QuinielaNacionalDetail 
        onVolver={() => setShowQuiniela(false)} 
        onAgregarTransaccion={onAgregarTransaccion}
        onEliminarTransaccion={onEliminarTransaccion}
        onEditarTransaccion={onEditarTransaccion}
        transacciones={transacciones}
        isEditable={isEditable}
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
      
      <div className="pt-4 border-t">
        <Button className="w-full" disabled={!isEditable}>
          Agregar Nueva Quiniela
        </Button>
      </div>
    </div>
  );
}