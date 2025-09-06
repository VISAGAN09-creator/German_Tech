<?php
/**
 * Centralized database connection file.
 * Include this file using `require_once __DIR__ . '/config.php';` to get a PDO instance.
 * It creates the database if it does not exist and returns a connected PDO object.
 */

$host    = 'localhost';
$port    = 3307;              // XAMPP MySQL port
$dbname  = 'german_tech';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

// Only create the PDO once per request
if (!isset($GLOBALS['pdo']) || !($GLOBALS['pdo'] instanceof PDO)) {
    try {
        // Temporary connection (no DB) to create DB if it doesn't exist
        $tmpDsn = "mysql:host=$host;port=$port;charset=$charset";
        $tmpPdo = new PDO($tmpDsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET $charset COLLATE {$charset}_unicode_ci");
        $tmpPdo = null; // Close temp connection

        // Main connection with DB selected
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);

        // Store globally so subsequent requires use the same object
        $GLOBALS['pdo'] = $pdo;
    } catch (PDOException $e) {
        // In production log this instead of outputting
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed',
            'error'   => $e->getMessage()
        ]);
        exit;
    }
} else {
    $pdo = $GLOBALS['pdo'];
}

return $pdo;
