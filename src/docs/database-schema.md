# 🗄️ **Esquema de Base de Datos**

Documentación completa del esquema de base de datos MySQL para el **Calendario de Gastos y Quinielas**.

## 📋 **Tabla de Contenidos**

- [📊 Diagrama de Relaciones](#-diagrama-de-relaciones)
- [🔧 Tablas Principales](#-tablas-principales)
- [⚙️ Stored Procedures](#️-stored-procedures)
- [📈 Índices y Optimización](#-índices-y-optimización)
- [🚀 Migración y Setup](#-migración-y-setup)

## 📊 **Diagrama de Relaciones**

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     usuarios    │       │ sesiones_usuario │       │ dias_finalizados│
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │<──────│ usuario_id (FK)  │       │ usuario_id (FK) │<───┐
│ username        │       │ session_token    │       │ fecha           │    │
│ nombre_quiniela │       │ remember_token   │       │ fecha_finalizac.│    │
│ email           │       │ ip_address       │       └─────────────────┘    │
│ password_hash   │       │ fecha_expiracion │                              │
│ activo          │       └──────────────────┘                              │
└─────────────────┘                                                         │
         │                                                                  │
         │                                                                  │
         ├──────────────────────────────────────────────────────────────────┘
         │
         │       ┌─────────────────┐       ┌──────────────────────┐
         ├───────│     gastos      │       │ transacciones_quiniela│
         │       ├─────────────────┤       ├──────────────────────┤
         │       │ id (PK)         │       │ id (PK)              │
         │       │ usuario_id (FK) │       │ usuario_id (FK)      │
         │       │ monto           │       │ tipo                 │
         │       │ categoria       │       │ categoria            │
         │       │ subcategoria    │       │ monto                │
         │       │ descripcion     │       │ fuente               │
         │       │ fecha           │       │ fecha                │
         │       │ activo          │       │ activo               │
         │       └─────────────────┘       └──────────────────────┘
         │
         │       ┌────────────────────┐
         └───────│configuracion_horarios│
                 ├────────────────────┤
                 │ usuario_id (FK)    │
                 │ modalidad_id       │
                 │ nombre_modalidad   │
                 │ horario_inicio     │
                 │ horario_fin        │
                 │ activo             │
                 └────────────────────┘
```

## 🔧 **Tablas Principales**

### **👤 usuarios**
Almacena información de usuarios del sistema.

```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_quiniela VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ultimo_acceso DATETIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Índices para performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_username_activo (username, activo)
);
```

**Campos:**
- `id`: Identificador único del usuario
- `username`: Nombre de usuario para login (único)
- `nombre_quiniela`: Nombre descriptivo para la quiniela
- `email`: Email del usuario (único)
- `password_hash`: Contraseña encriptada con bcrypt
- `ultimo_acceso`: Última vez que el usuario hizo login
- `activo`: Si el usuario está activo o deshabilitado

### **🔐 sesiones_usuario**
Gestión de sesiones y tokens JWT.

```sql
CREATE TABLE sesiones_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    remember_token VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_usuario_activo (usuario_id, activo),
    INDEX idx_expiracion (fecha_expiracion, activo)
);
```

**Campos:**
- `session_token`: Token JWT para autenticación
- `remember_token`: Token para "recordar sesión"
- `ip_address`: IP desde donde se inició sesión
- `user_agent`: Información del navegador/dispositivo
- `fecha_expiracion`: Cuándo expira la sesión

### **💰 gastos**
Transacciones de la caja interna (gastos diarios).

```sql
CREATE TABLE gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50),
    descripcion TEXT,
    fecha DATE NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_activo (fecha, activo)
);
```

**Categorías Predefinidas:**
- `Sueldo`: Ingresos salariales
- `Servicios`: Gastos de servicios básicos
  - Subcategorías: `Luz`, `Agua`, `Internet`, `Alquiler`
- `Otros`: Gastos varios

### **🎲 transacciones_quiniela**
Transacciones relacionadas con juegos de quiniela.

```sql
CREATE TABLE transacciones_quiniela (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    fuente VARCHAR(50) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_fuente (fuente),
    INDEX idx_tipo_fecha (tipo, fecha)
);
```

**Tipos de Juegos (`fuente`):**
- `Quiniela` (Nacional con modalidades)
- `Quiniela Express`
- `Loto`
- `Quini6`
- `Brinco`
- `Loto5`
- `Telekino TJ`

### **✅ dias_finalizados**
Control de días que han sido cerrados/finalizados.

```sql
CREATE TABLE dias_finalizados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    fecha_finalizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_date (usuario_id, fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha)
);
```

**Funcionalidad:**
- Previene edición de días anteriores
- Solo el día actual puede ser finalizado
- Una vez finalizado, no se pueden agregar/editar transacciones

### **⏰ configuracion_horarios**
Horarios personalizables para modalidades de quiniela.

```sql
CREATE TABLE configuracion_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    modalidad_id INT NOT NULL,
    nombre_modalidad VARCHAR(100) NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_modalidad (usuario_id, modalidad_id, activo),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_activo (usuario_id, activo)
);
```

**Modalidades Predefinidas:**
1. **La Primera** (09:15 AM)
2. **Matutina** (11:45 AM)
3. **Vespertina** (13:15 PM)
4. **De la Tarde** (18:45 PM)
5. **Nocturna** (20:45 PM)

## ⚙️ **Stored Procedures**

### **🔐 Autenticación**

#### **SP_ValidateUserCredentials**
Valida credenciales de usuario y actualiza último acceso.

```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateUserCredentials(
    IN p_username VARCHAR(50),
    IN p_password_hash VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(100),
    OUT p_email VARCHAR(255),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    SELECT COUNT(*), id, nombre_quiniela, email
    INTO user_count, p_usuario_id, p_nombre_quiniela, p_email
    FROM usuarios 
    WHERE username = p_username 
    AND password_hash = p_password_hash 
    AND activo = TRUE;
    
    SET p_is_valid = (user_count > 0);
    
    -- Actualizar último acceso si es válido
    IF p_is_valid THEN
        UPDATE usuarios 
        SET ultimo_acceso = CURRENT_TIMESTAMP 
        WHERE id = p_usuario_id;
    END IF;
END //
DELIMITER ;
```

#### **SP_CreateSession**
Crea nueva sesión e invalida sesiones anteriores.

```sql
DELIMITER //
CREATE PROCEDURE SP_CreateSession(
    IN p_usuario_id INT,
    IN p_session_token VARCHAR(500),
    IN p_remember_token VARCHAR(500),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_remember_me BOOLEAN
)
BEGIN
    DECLARE session_duration INT DEFAULT 24; -- horas
    
    -- Si es "recordar sesión", extender duración
    IF p_remember_me THEN
        SET session_duration = 720; -- 30 días
    END IF;
    
    -- Invalidar sesiones anteriores del usuario
    UPDATE sesiones_usuario 
    SET activo = FALSE 
    WHERE usuario_id = p_usuario_id;
    
    -- Crear nueva sesión
    INSERT INTO sesiones_usuario (
        usuario_id, 
        session_token, 
        remember_token,
        ip_address,
        user_agent,
        fecha_expiracion
    ) VALUES (
        p_usuario_id,
        p_session_token,
        p_remember_token,
        p_ip_address,
        p_user_agent,
        DATE_ADD(CURRENT_TIMESTAMP, INTERVAL session_duration HOUR)
    );
END //
DELIMITER ;
```

#### **SP_ValidateSession**
Valida token de sesión y retorna datos del usuario.

```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateSession(
    IN p_session_token VARCHAR(500),
    OUT p_usuario_id INT,
    OUT p_username VARCHAR(50),
    OUT p_nombre_quiniela VARCHAR(100),
    OUT p_email VARCHAR(255),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE session_count INT DEFAULT 0;
    
    SELECT COUNT(*), s.usuario_id, u.username, u.nombre_quiniela, u.email
    INTO session_count, p_usuario_id, p_username, p_nombre_quiniela, p_email
    FROM sesiones_usuario s
    INNER JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.session_token = p_session_token 
    AND s.activo = TRUE 
    AND s.fecha_expiracion > CURRENT_TIMESTAMP
    AND u.activo = TRUE;
    
    SET p_is_valid = (session_count > 0);
    
    -- Actualizar último acceso si la sesión es válida
    IF p_is_valid THEN
        UPDATE usuarios 
        SET ultimo_acceso = CURRENT_TIMESTAMP 
        WHERE id = p_usuario_id;
    END IF;
END //
DELIMITER ;
```

### **💰 Gestión de Gastos**

#### **SP_GetGastosByDate**
Obtiene gastos de un usuario en una fecha específica.

```sql
DELIMITER //
CREATE PROCEDURE SP_GetGastosByDate(
    IN p_fecha DATE,
    IN p_usuario_id INT
)
BEGIN
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND fecha = p_fecha 
    AND activo = TRUE
    ORDER BY fecha_creacion DESC;
END //
DELIMITER ;
```

#### **SP_CreateGasto**
Crea un nuevo gasto con validaciones.

```sql
DELIMITER //
CREATE PROCEDURE SP_CreateGasto(
    IN p_usuario_id INT,
    IN p_monto DECIMAL(10,2),
    IN p_categoria VARCHAR(50),
    IN p_subcategoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    OUT p_gasto_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE dia_finalizado INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_gasto_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el día no esté finalizado
    SELECT COUNT(*) INTO dia_finalizado
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id AND fecha = p_fecha;
    
    IF dia_finalizado > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'No se pueden agregar gastos a un día finalizado';
        SET p_gasto_id = NULL;
        ROLLBACK;
    ELSE
        -- Validar que la fecha no sea futura
        IF p_fecha > CURDATE() THEN
            SET p_success = FALSE;
            SET p_error_message = 'No se pueden crear gastos en fechas futuras';
            SET p_gasto_id = NULL;
            ROLLBACK;
        ELSE
            INSERT INTO gastos (
                usuario_id, monto, categoria, subcategoria, descripcion, fecha
            ) VALUES (
                p_usuario_id, p_monto, p_categoria, p_subcategoria, p_descripcion, p_fecha
            );
            
            SET p_gasto_id = LAST_INSERT_ID();
            SET p_success = TRUE;
            SET p_error_message = NULL;
            
            COMMIT;
        END IF;
    END IF;
END //
DELIMITER ;
```

### **🎲 Gestión de Quinielas**

#### **SP_GetTransaccionesByDate**
Obtiene transacciones de quinielas por fecha.

```sql
DELIMITER //
CREATE PROCEDURE SP_GetTransaccionesByDate(
    IN p_fecha DATE,
    IN p_usuario_id INT
)
BEGIN
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela 
    WHERE usuario_id = p_usuario_id 
    AND fecha = p_fecha 
    AND activo = TRUE
    ORDER BY fecha_creacion DESC;
END //
DELIMITER ;
```

#### **SP_CreateTransaccionQuiniela**
Crea nueva transacción de quiniela.

```sql
DELIMITER //
CREATE PROCEDURE SP_CreateTransaccionQuiniela(
    IN p_usuario_id INT,
    IN p_tipo ENUM('ingreso', 'egreso'),
    IN p_categoria VARCHAR(50),
    IN p_monto DECIMAL(10,2),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_fuente VARCHAR(50),
    OUT p_transaccion_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE dia_finalizado INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_transaccion_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el día no esté finalizado
    SELECT COUNT(*) INTO dia_finalizado
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id AND fecha = p_fecha;
    
    IF dia_finalizado > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'No se pueden agregar transacciones a un día finalizado';
        SET p_transaccion_id = NULL;
        ROLLBACK;
    ELSE
        INSERT INTO transacciones_quiniela (
            usuario_id, tipo, categoria, monto, descripcion, fecha, fuente
        ) VALUES (
            p_usuario_id, p_tipo, p_categoria, p_monto, p_descripcion, p_fecha, p_fuente
        );
        
        SET p_transaccion_id = LAST_INSERT_ID();
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

### **⏰ Gestión de Horarios**

#### **SP_GetHorariosQuiniela**
Obtiene horarios configurados para un usuario.

```sql
DELIMITER //
CREATE PROCEDURE SP_GetHorariosQuiniela(
    IN p_usuario_id INT
)
BEGIN
    SELECT modalidad_id, nombre_modalidad, horario_inicio, horario_fin
    FROM configuracion_horarios 
    WHERE usuario_id = p_usuario_id 
    AND activo = TRUE
    ORDER BY modalidad_id;
END //
DELIMITER ;
```

#### **SP_UpdateHorariosQuiniela**
Actualiza horarios de modalidades.

```sql
DELIMITER //
CREATE PROCEDURE SP_UpdateHorariosQuiniela(
    IN p_usuario_id INT,
    IN p_modalidad_id INT,
    IN p_nombre_modalidad VARCHAR(100),
    IN p_horario_inicio TIME,
    IN p_horario_fin TIME
)
BEGIN
    -- Desactivar configuración anterior para esta modalidad
    UPDATE configuracion_horarios 
    SET activo = FALSE 
    WHERE usuario_id = p_usuario_id 
    AND modalidad_id = p_modalidad_id;
    
    -- Insertar nueva configuración
    INSERT INTO configuracion_horarios (
        usuario_id, modalidad_id, nombre_modalidad, horario_inicio, horario_fin
    ) VALUES (
        p_usuario_id, p_modalidad_id, p_nombre_modalidad, p_horario_inicio, p_horario_fin
    );
END //
DELIMITER ;
```

### **✅ Gestión de Días**

#### **SP_FinalizarDia**
Finaliza un día específico.

```sql
DELIMITER //
CREATE PROCEDURE SP_FinalizarDia(
    IN p_fecha DATE,
    IN p_usuario_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
    END;
    
    START TRANSACTION;
    
    -- Verificar que sea el día actual
    IF p_fecha != CURDATE() THEN
        SET p_success = FALSE;
        SET p_error_message = 'Solo se puede finalizar el día actual';
        ROLLBACK;
    ELSE
        -- Insertar o actualizar día finalizado
        INSERT INTO dias_finalizados (usuario_id, fecha) 
        VALUES (p_usuario_id, p_fecha)
        ON DUPLICATE KEY UPDATE fecha_finalizacion = CURRENT_TIMESTAMP;
        
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

#### **SP_GetDiasFinalizados**
Obtiene lista de días finalizados.

```sql
DELIMITER //
CREATE PROCEDURE SP_GetDiasFinalizados(
    IN p_usuario_id INT
)
BEGIN
    SELECT fecha, fecha_finalizacion
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id 
    ORDER BY fecha DESC;
END //
DELIMITER ;
```

### **👤 Gestión de Usuarios (Admin)**

#### **SP_CreateUser**
Crea nuevo usuario desde panel administrativo.

```sql
DELIMITER //
CREATE PROCEDURE SP_CreateUser(
    IN p_username VARCHAR(50),
    IN p_nombre_quiniela VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE username_exists INT DEFAULT 0;
    DECLARE email_exists INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_usuario_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el username no exista
    SELECT COUNT(*) INTO username_exists
    FROM usuarios WHERE username = p_username;
    
    -- Verificar que el email no exista
    SELECT COUNT(*) INTO email_exists
    FROM usuarios WHERE email = p_email;
    
    IF username_exists > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'El nombre de usuario ya está registrado';
        SET p_usuario_id = NULL;
        ROLLBACK;
    ELSEIF email_exists > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'El email ya está registrado';
        SET p_usuario_id = NULL;
        ROLLBACK;
    ELSE
        INSERT INTO usuarios (username, nombre_quiniela, email, password_hash) 
        VALUES (p_username, p_nombre_quiniela, p_email, p_password_hash);
        
        SET p_usuario_id = LAST_INSERT_ID();
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

## 📈 **Índices y Optimización**

### **Índices Principales**

```sql
-- Índices para autenticación
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_username_activo ON usuarios(username, activo);

-- Índices para sesiones
CREATE INDEX idx_sesiones_token ON sesiones_usuario(session_token);
CREATE INDEX idx_sesiones_usuario_activo ON sesiones_usuario(usuario_id, activo);
CREATE INDEX idx_sesiones_expiracion ON sesiones_usuario(fecha_expiracion, activo);

-- Índices para consultas frecuentes
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);
CREATE INDEX idx_gastos_fecha_activo ON gastos(fecha, activo);

CREATE INDEX idx_transacciones_usuario_fecha ON transacciones_quiniela(usuario_id, fecha);
CREATE INDEX idx_transacciones_fuente ON transacciones_quiniela(fuente);
CREATE INDEX idx_transacciones_tipo_fecha ON transacciones_quiniela(tipo, fecha);

-- Índices para días finalizados
CREATE INDEX idx_dias_usuario_fecha ON dias_finalizados(usuario_id, fecha);

-- Índices para configuración
CREATE INDEX idx_configuracion_usuario_activo ON configuracion_horarios(usuario_id, activo);
```

### **Optimizaciones de Performance**

```sql
-- Configuraciones recomendadas para MySQL
SET innodb_buffer_pool_size = 256M;  -- Ajustar según RAM disponible
SET query_cache_size = 32M;
SET query_cache_type = 1;

-- Análisis de queries lentas
SET slow_query_log = 1;
SET long_query_time = 2;  -- Queries > 2 segundos
```

### **Mantenimiento Automático**

```sql
-- Procedimiento para limpiar sesiones expiradas
DELIMITER //
CREATE PROCEDURE SP_CleanExpiredSessions()
BEGIN
    -- Marcar como inactivas las sesiones expiradas
    UPDATE sesiones_usuario 
    SET activo = FALSE 
    WHERE fecha_expiracion < CURRENT_TIMESTAMP 
    AND activo = TRUE;
    
    -- Opcional: Eliminar sesiones muy antiguas (> 30 días)
    DELETE FROM sesiones_usuario 
    WHERE fecha_creacion < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
    AND activo = FALSE;
END //
DELIMITER ;

-- Ejecutar limpieza diariamente
CREATE EVENT IF NOT EXISTS ev_clean_expired_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL SP_CleanExpiredSessions();
```

## 🚀 **Migración y Setup**

### **Script de Instalación Completa**

```sql
-- install-database.sql

-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS calendario_gastos
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE calendario_gastos;

-- 2. Crear todas las tablas
SOURCE create-tables.sql;

-- 3. Crear stored procedures
SOURCE create-procedures.sql;

-- 4. Crear índices
SOURCE create-indexes.sql;

-- 5. Insertar datos de prueba
SOURCE insert-demo-data.sql;

-- 6. Crear usuario demo
INSERT INTO usuarios (username, nombre_quiniela, email, password_hash) 
VALUES (
    'admin', 
    'Usuario Demo', 
    'admin@demo.com', 
    '$2b$10$...' -- Hash de 'demo123'
);
```

### **Script de Reset para Desarrollo**

```sql
-- reset-database.sql

DROP DATABASE IF EXISTS calendario_gastos;
CREATE DATABASE calendario_gastos
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE calendario_gastos;

-- Ejecutar instalación completa
SOURCE install-database.sql;
```

### **Backup y Restore**

```bash
# Backup completo
mysqldump -u root -p calendario_gastos > backup_calendario_$(date +%Y%m%d).sql

# Backup solo estructura
mysqldump -u root -p --no-data calendario_gastos > estructura_calendario.sql

# Backup solo datos
mysqldump -u root -p --no-create-info calendario_gastos > datos_calendario.sql

# Restore
mysql -u root -p calendario_gastos < backup_calendario_20240115.sql
```

### **Migración de Datos**

```sql
-- Ejemplo de migración: agregar campo 'username' a usuarios existentes
ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE;

-- Generar usernames únicos basados en email
UPDATE usuarios 
SET username = SUBSTRING_INDEX(email, '@', 1) 
WHERE username IS NULL;

-- Hacer campo obligatorio después de migrar
ALTER TABLE usuarios MODIFY username VARCHAR(50) NOT NULL;
```

## 🔒 **Seguridad de Base de Datos**

### **Usuarios y Permisos**

```sql
-- Usuario de aplicación (limitado)
CREATE USER 'app_calendario'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT SELECT, INSERT, UPDATE, DELETE ON calendario_gastos.* TO 'app_calendario'@'localhost';
GRANT EXECUTE ON calendario_gastos.* TO 'app_calendario'@'localhost';

-- Usuario de backup (solo lectura)
CREATE USER 'backup_calendario'@'localhost' IDENTIFIED BY 'password_backup';
GRANT SELECT ON calendario_gastos.* TO 'backup_calendario'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

### **Validaciones de Integridad**

```sql
-- Constraints adicionales para integridad
ALTER TABLE gastos 
ADD CONSTRAINT chk_monto_positivo CHECK (monto > 0);

ALTER TABLE transacciones_quiniela 
ADD CONSTRAINT chk_monto_positivo CHECK (monto > 0);

ALTER TABLE configuracion_horarios 
ADD CONSTRAINT chk_horario_valido 
CHECK (horario_inicio < horario_fin);
```

---

<div align="center">

**📊 Base de datos optimizada para performance y escalabilidad**

Esta documentación se actualiza conforme el esquema evoluciona.

**[⬆️ Volver arriba](#️-esquema-de-base-de-datos)**

</div>