<?php
// Set headers to indicate a JSON response and prevent caching
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Centralized database connection
require_once __DIR__ . '/config.php'; // Provides $pdo instance

// Fetch all bookings from the database, ordered by the most recent.
$stmt = $pdo->query('SELECT * FROM service_bookings ORDER BY created_at DESC');
$bookings = $stmt->fetchAll();

// Output the bookings as a JSON array
echo json_encode($bookings);
?>
