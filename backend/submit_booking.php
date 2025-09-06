<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed: Only POST method is allowed']);
    exit;
}

// Centralized database connection
require_once __DIR__ . '/config.php'; // Provides $pdo instance

// Helper to safely fetch POST fields
function post($key, $default = null) {
    if (!isset($_POST[$key])) {
        return $default;
    }
    return is_array($_POST[$key]) ? $_POST[$key] : trim($_POST[$key]);
}

// Get form data
$fullName         = post('fullName');
$phone            = post('phone');
$email            = post('email');
$carMake          = post('carMake');
$carModel         = post('carModel');
$yearManufacture  = post('yearManufacture');
$preferredDate    = post('preferredDate');
$timeSlot         = post('timeSlot'); // Added timeSlot
$servicesNeeded   = post('servicesNeeded');
$issueDescription = post('issueDescription');
$pickupService    = (post('pickupService') === 'yes') ? 1 : 0;

// Basic validation
$errors = [];
if (empty($fullName)) $errors[] = 'Full Name is required';
if (empty($phone)) $errors[] = 'Phone number is required';
if (empty($carMake)) $errors[] = 'Car make is required';
if (empty($carModel)) $errors[] = 'Car model is required';
if (empty($timeSlot)) $errors[] = 'Time slot is required'; // Added validation
if (empty($servicesNeeded)) $errors[] = 'At least one service must be selected';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

try {
    // Check if table exists, if not create it
    $pdo->exec("CREATE TABLE IF NOT EXISTS service_bookings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        car_make VARCHAR(100) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        year_manufacture INT DEFAULT NULL,
        preferred_date DATE DEFAULT NULL,
        time_slot VARCHAR(100) NOT NULL, /* Added time_slot column */
        services_needed TEXT NOT NULL,
        issue_description TEXT,
        pickup_service TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Check if the time slot is already full
    $checkStmt = $pdo->prepare('SELECT COUNT(*) FROM service_bookings WHERE preferred_date = ? AND time_slot = ?');
    $checkStmt->execute([$preferredDate, $timeSlot]);
    $bookingCount = $checkStmt->fetchColumn();

    if ($bookingCount >= 2) {
        http_response_code(409); // 409 Conflict
        echo json_encode([
            'success' => false,
            'message' => 'This time slot is already full. Please choose another one.'
        ]);
        exit;
    }

    // Prepare and execute the insert statement
    $stmt = $pdo->prepare('INSERT INTO service_bookings 
        (full_name, phone, email, car_make, car_model, year_manufacture, 
         preferred_date, time_slot, services_needed, issue_description, pickup_service) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    $stmt->execute([
        $fullName,
        $phone,
        $email ?: null,
        $carMake,
        $carModel,
        is_numeric($yearManufacture) ? (int)$yearManufacture : null,
        $preferredDate ?: null,
        $timeSlot, // Added timeSlot
        is_array($servicesNeeded) ? implode(', ', $servicesNeeded) : $servicesNeeded,
        $issueDescription ?: null,
        $pickupService
    ]);

    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Booking submitted successfully!',
        'booking_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'An error occurred while saving your booking.',
        'error' => $e->getMessage()
    ]);
}
?>
