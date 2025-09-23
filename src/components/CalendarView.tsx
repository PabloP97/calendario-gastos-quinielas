import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CalendarDays, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "./ui/utils";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  diasFinalizados?: Set<string>;
}

export function CalendarView({ selectedDate, onDateSelect, diasFinalizados }: CalendarViewProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // TODO: SP_SELECT - Los días finalizados se cargan desde App.tsx al inicializar
  // EXEC SP_GetDiasFinalizados @usuario_id = ?
  
  // Nombres de días y meses en español
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Función para obtener días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const totalCells = 42; // 6 semanas × 7 días
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }
    
    return days;
  };

  // Función para verificar si un día está deshabilitado
  const isDayDisabled = (date: Date) => {
    // Deshabilitar domingos (day 0 = domingo)
    if (date.getDay() === 0) {
      return true;
    }
    
    // Deshabilitar días futuros
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (dateOnly > todayOnly) {
      return true;
    }
    
    return false;
  };

  // Función para verificar si es el día actual
  const isToday = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly.getTime() === todayOnly.getTime();
  };

  // Función para verificar si un día está seleccionado
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return dateOnly.getTime() === selectedOnly.getTime();
  };

  // Función para verificar si un día está finalizado
  const isFinalized = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return diasFinalizados?.has(dateKey) || false;
  };

  // Navegar meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Función para manejar click en día
  const handleDayClick = (date: Date, dayInfo: { isCurrentMonth: boolean }) => {
    if (!dayInfo.isCurrentMonth || isDayDisabled(date)) {
      return;
    }
    onDateSelect(date);
  };

  // Obtener días del mes actual
  const days = getDaysInMonth(currentDate);

  // Estadísticas del mes
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const finalizedDaysThisMonth = Array.from(diasFinalizados || []).filter(dateKey => {
    const date = new Date(dateKey);
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header con información del mes */}
      <Card className="bg-gradient-to-r from-primary/5 via-chart-1/5 to-chart-2/5 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl capitalize">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            Selecciona un día para gestionar tus gastos y quinielas
          </p>
          
          {/* Estadísticas rápidas */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {finalizedDaysThisMonth} días finalizados
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {daysInMonth} días en total
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Calendario principal */}
      <div className="flex justify-center">
        <Card className="w-full max-w-lg overflow-hidden shadow-lg border-2 border-primary/10">
          <CardContent className="p-6">
            {/* Header del calendario con navegación */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((dayInfo, index) => {
                const { date, isCurrentMonth } = dayInfo;
                const disabled = isDayDisabled(date);
                const today = isToday(date);
                const selected = isSelected(date);
                const finalized = isFinalized(date);

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "h-10 w-full p-0 text-sm relative",
                      "hover:bg-accent hover:text-accent-foreground",
                      !isCurrentMonth && "text-muted-foreground/40",
                      disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                      today && !selected && "bg-gradient-to-br from-chart-1 to-chart-2 text-white font-semibold border-2 border-chart-1 shadow-lg",
                      selected && "bg-primary text-primary-foreground font-semibold border-2 border-primary shadow-lg",
                      finalized && !selected && !today && "bg-gradient-to-br from-chart-4 to-chart-5 text-white font-semibold border-2 border-chart-4",
                      date.getDay() === 0 && "bg-red-50 dark:bg-red-950/20 relative"
                    )}
                    onClick={() => handleDayClick(date, dayInfo)}
                    disabled={disabled || !isCurrentMonth}
                  >
                    <span className="relative z-10">
                      {date.getDate()}
                    </span>
                    
                    {/* Indicadores especiales */}
                    {today && (
                      <span className="absolute bottom-0.5 right-0.5 text-xs">•</span>
                    )}
                    {finalized && (
                      <span className="absolute top-0.5 right-0.5 text-xs">✓</span>
                    )}
                    {date.getDay() === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-4 h-px bg-red-400 absolute"></span>
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-chart-1 to-chart-2 border-2 border-chart-1"></div>
              <span>Día actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-chart-4 to-chart-5 border-2 border-chart-4 relative">
                <span className="absolute -top-1 -right-1 text-white text-xs">✓</span>
              </div>
              <span>Día finalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-red-50 dark:bg-red-950/20 border border-red-200 relative">
                <span className="absolute top-1/2 left-1/2 w-2 h-px bg-red-400 transform -translate-x-1/2 -translate-y-1/2"></span>
              </div>
              <span>Domingos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-muted/50 border border-muted-foreground/30">
                <XCircle className="h-3 w-3 text-muted-foreground/50 m-0.5" />
              </div>
              <span>Días futuros</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}