import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { HistorialGastos } from "./HistorialGastos";
import { ConfirmationModal } from "./ConfirmationModal";
import { useConfirmation } from "./ui/use-confirmation";
import { useState } from "react";
import { 
  Plus,
  TrendingDown,
  DollarSign,
  Receipt,
  History,
  Banknote,
  Zap,
  Droplets,
  Wifi,
  Home,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";

interface Gasto {
  id: number;
  monto: number;
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  fecha: string;
}

interface CajaInternaMenuProps {
  gastos: Gasto[];
  onAgregarGasto: (gasto: Gasto) => Promise<void>;
  onEliminarGasto: (id: number) => Promise<void>;
  onEditarGasto: (gasto: Gasto) => Promise<void>;
  isEditable: boolean;
}

// Definición de categorías
const categorias = {
  sueldo: {
    id: 'sueldo',
    name: 'Sueldo',
    icon: Banknote,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    subcategorias: []
  },
  servicios: {
    id: 'servicios',
    name: 'Servicios',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    subcategorias: [
      { id: 'luz', name: 'Luz', icon: Zap },
      { id: 'agua', name: 'Agua', icon: Droplets },
      { id: 'internet', name: 'Internet', icon: Wifi },
      { id: 'alquiler', name: 'Alquiler', icon: Home }
    ]
  },
  otros: {
    id: 'otros',
    name: 'Otros',
    icon: MoreHorizontal,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    subcategorias: []
  }
};

export function CajaInternaMenu({ gastos, onAgregarGasto, onEliminarGasto, onEditarGasto, isEditable }: CajaInternaMenuProps) {
  const [monto, setMonto] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState("");
  const [descripcion, setDescripcion] = useState("");
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

  const totalGastos = gastos.reduce((sum, gasto) => sum + toNumber(gasto.monto), 0);

  const handleAgregarGasto = () => {
    if (monto && categoriaSeleccionada) {
      const categoria = categorias[categoriaSeleccionada as keyof typeof categorias];
      const subcategoria = subcategoriaSeleccionada ? 
        categoria.subcategorias.find(sub => sub.id === subcategoriaSeleccionada) : null;
      
      const etiquetaCompleta = subcategoria ? 
        `${categoria.name} - ${subcategoria.name}` : 
        categoria.name;

      const nuevoGasto: Gasto = {
        id: Date.now(),
        monto: parseFloat(monto),
        categoria: categoriaSeleccionada,
        subcategoria: subcategoriaSeleccionada || undefined,
        descripcion: descripcion || etiquetaCompleta,
        fecha: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      showConfirmation({
        type: 'add-gasto',
        title: 'Confirmar Nuevo Gasto',
        description: '¿Estás seguro de que quieres registrar este gasto?',
        data: { 
          ...nuevoGasto, 
          categoria: etiquetaCompleta,
          monto: nuevoGasto.monto
        },
        onConfirm: async () => {
          await onAgregarGasto(nuevoGasto);
          setMonto("");
          setCategoriaSeleccionada("");
          setSubcategoriaSeleccionada("");
          setDescripcion("");
        }
      });
    }
  };

  // Reset subcategoría cuando cambia la categoría principal
  const handleCategoriaChange = (nuevaCategoria: string) => {
    setCategoriaSeleccionada(nuevaCategoria);
    setSubcategoriaSeleccionada("");
  };

  // Función para obtener la etiqueta completa de un gasto para mostrar
  const getEtiquetaGasto = (gasto: Gasto) => {
    const categoria = categorias[gasto.categoria as keyof typeof categorias];
    if (!categoria) return gasto.descripcion;
    
    if (gasto.subcategoria) {
      const subcategoria = categoria.subcategorias.find(sub => sub.id === gasto.subcategoria);
      return subcategoria ? `${categoria.name} - ${subcategoria.name}` : categoria.name;
    }
    
    return categoria.name;
  };

  return (
    <Tabs defaultValue={isEditable ? "agregar" : "historial"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger 
          value="agregar" 
          className="flex items-center gap-2"
          disabled={!isEditable}
        >
          <Receipt className="h-4 w-4" />
          Agregar Gasto
        </TabsTrigger>
        <TabsTrigger value="historial" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Historial
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="agregar" className="mt-4">
        <div className="space-y-4">
          {/* Formulario para agregar gasto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Gasto por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monto"
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                    disabled={!isEditable}
                  />
                </div>
              </div>

              {/* Selección de Categoría Principal */}
              <div className="space-y-3">
                <Label>Categoría del Gasto</Label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(categorias).map((categoria) => {
                    const IconComponent = categoria.icon;
                    const isSelected = categoriaSeleccionada === categoria.id;
                    
                    return (
                      <Button
                        key={categoria.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleCategoriaChange(categoria.id)}
                        className={`justify-start h-auto p-4 ${
                          isSelected ? 'bg-primary text-primary-foreground border-2 border-primary' : 'hover:' + categoria.bgColor
                        }`}
                        disabled={!isEditable}
                      >
                        <IconComponent className={`h-5 w-5 mr-3 ${isSelected ? 'text-primary-foreground' : categoria.color}`} />
                        <div className="text-left">
                          <div className={`font-medium ${isSelected ? 'text-primary-foreground' : ''}`}>
                            {categoria.name}
                          </div>
                          {categoria.subcategorias.length > 0 && (
                            <div className={`text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {categoria.subcategorias.length} opciones disponibles
                            </div>
                          )}
                        </div>
                        {categoria.subcategorias.length > 0 && (
                          <ChevronDown className={`h-4 w-4 ml-auto ${isSelected ? 'text-primary-foreground' : categoria.color}`} />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Selección de Subcategoría (solo para Servicios) */}
              {categoriaSeleccionada === 'servicios' && (
                <div className="space-y-3">
                  <Label>Tipo de Servicio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categorias.servicios.subcategorias.map((subcategoria) => {
                      const IconComponent = subcategoria.icon;
                      const isSelected = subcategoriaSeleccionada === subcategoria.id;
                      
                      return (
                        <Button
                          key={subcategoria.id}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSubcategoriaSeleccionada(subcategoria.id)}
                          className={`justify-start p-3 ${
                            isSelected ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'
                          }`}
                          disabled={!isEditable}
                        >
                          <IconComponent className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                          <span className={isSelected ? 'text-white' : 'text-blue-600'}>
                            {subcategoria.name}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Descripción Opcional */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción adicional 
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input
                  id="descripcion"
                  placeholder="Ej: Factura #123, pago mensual..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              
              <Button 
                onClick={handleAgregarGasto} 
                className="w-full"
                disabled={
                  !monto || 
                  !categoriaSeleccionada || 
                  (categoriaSeleccionada === 'servicios' && !subcategoriaSeleccionada) ||
                  !isEditable
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Gasto
              </Button>
            </CardContent>
          </Card>

          {/* Resumen rápido de gastos recientes */}
          {gastos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Últimos Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gastos.slice(-3).map((gasto) => {
                    const categoria = categorias[gasto.categoria as keyof typeof categorias];
                    const IconComponent = categoria?.icon || Receipt;
                    
                    return (
                      <div key={gasto.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${categoria?.bgColor || 'bg-gray-100'}`}>
                            <IconComponent className={`h-4 w-4 ${categoria?.color || 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getEtiquetaGasto(gasto)}</p>
                            {gasto.descripcion !== getEtiquetaGasto(gasto) && (
                              <p className="text-muted-foreground text-sm">{gasto.descripcion}</p>
                            )}
                            <p className="text-muted-foreground text-sm">{gasto.fecha}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-destructive">
                          -${toNumber(gasto.monto).toFixed(2)}
                        </Badge>
                      </div>
                    );
                  })}
                  {gastos.length > 3 && (
                    <p className="text-center text-muted-foreground">
                      Y {gastos.length - 3} gasto(s) más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="historial" className="mt-4">
        <HistorialGastos 
          gastos={gastos}
          onEliminarGasto={onEliminarGasto}
          onEditarGasto={onEditarGasto}
          isEditable={isEditable}
          showConfirmation={showConfirmation}
          getEtiquetaGasto={getEtiquetaGasto}
        />
      </TabsContent>
      
      <ConfirmationModal
        isOpen={isOpen}
        action={currentAction}
        onClose={hideConfirmation}
      />
    </Tabs>
  );
}