-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS taller1;

-- Usar la base de datos
USE taller1;

-- Tabla de Operadores
CREATE TABLE IF NOT EXISTS `operadores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido_paterno` VARCHAR(100) NOT NULL,
    `apellido_materno` VARCHAR(100)
);

-- Tabla de Unidades
CREATE TABLE IF NOT EXISTS `unidades` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `num_economico` VARCHAR(50) NOT NULL UNIQUE,
    `placas` VARCHAR(50) NOT NULL UNIQUE,
    `modelo` VARCHAR(100) NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `status` ENUM('En Mantenimiento', 'Lista para Asignación', 'En Ruta') NOT NULL DEFAULT 'En Mantenimiento',
    `orden_mantenimiento` TEXT, -- Solo si está en mantenimiento
    `ruta_asignada` TEXT,       -- Solo si está en ruta
    `operador_id` INT,
    FOREIGN KEY (`operador_id`) REFERENCES `operadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
    -- ON DELETE SET NULL: Si un operador es eliminado, las unidades que tenía asignadas tendrán operador_id = NULL
    -- ON UPDATE CASCADE: Si el ID de un operador cambia, se actualiza automáticamente en unidades
);

-- Tabla de Órdenes de Trabajo
CREATE TABLE IF NOT EXISTS `ordenes_trabajo` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `unidad_id` INT NOT NULL,
    `operador_id` INT, -- Operador que reporta (opcional)
    `tipo_mantenimiento` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `estado` ENUM('Pendiente', 'En Proceso', 'Completada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    `fecha_fin` DATE,
    FOREIGN KEY (`unidad_id`) REFERENCES `unidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`operador_id`) REFERENCES `operadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
    -- ON DELETE CASCADE: Si una unidad es eliminada, sus órdenes de trabajo también se eliminan
    -- ON DELETE SET NULL: Si el operador que reportó es eliminado, su operador_id se vuelve NULL
);