<?php
// db_config.php

define('DB_SERVER', 'localhost'); // Usualmente 'localhost' para desarrollo
define('DB_USERNAME', 'root');   // Tu usuario de MySQL (por defecto 'root' en XAMPP)
define('DB_PASSWORD', '');       // Tu contraseña de MySQL (por defecto vacía en XAMPP)

// El nombre de la base de datos ha cambiado de 'taller1' a 'taller'
// define('DB_NAME', 'taller1'); 
define('DB_NAME', 'taller');  // Nombre de la base de datos actualizada

// Conexión a la base de datos
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificar conexión
if ($conn->connect_error) {
    // Si la conexión falla, se detiene la ejecución y se envía un error JSON
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Conexión a la base de datos fallida: ' . $conn->connect_error]);
    exit();
}

// Opcional: Establecer el juego de caracteres a UTF-8 para evitar problemas con acentos y caracteres especiales
$conn->set_charset("utf8mb4");

// Esta función es útil para enviar una respuesta JSON consistente
function sendJsonResponse($status, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode(['status' => $status, 'message' => $message, 'data' => $data]);
    exit(); // Termina la ejecución del script después de enviar la respuesta
}

?>