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
  Lock, 
  User, 
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { RegisterData } from "../types";

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<boolean>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

interface FormErrors {
  numeroQuiniela?: string;
  nombreQuiniela?: string;
  password?: string;
  confirmPassword?: string;
  preguntaSeguridad?: string;
  respuestaSeguridad?: string;
  general?: string;
}

const preguntasSeguridad = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu mejor amigo de la infancia?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu escuela primaria?",
  "¿Cuál es tu película favorita?",
  "¿Cuál es el nombre de tu madre?",
  "¿En qué año empezaste a trabajar?",
  "¿Cuál es tu número favorito?",
  "¿Cuál es tu color favorito?"
];

export function RegisterForm({ onRegister, onBackToLogin, isLoading }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    numeroQuiniela: "",
    nombreQuiniela: "",
    password: "",
    confirmPassword: "",
    preguntaSeguridad: "",
    respuestaSeguridad: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validación de número de quiniela
  const validateNumeroQuiniela = (numero: string): string | undefined => {
    if (!numero.trim()) {
      return "El número de quiniela es requerido";
    }
    
    // Solo números, entre 3 y 10 dígitos
    const numeroRegex = /^\d{3,10}$/;
    if (!numeroRegex.test(numero.trim())) {
      return "Debe ser un número de 3 a 10 dígitos";
    }
    
    return undefined;
  };

  // Validación de nombre de quiniela
  const validateNombreQuiniela = (nombre: string): string | undefined => {
    if (!nombre.trim()) {
      return "El nombre de quiniela es requerido";
    }
    
    if (nombre.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres";
    }
    
    if (nombre.length > 50) {
      return "El nombre no puede tener más de 50 caracteres";
    }
    
    // Solo letras, números, espacios y algunos caracteres especiales
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_\.]+$/;
    if (!nombreRegex.test(nombre)) {
      return "Solo se permiten letras, números, espacios y guiones";
    }
    
    return undefined;
  };

  // Validación de contraseña
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "La contraseña es requerida";
    }
    
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (password.length > 255) {
      return "La contraseña no puede tener más de 255 caracteres";
    }
    
    // Debe tener al menos una mayúscula, una minúscula y un número
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase) {
      return "La contraseña debe incluir al menos una letra mayúscula";
    }
    
    if (!hasLowercase) {
      return "La contraseña debe incluir al menos una letra minúscula";
    }
    
    if (!hasNumber) {
      return "La contraseña debe incluir al menos un número";
    }
    
    return undefined;
  };

  // Validación de confirmación de contraseña
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return "Debes confirmar tu contraseña";
    }
    
    if (confirmPassword !== password) {
      return "Las contraseñas no coinciden";
    }
    
    return undefined;
  };

  // Validación de pregunta de seguridad
  const validatePreguntaSeguridad = (pregunta: string): string | undefined => {
    if (!pregunta.trim()) {
      return "Debes seleccionar una pregunta de seguridad";
    }
    
    return undefined;
  };

  // Validación de respuesta de seguridad
  const validateRespuestaSeguridad = (respuesta: string): string | undefined => {
    if (!respuesta.trim()) {
      return "La respuesta de seguridad es requerida";
    }
    
    if (respuesta.trim().length < 2) {
      return "La respuesta debe tener al menos 2 caracteres";
    }
    
    if (respuesta.length > 100) {
      return "La respuesta no puede tener más de 100 caracteres";
    }
    
    return undefined;
  };

  // Validar formulario completo
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    const numeroError = validateNumeroQuiniela(formData.numeroQuiniela);
    if (numeroError) newErrors.numeroQuiniela = numeroError;
    
    const nombreError = validateNombreQuiniela(formData.nombreQuiniela);
    if (nombreError) newErrors.nombreQuiniela = nombreError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    const preguntaError = validatePreguntaSeguridad(formData.preguntaSeguridad);
    if (preguntaError) newErrors.preguntaSeguridad = preguntaError;
    
    const respuestaError = validateRespuestaSeguridad(formData.respuestaSeguridad);
    if (respuestaError) newErrors.respuestaSeguridad = respuestaError;
    
    return newErrors;
  };

  // Calcular fuerza de contraseña
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: "Débil", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Regular", color: "bg-yellow-500" };
    if (score <= 4) return { score, label: "Buena", color: "bg-blue-500" };
    return { score, label: "Excelente", color: "bg-green-500" };
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({
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
  const handleBlur = (field: keyof RegisterData) => {
    if (!hasAttemptedSubmit) return;
    
    let fieldError: string | undefined;
    
    switch (field) {
      case 'numeroQuiniela':
        fieldError = validateNumeroQuiniela(formData.numeroQuiniela);
        break;
      case 'nombreQuiniela':
        fieldError = validateNombreQuiniela(formData.nombreQuiniela);
        break;
      case 'password':
        fieldError = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(formData.confirmPassword, formData.password);
        break;
      case 'preguntaSeguridad':
        fieldError = validatePreguntaSeguridad(formData.preguntaSeguridad);
        break;
      case 'respuestaSeguridad':
        fieldError = validateRespuestaSeguridad(formData.respuestaSeguridad);
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

    try {
      // TODO: SP_INSERT - Crear nuevo usuario
      // EXEC SP_CreateUser @numero_quiniela = ?, @nombre_quiniela = ?, @password_hash = ?, @pregunta_seguridad = ?, @respuesta_seguridad = ?
      
      const registerSuccess = await onRegister(formData);
      
      if (!registerSuccess) {
        setErrors({
          general: "El número de quiniela ya está registrado. Por favor, intenta con otro número."
        });
      }
    } catch (error) {
      console.error("Error durante el registro:", error);
      setErrors({
        general: "Error de conexión. Por favor, intenta nuevamente."
      });
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

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
              Registro de Usuario
            </h1>
            <h2 className="text-xl text-muted-foreground">
              Gestión de Gastos y Quinielas
            </h2>
          </div>
          
          <p className="text-muted-foreground">
            Completa la información para crear tu cuenta
          </p>
        </div>

        {/* Formulario de registro */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Crear Cuenta
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

              {/* Campo Número de Quiniela */}
              <div className="space-y-2">
                <Label htmlFor="numeroQuiniela">Número de Quiniela</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="numeroQuiniela"
                    type="text"
                    placeholder="12345"
                    value={formData.numeroQuiniela}
                    onChange={(e) => handleInputChange("numeroQuiniela", e.target.value)}
                    onBlur={() => handleBlur('numeroQuiniela')}
                    className={`pl-10 ${errors.numeroQuiniela ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>
                {errors.numeroQuiniela && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.numeroQuiniela}
                  </p>
                )}
              </div>

              {/* Campo Nombre de Quiniela */}
              <div className="space-y-2">
                <Label htmlFor="nombreQuiniela">Nombre de Quiniela</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nombreQuiniela"
                    type="text"
                    placeholder="Mi Quiniela Favorita"
                    value={formData.nombreQuiniela}
                    onChange={(e) => handleInputChange("nombreQuiniela", e.target.value)}
                    onBlur={() => handleBlur('nombreQuiniela')}
                    className={`pl-10 ${errors.nombreQuiniela ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                </div>
                {errors.nombreQuiniela && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.nombreQuiniela}
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
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                    maxLength={255}
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
                
                {/* Indicador de fuerza de contraseña */}
                {formData.password && !errors.password && passwordStrength && (
                  <div className="text-xs space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-full rounded ${
                            level <= passwordStrength.score 
                              ? passwordStrength.color 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Fuerza: <span className={`font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-600' : 
                        passwordStrength.score >= 3 ? 'text-blue-600' :
                        passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
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
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
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

              {/* Campo Pregunta de Seguridad */}
              <div className="space-y-2">
                <Label htmlFor="preguntaSeguridad">Pregunta de Seguridad</Label>
                <div className="relative">
                  <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    id="preguntaSeguridad"
                    value={formData.preguntaSeguridad}
                    onChange={(e) => handleInputChange("preguntaSeguridad", e.target.value)}
                    onBlur={() => handleBlur('preguntaSeguridad')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      errors.preguntaSeguridad ? 'border-destructive focus:ring-destructive' : 'border-input'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona una pregunta...</option>
                    {preguntasSeguridad.map((pregunta, index) => (
                      <option key={index} value={pregunta}>
                        {pregunta}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.preguntaSeguridad && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.preguntaSeguridad}
                  </p>
                )}
              </div>

              {/* Campo Respuesta de Seguridad */}
              <div className="space-y-2">
                <Label htmlFor="respuestaSeguridad">Respuesta de Seguridad</Label>
                <Input
                  id="respuestaSeguridad"
                  type="text"
                  placeholder="Tu respuesta"
                  value={formData.respuestaSeguridad}
                  onChange={(e) => handleInputChange("respuestaSeguridad", e.target.value)}
                  onBlur={() => handleBlur('respuestaSeguridad')}
                  className={errors.respuestaSeguridad ? 'border-destructive focus:border-destructive' : ''}
                  disabled={isLoading}
                  maxLength={100}
                />
                {errors.respuestaSeguridad && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.respuestaSeguridad}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Esta respuesta te permitirá recuperar tu contraseña en caso de olvido
                </p>
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
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>

              {/* Link para volver al login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline flex items-center justify-center gap-1 cursor-pointer"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-3 w-3" />
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Crea tu cuenta y comienza a gestionar tus finanzas</p>
        </div>
      </div>
    </div>
  );
}