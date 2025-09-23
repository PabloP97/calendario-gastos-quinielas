import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  User, 
  AlertCircle,
  Calendar,
  DollarSign
} from "lucide-react";
import { LoginCredentials } from "../types";

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
  onShowRegister: () => void;
  onShowPasswordRecovery: () => void;
  isLoading: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ onLogin, onShowRegister, onShowPasswordRecovery, isLoading }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validación de email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "El email es requerido";
    }
    
    // Validación más estricta de email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return "Ingresa un email válido (ejemplo: usuario@dominio.com)";
    }
    
    if (email.length > 100) {
      return "El email no puede tener más de 100 caracteres";
    }
    
    return undefined;
  };

  // Validación de contraseña (relajada para demo)
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "La contraseña es requerida";
    }
    
    if (password.length < 3) {
      return "La contraseña debe tener al menos 3 caracteres";
    }
    
    if (password.length > 255) {
      return "La contraseña no puede tener más de 255 caracteres";
    }
    
    return undefined;
  };

  // Validar formulario completo
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    const emailError = validateEmail(credentials.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(credentials.password);
    if (passwordError) newErrors.password = passwordError;
    
    return newErrors;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar errores específicos del campo cuando el usuario empiece a escribir
    if (hasAttemptedSubmit && errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
        general: undefined // También limpiar error general
      }));
    }
  };

  // Manejar blur para validación en tiempo real
  const handleBlur = (field: 'email' | 'password') => {
    if (!hasAttemptedSubmit) return;
    
    let fieldError: string | undefined;
    
    if (field === 'email') {
      fieldError = validateEmail(credentials.email);
    } else if (field === 'password') {
      fieldError = validatePassword(credentials.password);
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      // TODO: SP_SELECT - Validar credenciales de usuario
      // EXEC SP_ValidateUserCredentials @email = ?, @password_hash = ?
      // EXEC SP_GetUserByEmail @email = ?
      
      const loginSuccess = await onLogin(credentials);
      
      if (!loginSuccess) {
        setErrors({
          general: "Email o contraseña incorrectos. Por favor, verifica tus credenciales."
        });
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      setErrors({
        general: error instanceof Error ? error.message : "Error de conexión. Por favor, intenta nuevamente."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-1/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header con branding */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="p-3 bg-chart-1/10 rounded-full">
              <DollarSign className="h-8 w-8 text-chart-1" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Gastos
            </h1>
            <h2 className="text-xl text-muted-foreground">
              y Quinielas
            </h2>
          </div>
          
          <p className="text-muted-foreground">
            Inicia sesión para acceder a tu calendario financiero
          </p>
        </div>

        {/* Formulario de login */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error general */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={credentials.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={credentials.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  disabled={isLoading}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Recordar mi sesión
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              {/* Links adicionales */}
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={onShowPasswordRecovery}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
                
                <div className="text-sm text-muted-foreground">
                  ¿No tienes cuenta? {" "}
                  <button
                    type="button"
                    onClick={onShowRegister}
                    className="register-button inline-flex items-center gap-1 text-primary px-3 py-2 rounded-md font-medium cursor-pointer"
                    disabled={isLoading}
                    title="Crear una nueva cuenta de quiniela"
                  >
                    <User className="h-3 w-3" />
                    Registrarse
                    <span className="register-arrow text-xs ml-1">→</span>
                  </button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Credenciales Demo */}
        <Card className="border border-chart-1/20 bg-chart-1/5">

        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Gestiona tus finanzas de manera segura y eficiente</p>

        </div>
      </div>
    </div>
  );
}