<?php
// Inicia el búfer de salida. Esto capturará cualquier salida inesperada.
ob_start();

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Si la petición es de tipo OPTIONS, respondemos con éxito y terminamos
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    ob_end_clean(); // Limpia el búfer y lo desactiva
    exit();
}

// Función para enviar una respuesta JSON y terminar el script
function sendJsonResponse($status, $message, $data = null) {
    ob_end_clean(); // ¡Importante! Limpia cualquier salida inesperada
    $response = ['status' => $status, 'message' => $message, 'data' => $data];
    echo json_encode($response);
    exit();
}

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "taller";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    sendJsonResponse('error', 'Error en la conexión a la base de datos: ' . $conn->connect_error);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
    $unidadNumEconomico = $_GET['unidad_id'] ?? null;
    if ($unidadNumEconomico) {
        $stmt = $conn->prepare("SELECT ot.*, u.num_economico, u.placas, o.nombre AS operador_nombre, o.apellido_paterno
                                FROM ordenes_trabajo ot
                                JOIN unidades u ON ot.unidad_id = u.num_economico
                                LEFT JOIN operadores o ON ot.operador_id = o.id
                                WHERE u.num_economico = ?");
        if ($stmt === false) {
            sendJsonResponse('error', 'Error en la preparación de la consulta GET: ' . $conn->error);
        }
        $stmt->bind_param("s", $unidadNumEconomico);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        sendJsonResponse('success', 'Órdenes de trabajo obtenidas con éxito.', $data);
        $stmt->close();
    } else {
        sendJsonResponse('error', 'El parámetro "unidad_id" es obligatorio para las consultas GET.');
    }
    break;

case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);
    
    $unidadNumEconomico = $data['unidad_id'] ?? '';
    $operadorId = $data['operador_id'] ?? null;
    $tipoMantenimiento = $data['tipo_mantenimiento'] ?? ''; 
    $descripcion = $data['descripcion'] ?? '';
    $fechaInicio = date('Y-m-d');
    $estado = 'Pendiente';

    if (empty($unidadNumEconomico) || empty($tipoMantenimiento) || empty($descripcion)) {
        sendJsonResponse('error', 'El número económico de la unidad, el tipo de mantenimiento y la descripción son obligatorios.');
    }
    
    $stmt = $conn->prepare("INSERT INTO ordenes_trabajo (unidad_id, operador_id, tipo_mantenimiento, descripcion, fecha_inicio, estado) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sissss", $unidadNumEconomico, $operadorId, $tipoMantenimiento, $descripcion, $fechaInicio, $estado);

    if ($stmt->execute()) {
        sendJsonResponse('success', 'Orden de trabajo creada con éxito.', ['id' => $conn->insert_id]);
    } else {
        sendJsonResponse('error', 'Error al crear la orden de trabajo: ' . $stmt->error);
    }
    break;

    default:
        sendJsonResponse('error', 'Método no soportado.');
        break;
}

$conn->close();
?>