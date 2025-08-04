<?php
require_once 'db_config.php'; // Incluye tu archivo de configuración de la base de datos

// Si la conexión falló, db_config.php ya habrá enviado un JSON de error y salido.
// Si llegamos a este punto, significa que $conn es una conexión exitosa.

if ($conn) {
    // Ejecutar una consulta de prueba simple para asegurar que la DB responde
    $result = $conn->query("SELECT 1 + 1 AS test_result");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "<h1>&#9989; ¡Conexión a la base de datos exitosa!</h1>";
        echo "<p>Resultado de la consulta de prueba (1+1): <strong>" . $row['test_result'] . "</strong></p>";
        echo "<p>Base de datos conectada: <strong>" . DB_NAME . "</strong></p>";
    } else {
        echo "<h1>&#10060; Error al ejecutar consulta de prueba:</h1>";
        echo "<p>" . $conn->error . "</p>";
    }
} else {
    // Esto no debería ejecutarse si db_config.php maneja la salida de error
    echo "<h1>&#10060; Error: La conexión a la base de datos no se estableció.</h1>";
}

$conn->close(); // Cierra la conexión
?>