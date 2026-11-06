<?php
declare(strict_types=1);

function respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respond(405, ['error' => 'Use GET to view or download a file.']);
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($id === false || $id === null) {
    respond(422, ['error' => 'Choose a valid file.']);
}

$backendRoot = dirname(__DIR__, 2);
require_once $backendRoot . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'database.php';

try {
    $database = getDatabaseConnection();
    $statement = $database->prepare(
        'SELECT original_name, stored_name, mime_type FROM uploads WHERE id = :id'
    );
    $statement->execute(['id' => $id]);
    $material = $statement->fetch();
    if (!$material) {
        respond(404, ['error' => 'The requested file was not found.']);
    }
} catch (Throwable $error) {
    error_log('Okoa Sem file lookup failed: ' . $error->getMessage());
    respond(500, ['error' => 'The file could not be retrieved. Check the database connection.']);
}

$storedName = (string) $material['stored_name'];
if (!preg_match('/^[a-f0-9]{48}\.[a-z0-9]+$/', $storedName)) {
    error_log('Okoa Sem refused an invalid stored file name for upload ' . $id);
    respond(500, ['error' => 'The requested file is unavailable.']);
}

$storageDirectory = $backendRoot . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'uploads';
$filePath = $storageDirectory . DIRECTORY_SEPARATOR . $storedName;
$realStorageDirectory = realpath($storageDirectory);
$realFilePath = realpath($filePath);
if ($realStorageDirectory === false || $realFilePath === false || dirname($realFilePath) !== $realStorageDirectory || !is_file($realFilePath)) {
    respond(404, ['error' => 'The requested file is no longer available.']);
}

$originalName = (string) $material['original_name'];
$fallbackName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName) ?: 'download';
$inlineTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
$viewRequested = ($_GET['view'] ?? '') === '1' && in_array($material['mime_type'], $inlineTypes, true);
$disposition = $viewRequested ? 'inline' : 'attachment';

header('Content-Type: ' . $material['mime_type']);
header('Content-Length: ' . (string) filesize($realFilePath));
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: ' . $disposition . '; filename="' . $fallbackName . '"; filename*=UTF-8\'\'' . rawurlencode($originalName));
readfile($realFilePath);
