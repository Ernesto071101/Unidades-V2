<?php
// operadores.php
require_once 'db_config.php';

// Establecer cabeceras para permitir CORS (Cross-Origin Resource Sharing)
header('Access-Control-Allow-Origin: *'); // Permite peticiones desde cualquier origen (para desarrollo)
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar la petición OPTIONS (preflight request de CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Leer operadores
        $sql = "SELECT id, nombre, apellido_paterno, IFNULL(apellido_materno, '') as apellido_materno FROM operadores ORDER BY id ASC";
        $result = $conn->query($sql);

        $operadores = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $operadores[] = $row;
            }
        }
        sendJsonResponse('success', 'Operadores obtenidos', $operadores);
        break;

    case 'POST':
        // Crear operador
        $data = json_decode(file_get_contents("php://input"), true);
        $nombre = $data['nombre'] ?? ''; // Eliminado real_escape_string
        $apellidoPaterno = $data['apellido_paterno'] ?? ''; // Eliminado real_escape_string
        // Usar null si el campo está vacío para la base de datos
        $apellidoMaterno = !empty($data['apellido_materno']) ? $data['apellido_materno'] : NULL; // Eliminado real_escape_string

        if (empty($nombre) || empty($apellidoPaterno)) {
            sendJsonResponse('error', 'Nombre y apellido paterno son obligatorios.');
        }

        $stmt = $conn->prepare("INSERT INTO operadores (nombre, apellido_paterno, apellido_materno) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nombre, $apellidoPaterno, $apellidoMaterno);

        if ($stmt->execute()) {
            sendJsonResponse('success', 'Operador agregado con éxito.', ['id' => $stmt->insert_id]);
        } else {
            // Error en la inserción
            sendJsonResponse('error', 'Error al agregar operador: ' . $stmt->error);
        }
        $stmt->close();
        break;

    case 'PUT':
        // Actualizar operador
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id'] ?? 0);
        $nombre = $data['nombre'] ?? ''; // Eliminado real_escape_string
        $apellidoPaterno = $data['apellido_paterno'] ?? ''; // Eliminado real_escape_string
        // Usar null si el campo está vacío
        $apellidoMaterno = !empty($data['apellido_materno']) ? $data['apellido_materno'] : NULL; // Eliminado real_escape_string

        if ($id === 0 || empty($nombre) || empty($apellidoPaterno)) {
            sendJsonResponse('error', 'ID, nombre y apellido paterno son obligatorios para actualizar.');
        }

        $stmt = $conn->prepare("UPDATE operadores SET nombre = ?, apellido_paterno = ?, apellido_materno = ? WHERE id = ?");
        $stmt->bind_param("sssi", $nombre, $apellidoPaterno, $apellidoMaterno, $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                sendJsonResponse('success', 'Operador actualizado con éxito.');
            } else {
                sendJsonResponse('error', 'Operador no encontrado o no se realizaron cambios.', ['id' => $id]);
            }
        } else {
            sendJsonResponse('error', 'Error al actualizar operador: ' . $stmt->error);
        }
        $stmt->close();
        break;

    case 'DELETE':
        // Eliminar operador
        $id = intval($_GET['id'] ?? 0); 

        if ($id === 0) {
            sendJsonResponse('error', 'ID del operador es obligatorio para eliminar.');
        }

        $stmt = $conn->prepare("DELETE FROM operadores WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                sendJsonResponse('success', 'Operador eliminado con éxito. Unidades y órdenes de trabajo desvinculadas (operador_id = NULL).');
            } else {
                sendJsonResponse('error', 'Operador no encontrado.');
            }
        } else {
            sendJsonResponse('error', 'Error al eliminar operador: ' . $stmt->error);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse('error', 'Método no soportado.');
        break;
}

$conn->close();
?>