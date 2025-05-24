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

CREATE TABLE estados (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS tipo_producto;
CREATE TABLE tipo_producto (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	tipo_producto TINYINT UNSIGNED NOT NULL,
	precio DECIMAL(10,2) NOT NULL,
	estado BIT(1) DEFAULT b'1',
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS empleados;
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
DROP TABLE IF EXISTS deliveries;
CREATE TABLE deliveries (
	id INT UNSIGNED NOT NULL,
	unidad VARCHAR(25) NOT NULL,
	placa VARCHAR(8) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE KEY placa (placa),
	CONSTRAINT fk_delivery_empleado FOREIGN KEY (id) REFERENCES empleados (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	cliente_id INT UNSIGNED NOT NULL,
	total DECIMAL(10,2) NOT NULL,
	empleado_id INT UNSIGNED NULL, -- Puede ser NULL al principio
	estado_pedido TINYINT UNSIGNED NOT NULL,
	direccion_entrega VARCHAR(200) NULL, -- Puede ser NULL al principio
	fecha_pedido TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	delivery_id INT UNSIGNED DEFAULT NULL,
	PRIMARY KEY (id),
	KEY cliente_id (cliente_id),
	KEY empleado_id (empleado_id),
	KEY fk_pedidos_delivery (delivery_id),
	CONSTRAINT fk_pedidos_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (cliente_id) REFERENCES clientes (id),
	CONSTRAINT pedidos_ibfk_2 FOREIGN KEY (empleado_id) REFERENCES empleados (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DROP TABLE IF EXISTS detalle_pedido;
CREATE TABLE detalle_pedido (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pedido_id INT UNSIGNED NOT NULL,
	producto_id INT UNSIGNED NOT NULL,
	cantidad TINYINT UNSIGNED NOT NULL,
	precio_unitario DECIMAL(10,2) NOT NULL,
	estado TINYINT UNSIGNED NOT NULL DEFAULT 1, -- Numérico porque manejaremos hasta 8 estados
	creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	KEY pedido_id (pedido_id),
	KEY producto_id (producto_id),
	CONSTRAINT detalle_pedido_ibfk_1 FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
	CONSTRAINT detalle_pedido_ibfk_2 FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- Stored Procedures
DELIMITER $$

DROP PROCEDURE IF EXISTS `addProducto`$$

CREATE PROCEDURE `addProducto`(
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

    -- Buscar pedido existente (no asignado aún a empleado)
    SELECT id INTO p_id 
    FROM pedidos 
    WHERE cliente_id = p_cliente_id AND empleado_id IS NULL 
    ORDER BY id DESC LIMIT 1;

    -- Si no hay pedido en curso, crear uno
    IF p_id IS NULL THEN
        INSERT INTO pedidos (cliente_id, direccion_entrega, total, estado_pedido)
        VALUES (p_cliente_id, NULL, 0, 0);  -- Total 0 mientras se arma el pedido
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
        -- Si el producto no existe, insertar un nuevo detalle
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (p_id, p_producto_id, p_cantidad, p_precio_unitario);
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




DELIMITER ;;
CREATE DEFINER=root@localhost PROCEDURE adjustCantidadProducto(
    IN p_pedido_id   INT UNSIGNED,
    IN p_producto_id INT UNSIGNED,
    IN p_delta       SMALLINT       -- ahora con signo: permite -32768 a +32767
)
BEGIN
    DECLARE v_cantidad_actual INT DEFAULT 0;
    DECLARE v_nueva_cantidad INT;

    -- 1) Leer la cantidad actual (solo en estado carrito)
    SELECT cantidad
      INTO v_cantidad_actual
      FROM detalle_pedido
     WHERE pedido_id   = p_pedido_id
       AND producto_id = p_producto_id
       AND estado      = 1
     LIMIT 1;

    -- 2) Calcular la nueva cantidad, evitando negativos
    SET v_nueva_cantidad = GREATEST(v_cantidad_actual + p_delta, 0);

    -- 3) Si la nueva cantidad es 0, baja lógica
    IF v_nueva_cantidad = 0 THEN
        UPDATE detalle_pedido
           SET cantidad = 0,
               estado   = 0
         WHERE pedido_id   = p_pedido_id
           AND producto_id = p_producto_id;
    ELSE
        -- 4) Actualizar cantidad y mantener activo
        UPDATE detalle_pedido
           SET cantidad = v_nueva_cantidad,
               estado   = 1
         WHERE pedido_id   = p_pedido_id
           AND producto_id = p_producto_id;
    END IF;

    -- 5) Recalcular el total del pedido según detalles activos
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
CREATE DEFINER=root@localhost PROCEDURE deleteProducto(
    IN p_pedido_id    INT UNSIGNED,
    IN p_producto_id  INT UNSIGNED
)
BEGIN
    -- Marcar el detalle como eliminado (estado = 0)
    UPDATE detalle_pedido
       SET estado = 0
     WHERE pedido_id   = p_pedido_id
       AND producto_id = p_producto_id
       AND estado      = 1;

    -- Recalcular el total del pedido, ignorando detalles con estado = 0
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
    -- 1) Marcar el detalle como activo de nuevo (estado = 1)
    UPDATE detalle_pedido
       SET estado = 1
     WHERE pedido_id   = p_pedido_id
       AND producto_id = p_producto_id
       AND estado      = 0;

    -- 2) Recalcular el total del pedido, contando sólo los detalles activos
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
    IN p_nuevo_estado   TINYINT UNSIGNED  -- acepta 0 a 255; en tu lógica usarás 0–5, etc.
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



/* TRIGGERS */

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




-- DATA
INSERT INTO clientes (nombre, telefono, documento, direccion, estado) VALUES 
('Pedro Sánchez', '970555444', '55667788', 'Jr. Lima 234 Surco', b'1'), 
('Luis González', '981234567', '99001122', 'Jr. Pescadores 123 Surco', b'1'), 
('Andrea Rojas', '984321654', '10010010', 'Av. Jorge Chávez 450 Surco', b'1'), 
('Carlos Montenegro', '991876543', '10010011', 'Calle San Marcos 567 Chorrillos', b'1'), 
('Mariana Paredes', '972345678', '10010012', 'Jr. Los Álamos 321 Surco', b'1'), 
('Ricardo Linares', '989543210', '10010013', 'Av. El Sol 890Chorrillos', b'1'), 
('Gabriela Torres', '998112233', '10010014', 'Calle Santa Rosa 768 Surco', b'1'), 
('Fernando Salas', '987654320', '10010015', 'Jr. Huaylas 222 Surco', b'1'), 
('Lucía Herrera', '986543210', '10010016', 'Av. Caminos del Inca 987 Surco', b'1'), 
('Diego Ramírez', '981112233', '10010017', 'Calle Los Jardines 555 Chorrillos', b'1'), 
('Paola Cárdenas', '975123456', '10010018', 'Jr. Doña Delmira 105 Chorrillos', b'1'), 
('Sergio Guzmán', '988765432', '10010019', 'Av. Defensores del Morro 800 Surco', b'1'), 
('Natalia Barrera', '971223344', '10010020', 'Calle Monte de los Olivos 214 Surco', b'1'), 
('Héctor Valenzuela', '967889900', '10010021', 'Jr. San Sebastián 902 Surco', b'1'), 
('Isabel Castro', '973456789', '10010022', 'Av. Pedro Venturo 634 Chorrillos', b'1'), 
('Esteban Rivas', '976112244', '10010023', 'Jr. Ballestas 432 Chorrillos', b'1'), 
('Melisa Navarro', '986778899', '10010024', 'Calle Los Cedros 210 Surco', b'1'), 
('Tomás Aguirre', '972334455', '10010025', 'Av. Guardia Civil 301 Chorrillos', b'1'), 
('Karla Mendoza', '980112233', '10010026', 'Jr. San Borja Norte 202 Surco', b'1'), 
('Jorge Peña', '997654321', '10010027', 'Av. Alameda Sur 601 Surco', b'0'), 
('Rosario Vidal', '984556677', '10010028', 'Calle Doña Juana 131 Surco', b'0'), 
('Miguel Campos', '979876543', '10010029', 'Av. Alameda San Marcos 701 Chorrillos', b'1'), 
('Tatiana Morales', '961122334', '10010030', 'Calle Las Gardenias 115 Chorrillos', b'1'), 
('Álvaro Reyes', '969123456', '10010031', 'Jr. Tambo de Oro 400 Surco', b'0'), 
('Verónica Espinoza', '995112233', '10010032', 'Av. Velasco Astete 1020 Surco', b'1'), 
('Ramiro Sáenz', '994223344', '10010033', 'Av. Huaylas 1500 Chorrillos Surco', b'1'), 
('Leticia Rivas', '993334455', '10010034', 'Calle Las Violetas 309 Surco', b'1'), 
('Julio Meneses', '965443322', '10010035', 'Jr. Los Pinos 112 Surco', b'1'), 
('Valeria Soto', '962345678', '10010036', 'Av. Cristóbal de Peralta Norte 750 Surco', b'1'), 
('Renato Vega', '961234567', '10010037', 'Calle Las Lomas 134 Chorrillos', b'1'), 
('Camila Lozano', '989123456', '10010038', 'Av. Caminos del Inca 300 Surco', b'1'), 
('Jonathan Herrera', '981223344', '10010039', 'Jr. Santa Rosa 250 Chorrillos', b'1'), 
('Alejandra Díaz', '974321987', '10010040', 'Calle Las Acacias 101 Surco', b'1'), 
('Liliana María Mendoza', '950117233', '60010026', 'Jirón Júpiter 221 Surco', b'1');

INSERT INTO empleados (nombre, telefono, documento, clave, direccion, nivel, estado) VALUES  
('AdminAdmin', '000000000', '00000000', '1954260873', '000000000000', 3, 1), 
('Mariela Salazar Vargas', '987654321', '41015448', '8845122', 'Jirón Las Gaviotas 122 Chorrillos', 2, 1), 
('Andrea Mamani', '976543210', '87654321', '234567', 'Jirón Las Gaviotas 355 Chorrillos', 0, 1), 
('Carlos José Fernández', '965432109', '23456789', '345678', 'Av. Arequipa 789 Chorrillos', 1, 1), 
('Ana Torres', '954321098', '34567890', '456789', 'Calle La Paz 321 Chorrillos', 0, 1), 
('Luis Martínez', '943210987', '45678901', '567890', 'Av. Brasil 654 Surco', 0, 1), 
('Sofía Ruiz', '932109876', '56789012', '678901', 'Calle Los Pinos 987 Chorrillos', 0, 1), 
('Pedro Pablo Contreras', '951124055', '48452001', '6101244', 'Jiron Las Gaviotas 88 Chorrillos', 1, 1), 
('Takumi Fujiwara', '462150109', '50122144', '8495846', 'Calle Hokisha 334,  Akina', 1, 1), 
('Jorge Juan Negrete', '659501248', '95162840', '23942341', 'Calle La Joya 2332,  Chorrillos', 2, 1);

INSERT INTO deliveries (id, unidad, placa) VALUES  
(4, 'Mototaxi', '2102-JD'), 
(8, 'Moto', '3400-AE'), 
(9, 'Mototaxi', 'TRU3-N0');

INSERT INTO estados (nombre) VALUES  
('Inactivo'),
('En preparación'),
('Preparado'),
('En tránsito'),
('Entregado'),
('No entregado'),
('Devuelto'),
('Incidente'),
('ERROR');

INSERT INTO productos (nombre, tipo_producto, precio, estado) VALUES 
('Papa a la Huancaína', 1, 3.00, b'1'), 
('Causa de Pollo', 1, 3.00, b'1'), 
('Causa de Atún', 1, 3.00, b'1'), 
('Ocopa Arequipeña', 1, 3.00, b'1'), 
('Yuquitas Fritas', 1, 3.00, b'1'), 
('Palta Rellena', 1, 3.00, b'1'), 
('Ensalada Rusa', 1, 3.00, b'1'), 
('Sopa Criolla', 1, 3.00, b'0'), 
('Chicharrón de Pota', 1, 3.00, b'1'), 
('Ceviche', 1, 3.00, b'1'), 
('Ensalada Criolla', 1, 3.00, b'1'), 
('Gelatina', 1, 3.00, b'1'), 
('Lomo Saltado', 2, 9.00, b'1'), 
('Ají de Gallina', 2, 9.00, b'1'), 
('Arroz con Pollo', 2, 9.00, b'1'), 
('Cau Cau', 2, 9.00, b'0'), 
('Seco con Frejoles', 2, 9.00, b'1'), 
('Tacu Tacu con Lomo', 2, 9.00, b'1'), 
('Chicharrón de Pescado', 2, 9.00, b'1'), 
('Milanesa de pollo', 2, 9.00, b'1'), 
('Arroz Chaufa', 2, 9.00, b'1'), 
('Ceviche Mixto', 2, 9.00, b'1'), 
('Arroz Tapado', 2, 9.00, b'1'), 
('Chupe de Pescado', 2, 9.00, b'1'), 
('Inca Kola 500ml', 3, 2.80, b'1'), 
('Inca Kola 1.5L', 3, 4.00, b'1'), 
('Chicha Morada', 3, 3.50, b'1'), 
('Maracuyá', 3, 3.00, b'1'), 
('Limonada', 3, 3.00, b'1'), 
('Coca-Cola Zero 500ml', 3, 3.00, b'1'), 
('Coca-Cola Zero 1.5L', 3, 6.00, b'1'), 
('Jugo de Naranja', 3, 3.50, b'0'), 
('Agua con gas 500ml', 3, 2.00, b'1'), 
('Chicha de Jora', 3, 3.50, b'1'), 
('Té de Hierba Luisa', 3, 3.00, b'0'), 
('Jugo de Sandía', 3, 3.50, b'0'), 
('Jugo de Carambola', 3, 3.00, b'1'), 
('Jugo de Manzana', 3, 3.50, b'1'), 
('Helado tricolor', 4, 4.00, b'1'), 
('Torta tres leches', 4, 4.50, b'0'), 
('Flan de Vainilla', 4, 3.50, b'1'), 
('Helado de vainilla', 4, 2.50, b'1'), 
('Arroz con Leche', 4, 3.00, b'1'), 
('Crema Volteada', 4, 3.50, b'1');

INSERT INTO tipo_producto (nombre) VALUES  
('Entrada'),
('Segundo'),
('Bebida'),
('Postre');