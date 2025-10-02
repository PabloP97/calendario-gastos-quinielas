import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  UserPlus, 
  AlertCircle,
  Building,
  Mail,
  User,
  Lock,
  CheckCircle,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import apiService from "../services/apiService";

interface CreateUserData {
  username: string;
  email: string;
  nombre: string;
  nombreQuiniela: string;
  numeroQuiniela: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  nombre?: string;
  nombreQuiniela?: string;
  numeroQuiniela?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface AdminUserManagementProps {
  onClose: () => void;
}

export function AdminUserManagement({ onClose }: AdminUserManagementProps) {
  const [userData, setUserData] = useState<CreateUserData>({
    username: "",
    email: "",
    nombre: "",
    nombreQuiniela: "",
    numeroQuiniela: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [createdSuccessfully, setCreatedSuccessfully] = useState(false);

  // Validaciones
  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return "El nombre de usuario es requerido";
    }
    
    if (username.length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres";
    }
    
    if (username.length > 50) {
      return "El nombre de usuario no puede tener más de 50 caracteres";
    }
    
    // Solo letras, números, guiones y guiones bajos
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos";
    }
    
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "El email es requerido";
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return "Ingresa un email válido";
    }
    
    if (email.length > 100) {
      return "El email no puede tener más de 100 caracteres";
    }
    
    return undefined;
  };

  const validateNombre = (nombre: string): string | undefined => {
    if (!nombre.trim()) {
      return "El nombre es requerido";
    }
    
    if (nombre.length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    
    if (nombre.length > 50) {
      return "El nombre no puede tener más de 50 caracteres";
    }
    
    return undefined;
  };

  const validateNombreQuiniela = (nombreQuiniela: string): string | undefined => {
    if (!nombreQuiniela.trim()) {
      return "El nombre de la quiniela es requerido";
    }
    
    if (nombreQuiniela.length < 2) {
      return "El nombre de la quiniela debe tener al menos 2 caracteres";
    }
    
    if (nombreQuiniela.length > 100) {
      return "El nombre de la quiniela no puede tener más de 100 caracteres";
    }
    
    return undefined;
  };

  const validateNumeroQuiniela = (numeroQuiniela: string): string | undefined => {
    if (!numeroQuiniela.trim()) {
      return "El número de quiniela es requerido";
    }
    
    // Solo números permitidos
    if (!/^\d+$/.test(numeroQuiniela)) {
      return "El número de quiniela solo puede contener dígitos";
    }
    
    if (numeroQuiniela.length < 4) {
      return "El número de quiniela debe tener al menos 4 dígitos";
    }
    
    if (numeroQuiniela.length > 15) {
      return "El número de quiniela no puede tener más de 15 dígitos";
    }
    
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "La contraseña es requerida";
    }
    
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (password.length > 255) {
      return "La contraseña no puede tener más de 255 caracteres";
    }
    
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return "Confirma la contraseña";
    }
    
    if (confirmPassword !== password) {
      return "Las contraseñas no coinciden";
    }
    
    return undefined;
  };

  // Validar formulario completo
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    const usernameError = validateUsername(userData.username);
    if (usernameError) newErrors.username = usernameError;
    
    const emailError = validateEmail(userData.email);
    if (emailError) newErrors.email = emailError;
    
    const nombreError = validateNombre(userData.nombre);
    if (nombreError) newErrors.nombre = nombreError;
    
    const nombreQuinielaError = validateNombreQuiniela(userData.nombreQuiniela);
    if (nombreQuinielaError) newErrors.nombreQuiniela = nombreQuinielaError;
    
    const numeroQuinielaError = validateNumeroQuiniela(userData.numeroQuiniela);
    if (numeroQuinielaError) newErrors.numeroQuiniela = numeroQuinielaError;
    
    const passwordError = validatePassword(userData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(userData.confirmPassword, userData.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    return newErrors;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar errores específicos del campo cuando el usuario empiece a escribir
    if (hasAttemptedSubmit && errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
        general: undefined
      }));
    }
  };

  // Manejar blur para validación en tiempo real
  const handleBlur = (field: keyof CreateUserData) => {
    if (!hasAttemptedSubmit) return;
    
    let fieldError: string | undefined;
    
    switch (field) {
      case 'username':
        fieldError = validateUsername(userData.username);
        break;
      case 'email':
        fieldError = validateEmail(userData.email);
        break;
      case 'nombre':
        fieldError = validateNombre(userData.nombre);
        break;
      case 'nombreQuiniela':
        fieldError = validateNombreQuiniela(userData.nombreQuiniela);
        break;
      case 'numeroQuiniela':
        fieldError = validateNumeroQuiniela(userData.numeroQuiniela);
        break;
      case 'password':
        fieldError = validatePassword(userData.password);
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(userData.confirmPassword, userData.password);
        break;
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

    setIsCreating(true);

    try {
      // TODO: SP_INSERT - Crear nuevo usuario desde admin
      // EXEC SP_AdminCreateUser @email = ?, @nombre = ?, @nombre_quiniela = ?, @password_hash = ?
      
      const success = await apiService.adminCreateUser({
        username: userData.username,
        email: userData.email,
        nombre: userData.nombre,
        nombreQuiniela: userData.nombreQuiniela,
        numeroQuiniela: userData.numeroQuiniela,
        password: userData.password
      });
      
      if (success) {
        setCreatedSuccessfully(true);
        
        toast.success("Usuario creado exitosamente", {
          description: `El usuario ${userData.nombre} ha sido creado con usuario: ${userData.username}`,
          duration: 4000,
        });

        // Limpiar formulario
        setUserData({
          username: "",
          email: "",
          nombre: "",
          nombreQuiniela: "",
          numeroQuiniela: "",
          password: "",
          confirmPassword: ""
        });
        setErrors({});
        setHasAttemptedSubmit(false);

        // Cerrar después de 2 segundos para mostrar el éxito
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error("No se pudo crear el usuario");
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
      
      let errorMessage = "Error al crear usuario";
      
      if (error instanceof Error) {
        if (error.message.includes('email ya existe') || error.message.includes('UNIQUE constraint')) {
          errorMessage = "Ya existe un usuario con este email";
        } else if (error.message.includes('conexión')) {
          errorMessage = "Error de conexión con el servidor";
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({
        general: errorMessage
      });
      
      toast.error("Error al crear usuario", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (createdSuccessfully) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-1/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-green-600">
                ¡Usuario Creado Exitosamente!
              </h2>
              <p className="text-muted-foreground">
                El usuario <strong>{userData.nombre}</strong> ha sido creado con el email <strong>{userData.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Cerrando automáticamente...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-1/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Crear Usuario
            </h1>
            <h2 className="text-xl text-muted-foreground">
              Panel de Administración
            </h2>
          </div>
          
          <p className="text-muted-foreground">
            Crea una nueva cuenta de usuario para el sistema
          </p>
        </div>

        {/* Formulario */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Nuevo Usuario
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

              {/* Campo Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario (para iniciar sesión)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="juan_perez"
                    value={userData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    onBlur={() => handleBlur('username')}
                    className={`pl-10 ${errors.username ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Solo letras, números, guiones y guiones bajos. El cliente usará este nombre para iniciar sesión.
                </p>
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={userData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
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

              {/* Campo Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    value={userData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    onBlur={() => handleBlur('nombre')}
                    className={`pl-10 ${errors.nombre ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                    autoComplete="name"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Campo Nombre de Quiniela */}
              <div className="space-y-2">
                <Label htmlFor="nombreQuiniela">Nombre de la Quiniela</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombreQuiniela"
                    type="text"
                    placeholder="Quiniela San José"
                    value={userData.nombreQuiniela}
                    onChange={(e) => handleInputChange("nombreQuiniela", e.target.value)}
                    onBlur={() => handleBlur('nombreQuiniela')}
                    className={`pl-10 ${errors.nombreQuiniela ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                  />
                </div>
                {errors.nombreQuiniela && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.nombreQuiniela}
                  </p>
                )}
              </div>

              {/* Campo Número de Quiniela */}
              <div className="space-y-2">
                <Label htmlFor="numeroQuiniela">Número de Quiniela</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="numeroQuiniela"
                    type="text"
                    placeholder="12345678"
                    value={userData.numeroQuiniela}
                    onChange={(e) => handleInputChange("numeroQuiniela", e.target.value)}
                    onBlur={() => handleBlur('numeroQuiniela')}
                    className={`pl-10 ${errors.numeroQuiniela ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                {errors.numeroQuiniela && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.numeroQuiniela}
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
                    value={userData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isCreating}
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

              {/* Campo Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={userData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isCreating}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isCreating}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando usuario...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full"
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Panel de administración - Crear usuarios del sistema</p>
        </div>
      </div>
    </div>
  );
}