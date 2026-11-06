<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(405, ['error' => 'Use GET to search study materials.']);
}

$unitCode = $_GET['unit_code'] ?? '';
if (!is_string($unitCode)) {
    respond(422, ['error' => 'Enter a valid unit code.']);
}
$unitCode = strtoupper(trim(preg_replace('/\s+/', ' ', $unitCode) ?? ''));
if ($unitCode === '' || strlen($unitCode) > 64 || !preg_match('/^[A-Z0-9][A-Z0-9 ._-]*$/', $unitCode)) {
    respond(422, ['error' => 'Enter a valid unit code to search.']);
}

$category = $_GET['category'] ?? '';
$allowedCategories = ['notes', 'assignments', 'past_papers'];
if ($category !== '' && (!is_string($category) || !in_array($category, $allowedCategories, true))) {
    respond(422, ['error' => 'Choose a valid material category.']);
}

$backendRoot = dirname(__DIR__, 2);
require_once $backendRoot . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'database.php';

try {
    $database = getDatabaseConnection();
    $sql = 'SELECT id, category, unit_code, original_name, mime_type, size_bytes, uploaded_at
            FROM uploads
            WHERE unit_code = :unit_code';
    $parameters = ['unit_code' => $unitCode];
    if ($category !== '') {
        $sql .= ' AND category = :category';
        $parameters['category'] = $category;
    }
    $sql .= ' ORDER BY uploaded_at DESC, id DESC';

    $statement = $database->prepare($sql);
    $statement->execute($parameters);
    $categoryLabels = [
        'notes' => 'Lecture notes',
        'assignments' => 'Assignment',
        'past_papers' => 'Past paper',
    ];
    $materials = [];
    foreach ($statement->fetchAll() as $row) {
        $id = (int) $row['id'];
        $materials[] = [
            'id' => $id,
            'title' => $row['original_name'],
            'category' => $row['category'],
            'categoryLabel' => $categoryLabels[$row['category']],
            'unit_code' => $row['unit_code'],
            'mime_type' => $row['mime_type'],
            'size_bytes' => (int) $row['size_bytes'],
            'uploaded_at' => $row['uploaded_at'],
            'view_url' => '/api/download.php?id=' . $id . '&view=1',
            'download_url' => '/api/download.php?id=' . $id,
        ];
    }

    respond(200, ['materials' => $materials]);
} catch (Throwable $error) {
    error_log('Okoa Sem materials search failed: ' . $error->getMessage());
    respond(500, ['error' => 'The study materials could not be searched. Check the database connection.']);
}
