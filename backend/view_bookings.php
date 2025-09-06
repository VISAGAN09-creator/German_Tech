<?php
// Centralized database connection
require_once __DIR__ . '/config.php'; // Provides $pdo instance

// Fetch all bookings from the database, ordered by the most recent.
$stmt = $pdo->query('SELECT * FROM service_bookings ORDER BY created_at DESC');
$bookings = $stmt->fetchAll();

/**
 * A simple helper function to safely display data in HTML.
 * @param string|null $data The data to escape.
 * @return string The escaped data.
 */
function e($data) {
    return htmlspecialchars($data ?? '', ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View All Bookings</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 14px;
        }
        th {
            background-color: #34495e;
            color: #fff;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #e8f4f8;
        }
        .no-bookings {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>All Service Bookings</h1>
        <?php if (empty($bookings)): ?>
            <p class="no-bookings">No bookings have been made yet.</p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Car Model</th>
                        <th>Year</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Services</th>
                        <th>Pickup</th>
                        <th>Message</th>
                        <th>Booking Time</th>
                    </tr>
                </thead>
                <tbody id="bookings-tbody">
                    <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td><?= e($booking['id']) ?></td>
                            <td><?= e($booking['full_name']) ?></td>
                            <td><?= e($booking['phone']) ?></td>
                            <td><?= e($booking['email']) ?></td>
                            <td><?= e($booking['car_model']) ?></td>
                            <td><?= e($booking['year_manufacture']) ?></td>
                            <td><?= e($booking['preferred_date']) ?></td>
                            <td><?= e($booking['time_slot']) ?></td>
                            <td><?= e($booking['services_needed']) ?></td>
                            <td><?= e($booking['pickup_service']) ?></td>
                            <td><?= e($booking['issue_description']) ?></td>
                            <td><?= e($booking['created_at']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <script>
        // A simple function to safely escape string for HTML display
        function escapeHTML(str) {
            if (str === null || str === undefined) return '';
            return str.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        // This function fetches the latest bookings and redraws the table
        async function fetchAndUpdateBookings() {
            try {
                const response = await fetch('fetch_bookings.php');
                if (!response.ok) {
                    console.error('Failed to fetch booking data.');
                    return;
                }
                const bookings = await response.json();
                const tbody = document.getElementById('bookings-tbody');
                
                // Clear the current table body
                tbody.innerHTML = '';

                // If there are no bookings, display a message (optional)
                if (bookings.length === 0) {
                    const row = `<tr><td colspan="12" class="no-bookings">No bookings have been made yet.</td></tr>`;
                    tbody.innerHTML = row;
                    return;
                }

                // Re-populate the table with the new data
                bookings.forEach(booking => {
                    const row = `
                        <tr>
                            <td>${escapeHTML(booking.id)}</td>
                            <td>${escapeHTML(booking.full_name)}</td>
                            <td>${escapeHTML(booking.phone)}</td>
                            <td>${escapeHTML(booking.email)}</td>
                            <td>${escapeHTML(booking.car_model)}</td>
                            <td>${escapeHTML(booking.year_manufacture)}</td>
                            <td>${escapeHTML(booking.preferred_date)}</td>
                            <td>${escapeHTML(booking.time_slot)}</td>
                            <td>${escapeHTML(booking.services_needed)}</td>
                            <td>${escapeHTML(booking.pickup_service)}</td>
                            <td>${escapeHTML(booking.issue_description)}</td>
                            <td>${escapeHTML(booking.created_at)}</td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });

            } catch (error) {
                console.error('Error updating bookings:', error);
            }
        }

        // Set the interval to run the update function every 5 seconds (5000 milliseconds)
        setInterval(fetchAndUpdateBookings, 5000);
    </script>
</body>
</html>
