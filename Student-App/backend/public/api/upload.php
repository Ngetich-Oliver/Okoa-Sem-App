<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Use POST to upload a file.']);
}

$category = $_POST['category'] ?? '';
$allowedCategories = ['notes', 'assignments', 'past_papers'];
if (!in_array($category, $allowedCategories, true)) {
    respond(422, ['error' => 'Choose a valid upload category.']);
}

$unitCode = $_POST['unit_code'] ?? '';
if (!is_string($unitCode)) {
    respond(422, ['error' => 'Enter a valid unit code.']);
}
$unitCode = strtoupper(trim(preg_replace('/\s+/', ' ', $unitCode) ?? ''));
if ($unitCode === '' || strlen($unitCode) > 64 || !preg_match('/^[A-Z0-9][A-Z0-9 ._-]*$/', $unitCode)) {
    respond(422, ['error' => 'Enter a valid unit code using letters, numbers, spaces, dots, underscores, or hyphens.']);
}

if (!isset($_FILES['file']) || is_array($_FILES['file']['name'])) {
    respond(400, ['error' => 'Upload one file at a time.']);
}

$upload = $_FILES['file'];
if ($upload['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => 'The file exceeds the server upload limit.',
        UPLOAD_ERR_FORM_SIZE => 'The file exceeds the upload limit.',
        UPLOAD_ERR_PARTIAL => 'The file upload was incomplete. Try again.',
        UPLOAD_ERR_NO_FILE => 'Choose a file to upload.',
    ];
    respond(400, ['error' => $uploadErrors[$upload['error']] ?? 'The file could not be uploaded.']);
}

$maxBytes = 15 * 1024 * 1024;
if ($upload['size'] < 1 || $upload['size'] > $maxBytes) {
    respond(413, ['error' => 'Files must be smaller than 15 MB.']);
}

$originalName = basename(str_replace('\\', '/', (string) $upload['name']));
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedMimeTypes = [
    'pdf' => ['application/pdf'],
    'doc' => ['application/msword', 'application/x-ole-storage', 'application/CDFV2', 'application/octet-stream'],
    'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
    'ppt' => ['application/vnd.ms-powerpoint', 'application/x-ole-storage', 'application/CDFV2', 'application/octet-stream'],
    'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'],
    'txt' => ['text/plain'],
    'jpg' => ['image/jpeg'],
    'jpeg' => ['image/jpeg'],
    'png' => ['image/png'],
];

if (!isset($allowedMimeTypes[$extension]) || !is_uploaded_file($upload['tmp_name'])) {
    respond(415, ['error' => 'That file type is not supported.']);
}

$fileInfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $fileInfo->file($upload['tmp_name']);
if (!in_array($mimeType, $allowedMimeTypes[$extension], true)) {
    respond(415, ['error' => 'The file contents do not match the selected file type.']);
}

$backendRoot = dirname(__DIR__, 2);
$storageDirectory = $backendRoot . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0750, true) && !is_dir($storageDirectory)) {
    respond(500, ['error' => 'The upload storage folder could not be created.']);
}

$storedName = bin2hex(random_bytes(24)) . '.' . $extension;
$storedPath = $storageDirectory . DIRECTORY_SEPARATOR . $storedName;
if (!move_uploaded_file($upload['tmp_name'], $storedPath)) {
    respond(500, ['error' => 'The server could not save this file.']);
}

require_once $backendRoot . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'database.php';             

try {
    $database = getDatabaseConnection();
    $statement = $database->prepare(
        'INSERT INTO uploads (category, unit_code, original_name, stored_name, mime_type, size_bytes)
         VALUES (:category, :unit_code, :original_name, :stored_name, :mime_type, :size_bytes)'
    );
    $statement->execute([
        'category' => $category,
        'unit_code' => $unitCode,
        'original_name' => $originalName,
        'stored_name' => $storedName,
        'mime_type' => $mimeType,
        'size_bytes' => (int) $upload['size'],
    ]);

    respond(201, [
        'message' => 'File uploaded successfully.',
        'file' => [
            'id' => (int) $database->lastInsertId(),
            'name' => $originalName,
            'category' => $category,
            'unitCode' => $unitCode,
            'sizeBytes' => (int) $upload['size'],
        ],
    ]);
} catch (Throwable $error) {
    if (is_file($storedPath)) {
        unlink($storedPath);
    }
    error_log('Okoa Sem upload failed: ' . $error->getMessage());
    respond(500, ['error' => 'The server could not save the file details. Check the database connection.']);
}
