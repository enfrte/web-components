<?php 

$search = $_POST['backend_call_example'] ?? '';
$res = [];

$data = [
    "Alabama (response from backend)",
    "Alaska (response from backend)",
    "Arizona (response from backend)",
    "Arkansas (response from backend)",
    "California (response from backend)",
    "Colorado (response from backend)"
];

// Simulate a backend query search
if ($search) {
    // Requires a simple array of results (no keys)
    $res = array_values(array_filter($data, fn($item) => stripos($item, $search) !== false));
}

header('Content-Type: application/json');
echo json_encode($res);