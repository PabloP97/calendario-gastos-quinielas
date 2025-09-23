import { useState, useEffect } from "react";
import { CalendarView } from "./components/CalendarView";
import { DayDetailsPanel } from "./components/DayDetailsPanel";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { PasswordRecoveryForm } from "./components/PasswordRecoveryForm";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { User, LoginCredentials, RegisterData, PasswordRecoveryData } from "./types";
import apiService from "./services/apiService";

export default function App() {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  // Estados existentes
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [diasFinalizados, setDiasFinalizados] = useState<Set<string>>(new Set());

  // TODO: SP_SELECT - Al cargar la aplicación, verificar sesión existente
  // EXEC SP_ValidateSession @session_token = ?

  // TODO: SP_SELECT - Al cargar la aplicación autenticada, ejecutar SP para obtener todos los días finalizados
  // EXEC SP_GetDiasFinalizados @usuario_id = ?

  // Verificar sesión existente al cargar la aplicación
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Validar sesión con el backend real
        const user = await apiService.validateSession();

        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);

          // Cargar días finalizados para el usuario autenticado
          const diasFinalizadosArray = await apiService.obtenerDiasFinalizados();
          setDiasFinalizados(new Set(diasFinalizadosArray));

          toast.success(`Sesión restaurada`, {
            description: `Bienvenido de nuevo, ${user.nombre}`,
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        // Limpiar datos locales si la sesión es inválida
        localStorage.removeItem('auth_token');
        localStorage.removeItem('remembered_session');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkExistingSession();
  }, []);

  // Función para manejar el login
  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoggingIn(true);

    try {
      // Realizar login con el backend real
      const { user, token } = await apiService.login(credentials);

      setCurrentUser(user);
      setIsAuthenticated(true);

      // Cargar días finalizados del usuario autenticado
      const diasFinalizadosArray = await apiService.obtenerDiasFinalizados();
      setDiasFinalizados(new Set(diasFinalizadosArray));

      // Mostrar notificación de bienvenida
      toast.success(`¡Bienvenido, ${user.nombre}!`, {
        description: "Has iniciado sesión correctamente",
        duration: 3000,
      });

      return true;
    } catch (error) {
      console.error("Error durante el login:", error);

      let errorMessage = "Credenciales inválidas";
      let errorDescription = "Verifica tu email y contraseña";

      if (error instanceof Error) {
        if (error.message.includes('Error de conexión')) {
          errorMessage = "Servicio no disponible";
          errorDescription = "No se pudo conectar con el servidor. Inténtalo más tarde.";
        } else {
          errorMessage = "Error de autenticación";
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000,
      });
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Función para manejar el registro
  const handleRegister = async (registerData: RegisterData): Promise<boolean> => {
    setIsRegistering(true);

    try {
      // Realizar registro con el backend real
      const { user, token } = await apiService.register(registerData);

      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowRegister(false);

      // Mostrar notificación de registro exitoso
      toast.success(`¡Bienvenido, ${user.nombre}!`, {
        description: "Tu cuenta ha sido creada exitosamente",
        duration: 4000,
      });

      return true;
    } catch (error) {
      console.error("Error durante el registro:", error);
      toast.error("Error en el registro", {
        description: error instanceof Error ? error.message : "No se pudo crear la cuenta",
        duration: 4000,
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  // Función para manejar la recuperación de contraseña por email
  const handlePasswordRecovery = async (recoveryData: PasswordRecoveryData): Promise<boolean> => {
    setIsRecoveringPassword(true);

    try {
      // Enviar solicitud de recuperación al backend real
      const success = await apiService.sendPasswordRecovery(recoveryData);

      if (!success) {
        toast.error("Email no encontrado", {
          description: "No se encontró una cuenta asociada a este email",
          duration: 4000,
        });
      }

      return success;
    } catch (error) {
      console.error("Error durante la recuperación:", error);
      toast.error("Error en la recuperación", {
        description: error instanceof Error ? error.message : "No se pudo enviar el email de recuperación",
        duration: 4000,
      });
      return false;
    } finally {
      setIsRecoveringPassword(false);
    }
  };

  // Función para logout
  const handleLogout = async () => {
    try {
      // Cerrar sesión en el backend
      await apiService.logout();

      toast.info("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
        duration: 2000,
      });

      setCurrentUser(null);
      setIsAuthenticated(false);
      setSelectedDate(undefined);
      setDiasFinalizados(new Set());
    } catch (error) {
      console.error("Error durante el logout:", error);
      toast.error("Error al cerrar sesión", {
        description: "Hubo un problema al cerrar la sesión",
      });
    }
  };

  // Función para determinar si un día es editable (solo el día actual Y no finalizado)
  const isDayEditable = (date: Date) => {
    const today = new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // El día debe ser el día actual Y no estar finalizado
    const isToday = dateOnly.getTime() === todayOnly.getTime();
    const dateKey = dateOnly.toISOString().split('T')[0];
    const isFinalized = diasFinalizados.has(dateKey);

    return isToday && !isFinalized;
  };

  // Función para cargar datos al seleccionar un día
  const handleDateSelect = async (date: Date | undefined) => {
    if (date) {
      setIsLoadingDay(true);

      try {
        // Cargar todos los datos del día seleccionado desde el backend
        const fechaStr = date.toISOString().split('T')[0];
        const datosDia = await apiService.obtenerDatosDia(fechaStr);

        // Los datos se cargarán automáticamente cuando el DayDetailsPanel se monte
        // con la fecha seleccionada
        setSelectedDate(date);
      } catch (error) {
        console.error("Error cargando datos del día:", error);
        toast.error("Error", {
          description: "No se pudieron cargar los datos del día seleccionado",
          duration: 3000,
        });
      } finally {
        setIsLoadingDay(false);
      }
    } else {
      setSelectedDate(undefined);
    }
  };

  // Función para finalizar un día
  const handleFinalizarDia = async (): Promise<void> => {
    if (!selectedDate || !currentUser) return;
    setIsLoadingDay(true);

    try {
      // Finalizar día en el backend
      const fechaStr = selectedDate.toISOString().split('T')[0];
      const success = await apiService.finalizarDia(fechaStr);

      if (success) {
        // Agregar el día a la lista de días finalizados
        setDiasFinalizados((prev: Set<string>) => new Set([...prev, fechaStr]));

        toast.success("Día finalizado", {
          description: "El día ha sido finalizado correctamente",
          duration: 3000,
        });
      } else {
        throw new Error("No se pudo finalizar el día");
      }
    } catch (error) {
      console.error("Error finalizando día:", error);
      toast.error("Error", {
        description: "No se pudo finalizar el día. Inténtalo de nuevo.",
        duration: 4000,
      });
    } finally {
      setIsLoadingDay(false);
    }
  };

  // Pantalla de carga inicial
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-1/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Cargando aplicación...</h2>
            <p className="text-muted-foreground">Verificando sesión existente</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar formulario de login, registro o recuperación si no está autenticado
  if (!isAuthenticated) {
    if (showPasswordRecovery) {
      return (
        <PasswordRecoveryForm
          onRecovery={handlePasswordRecovery}
          onBackToLogin={() => setShowPasswordRecovery(false)}
          isLoading={isRecoveringPassword}
        />
      );
    } else if (showRegister) {
      return (
        <RegisterForm
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
          isLoading={isRegistering}
        />
      );
    } else {
      return (
        <LoginForm
          onLogin={handleLogin}
          onShowRegister={() => setShowRegister(true)}
          onShowPasswordRecovery={() => setShowPasswordRecovery(true)}
          isLoading={isLoggingIn}
        />
      );
    }
  }

  // Aplicación principal (usuario autenticado)
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header superior con información del usuario */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border shadow-lg backdrop-blur-sm bg-card/95">
          <div className="text-right">
            <p className="font-medium text-sm">Bienvenido, {currentUser?.nombre}</p>
            <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors flex items-center gap-2"
          >
            <LogOut className="h-3 w-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Título principal centrado */}
        <div className="mb-8 text-center">
          <h1 className="mb-2">Gestión de Gastos y Quinielas</h1>
          <p className="text-muted-foreground">
            Selecciona un día del calendario para gestionar tus gastos diarios y quinielas
          </p>
        </div>

        <div className="flex justify-center relative min-h-[600px]">
          {!selectedDate && !isLoadingDay ? (
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              diasFinalizados={diasFinalizados}
            />
          ) : selectedDate && !isLoadingDay ? (
            <div className="w-full max-w-4xl">
              <DayDetailsPanel
                selectedDate={selectedDate}
                isEditable={isDayEditable(selectedDate)}
                onVolver={() => handleDateSelect(undefined)}
                onFinalizarDia={handleFinalizarDia}
              />
            </div>
          ) : null}

          {/* Loading Overlay para selección de día */}
          {isLoadingDay && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60]">
              <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-xl border-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {selectedDate && diasFinalizados.has(selectedDate.toISOString().split('T')[0])
                    ? "Finalizando día..."
                    : "Cargando información del día..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {!selectedDate && !isLoadingDay && (
          <div className="text-center mt-8 p-8 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">
              👆 Haz click en un día del calendario para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Toaster para notificaciones */}
      <Toaster />
    </div>
  );
}
