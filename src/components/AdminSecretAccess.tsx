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
  Shield, 
  AlertCircle,
  Lock,
  UserPlus,
  ArrowLeft
} from "lucide-react";

interface AdminSecretAccessProps {
  onAccess: (secretKey: string) => Promise<boolean>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

export function AdminSecretAccess({ onAccess, onBackToLogin, isLoading }: AdminSecretAccessProps) {
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttempted(true);
    setError("");
    
    if (!secretKey.trim()) {
      setError("La clave secreta es requerida");
      return;
    }

    try {
      const success = await onAccess(secretKey);
      
      if (!success) {
        setError("Clave secreta incorrecta. Acceso denegado.");
        setSecretKey("");
      }
    } catch (error) {
      console.error("Error validando clave secreta:", error);
      setError("Error de validación. Inténtalo nuevamente.");
      setSecretKey("");
    }
  };

  const handleInputChange = (value: string) => {
    setSecretKey(value);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (hasAttempted && error) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Acceso Administrativo
            </h1>
            <h2 className="text-xl text-muted-foreground">
              Área Restringida
            </h2>
          </div>
          
          <p className="text-muted-foreground">
            Ingresa la clave secreta para acceder al panel de administración
          </p>
        </div>

        {/* Formulario de acceso secreto */}
        <Card className="border-2 shadow-xl border-red-500/20">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2 text-red-600">
              <Lock className="h-5 w-5" />
              Verificación Requerida
            </CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo Clave Secreta */}
              <div className="space-y-2">
                <Label htmlFor="secretKey">Clave Secreta</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="secretKey"
                    type={showSecret ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={secretKey}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`pl-10 pr-10 ${error ? 'border-destructive focus:border-destructive' : 'border-red-500/30 focus:border-red-500'}`}
                    disabled={isLoading}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Advertencia de seguridad */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">⚠️ Área de Alta Seguridad</p>
                    <p className="text-xs mt-1">
                      Solo personal autorizado puede acceder a esta sección.
                      El acceso no autorizado será registrado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
                disabled={isLoading || !secretKey.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando acceso...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Acceder al Panel
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToLogin}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Login
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer de seguridad */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>🔒 Conexión segura - SSL/TLS encriptado</p>
          <p>📋 Todos los intentos de acceso son registrados</p>
          <p className="text-red-600 dark:text-red-400 font-medium">
            ⚠️ Para administradores autorizados únicamente
          </p>
        </div>
      </div>
    </div>
  );
}