<?php
// ordenes_trabajo.php
require_once 'db_config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Leer órdenes de trabajo
        // El 'unidad_id' ahora es el 'num_economico'
        $unidadNumEconomico = $_GET['unidad_id'] ?? '';
        $otId = intval($_GET['id'] ?? 0); 

        $sql = "SELECT ot.*, u.num_economico, u.placas,
                        op.nombre AS operador_nombre, IFNULL(op.apellido_paterno, '') AS operador_apellido_paterno
                FROM ordenes_trabajo ot
                -- La unión ahora se hace usando el 'num_economico'
                JOIN unidades u ON ot.unidad_id = u.num_economico
                LEFT JOIN operadores op ON ot.operador_id = op.id";
        
        $params = [];
        $types = "";

        if ($otId > 0) {
             $sql .= " WHERE ot.id = ?";
             $params[] = $otId;
             $types .= "i";
        } elseif (!empty($unidadNumEconomico)) {
            // El filtro ahora se hace con el 'num_economico' que es un string
            $sql .= " WHERE ot.unidad_id = ?";
            $params[] = $unidadNumEconomico;
            $types .= "s";
        }
        $sql .= " ORDER BY ot.fecha_inicio DESC, ot.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $bind_params = [];
            $bind_params[] = &$types;
            for ($i = 0; $i < count($params); $i++) {
                $bind_params[] = &$params[$i];
            }
            call_user_func_array([$stmt, 'bind_param'], $bind_params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();

        $ordenes = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $ordenes[] = $row;
            }
        }
        sendJsonResponse('success', 'Órdenes de trabajo obtenidas', $ordenes);
        $stmt->close();
        break;

    case 'POST':
        // Crear orden de trabajo
        $data = json_decode(file_get_contents("php://input"), true);
        // El 'unidad_id' ya no se convierte a entero
        $unidadId = $data['unidad_id'] ?? ''; 
        $operadorId = null;
        if (isset($data['operador_id']) && $data['operador_id'] !== '') {
            $operadorId = intval($data['operador_id']);
        }
        $tipoMantenimiento = $data['tipo_mantenimiento'] ?? '';
        $descripcion = $data['descripcion'] ?? '';
        $fechaInicio = $data['fecha_inicio'] ?? date('Y-m-d');
        $estado = 'Pendiente';

        if (empty($unidadId) || empty($tipoMantenimiento) || empty($descripcion)) {
            sendJsonResponse('error', 'Datos incompletos.');
        }

        $sql = "INSERT INTO ordenes_trabajo (unidad_id, operador_id, tipo_mantenimiento, descripcion, fecha_inicio, estado) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        // El tipo de parámetro para 'unidad_id' es 's' (string)
        $stmt->bind_param("sissss", $unidadId, $operadorId, $tipoMantenimiento, $descripcion, $fechaInicio, $estado);

        if ($stmt->execute()) {
            sendJsonResponse('success', 'Orden de trabajo creada correctamente.', ['id' => $conn->insert_id]);
        } else {
            sendJsonResponse('error', 'Error al crear la orden de trabajo: ' . $stmt->error);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse('error', 'Método no permitido.');
        break;
}

$conn->close();
?>