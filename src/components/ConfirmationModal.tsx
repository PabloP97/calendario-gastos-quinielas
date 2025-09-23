import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export interface ConfirmationAction {
  type: 'add-gasto' | 'add-ingreso' | 'add-egreso' | 'edit' | 'delete';
  title: string;
  description: string;
  data?: any;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  action: ConfirmationAction | null;
  onClose: () => void;
}

export function ConfirmationModal({ isOpen, action, onClose }: ConfirmationModalProps) {
  if (!action) return null;

  const handleConfirm = () => {
    action.onConfirm();
    onClose();
  };

  const handleCancel = () => {
    action.onCancel?.();
    onClose();
  };

  const getActionIcon = () => {
    switch (action.type) {
      case 'add-gasto':
        return <DollarSign className="h-6 w-6 text-blue-500" />;
      case 'add-ingreso':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'add-egreso':
        return <TrendingDown className="h-6 w-6 text-orange-500" />;
      case 'edit':
        return <Edit className="h-6 w-6 text-primary" />;
      case 'delete':
        return <Trash2 className="h-6 w-6 text-destructive" />;
      default:
        return <CheckCircle className="h-6 w-6 text-primary" />;
    }
  };

  const getActionColor = () => {
    switch (action.type) {
      case 'delete':
        return 'bg-destructive hover:bg-destructive/90';
      case 'add-ingreso':
        return 'bg-green-500 hover:bg-green-600';
      case 'add-egreso':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'add-gasto':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getButtonText = () => {
    switch (action.type) {
      case 'add-gasto':
        return 'Agregar Gasto';
      case 'add-ingreso':
        return 'Registrar Ingreso';
      case 'add-egreso':
        return 'Registrar Egreso';
      case 'edit':
        return 'Guardar Cambios';
      case 'delete':
        return 'Eliminar';
      default:
        return 'Confirmar';
    }
  };

  const renderDataPreview = () => {
    if (!action.data) return null;

    return (
      <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
        <div className="font-medium mb-2 flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Detalles de la operación:
        </div>
        <div className="space-y-2 text-sm">
          {action.data.monto && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-medium">${action.data.monto}</span>
            </div>
          )}
          {action.data.categoria && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categoría:</span>
              <span className="font-medium">{action.data.categoria}</span>
            </div>
          )}
          {action.data.descripcion && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descripción:</span>
              <span className="font-medium">{action.data.descripcion}</span>
            </div>
          )}
          {action.data.fuente && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Juego:</span>
              <span className="font-medium">{action.data.fuente}</span>
            </div>
          )}
          {action.data.tipo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className={`font-medium ${
                action.data.tipo === 'ingreso' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {action.data.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            {getActionIcon()}
            {action.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {action.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {renderDataPreview()}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={getActionColor()}
          >
            {getButtonText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}