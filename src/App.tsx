import { useState, useEffect } from "react";
import { CalendarView } from "./components/CalendarView";
import { DayDetailsPanel } from "./components/DayDetailsPanel";
import { LoginForm } from "./components/LoginForm";

import { AdminUserManagement } from "./components/AdminUserManagement";
import { AdminSecretAccess } from "./components/AdminSecretAccess";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { User, LoginCredentials } from "./types";
import apiService from "./services/apiService";

// 🔧 AGREGADO: Función helper para normalizar fechas
const normalizarFecha = (fecha: string): string => {
  // Convertir cualquier formato de fecha a YYYY-MM-DD
  const date = new Date(fecha);
  return date.toISOString().split('T')[0];
};

export default function App() {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminSecretAccess, setShowAdminSecretAccess] = useState(false);
  const [isValidatingSecret, setIsValidatingSecret] = useState(false);

  // Estados existentes
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [diasFinalizados, setDiasFinalizados] = useState<Set<string>>(new Set());
  const [calendarKey, setCalendarKey] = useState(0);

  // TODO: SP_SELECT - Al cargar la aplicación, verificar sesión existente
  // EXEC SP_ValidateSession @session_token = ?
  
  // TODO: SP_SELECT - Al cargar la aplicación autenticada, ejecutar SP para obtener todos los días finalizados
  // EXEC SP_GetDiasFinalizados @usuario_id = ?

  // 🔧 AGREGADO: useEffect para detectar cambios en diasFinalizados
  useEffect(() => {
    console.log('👀 Cambio detectado en diasFinalizados:', diasFinalizados);
  }, [diasFinalizados]);

  // 🔐 NUEVO: useEffect para detectar URL de administración
  useEffect(() => {
    const checkAdminURL = () => {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      // Detectar rutas de administración: /admin, /#admin, /#/admin
      const isAdminRoute = currentPath === '/admin' || 
                          currentHash === '#admin' || 
                          currentHash === '#/admin' ||
                          currentPath.includes('/admin');
      
      if (isAdminRoute && !isAuthenticated) {
        setShowAdminSecretAccess(true);
        console.log('🔐 Acceso administrativo detectado - mostrando verificación de seguridad');
      }
    };

    checkAdminURL();
    
    // Escuchar cambios en la URL
    window.addEventListener('popstate', checkAdminURL);
    window.addEventListener('hashchange', checkAdminURL);
    
    return () => {
      window.removeEventListener('popstate', checkAdminURL);
      window.removeEventListener('hashchange', checkAdminURL);
    };
  }, [isAuthenticated]);

  // Verificar sesión existente al cargar la aplicación
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Validar sesión con el backend real
        const user = await apiService.validateSession();
        
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // 🔧 AGREGADO: Logs de debugging para días finalizados
          console.log('🔍 Cargando días finalizados del usuario:', user.id);
          const diasFinalizadosArray = await apiService.obtenerDiasFinalizados();
          console.log('📅 Días finalizados obtenidos del backend:', diasFinalizadosArray);
          
          const diasFinalizadosNormalizados = diasFinalizadosArray.map(normalizarFecha);
          console.log('📅 Días finalizados normalizados:', diasFinalizadosNormalizados);
          
          const diasFinalizadosSet = new Set(diasFinalizadosNormalizados);
          console.log('🗂️ Set de días finalizados creado:', diasFinalizadosSet);
          
          setDiasFinalizados(diasFinalizadosSet);
          console.log('✅ Estado actualizado - días finalizados establecidos');
          
          // 🔧 COMENTADO: Toast de sesión restaurada que molesta al usuario
          // toast.success(`Sesión restaurada`, {
          //   description: `Bienvenido de nuevo, ${user.nombre}`,
          //   duration: 2000,
          // });
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
      
      // 🔧 AGREGADO: Logs de debugging para login
      console.log('🔍 Login exitoso, cargando días finalizados del usuario:', user.id);
      const diasFinalizadosArray = await apiService.obtenerDiasFinalizados();
      console.log('📅 Días finalizados obtenidos en login:', diasFinalizadosArray);
      
      const diasFinalizadosNormalizados = diasFinalizadosArray.map(normalizarFecha);
      console.log('📅 Días finalizados normalizados en login:', diasFinalizadosNormalizados);
      
      const diasFinalizadosSet = new Set(diasFinalizadosNormalizados);
      console.log('🗂️ Set de días finalizados en login:', diasFinalizadosSet);
      
      setDiasFinalizados(diasFinalizadosSet);
      console.log('✅ Estado login actualizado - días finalizados establecidos');
      
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

  // 🔐 NUEVO: Función para validar clave secreta administrativa
  const handleValidateSecretKey = async (secretKey: string): Promise<boolean> => {
    setIsValidatingSecret(true);
    
    try {
      // Obtener clave secreta desde variable de entorno o usar fallback
      const validSecretKey = import.meta.env.VITE_ADMIN_SECRET_KEY || "Duki9796";
      
      // Simular latencia de validación para mayor realismo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (secretKey === validSecretKey) {
        console.log('✅ Clave secreta válida - acceso administrativo autorizado');
        setShowAdminSecretAccess(false);
        setShowAdminPanel(true);
        
        toast.success("Acceso autorizado", {
          description: "Bienvenido al panel de administración",
          duration: 3000,
        });
        
        // Limpiar la URL para mayor seguridad
        window.history.replaceState({}, '', '/');
        
        return true;
      } else {
        console.warn('❌ Intento de acceso administrativo con clave incorrecta');
        
        toast.error("Acceso denegado", {
          description: "Clave secreta incorrecta",
          duration: 4000,
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error validando clave secreta:", error);
      
      toast.error("Error de validación", {
        description: "No se pudo validar la clave secreta",
        duration: 4000,
      });
      
      return false;
    } finally {
      setIsValidatingSecret(false);
    }
  };

  // Función para cerrar el acceso secreto y volver al login
  const handleCloseSecretAccess = () => {
    setShowAdminSecretAccess(false);
    
    // Limpiar la URL
    window.history.replaceState({}, '', '/');
    
    toast.info("Acceso cancelado", {
      description: "Regresando al login principal",
      duration: 2000,
    });
  };

  // Función para cerrar el panel de administración
  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
    
    toast.info("Panel cerrado", {
      description: "Regresando al login principal",
      duration: 2000,
    });
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
        // 🔧 AGREGADO: Logs de debugging
        console.log('✅ Día finalizado exitosamente en backend:', fechaStr);
        
        // Agregar el día a la lista de días finalizados
        setDiasFinalizados((prev: Set<string>) => {
          const nuevoSet = new Set([...prev, fechaStr]);
          console.log('🗂️ Nuevo set de días finalizados:', nuevoSet);
          return nuevoSet;
        });
        
        // Forzar re-renderizado del calendario
        setCalendarKey(prev => prev + 1);
        
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

  // Mostrar formulario de login, recuperación, acceso secreto o panel de admin si no está autenticado
  if (!isAuthenticated) {
    if (showAdminPanel) {
      return (
        <AdminUserManagement 
          onClose={handleCloseAdminPanel}
        />
      );
    } else if (showAdminSecretAccess) {
      return (
        <AdminSecretAccess 
          onAccess={handleValidateSecretKey}
          onBackToLogin={handleCloseSecretAccess}
          isLoading={isValidatingSecret}
        />
      );
    } else {
      return (
        <LoginForm 
          onLogin={handleLogin}
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
              key={calendarKey} // 🔧 AGREGADO: Key para forzar re-renderizado
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