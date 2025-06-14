DROP DATABASE IF EXISTS mesalista_db;

CREATE DATABASE mesalista_db;

USE mesalista_db;

CREATE TABLE clientes (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	telefono VARCHAR(16) NOT NULL,
	documento VARCHAR(12) NOT NULL,
	direccion VARCHAR(200) NOT NULL,
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE productos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	tipo_producto TINYINT UNSIGNED NOT NULL,
	precio DECIMAL(10,2) NOT NULL,
	estado BIT(1) DEFAULT b'1',
    imagen_url VARCHAR(255) NULL,
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE empleados (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(16) NOT NULL,
    documento VARCHAR(12) NOT NULL,
    clave VARCHAR(64) NOT NULL,
    salt VARCHAR(64) DEFAULT NULL,
    direccion VARCHAR(100) NOT NULL,
    nivel TINYINT UNSIGNED DEFAULT '2',
    estado TINYINT UNSIGNED DEFAULT '1',
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

/* extends empleados */
CREATE TABLE deliveries (
	id INT UNSIGNED NOT NULL,
	unidad VARCHAR(25) NOT NULL,
	placa VARCHAR(8) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE KEY placa (placa),
	CONSTRAINT fk_delivery_empleado FOREIGN KEY (id) REFERENCES empleados (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE pedidos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	cliente_id INT UNSIGNED NOT NULL,
	total DECIMAL(10,2) NOT NULL,
	empleado_id INT UNSIGNED NULL, -- Puede ser NULL al principio
	estado_pedido TINYINT UNSIGNED NOT NULL,
	direccion_entrega VARCHAR(200) NULL, -- Puede ser NULL al principio
    delivery_id INT UNSIGNED DEFAULT NULL,
	fecha_pedido TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    visible TINYINT(1) NOT NULL DEFAULT '1',
	PRIMARY KEY (id),
	KEY cliente_id (cliente_id),
	KEY empleado_id (empleado_id),
	KEY fk_pedidos_delivery (delivery_id),
	CONSTRAINT fk_pedidos_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (cliente_id) REFERENCES clientes (id),
	CONSTRAINT pedidos_ibfk_2 FOREIGN KEY (empleado_id) REFERENCES empleados (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE detalle_pedido (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pedido_id INT UNSIGNED NOT NULL,
	producto_id INT UNSIGNED NOT NULL,
	cantidad TINYINT UNSIGNED NOT NULL,
	precio_unitario DECIMAL(10,2) NOT NULL,
	estado TINYINT UNSIGNED NOT NULL DEFAULT 1,
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	KEY pedido_id (pedido_id),
	KEY producto_id (producto_id),
	CONSTRAINT detalle_pedido_ibfk_1 FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
	CONSTRAINT detalle_pedido_ibfk_2 FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE dias (
    id TINYINT UNSIGNED PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE menu_del_dia (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    producto_id INT UNSIGNED NOT NULL,
    dia_id TINYINT UNSIGNED NOT NULL,
    CONSTRAINT fk_menu_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_dia FOREIGN KEY (dia_id) REFERENCES dias(id) ON DELETE CASCADE,
    CONSTRAINT uq_producto_dia UNIQUE (producto_id, dia_id)
);
CREATE INDEX idx_dia_id ON menu_del_dia(dia_id);

CREATE TABLE incidentes (
	id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	delivery_id INT UNSIGNED NOT NULL,
	pedido_id INT UNSIGNED NOT NULL,
	ubicacion VARCHAR(60),
	estado TINYINT UNSIGNED NOT NULL DEFAULT 1,
	incidente TEXT,
	fecha TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (delivery_id) REFERENCES empleados (id),
	FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
);

/* ========================= FIN ESTRUCTURA =========================== */


/* ================= EVENTS, JOBS y STORED PROCEDURES ================= */

-- Events (JOB)
CREATE EVENT IF NOT EXISTS ocultar_pedidos_antiguos
ON SCHEDULE EVERY 1 HOUR DO UPDATE pedidos
    SET visible = FALSE WHERE visible = TRUE
    AND fecha_pedido < NOW() - INTERVAL 72 HOUR;
-- Se necesita encender el Scheduler:
SET GLOBAL event_scheduler = ON;


-- Stored Procedures
DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `addProducto`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addProducto`(
    IN p_cliente_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(10,2),
    OUT p_pedido_id INT  -- Parámetro de salida
)
BEGIN
    DECLARE p_id INT;
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_existe INT;
    DECLARE v_precio DECIMAL(10,2);

    -- Si p_precio_unitario es NULL o 0, buscar precio en tabla productos
    IF p_precio_unitario IS NULL OR p_precio_unitario = 0 THEN
        SELECT precio INTO v_precio FROM productos WHERE id = p_producto_id LIMIT 1;
    ELSE
        SET v_precio = p_precio_unitario;
    END IF;

    -- Buscar pedido existente EN ESTADO 0 (no confirmado aún)
    SELECT id INTO p_id 
    FROM pedidos 
    WHERE cliente_id = p_cliente_id 
      AND estado_pedido = 0
    ORDER BY id DESC 
    LIMIT 1;

    -- Si no hay pedido en estado 0, crear uno nuevo
    IF p_id IS NULL THEN
        INSERT INTO pedidos (cliente_id, direccion_entrega, total, estado_pedido)
        VALUES (p_cliente_id, NULL, 0, 0);  -- estado 0: pedido en armado
        SET p_id = LAST_INSERT_ID();
    END IF;

    -- Verificar si el producto ya existe en el detalle del pedido
    SELECT COUNT(*) INTO v_existe
    FROM detalle_pedido
    WHERE pedido_id = p_id AND producto_id = p_producto_id;

    -- Si el producto existe, actualizar la cantidad
    IF v_existe > 0 THEN
        UPDATE detalle_pedido
        SET cantidad = cantidad + p_cantidad
        WHERE pedido_id = p_id AND producto_id = p_producto_id;
    ELSE
        -- Si el producto no existe, insertar un nuevo detalle con el precio correcto
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (p_id, p_producto_id, p_cantidad, v_precio);
    END IF;

    -- Actualizar el total del pedido
    SELECT SUM(cantidad * precio_unitario) INTO v_total
    FROM detalle_pedido
    WHERE pedido_id = p_id;

    -- Actualizar el campo total del pedido
    UPDATE pedidos 
    SET total = v_total
    WHERE id = p_id;

    -- Asignar el pedido_id al parámetro de salida
    SET p_pedido_id = p_id;

END$$

DELIMITER ;



DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `addProductoConPedidoId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addProductoConPedidoId`(
    IN p_pedido_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(10,2)
)
BEGIN
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_existe INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_estado INT;

    -- Verificar que el pedido existe y obtener su estado
    SELECT estado_pedido INTO v_estado
    FROM pedidos
    WHERE id = p_pedido_id;

    -- Si no se encontró el pedido, lanzar error
    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no existe.';
    END IF;

    -- Verificar que el estado sea permitido (0 o 1)
    IF v_estado > 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede modificar un pedido con estado mayor a 1.';
    END IF;

    -- Si no se proporcionó un precio válido, obtener el precio desde la tabla productos
    IF p_precio_unitario IS NULL OR p_precio_unitario = 0 THEN
        SELECT precio INTO v_precio FROM productos WHERE id = p_producto_id LIMIT 1;
    ELSE
        SET v_precio = p_precio_unitario;
    END IF;

    -- Verificar si ya existe el producto en el pedido
    SELECT COUNT(*) INTO v_existe
    FROM detalle_pedido
    WHERE pedido_id = p_pedido_id AND producto_id = p_producto_id;

    IF v_existe > 0 THEN
        -- Actualizar cantidad si ya existe
        UPDATE detalle_pedido
        SET cantidad = cantidad + p_cantidad
        WHERE pedido_id = p_pedido_id AND producto_id = p_producto_id;
    ELSE
        -- Insertar nuevo detalle
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (p_pedido_id, p_producto_id, p_cantidad, v_precio);
    END IF;

    -- Recalcular el total del pedido
    SELECT SUM(cantidad * precio_unitario) INTO v_total
    FROM detalle_pedido
    WHERE pedido_id = p_pedido_id;

    UPDATE pedidos
    SET total = v_total
    WHERE id = p_pedido_id;

END$$

DELIMITER ;




DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `confirmarPedido`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `confirmarPedido`(
    IN p_pedido_id INT,
    IN p_empleado_id INT,
    IN p_clave VARCHAR(100),
    IN p_direccion_entrega VARCHAR(200)
)
BEGIN
    DECLARE v_cliente_id INT;
    DECLARE v_direccion_cliente VARCHAR(200);
    DECLARE v_empleado_existente INT;
    DECLARE v_cliente_existente INT;
    DECLARE v_empleado_nivel TINYINT;
    DECLARE v_estado TINYINT;
    DECLARE v_salt VARCHAR(64);
    DECLARE v_hash_clave VARCHAR(64);
    DECLARE v_clave_almacenada VARCHAR(64);

    -- Verificar si el pedido existe
    IF NOT EXISTS (SELECT 1 FROM pedidos WHERE id = p_pedido_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no existe';
    END IF;

    -- Verificar si el empleado existe
    SELECT COUNT(1) INTO v_empleado_existente
    FROM empleados
    WHERE id = p_empleado_id;

    IF v_empleado_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El empleado no existe';
    END IF;

    -- Obtener estado, nivel, salt y clave (válido porque ya verificamos que el empleado existe)
    SELECT estado, nivel, salt, clave
    INTO v_estado, v_empleado_nivel, v_salt, v_clave_almacenada
    FROM empleados
    WHERE id = p_empleado_id;

    -- Validar estado del empleado
    IF v_estado <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado restringido';
    END IF;

    -- Validar que el empleado no sea de nivel 3 (Delivery)
    IF v_empleado_nivel = 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El personal de delivery no puede confirmar pedidos';
    END IF;

    -- Validar clave usando hash + salt
    SET v_hash_clave = SHA2(CONCAT(p_clave, v_salt), 256);
    IF v_hash_clave <> v_clave_almacenada THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Credenciales inválidas';
    END IF;

    -- Obtener cliente_id del pedido
    SELECT cliente_id INTO v_cliente_id
    FROM pedidos
    WHERE id = p_pedido_id;

    -- Verificar si el cliente existe
    SELECT COUNT(1) INTO v_cliente_existente
    FROM clientes
    WHERE id = v_cliente_id;

    IF v_cliente_existente = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe';
    END IF;

    -- Si no se proporcionó dirección de entrega, usar la del cliente
    IF p_direccion_entrega IS NULL OR p_direccion_entrega = '' THEN
        SELECT direccion INTO v_direccion_cliente
        FROM clientes
        WHERE id = v_cliente_id;
    ELSE
        SET v_direccion_cliente = p_direccion_entrega;
    END IF;

    -- Verificar si el pedido ya ha sido confirmado
    IF EXISTS (SELECT 1 FROM pedidos WHERE id = p_pedido_id AND estado_pedido = 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido ya ha sido confirmado';
    END IF;

    -- Confirmar el pedido
    UPDATE pedidos
    SET
        empleado_id = p_empleado_id,
        direccion_entrega = v_direccion_cliente,
        estado_pedido = 1
    WHERE id = p_pedido_id;

    COMMIT;
END$$

DELIMITER ;




DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `sp_validar_empleado`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_validar_empleado`(
    IN p_id INT,
    IN p_clave VARCHAR(100),
    OUT p_es_valido BOOLEAN,
    OUT p_mensaje VARCHAR(100)
)
BEGIN
    DECLARE v_nivel INT;
    DECLARE v_estado TINYINT;
    DECLARE v_salt VARCHAR(64);
    DECLARE v_contador INT DEFAULT 0;
    DECLARE v_hash_clave VARCHAR(64);

    -- Intentamos obtener estado, nivel y salt del empleado
    SELECT estado, nivel, salt
    INTO v_estado, v_nivel, v_salt
    FROM empleados
    WHERE id = p_id;

    -- Validaciones
    IF v_estado IS NULL THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'Empleado no encontrado';
    ELSEIF v_estado <> 1 THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'Empleado restringido';
    ELSEIF v_nivel >= 2 THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'Su nivel es muy bajo para acceder';
    ELSE
        -- Si pasa validaciones, validar clave con hash
        SET v_hash_clave = SHA2(CONCAT(p_clave, v_salt), 256);

        SELECT COUNT(*) INTO v_contador 
        FROM empleados 
        WHERE id = p_id AND clave = v_hash_clave;

        IF v_contador = 0 THEN
            SET p_es_valido = FALSE;
            SET p_mensaje = 'Credenciales inválidas';
        ELSE
            SET p_es_valido = TRUE;
            SET p_mensaje = 'Autenticación exitosa';
        END IF;
    END IF;

END$$

DELIMITER ;



DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `sp_validar_delivery`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_validar_delivery`(
    IN p_id INT,
    IN p_clave VARCHAR(100),
    OUT p_es_valido BOOLEAN,
    OUT p_mensaje VARCHAR(100)
)
BEGIN
    DECLARE v_nivel INT;
    DECLARE v_estado TINYINT;
    DECLARE v_salt VARCHAR(64);
    DECLARE v_contador INT DEFAULT 0;
    DECLARE v_hash_clave VARCHAR(64);

    SELECT estado, nivel, salt
    INTO v_estado, v_nivel, v_salt
    FROM empleados
    WHERE id = p_id;

    IF v_estado IS NULL THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'Empleado no encontrado';
    ELSEIF v_estado <> 1 THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'Empleado restringido';
    ELSEIF v_nivel NOT IN (0, 1, 3) THEN
        SET p_es_valido = FALSE;
        SET p_mensaje = 'No tiene permisos para ver esta pantalla';
    ELSE
        SET v_hash_clave = SHA2(CONCAT(p_clave, v_salt), 256);

        SELECT COUNT(*) INTO v_contador 
        FROM empleados 
        WHERE id = p_id AND clave = v_hash_clave;

        IF v_contador = 0 THEN
            SET p_es_valido = FALSE;
            SET p_mensaje = 'Credenciales inválidas';
        ELSE
            SET p_es_valido = TRUE;
            SET p_mensaje = 'Autenticación exitosa';
        END IF;
    END IF;
END$$

DELIMITER ;


DELIMITER $$

USE `mesalista_db`$$

DROP PROCEDURE IF EXISTS `addCliente`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addCliente`(
    IN cliente_nombre VARCHAR(100),
    IN cliente_telefono VARCHAR(16),
    IN cliente_documento VARCHAR(12),
    IN cliente_direccion VARCHAR(200),
    OUT created BOOLEAN,
    OUT msg VARCHAR(60)
)
BEGIN
    DECLARE existe INT DEFAULT 0;

    -- Manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET created = FALSE;
        SET msg = 'Error durante la creación del cliente.';
    END;

    START TRANSACTION;

    -- Verificar si ya existe el cliente
    SELECT COUNT(*) INTO existe 
    FROM clientes 
    WHERE TRIM(documento) = TRIM(cliente_documento);

    IF existe > 0 THEN
        ROLLBACK;
        SET created = FALSE;
        SET msg = 'Existe otro Cliente con ese número de documento.';
    ELSE
        INSERT INTO clientes (nombre, telefono, documento, direccion)
        VALUES (cliente_nombre, cliente_telefono, cliente_documento, cliente_direccion);

        COMMIT;
        SET created = TRUE;
        SET msg = 'Cliente creado exitosamente.';
    END IF;
END$$

DELIMITER ;



DELIMITER ;;

CREATE DEFINER = root @localhost PROCEDURE adjustCantidadProducto (
    IN p_pedido_id INT UNSIGNED,
    IN p_producto_id INT UNSIGNED,
    IN p_delta SMALLINT
)
BEGIN
    DECLARE v_cantidad_actual INT DEFAULT 0;
    DECLARE v_nueva_cantidad INT;
    SELECT
        cantidad INTO v_cantidad_actual
    FROM
        detalle_pedido
    WHERE pedido_id = p_pedido_id
        AND producto_id = p_producto_id
        AND estado = 1
    LIMIT 1;
    SET v_nueva_cantidad = GREATEST (v_cantidad_actual + p_delta, 0);
    IF v_nueva_cantidad = 0
    THEN
    UPDATE
        detalle_pedido
    SET
        cantidad = 0,
        estado = 0
    WHERE pedido_id = p_pedido_id
        AND producto_id = p_producto_id;
    ELSE
    UPDATE
        detalle_pedido
    SET
        cantidad = v_nueva_cantidad,
        estado = 1
    WHERE pedido_id = p_pedido_id
        AND producto_id = p_producto_id;
    END IF;
    UPDATE
        pedidos
    SET
        total =
        (SELECT
            COALESCE (SUM (cantidad * precio_unitario), 0)
        FROM
            detalle_pedido
        WHERE pedido_id = p_pedido_id
            AND estado = 1)
    WHERE id = p_pedido_id;
END ;;

DELIMITER ;


DELIMITER ;;
CREATE DEFINER=root@localhost PROCEDURE deleteProducto(
    IN p_pedido_id    INT UNSIGNED,
    IN p_producto_id  INT UNSIGNED
)
BEGIN
    UPDATE detalle_pedido
       SET estado = 0
     WHERE pedido_id   = p_pedido_id
       AND producto_id = p_producto_id
       AND estado      = 1;

    UPDATE pedidos
       SET total = (
            SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
              FROM detalle_pedido
             WHERE pedido_id = p_pedido_id
               AND estado    = 1
       )
     WHERE id = p_pedido_id;
END ;;
DELIMITER ;


DELIMITER ;;
CREATE DEFINER=root@localhost PROCEDURE enableProducto(
    IN p_pedido_id    INT UNSIGNED,
    IN p_producto_id  INT UNSIGNED
)
BEGIN
    UPDATE detalle_pedido
       SET estado = 1
     WHERE pedido_id   = p_pedido_id
       AND producto_id = p_producto_id
       AND estado      = 0;

    UPDATE pedidos
       SET total = (
            SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
              FROM detalle_pedido
             WHERE pedido_id = p_pedido_id
               AND estado    = 1
       )
     WHERE id = p_pedido_id;
END ;;
DELIMITER ;


DELIMITER ;;
CREATE DEFINER=root@localhost PROCEDURE updateEstadoPedido(
    IN p_pedido_id      INT UNSIGNED,
    IN p_nuevo_estado   TINYINT UNSIGNED 
)
BEGIN
    -- Verificar que el pedido exista
    IF EXISTS (SELECT 1 FROM pedidos WHERE id = p_pedido_id) THEN
        -- Actualizar el estado del pedido
        UPDATE pedidos
           SET estado_pedido = p_nuevo_estado,
               actualizado_en = NOW()
         WHERE id = p_pedido_id;
    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pedido no encontrado';
    END IF;
END ;;
DELIMITER ;


-- Cambiar clave de usuario
DELIMITER $$

CREATE PROCEDURE sp_restablecer_clave (
    IN p_id_empleado INT UNSIGNED,
    IN p_nombre VARCHAR(100),
    IN p_telefono VARCHAR(16),
    IN p_documento VARCHAR(12),
    IN p_nueva_clave VARCHAR(100),
    OUT p_exito BOOLEAN,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_salt VARCHAR(64);
    DECLARE v_clave_hash VARCHAR(64);
    DECLARE v_existe INT DEFAULT 0;

    -- Verificar si el empleado existe y los datos coinciden
    SELECT COUNT(*) INTO v_existe
    FROM empleados
    WHERE id = p_id_empleado
      AND nombre = p_nombre
      AND telefono = p_telefono
      AND documento = p_documento;

    IF v_existe = 0 THEN
        -- Datos incorrectos
        SET p_exito = FALSE;
        SET p_mensaje = 'Los datos ingresados no coinciden con ningún empleado.';
    ELSE
        -- Generar salt y hash de nueva clave
        SET v_salt = SUBSTRING(MD5(RAND()), 1, 16);
        SET v_clave_hash = SHA2(CONCAT(p_nueva_clave, v_salt), 256);
        
        -- Actualizar clave y salt
        UPDATE empleados
        SET clave = v_clave_hash,
            salt = v_salt
        WHERE id = p_id_empleado;

        SET p_exito = TRUE;
        SET p_mensaje = 'Contraseña actualizada exitosamente.';
    END IF;
END$$

DELIMITER ;



-- Triggers
DELIMITER $$

CREATE TRIGGER before_insert_empleados
BEFORE INSERT ON empleados
FOR EACH ROW
BEGIN
    SET NEW.salt = SUBSTRING(MD5(RAND()), 1, 16);  
    SET NEW.clave = SHA2(CONCAT(NEW.clave, NEW.salt), 256);
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER before_update_empleados
BEFORE UPDATE ON empleados
FOR EACH ROW
BEGIN
    IF NEW.clave <> OLD.clave THEN
        SET NEW.salt = SUBSTRING(MD5(RAND()), 1, 16);
        SET NEW.clave = SHA2(CONCAT(NEW.clave, NEW.salt), 256);
    ELSE
        SET NEW.salt = OLD.salt;
        SET NEW.clave = OLD.clave;
    END IF;
END$$

DELIMITER ;
/* =============== FIN EVENTS, JOBS y STORED PROCEDURES ================= */


/* =============  DATA DE MUESTRA =============== */
INSERT INTO dias (id, nombre) VALUES 
(1, 'Lunes'),
(2, 'Martes'),
(3, 'Miércoles'),
(4, 'Jueves'),
(5, 'Viernes'),
(6, 'Sábado'),
(7, 'Domingo');

INSERT INTO productos (nombre, tipo_producto, precio, estado, imagen_url) VALUES 
('Papa a la Huancaína', 1, 3.00, 1, 'img-realtime/1749773952904_papahuancaina.png'), 
('Causa de Pollo', 1, 2.90, 1, 'img-realtime/1749776016168_causapollo.png'), 
('Causa de Atún', 1, 3.00, 1, 'img-realtime/1749778867412_causaatun.png'), 
('Ocopa Arequipeña', 1, 3.00, 1, 'img-realtime/1749778881120_ocopa.png'), 
('Yuquitas Fritas', 1, 3.00, 1, 'img-realtime/1749778952613_yucas.png'), 
('Palta Rellena', 1, 3.00, 1, 'img-realtime/1749778961004_palta.png'), 
('Ensalada Rusa', 1, 3.00, 1, 'img-realtime/1749778975685_rusa.png'), 
('Sopa Criolla', 1, 3.00, 1, 'img-realtime/1749778982187_sopa.png'), 
('Chicharrón de Pota', 1, 3.00, 1, 'img-realtime/1749778994653_pota.png'), 
('Ceviche', 1, 3.00, 1, 'img-realtime/1749779005043_cevicheentrada.png'), 

('Ensalada Criolla', 1, 3.00, 1, 'img-realtime/1749779016823_ensaladacriolla.png'), 
('Gelatina', 1, 3.00, 1, 'img-realtime/1749779025182_gelatina.png'), 
('Lomo Saltado', 2, 9.00, 1, 'img-realtime/1749784424316_lomosaltado.png'), 
('Ají de Gallina', 2, 9.00, 1, 'img-realtime/1749784820862_ajidegallina.png'), 
('Arroz con Pollo', 2, 9.00, 1, 'img-realtime/1749818505290_arrozconpollo.png'), 
('Cau Cau', 2, 9.00, 1, 'img-realtime/1749818629504_caucau.png'), 
('Seco con Frejoles', 2, 9.00, 1, 'img-realtime/1749795645429_seco.png'), 
('Tacu Tacu con Lomo', 2, 9.00, 1, 'img-realtime/1749818725914_tacutacu.png'), 
('Chicharrón de Pescado', 2, 9.00, 1, 'img-realtime/1749819229125_chicharronpescado.png'), 
('Milanesa de pollo', 2, 9.00, 1, 'img-realtime/1749795697272_milanesa.png'), 

('Arroz Chaufa', 2, 9.00, 1, 'img-realtime/1749795752054_chaufa.png'), 
('Ceviche Mixto', 2, 9.00, 1, 'img-realtime/1749819353472_cevichemixto.png'), 
('Arroz Tapado', 2, 9.00, 1, 'img-realtime/1749819489850_arroztapado.png'), 
('Chupe de Pescado', 2, 9.00, 1, 'img-realtime/1749819646274_chupe.png'), 
('Inca Kola 500ml', 3, 2.80, 1, 'img-realtime/1749795852125_incakola500.png'), 
('Inca Kola 1.5L', 3, 4.00, 1, 'img-realtime/1749795902146_incakola1500.png'), 
('Chicha Morada', 3, 3.50, 1, 'img-realtime/1749796014385_chicha.png'), 
('Maracuyá', 3, 3.00, 1, 'img-realtime/1749796113705_maracuya.png'), 
('Limonada', 3, 3.00, 1, 'img-realtime/1749820235066_limonada.png'), 
('Coca-Cola Zero 500ml', 3, 3.00, 1, 'img-realtime/1749796213072_cocacola500.png'), 

('Coca-Cola Zero 1.5L', 3, 6.00, 1, 'img-realtime/1749796276274_cocacola1500.png'), 
('Jugo de Naranja', 3, 3.50, 1, 'img-realtime/1749796322929_naranja.png'), 
('Agua con gas 500ml', 3, 2.00, 1, 'img-realtime/1749820367920_aguagas.png'), 
('Chicha de Jora', 3, 3.50, 1, 'img-realtime/1749820459880_jora.png'), 
('Té de Hierba Luisa', 3, 3.00, 1, 'img-realtime/1749820556588_hierbaluisa.png'), 
('Jugo de Sandía', 3, 3.50, 1, 'img-realtime/1749820669696_sandia.png'), 
('Jugo de Carambola', 3, 3.00, 1, 'img-realtime/1749820781605_carambola.png'), 
('Jugo de Manzana', 3, 3.50, 1, 'img-realtime/1749820843678_manzana.png'), 
('Helado tricolor', 4, 4.00, 1, 'img-realtime/1749844214564_helado.png'), 
('Torta tres leches', 4, 4.50, 1, 'img-realtime/1749844453290_3leches.png'), 

('Flan de Vainilla', 4, 3.50, 1, 'img-realtime/1749844522430_flandevainilla.png'), 
('Helado de vainilla', 4, 2.50, 1, 'img-realtime/1749844607579_heladovainilla.png'), 
('Arroz con Leche', 4, 3.00, 1, 'img-realtime/1749796377208_arrozconleche.png'), 
('Crema Volteada', 4, 3.50, 1, 'img-realtime/1749844751199_cremavolteada.png'), 
('Aeropuerto', 2, 9.50, 1, 'img-realtime/1749819717960_aeropuerto.png'), 
('Mazamorra de Durazno', 4, 2.80, 1, 'img-realtime/1749844843607_mazamorraduraaz.png'), 
('Leche de tigre', 1, 3.00, 1, 'img-realtime/1749818888036_lechedetigre.png'), 
('Rocoto Relleno', 2, 9.00, 1, 'img-realtime/1749819930172_rocoto.png'), 
('Refresco de Chirimoya', 3, 4.00, 1, 'img-realtime/1749820951367_chirimoya.png'), 
('Tequeños con guacamole', 1, 3.00, 1, 'img-realtime/1749819000079_tequenos.png'), 

('Sopa de la casa', 1, 2.50, 1, 'img-realtime/1749819078637_sopacasa.png'), 
('Sopa de mote', 1, 2.50, 1, 'img-realtime/1749819153011_sopamote.png'), 
('Picarones', 4, 8.00, 1, 'img-realtime/1749844894914_picarones.png'), 
('Pollo Broaster', 2, 9.00, 1, 'img-realtime/1749820046499_broaster.png'), 
('Pollo Saltado', 2, 9.50, 1, 'img-realtime/1749775712607_pollosaltado.png'),
('Alitas Broaster', 1, 3.00, 1, 'img-realtime/1749875397783_alitasBroaster.jpg'),
('Bistek a lo Pobre', 2, 10, 1, 'img-realtime/1749875679090_bistek.jpg');

INSERT INTO clientes (nombre, telefono, documento, direccion) VALUES 
('Pedro Sánchez Haylas', '970555444', '55667788', 'Jr. Lima 234 Surco'), 
('Luis Javier González', '981234567', '99001122', 'Jr. Pescadores 123 Surco'), 
('Andrea Rojas Mamani', '984321654', '46129948', 'Av. Jorge Chávez 450 Surco'), 
('Carlos Raúl Montenegro', '991876543', '10010011', 'Calle San Marcos 567 Chorrillos'), 
('Mariana Ignacia Paredes Tello', '972345678', '10010012', 'Jr. Los Álamos 321 Surco'), 
('Ricardo Levi Linares Alvarado', '989543210', '10010013', 'Av. El Sol 890Chorrillos'), 
('Rosa Gabriela Herrera Torres', '998112233', '10010014', 'Calle Santa Rosa 768 Surco'), 
('Fernando Nicolás Salas Higuera', '987654320', '10010015', 'Jr. Huaylas 222 Surco'), 
('Lucía Herrera Henríquez', '986543210', '10010016', 'Av. Caminos del Inca 987 Surco'), 
('Diego José Ramírez Justo', '981112233', '10010017', 'Calle Los Jardines 555 Chorrillos'), 
('Paola Germán Cárdenas', '975123456', '10010018', 'Jr. Doña Delmira 105 Chorrillos'), 
('Sergio Daniel Guzmán Contreras', '988765432', '10010019', 'Av. Defensores del Morro 800 Surco'), 
('Natalia Elena Barrera', '971223344', '10010020', 'Calle Monte de los Olivos 214 Surco'), 
('Héctor José Valenzuela Reyes', '967889900', '10010021', 'Jr. San Sebastián 902 Surco'), 
('Isabel Mary Castro Calle', '973456789', '10010022', 'Av. Pedro Venturo 634 Chorrillos'), 
('Esteban Ignacio Rivas Sucre', '976112244', '10010023', 'Jr. Ballestas 432 Chorrillos'), 
('Melisa Navarro Altamirano', '986778899', '10010024', 'Calle Los Cedros 210 Surco'), 
('Tomás Santiago Aguirre Casas', '972334455', '10010025', 'Av. Guardia Civil 301 Chorrillos'), 
('Karla María Mendoza Figueroa', '980112233', '10010026', 'Jr. San Borja Norte 202 Surco'), 
('Jorge Dan Zambrano Peña', '997654321', '10010027', 'Av. Alameda Sur 601 Surco'), 
('Rosario Vélez Vidal', '984556677', '10010028', 'Calle Doña Juana 131 Surco'), 
('Miguel Ángel Campos Ayamamani', '979876543', '10010029', 'Av. Alameda San Marcos 701 Chorrillos'), 
('Tatiana Lola Morales Mamani', '961122334', '10010030', 'Calle Las Gardenias 115 Chorrillos'), 
('Álvaro Vásquez Reyes', '969123456', '10010031', 'Jr. Tambo de Oro 400 Surco'), 
('Verónica Nicole Estrella Espinoza', '995112233', '10010032', 'Av. Velasco Astete 1020 Surco'), 
('Ramiro Rúa Sáenz', '994223344', '10010033', 'Av. Huaylas 1500 Chorrillos Surco'), 
('Leticia Eugenia Rivas', '993334455', '10010034', 'Calle Las Violetas 309 Surco'), 
('Julio Alcántara Meneses', '965443322', '10010035', 'Jr. Los Pinos 112 Surco'), 
('Valeria Sofía Soto Germosén', '962345678', '10010036', 'Av. Cristóbal de Peralta Norte 750 Surco'), 
('Renato Hugo Tintaya Vega', '961234567', '10010037', 'Calle Las Lomas 134 Chorrillos'), 
('Camila Abigail Lozano', '989123456', '10010038', 'Av. Caminos del Inca 300 Surco'), 
('Jonathan de Jesús Herrera', '981223344', '10010039', 'Jr. Santa Rosa 250 Chorrillos'), 
('Alejandra Díaz Mampero', '974321987', '10010040', 'Calle Las Acacias 101 Surco'), 
('Liliana María Mendoza', '950117233', '60010026', 'Jirón Júpiter 221 Surco'), 
('Brígida Fernández Hidalgo', '623115048', '63957741', 'Calle Pinales 88 Surco'), 
('Ariel Fastino Camilo Peña', '953270109', '49086269', 'Calle Las Lilas 123 Surco'), 
('Helen Shirley Cuadros Hidalgo', '940214221', '42927651', 'Calle Las Lilas 123 Surco'), 
('Feliciana Dani Amaya Llopis', '995822412', '75213198', 'Av. Alameda Sur 458,  Chorrillos'), 
('Jose Ignacio Jacinto Chaparro Calatayud', '913356886', '11249419', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Inmaculada Manu Bonet Roca', '942868828', '90607503', 'Calle Las Gaviotas 178,  Chorrillos'), 
('Amílcar Amor Bueno Gil', '928728463', '49289263', 'Av. Alameda Sur 458,  Chorrillos'), 
('Joan Anselma Amor Flor', '983197857', '54623809', 'Jr. Ballestas 977,  Chorrillos'), 
('Lilia Florentina Rivas Giménez', '989254563', '25251262', 'Av. Ayacucho 550,  Surco'), 
('Vidal Dolores Lobo Agudo', '914265799', '42384885', 'Av. Huaylas 308,  Chorrillos'), 
('Martina Noelia Cuervo Rocamora', '922575562', '36170644', 'Calle Manco Cápac 221,  Chorrillos'), 
('Noé Leopoldo Cortés Garrido', '941227216', '43698567', 'Av. Velasco Astete 1023,  Surco'), 
('María Carmen Nicodemo Calatayud Bru', '990801586', '99980907', 'Av. Huaylas 308,  Chorrillos'), 
('Ricardo Cleto Palomar Núñez', '985329037', '88808839', 'Calle Manco Cápac 221,  Chorrillos'), 
('Elisabet Juan Luis Aroca Segovia', '997226012', '44101477', 'Av. Tomás Marsano 1080,  Surco'), 
('Brunilda Edelmiro Pinedo Bermúdez', '966306997', '34080873', 'Calle Las Gaviotas 178,  Chorrillos'), 
('Carmina Lázaro Pardo Fernandez', '970291817', '28099938', 'Av. La Merced 651,  Surco'), 
('Julie Buenaventura Arroyo Goñi', '947338124', '28257073', 'Av. Huaylas 308,  Chorrillos'), 
('María Teresa Luis Miguel Bernal Guerrero', '931429110', '46985553', 'Av. Ayacucho 550,  Surco'), 
('Roxana Cosme Pinto Lobo', '955667651', '50156553', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Wilfredo Fabiola Patiño Cánovas', '930868105', '99826109', 'Calle Manco Cápac 221,  Chorrillos'), 
('Raimundo Pedro Gallego Lasa', '955176955', '68660891', 'Av. Alameda Sur 458,  Chorrillos'), 
('Judith Isabela Bellido Donoso', '922448136', '33826133', 'Av. Benavides 113,  Surco'), 
('Bibiana Luisina Hierro Cárdenas', '922981052', '43147995', 'Av. Benavides 928,  Surco'), 
('Óscar Reynaldo Lerma Gimenez', '956164955', '14261580', 'Av. Pedro Venturo 450,  Surco'), 
('Isidora Moreno Barba Grande', '945503389', '21863917', 'Av. Defensores del Morro 181,  Chorrillos'), 
('Paca Amílcar Moles Quero', '971662963', '56534846', 'Av. Tomás Marsano 1080,  Surco'), 
('Julio Blas Galván Miranda', '926753883', '27082486', 'Av. Benavides 113,  Surco'), 
('Ibán Gabriela Valera Priego', '920576383', '45807893', 'Av. Tomás Marsano 1080,  Surco'), 
('Soledad Yaiza Segarra Clavero', '949349722', '47792013', 'Av. Pedro Venturo 450,  Surco'), 
('Juan Manuel Emilio Huerta Jódar', '958537831', '91536387', 'Av. La Merced 651,  Surco'), 
('Margarita Daniela Romero Pujol', '935808537', '34305904', 'Jr. Ballestas 977,  Chorrillos'), 
('Porfirio Isidoro Chacón Vergara', '916150444', '66920359', 'Calle Las Gaviotas 178,  Chorrillos'), 
('Ana Ciriaco Arévalo Canals', '948840994', '41684089', 'Jr. Ballestas 977,  Chorrillos'), 
('Ezequiel Eulalia Cuesta Roca', '941244663', '87659372', 'Av. Alameda Sur 458,  Chorrillos'), 
('Débora Bernardo Plaza Pizarro', '961019678', '33244599', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Débora Adelina Ángel Iglesias', '970855700', '73244877', 'Av. Benavides 928,  Surco'), 
('Carolina Rosalinda Alberdi Carbó', '931831063', '76490597', 'Av. Benavides 928,  Surco'), 
('Isabel Sonia Lasa Nieto', '957683626', '62718356', 'Calle Manco Cápac 221,  Chorrillos'), 
('Dani Lázaro Royo Cruz', '999949389', '74119995', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Wilfredo Abraham Lago Valle', '996977837', '82444910', 'Jr. Ballestas 977,  Chorrillos'), 
('María Belén Gaspar Vera Camino', '991756179', '89864568', 'Av. Paseo de La República 6050,  Chorrillos'), 
('Sabina Eufemia Martín Vera', '981691040', '11988115', 'Calle Las Gaviotas 178,  Chorrillos'), 
('Emelina Heliodoro Coronado Pereira', '931931511', '50346871', 'Av. El Polo 745,  Surco'), 
('María Belén Felix Abascal Morante', '960929647', '25770014', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Amaya Alejo Caparrós Parejo', '995899313', '57809460', 'Av. Tomás Marsano 1080,  Surco'), 
('Selena Paz Meléndez Heras', '939476249', '21737266', 'Av. Caminos del Inca 716,  Surco'), 
('Bautista Jose Angel Bermúdez Boada', '917507864', '15257950', 'Calle Las Gaviotas 178,  Chorrillos'), 
('Lupita Amalia Bayón Casas', '914308421', '91077954', 'Av. Caminos del Inca 716,  Surco'), 
('Eduardo Georgina Talavera Dalmau', '963843426', '39615929', 'Jr. Jorge Chávez 213,  Chorrillos'), 
('Juan Manuel Belén Rocha Galán', '918883684', '94845781', 'Calle Manco Cápac 221,  Chorrillos'), 
('Úrsula Calista Font Mesa', '986125617', '75381128', 'Av. Caminos del Inca 716,  Surco'), 
('Sabas Hilda Perea Ríos', '938538251', '82368299', 'Calle Los Faisanes 516,  Surco');

INSERT INTO empleados (nombre, telefono, documento, clave, direccion, nivel, estado) VALUES 
('DBADMIN', '953270108', '48485959', 'plqaokwsijed', '(No disponible)', 0, 1), 
('Mariela Solorzano', '987654321', '42921514', '123456', 'Jirón Las Gaviotas 122 Chorrillos', 1, 1), 
('Andrea Mamani', '976543210', '87654321', '123456', 'Jirón Las Gaviotas 355 Chorrillos', 2, 1), 
('Carlos José Fernández', '965432109', '23456789', '123456', 'Av. Arequipa 789 Chorrillos', 3, 1), 
('Ana Torres', '954321098', '34567890', '123456', 'Calle La Paz 321 Chorrillos', 2, 1), 
('Luis Martínez', '943210987', '45678901', '123456', 'Av. Brasil 654 Surco', 3, 1), 
('Sofía Ruiz', '932109876', '56789012', '123456', 'Calle Los Pinos 987 Chorrillos', 4, 1), 
('Pedro Pablo Contreras', '951124055', '48452001', '123456', 'Jiron Las Gaviotas 88 Chorrillos', 4, 1), 
('Takumi Sakamoto', '462150109', '50122144', '123456', 'Calle Huaylas 223 Surco', 3, 1), 
('Jorge Juan Negrete', '659501248', '95162840', '123456', 'Calle La Joya 2332,   Chorrillos', 4, 1), 
('Luis Alberto Quispe Ramos', '987654321', '71234567', '123456', 'Av. Defensores del Morro,  Chorrillos', 2, 1), 
('María Fernanda Huamán Paredes', '976543210', '72345678', '123456', 'Jr. Pedro Silva,  Surco', 3, 1), 
('José Carlos Apaza Mamani', '965432109', '73456789', '123456', 'Calle Las Gaviotas,  Chorrillos', 2, 1), 
('Ana Lucía Condori Quispe', '954321098', '74567890', '123456', 'Av. Ayacucho,  Surco', 3, 1), 
('Juan Diego Ticona Flores', '943210987', '75678901', '123456', 'Pasaje Las Palmas,  Chorrillos', 2, 1), 
('Rosa Elena Chuquimia Aguilar', '932109876', '76789012', '123456', 'Calle Monte de los Olivos,  Surco', 3, 1), 
('Carlos Eduardo Mamani Huanca', '921098765', '77890123', '123456', 'Jr. Los Próceres,  Chorrillos', 2, 1), 
('Fiorella Milagros Ccahuana Soto', '910987654', '78901234', '123456', 'Av. Caminos del Inca,  Surco', 3, 1), 
('Andrés Martín Poma Huari', '999876543', '79012345', '123456', 'Jr. Santa Leonor,  Chorrillos', 2, 1), 
('Valeria Sofía Quispe Ñahui', '988765432', '70123456', '123456', 'Calle Los Álamos,  Surco', 3, 1);

INSERT INTO deliveries (id, unidad, placa) VALUES  
(4, 'Mototaxi', '2102-JD'), 
(6, 'Moto', '3400-AE'), 
(9, 'Mototaxi', 'EGKJ-N0'),
(13, 'Moto', 'BAZG-0P');

INSERT INTO menu_del_dia (producto_id, dia_id) VALUES 
(1, 1), (9, 1), (50, 1), (52, 1), (13, 1), (14, 1), (20, 1), (57, 1), (28, 1), (29, 1), (37, 1), (25, 1), (26, 1), (30, 1), (31, 1), (33, 1), (44, 1), 
(40, 1), (2, 2), (4, 2), (11, 2), (12, 2), (15, 2), (17, 2), (23, 2), (24, 2), (27, 2), (29, 2), (35, 2), (25, 2), (26, 2), (30, 2), (31, 2), (33, 2), 
(39, 2), (43, 2), (3, 3), (5, 3), (56, 3), (51, 3), (16, 3), (18, 3), (21, 3), (45, 3), (32, 3), (34, 3), (36, 3), (25, 3), (26, 3), (30, 3), (31, 3), 
(33, 3), (46, 3), (53, 3), (6, 4), (7, 4), (8, 4), (10, 4), (19, 4), (22, 4), (55, 4), (48, 4), (36, 4), (49, 4), (25, 4), (26, 4), (30, 4), (31, 4), 
(33, 4), (41, 4), (42, 4), (47, 5), (1, 5), (5, 5), (9, 5), (13, 5), (15, 5), (54, 5), (57, 5), (28, 5), (37, 5), (25, 5), (26, 5), (30, 5), (31, 5), 
(33, 5), (40, 5), (44, 5), (2, 6), (50, 6), (52, 6), (12, 6), (14, 6), (20, 6), (17, 6), (23, 6), (27, 6), (29, 6), (25, 6), (26, 6), (30, 6), (31, 6), 
(33, 6), (40, 6), (41, 6), (44, 6), (53, 6), (4, 7), (6, 7), (11, 7), (47, 7), (16, 7), (19, 7), (24, 7), (54, 7), (34, 7), (36, 7), (49, 7), (25, 7), 
(26, 7), (30, 7), (31, 7), (33, 7), (39, 7), (42, 7), (43, 7), (46, 7);