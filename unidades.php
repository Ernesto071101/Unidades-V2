<?php
// unidades.php
require_once 'db_config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($method) {
    case 'GET':
        // Leer unidades (con información del operador)
        // Ahora usamos 'num_economico' en lugar de 'id' para buscar una unidad específica
        $numEconomico = $_GET['num_economico'] ?? '';

        $sql = "SELECT u.*, 
                        o.nombre AS operador_nombre, 
                        o.apellido_paterno AS operador_apellido_paterno, 
                        IFNULL(o.apellido_materno, '') AS operador_apellido_materno
                FROM unidades u
                LEFT JOIN operadores o ON u.operador_id = o.id";
        
        if (!empty($numEconomico)) {
            // El identificador es 'num_economico', que es un VARCHAR, no un INT
            $sql .= " WHERE u.num_economico = ?";
        }
        $sql .= " ORDER BY u.num_economico ASC";

        $stmt = $conn->prepare($sql);
        if (!empty($numEconomico)) {
            // El tipo de parámetro es 's' (string) en lugar de 'i' (integer)
            $stmt->bind_param("s", $numEconomico);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $unidades = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $unidades[] = $row;
            }
        }
        sendJsonResponse('success', 'Unidades obtenidas', $unidades);
        $stmt->close();
        break;

    case 'POST':
        // La lógica para crear, actualizar y eliminar unidades
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        switch ($action) {
            case 'agregar':
                $numEconomico = $data['num_economico'] ?? '';
                $placas = $data['placas'] ?? '';
                $modelo = $data['modelo'] ?? '';
                $marca = $data['marca'] ?? '';
                $status = $data['status'] ?? 'En Mantenimiento';
                
                $operadorId = null;
                if (isset($data['operador_id']) && $data['operador_id'] !== '') {
                    $operadorId = intval($data['operador_id']);
                }

                $ordenMantenimiento = !empty($data['orden_mantenimiento']) ? $data['orden_mantenimiento'] : null;
                $rutaAsignada = !empty($data['ruta_asignada']) ? $data['ruta_asignada'] : null;

                if (empty($numEconomico) || empty($placas) || empty($modelo) || empty($marca)) {
                    sendJsonResponse('error', 'Número económico, placas, modelo y marca son obligatorios.');
                }
            
                $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM unidades WHERE num_economico = ? OR placas = ?");
                $stmtCheck->bind_param("ss", $numEconomico, $placas);
                $stmtCheck->execute();
                $stmtCheck->bind_result($count);
                $stmtCheck->fetch();
                $stmtCheck->close();
                if ($count > 0) {
                    sendJsonResponse('error', 'Una unidad con este número económico o placas ya existe.');
                }
            
                // La consulta de inserción ya no incluye el campo 'id'
                $sql = "INSERT INTO unidades (num_economico, placas, modelo, marca, status, operador_id, orden_mantenimiento, ruta_asignada) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                // Tipos de parámetros: 'sssssiss' (cinco strings, un int, dos strings)
                $stmt->bind_param("sssssiss", $numEconomico, $placas, $modelo, $marca, $status, $operadorId, $ordenMantenimiento, $rutaAsignada);
            
                if ($stmt->execute()) {
                    sendJsonResponse('success', 'Unidad agregada correctamente.');
                } else {
                    sendJsonResponse('error', 'Error al agregar la unidad: ' . $stmt->error);
                }
                $stmt->close();
                break;

            case 'completar_mantenimiento':
                // Se busca la unidad por su 'num_economico'
                $numEconomico = $data['num_economico'] ?? '';
                if (empty($numEconomico)) {
                    sendJsonResponse('error', 'El número económico es obligatorio para completar el mantenimiento.');
                }
                $sql = "UPDATE unidades SET status = 'Lista para Asignación', orden_mantenimiento = NULL WHERE num_economico = ?";
                $stmt = $conn->prepare($sql);
                // El tipo de parámetro es 's' (string)
                $stmt->bind_param("s", $numEconomico);
                if ($stmt->execute()) {
                    sendJsonResponse('success', "Mantenimiento de la unidad {$numEconomico} completado.");
                } else {
                    sendJsonResponse('error', 'Error al completar el mantenimiento: ' . $stmt->error);
                }
                $stmt->close();
                break;
                
            case 'asignar_ruta':
                // Se busca la unidad por su 'num_economico'
                $numEconomico = $data['num_economico'] ?? '';
                $rutaAsignada = $data['ruta_asignada'] ?? null;
                if (empty($numEconomico) || empty($rutaAsignada)) {
                    sendJsonResponse('error', 'El número económico y la ruta son obligatorios.');
                }
                $sql = "UPDATE unidades SET status = 'En Ruta', ruta_asignada = ? WHERE num_economico = ?";
                $stmt = $conn->prepare($sql);
                // El tipo de parámetro es 'ss' (dos strings)
                $stmt->bind_param("ss", $rutaAsignada, $numEconomico);
                if ($stmt->execute()) {
                    sendJsonResponse('success', "Ruta '{$rutaAsignada}' asignada a la unidad {$numEconomico}.");
                } else {
                    sendJsonResponse('error', 'Error al asignar la ruta: ' . $stmt->error);
                }
                $stmt->close();
                break;
                
            case 'regresar_ruta':
                // Se busca la unidad por su 'num_economico'
                $numEconomico = $data['num_economico'] ?? '';
                if (empty($numEconomico)) {
                    sendJsonResponse('error', 'El número económico es obligatorio para regresar de ruta.');
                }
                $sql = "UPDATE unidades SET status = 'Lista para Asignación', ruta_asignada = NULL WHERE num_economico = ?";
                $stmt = $conn->prepare($sql);
                // El tipo de parámetro es 's' (string)
                $stmt->bind_param("s", $numEconomico);
                if ($stmt->execute()) {
                    sendJsonResponse('success', "Unidad {$numEconomico} ha regresado de la ruta.");
                } else {
                    sendJsonResponse('error', 'Error al regresar de la ruta: ' . $stmt->error);
                }
                $stmt->close();
                break;

            case 'eliminar':
                // Se busca la unidad por su 'num_economico'
                $numEconomico = $data['num_economico'] ?? '';
                if (empty($numEconomico)) {
                    sendJsonResponse('error', 'El número económico es obligatorio para eliminar.');
                }
                $sql = "DELETE FROM unidades WHERE num_economico = ?";
                $stmt = $conn->prepare($sql);
                // El tipo de parámetro es 's' (string)
                $stmt->bind_param("s", $numEconomico);
                if ($stmt->execute()) {
                    sendJsonResponse('success', "Unidad {$numEconomico} eliminada correctamente.");
                } else {
                    sendJsonResponse('error', 'Error al eliminar la unidad: ' . $stmt->error);
                }
                $stmt->close();
                break;

            case 'asignar_operador':
                // Se busca la unidad por su 'num_economico'
                $numEconomico = $data['num_economico'] ?? '';
                $operadorId = $data['operador_id'] ?? null;
                if (empty($numEconomico)) {
                    sendJsonResponse('error', 'El número económico es obligatorio para asignar un operador.');
                }
                $sql = "UPDATE unidades SET operador_id = ? WHERE num_economico = ?";
                $stmt = $conn->prepare($sql);
                // El tipo de parámetro es 'is' (integer y string)
                $stmt->bind_param("is", $operadorId, $numEconomico);
                if ($stmt->execute()) {
                    sendJsonResponse('success', "Operador asignado a la unidad {$numEconomico}.");
                } else {
                    sendJsonResponse('error', 'Error al asignar el operador: ' . $stmt->error);
                }
                $stmt->close();
                break;

            default:
                sendJsonResponse('error', 'Acción no válida.');
                break;
        }
        break;

    default:
        sendJsonResponse('error', 'Método no permitido.');
        break;
}

// Cerramos la conexión al final del script
$conn->close();

?>