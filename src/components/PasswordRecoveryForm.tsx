import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, KeyRound, Mail, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";

interface PasswordRecoveryData {
  email: string;
}

interface PasswordRecoveryFormProps {
  onRecovery: (data: PasswordRecoveryData) => Promise<boolean>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

export function PasswordRecoveryForm({ onRecovery, onBackToLogin, isLoading }: PasswordRecoveryFormProps) {
  // Estados del formulario
  const [formData, setFormData] = useState<PasswordRecoveryData>({
    email: ""
  });

  // Estados de validación y errores
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  const [isEmailSent, setIsEmailSent] = useState(false);

  // Función para validar el email
  const validateEmail = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    return newErrors;
  };

  // Manejar envío de email de recuperación
  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateEmail();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    
    try {
      const success = await onRecovery(formData);
      if (success) {
        setIsEmailSent(true);
      } else {
        setErrors({ general: "No se encontró una cuenta asociada a este email" });
      }
    } catch (error) {
      console.error("Error en recuperación:", error);
      setErrors({ general: "Error al procesar la solicitud. Intenta nuevamente." });
    }
  };

  // Manejar cambios en el input de email
  const handleEmailChange = (value: string) => {
    setFormData({ email: value });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-1/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              {isEmailSent ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <KeyRound className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-semibold">
            {isEmailSent ? "¡Email Enviado!" : "Recuperar Contraseña"}
          </h1>
          <p className="text-muted-foreground">
            {isEmailSent 
              ? "Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña"
              : "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña"
            }
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              {isEmailSent ? (
                <>
                  <Mail className="h-5 w-5 text-green-600" />
                  Instrucciones Enviadas
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 text-primary" />
                  Recuperación por Email
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isEmailSent 
                ? "Hemos enviado las instrucciones de recuperación a tu email"
                : "Te enviaremos un enlace seguro para restablecer tu contraseña"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isEmailSent ? (
              /* Confirmación de email enviado */
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      ¡Email enviado exitosamente!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Hemos enviado las instrucciones de recuperación a:
                  </p>
                  <p className="font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded border">
                    {formData.email}
                  </p>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground">📧</span>
                    <span>Revisa tu bandeja de entrada y la carpeta de spam</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground">⏰</span>
                    <span>El enlace de recuperación expira en 1 hora por seguridad</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground">🔒</span>
                    <span>El enlace solo se puede usar una vez</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsEmailSent(false)}
                  variant="outline" 
                  className="w-full mt-4"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar a otro email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                {/* Mostrar error general */}
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                {/* Campo de Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email de tu cuenta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={errors.email ? "border-destructive focus:border-destructive" : ""}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Ingresa el email que usaste para crear tu cuenta de quiniela
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando email...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Email de Recuperación
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            {/* Botón para volver */}
            <div className="w-full">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline flex items-center justify-center gap-1 cursor-pointer"
                disabled={isLoading}
              >
                <ArrowLeft className="h-3 w-3" />
                Volver al inicio de sesión
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        {!isEmailSent && (
          <div className="text-center text-sm text-muted-foreground">
            <p>¿Recuerdas tu contraseña?</p>
            <button
              onClick={onBackToLogin}
              className="text-primary hover:underline cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}