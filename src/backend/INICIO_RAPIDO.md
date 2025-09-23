# 🚀 Inicio Rápido del Backend

## ⚡ **Para probarlo AHORA (sin MySQL):**

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Iniciar servidor simple:**
   ```bash
   npm run simple
   ```

3. **¡Listo!** El backend estará funcionando en `http://localhost:4000`

## 🔐 **Credenciales Demo:**
- **Email:** `admin@demo.com`
- **Password:** `demo123`

## ✅ **Verificar que funciona:**

Abre tu navegador en: `http://localhost:4000/api/v1/health`

Deberías ver:
```json
{
  "success": true,
  "message": "Backend funcionando correctamente",
  "timestamp": "...",
  "environment": "development"
}
```

## 🧪 **Probar Login desde el Frontend:**

1. Inicia el backend: `npm run simple`
2. Inicia el frontend en otra terminal
3. Usa las credenciales demo para hacer login

## 📝 **Nota:**
Este es un servidor simple para pruebas. Para el backend completo con MySQL, sigue las instrucciones en `CONFIGURACION.md`.

## 🔧 **Solución de Problemas:**

### Error: "EADDRINUSE: port 4000 already in use"
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <numero_proceso> /F

# macOS/Linux  
lsof -ti:4000 | xargs kill -9
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de CORS
Verifica que el frontend esté en `http://localhost:3000`

## 🎯 **Próximos Pasos:**
1. ✅ Probar login con credenciales demo
2. ✅ Verificar que el frontend se conecta
3. 📝 Configurar MySQL para datos persistentes
4. 🔄 Migrar al backend completo con TypeScript