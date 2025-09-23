# Esquema de Base de Datos y Stored Procedures

## Tablas Principales

### usuarios
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_quiniela VARCHAR(10) UNIQUE NOT NULL,
    nombre_quiniela VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pregunta_seguridad TEXT NOT NULL,
    respuesta_seguridad_hash VARCHAR(255) NOT NULL,
    ultimo_acceso DATETIME,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_email_activo (email, activo)
);
```

### sesiones_usuario
```sql
CREATE TABLE sesiones_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    remember_token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_session_token (session_token),
    INDEX idx_usuario_activo (usuario_id, activo)
);
```

### gastos
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
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### transacciones_quiniela
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
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### dias_finalizados
```sql
CREATE TABLE dias_finalizados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    fecha_finalizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (usuario_id, fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### configuracion_horarios
```sql
CREATE TABLE configuracion_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    modalidad_id INT NOT NULL,
    nombre_modalidad VARCHAR(100) NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    reset_token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_reset_token (reset_token),
    INDEX idx_email_token (email, reset_token),
    INDEX idx_expiracion (fecha_expiracion, usado)
);
```

## Stored Procedures

### SP_ValidateUserCredentials
```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateUserCredentials(
    IN p_numero_quiniela VARCHAR(10),
    IN p_password_hash VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    SELECT COUNT(*), id, nombre_quiniela
    INTO user_count, p_usuario_id, p_nombre_quiniela
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela 
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

### SP_GetUserByQuiniela
```sql
DELIMITER //
CREATE PROCEDURE SP_GetUserByQuiniela(
    IN p_numero_quiniela VARCHAR(10)
)
BEGIN
    SELECT id, numero_quiniela, nombre_quiniela, ultimo_acceso, fecha_creacion
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela 
    AND activo = TRUE;
END //
DELIMITER ;
```

### SP_CreateSession
```sql
DELIMITER //
CREATE PROCEDURE SP_CreateSession(
    IN p_usuario_id INT,
    IN p_session_token VARCHAR(255),
    IN p_remember_token VARCHAR(255),
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

### SP_ValidateSession
```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateSession(
    IN p_session_token VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_numero_quiniela VARCHAR(10),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE session_count INT DEFAULT 0;
    
    SELECT COUNT(*), s.usuario_id, u.nombre_quiniela, u.numero_quiniela
    INTO session_count, p_usuario_id, p_nombre_quiniela, p_numero_quiniela
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

### SP_InvalidateSession
```sql
DELIMITER //
CREATE PROCEDURE SP_InvalidateSession(
    IN p_usuario_id INT
)
BEGIN
    UPDATE sesiones_usuario 
    SET activo = FALSE 
    WHERE usuario_id = p_usuario_id;
END //
DELIMITER ;
```

### SP_CleanExpiredSessions
```sql
DELIMITER //
CREATE PROCEDURE SP_CleanExpiredSessions()
BEGIN
    UPDATE sesiones_usuario 
    SET activo = FALSE 
    WHERE fecha_expiracion < CURRENT_TIMESTAMP 
    AND activo = TRUE;
END //
DELIMITER ;
```

### SP_CleanExpiredPasswordTokens
```sql
DELIMITER //
CREATE PROCEDURE SP_CleanExpiredPasswordTokens()
BEGIN
    -- Marcar como usados los tokens expirados (soft delete)
    UPDATE password_reset_tokens 
    SET usado = TRUE 
    WHERE fecha_expiracion < CURRENT_TIMESTAMP 
    AND usado = FALSE;
    
    -- Opcional: Eliminar físicamente tokens muy antiguos (más de 30 días)
    DELETE FROM password_reset_tokens 
    WHERE fecha_creacion < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY);
END //
DELIMITER ;
```

### SP_CreateUser
```sql
DELIMITER //
CREATE PROCEDURE SP_CreateUser(
    IN p_numero_quiniela VARCHAR(10),
    IN p_nombre_quiniela VARCHAR(50),
    IN p_password_hash VARCHAR(255),
    IN p_pregunta_seguridad TEXT,
    IN p_respuesta_seguridad_hash VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE quiniela_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_usuario_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si el número de quiniela ya existe
    SELECT COUNT(*) INTO quiniela_exists
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela;
    
    IF quiniela_exists > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'El número de quiniela ya está registrado';
        SET p_usuario_id = NULL;
        ROLLBACK;
    ELSE
        INSERT INTO usuarios (
            numero_quiniela, 
            nombre_quiniela, 
            password_hash, 
            pregunta_seguridad, 
            respuesta_seguridad_hash
        ) VALUES (
            p_numero_quiniela, 
            p_nombre_quiniela, 
            p_password_hash, 
            p_pregunta_seguridad, 
            p_respuesta_seguridad_hash
        );
        
        SET p_usuario_id = LAST_INSERT_ID();
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

### SP_GetDiasFinalizados
```sql
DELIMITER //
CREATE PROCEDURE SP_GetDiasFinalizados(
    IN p_usuario_id INT
)
BEGIN
    SELECT fecha 
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id 
    ORDER BY fecha DESC;
END //
DELIMITER ;
```

### SP_GetDayData
```sql
DELIMITER //
CREATE PROCEDURE SP_GetDayData(
    IN p_fecha DATE,
    IN p_usuario_id INT
)
BEGIN
    -- Obtener gastos del día
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos 
    WHERE usuario_id = p_usuario_id 
    AND fecha = p_fecha 
    AND activo = TRUE
    ORDER BY fecha_creacion DESC;
    
    -- Obtener transacciones de quiniela del día
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela 
    WHERE usuario_id = p_usuario_id 
    AND fecha = p_fecha 
    AND activo = TRUE
    ORDER BY fecha_creacion DESC;
    
    -- Verificar si el día está finalizado
    SELECT COUNT(*) as finalizado
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id 
    AND fecha = p_fecha;
END //
DELIMITER ;
```

### SP_GetGastosByDate
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

### SP_GetTransaccionesByDate
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

### SP_InsertGasto
```sql
DELIMITER //
CREATE PROCEDURE SP_InsertGasto(
    IN p_monto DECIMAL(10,2),
    IN p_categoria VARCHAR(50),
    IN p_subcategoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_usuario_id INT,
    OUT p_gasto_id INT
)
BEGIN
    INSERT INTO gastos (monto, categoria, subcategoria, descripcion, fecha, usuario_id)
    VALUES (p_monto, p_categoria, p_subcategoria, p_descripcion, p_fecha, p_usuario_id);
    
    SET p_gasto_id = LAST_INSERT_ID();
END //
DELIMITER ;
```

### SP_UpdateGasto
```sql
DELIMITER //
CREATE PROCEDURE SP_UpdateGasto(
    IN p_gasto_id INT,
    IN p_monto DECIMAL(10,2),
    IN p_categoria VARCHAR(50),
    IN p_subcategoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_usuario_id INT
)
BEGIN
    UPDATE gastos 
    SET monto = p_monto,
        categoria = p_categoria,
        subcategoria = p_subcategoria,
        descripcion = p_descripcion
    WHERE id = p_gasto_id 
    AND usuario_id = p_usuario_id 
    AND activo = TRUE;
END //
DELIMITER ;
```

### SP_DeleteGasto
```sql
DELIMITER //
CREATE PROCEDURE SP_DeleteGasto(
    IN p_gasto_id INT,
    IN p_usuario_id INT
)
BEGIN
    UPDATE gastos 
    SET activo = FALSE 
    WHERE id = p_gasto_id 
    AND usuario_id = p_usuario_id;
END //
DELIMITER ;
```

### SP_InsertTransaccionQuiniela
```sql
DELIMITER //
CREATE PROCEDURE SP_InsertTransaccionQuiniela(
    IN p_tipo ENUM('ingreso', 'egreso'),
    IN p_categoria VARCHAR(50),
    IN p_monto DECIMAL(10,2),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    IN p_fuente VARCHAR(50),
    IN p_usuario_id INT,
    OUT p_transaccion_id INT
)
BEGIN
    INSERT INTO transacciones_quiniela (tipo, categoria, monto, descripcion, fecha, fuente, usuario_id)
    VALUES (p_tipo, p_categoria, p_monto, p_descripcion, p_fecha, p_fuente, p_usuario_id);
    
    SET p_transaccion_id = LAST_INSERT_ID();
END //
DELIMITER ;
```

### SP_InsertTransaccionesQuiniela (Bulk Insert)
```sql
DELIMITER //
CREATE PROCEDURE SP_InsertTransaccionesQuiniela(
    IN p_transacciones_json JSON,
    IN p_usuario_id INT
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE transaccion_count INT;
    
    SET transaccion_count = JSON_LENGTH(p_transacciones_json);
    
    WHILE i < transaccion_count DO
        INSERT INTO transacciones_quiniela (
            tipo, categoria, monto, descripcion, fecha, fuente, usuario_id
        ) VALUES (
            JSON_UNQUOTE(JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].tipo'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].categoria'))),
            JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].monto')),
            JSON_UNQUOTE(JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].descripcion'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].fecha'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_transacciones_json, CONCAT('$[', i, '].fuente'))),
            p_usuario_id
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;
```

### SP_UpdateTransaccionQuiniela
```sql
DELIMITER //
CREATE PROCEDURE SP_UpdateTransaccionQuiniela(
    IN p_transaccion_id INT,
    IN p_tipo ENUM('ingreso', 'egreso'),
    IN p_categoria VARCHAR(50),
    IN p_monto DECIMAL(10,2),
    IN p_descripcion TEXT,
    IN p_usuario_id INT
)
BEGIN
    UPDATE transacciones_quiniela 
    SET tipo = p_tipo,
        categoria = p_categoria,
        monto = p_monto,
        descripcion = p_descripcion
    WHERE id = p_transaccion_id 
    AND usuario_id = p_usuario_id 
    AND activo = TRUE;
END //
DELIMITER ;
```

### SP_DeleteTransaccionQuiniela
```sql
DELIMITER //
CREATE PROCEDURE SP_DeleteTransaccionQuiniela(
    IN p_transaccion_id INT,
    IN p_usuario_id INT
)
BEGIN
    UPDATE transacciones_quiniela 
    SET activo = FALSE 
    WHERE id = p_transaccion_id 
    AND usuario_id = p_usuario_id;
END //
DELIMITER ;
```

### SP_FinalizarDia
```sql
DELIMITER //
CREATE PROCEDURE SP_FinalizarDia(
    IN p_fecha DATE,
    IN p_usuario_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insertar el día como finalizado
    INSERT INTO dias_finalizados (usuario_id, fecha) 
    VALUES (p_usuario_id, p_fecha)
    ON DUPLICATE KEY UPDATE fecha_finalizacion = CURRENT_TIMESTAMP;
    
    -- Opcional: Marcar gastos y transacciones como finalizados
    -- (No se implementa borrado lógico adicional ya que el día finalizado es suficiente)
    
    COMMIT;
END //
DELIMITER ;
```

### SP_GetHorariosQuiniela
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

### SP_UpdateHorariosQuiniela
```sql
DELIMITER //
CREATE PROCEDURE SP_UpdateHorariosQuiniela(
    IN p_horarios_json JSON,
    IN p_usuario_id INT
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE horario_count INT;
    
    SET horario_count = JSON_LENGTH(p_horarios_json);
    
    WHILE i < horario_count DO
        INSERT INTO configuracion_horarios (
            usuario_id, modalidad_id, nombre_modalidad, horario_inicio, horario_fin
        ) VALUES (
            p_usuario_id,
            JSON_EXTRACT(p_horarios_json, CONCAT('$[', i, '].id')),
            JSON_UNQUOTE(JSON_EXTRACT(p_horarios_json, CONCAT('$[', i, '].name'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_horarios_json, CONCAT('$[', i, '].horarioInicio'))),
            JSON_UNQUOTE(JSON_EXTRACT(p_horarios_json, CONCAT('$[', i, '].horarioFin')))
        ) ON DUPLICATE KEY UPDATE
            nombre_modalidad = VALUES(nombre_modalidad),
            horario_inicio = VALUES(horario_inicio),
            horario_fin = VALUES(horario_fin),
            fecha_actualizacion = CURRENT_TIMESTAMP;
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;
```

### SP_ValidateEmailForRecovery
```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateEmailForRecovery(
    IN p_email VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_numero_quiniela VARCHAR(10),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    SELECT COUNT(*), id, nombre_quiniela, numero_quiniela
    INTO user_count, p_usuario_id, p_nombre_quiniela, p_numero_quiniela
    FROM usuarios 
    WHERE email = p_email 
    AND activo = TRUE;
    
    SET p_is_valid = (user_count > 0);
END //
DELIMITER ;
```

### SP_ValidateSecurityQuestion
```sql
DELIMITER //
CREATE PROCEDURE SP_ValidateSecurityQuestion(
    IN p_numero_quiniela VARCHAR(10),
    IN p_pregunta_seguridad TEXT,
    IN p_respuesta_seguridad_hash VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    SELECT COUNT(*), id, nombre_quiniela
    INTO user_count, p_usuario_id, p_nombre_quiniela
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela 
    AND pregunta_seguridad = p_pregunta_seguridad
    AND respuesta_seguridad_hash = p_respuesta_seguridad_hash 
    AND activo = TRUE;
    
    SET p_is_valid = (user_count > 0);
END //
DELIMITER ;
```

### SP_GetSecurityQuestion
```sql
DELIMITER //
CREATE PROCEDURE SP_GetSecurityQuestion(
    IN p_numero_quiniela VARCHAR(10)
)
BEGIN
    SELECT pregunta_seguridad
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela 
    AND activo = TRUE;
END //
DELIMITER ;
```

### SP_GeneratePasswordResetToken
```sql
DELIMITER //
CREATE PROCEDURE SP_GeneratePasswordResetToken(
    IN p_email VARCHAR(255),
    IN p_reset_token VARCHAR(255),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    OUT p_usuario_id INT,
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT DEFAULT 0;
    DECLARE user_id INT;
    DECLARE user_name VARCHAR(50);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_usuario_id = NULL;
        SET p_nombre_quiniela = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el email existe y está activo
    SELECT COUNT(*), id, nombre_quiniela 
    INTO user_exists, user_id, user_name
    FROM usuarios 
    WHERE email = p_email 
    AND activo = TRUE;
    
    IF user_exists = 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'No se encontró una cuenta con este email';
        SET p_usuario_id = NULL;
        SET p_nombre_quiniela = NULL;
        ROLLBACK;
    ELSE
        -- Invalidar tokens de recuperación anteriores para este usuario
        UPDATE password_reset_tokens 
        SET usado = TRUE 
        WHERE usuario_id = user_id 
        AND usado = FALSE;
        
        -- Crear nuevo token de recuperación (válido por 1 hora)
        INSERT INTO password_reset_tokens (
            usuario_id, 
            reset_token, 
            email, 
            fecha_expiracion,
            ip_address,
            user_agent
        ) VALUES (
            user_id,
            p_reset_token,
            p_email,
            DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR),
            p_ip_address,
            p_user_agent
        );
        
        SET p_usuario_id = user_id;
        SET p_nombre_quiniela = user_name;
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

### SP_ValidatePasswordResetToken
```sql
DELIMITER //
CREATE PROCEDURE SP_ValidatePasswordResetToken(
    IN p_reset_token VARCHAR(255),
    OUT p_usuario_id INT,
    OUT p_email VARCHAR(255),
    OUT p_nombre_quiniela VARCHAR(50),
    OUT p_is_valid BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE token_count INT DEFAULT 0;
    DECLARE user_id INT;
    DECLARE user_email VARCHAR(255);
    DECLARE user_name VARCHAR(50);
    
    -- Verificar que el token existe, no ha sido usado y no ha expirado
    SELECT COUNT(*), rt.usuario_id, rt.email, u.nombre_quiniela
    INTO token_count, user_id, user_email, user_name
    FROM password_reset_tokens rt
    INNER JOIN usuarios u ON rt.usuario_id = u.id
    WHERE rt.reset_token = p_reset_token 
    AND rt.usado = FALSE 
    AND rt.fecha_expiracion > CURRENT_TIMESTAMP
    AND u.activo = TRUE;
    
    IF token_count > 0 THEN
        SET p_usuario_id = user_id;
        SET p_email = user_email;
        SET p_nombre_quiniela = user_name;
        SET p_is_valid = TRUE;
        SET p_error_message = NULL;
    ELSE
        SET p_usuario_id = NULL;
        SET p_email = NULL;
        SET p_nombre_quiniela = NULL;
        SET p_is_valid = FALSE;
        SET p_error_message = 'El enlace de recuperación es inválido o ha expirado';
    END IF;
END //
DELIMITER ;
```

### SP_ResetPasswordWithToken
```sql
DELIMITER //
CREATE PROCEDURE SP_ResetPasswordWithToken(
    IN p_reset_token VARCHAR(255),
    IN p_new_password_hash VARCHAR(255),
    IN p_ip_address VARCHAR(45),
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE token_exists INT DEFAULT 0;
    DECLARE user_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
    END;
    
    START TRANSACTION;
    
    -- Verificar que el token es válido
    SELECT COUNT(*), rt.usuario_id INTO token_exists, user_id
    FROM password_reset_tokens rt
    INNER JOIN usuarios u ON rt.usuario_id = u.id
    WHERE rt.reset_token = p_reset_token 
    AND rt.usado = FALSE 
    AND rt.fecha_expiracion > CURRENT_TIMESTAMP
    AND u.activo = TRUE;
    
    IF token_exists = 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'El enlace de recuperación es inválido o ha expirado';
        ROLLBACK;
    ELSE
        -- Actualizar la contraseña del usuario
        UPDATE usuarios 
        SET password_hash = p_new_password_hash,
            ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id = user_id;
        
        -- Marcar el token como usado
        UPDATE password_reset_tokens 
        SET usado = TRUE 
        WHERE reset_token = p_reset_token;
        
        -- Invalidar todas las sesiones existentes del usuario
        UPDATE sesiones_usuario 
        SET activo = FALSE 
        WHERE usuario_id = user_id;
        
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

### SP_ResetPassword
```sql
DELIMITER //
CREATE PROCEDURE SP_ResetPassword(
    IN p_numero_quiniela VARCHAR(10),
    IN p_new_password_hash VARCHAR(255),
    IN p_respuesta_seguridad_hash VARCHAR(255),
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
    END;
    
    START TRANSACTION;
    
    -- Verificar que la respuesta de seguridad sea correcta
    SELECT COUNT(*) INTO user_exists
    FROM usuarios 
    WHERE numero_quiniela = p_numero_quiniela 
    AND respuesta_seguridad_hash = p_respuesta_seguridad_hash
    AND activo = TRUE;
    
    IF user_exists = 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'Número de quiniela o respuesta de seguridad incorrectos';
        ROLLBACK;
    ELSE
        UPDATE usuarios 
        SET password_hash = p_new_password_hash,
            ultimo_acceso = CURRENT_TIMESTAMP
        WHERE numero_quiniela = p_numero_quiniela 
        AND activo = TRUE;
        
        -- Invalidar todas las sesiones existentes del usuario
        UPDATE sesiones_usuario 
        SET activo = FALSE 
        WHERE usuario_id = (
            SELECT id FROM usuarios 
            WHERE numero_quiniela = p_numero_quiniela 
            AND activo = TRUE
        );
        
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

## Índices Recomendados

```sql
-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
CREATE INDEX idx_transacciones_usuario_fecha ON transacciones_quiniela(usuario_id, fecha);
CREATE INDEX idx_dias_finalizados_usuario ON dias_finalizados(usuario_id);
CREATE INDEX idx_configuracion_usuario ON configuracion_horarios(usuario_id);

-- Índices para autenticación y sesiones
CREATE INDEX idx_usuarios_quiniela ON usuarios(numero_quiniela);
CREATE INDEX idx_usuarios_quiniela_activo ON usuarios(numero_quiniela, activo);
CREATE INDEX idx_sesiones_token ON sesiones_usuario(session_token);
CREATE INDEX idx_sesiones_usuario_activo ON sesiones_usuario(usuario_id, activo);
CREATE INDEX idx_sesiones_expiracion ON sesiones_usuario(fecha_expiracion, activo);
```

## Eventos Programados (Mantenimiento)

```sql
-- Evento para limpiar sesiones expiradas (ejecutar cada hora)
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
  CALL SP_CleanExpiredSessions();

-- Evento para limpiar tokens de recuperación expirados (ejecutar cada 2 horas)
CREATE EVENT IF NOT EXISTS cleanup_expired_password_tokens
ON SCHEDULE EVERY 2 HOUR
STARTS CURRENT_TIMESTAMP
DO
  CALL SP_CleanExpiredPasswordTokens();
```

## Notas de Implementación

1. **Seguridad**: 
   - Todos los SPs validan que el usuario_id coincida para evitar acceso no autorizado
   - Las contraseñas se almacenan hasheadas (usar bcrypt o similar)
   - Los tokens de sesión deben ser criptográficamente seguros
   - Implementar rate limiting para intentos de login

2. **Soft Delete**: Se usa borrado lógico (campo `activo`) en lugar de DELETE físico para mantener historial.

3. **Transacciones**: SP_FinalizarDia y SP_RegisterUser usan transacciones para garantizar consistencia.

4. **JSON**: Los SPs de inserción masiva usan JSON para manejar múltiples registros eficientemente.

5. **Horarios**: La configuración de horarios se maneja por usuario para personalización individual.

6. **Sesiones**:
   - Las sesiones tienen expiración automática
   - Solo una sesión activa por usuario (invalida anteriores)
   - Opción de "recordar sesión" con duración extendida
   - Limpieza automática de sesiones expiradas

7. **Registro de Usuario**:
   - Validación de email único
   - Manejo de errores con rollback automático
   - Estructura preparada para activación por email (campo activo)

8. **Logs de Acceso**:
   - Se registra IP y User-Agent para auditoría
   - Se actualiza último acceso en cada validación de sesión

9. **Recuperación de Contraseña por Email**:
   - Tokens de recuperación con expiración de 1 hora
   - Un token solo se puede usar una vez
   - Se invalidan tokens anteriores al generar uno nuevo
   - Se registra IP y User-Agent para auditoría de seguridad
   - Limpieza automática de tokens expirados cada 2 horas
   - Eliminación física de tokens antiguos (más de 30 días)

10. **Email de Recuperación**:
    - Validación de email antes de generar token
    - Enlace seguro con token único
    - Invalidación de todas las sesiones activas al cambiar contraseña
    - Manejo de errores para emails no registrados