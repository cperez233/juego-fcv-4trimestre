<?php
/**
 * Config API — Ciber Héroes Doomsday
 * DB SEPARADA del Mundial. Ajusta credenciales al desplegar.
 */
declare(strict_types=1);

// Cabeceras de seguridad (API JSON)
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=utf-8');

// CORS: mismo origen en producción; en dev puede hacer falta el origen local
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://juegoheroes.fcv.org',
    'http://juegoheroes.fcv.org',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5005',
    'http://127.0.0.1:5005',
];
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

const CH_DB_HOST = 'localhost';
const CH_DB_USER = 'root';
const CH_DB_PASS = 'password';
const CH_DB_NAME = 'ciberheroes';

/**
 * Carpeta de resultados por participación:
 *   data-ciber-heroes/21082026 - 1007511633/resultado.json
 * Variable de entorno CH_DATA_DIR para otra ruta/máquina montada.
 */
const CH_DATA_DIR = getenv('CH_DATA_DIR') ?: (dirname(__DIR__) . '/data-ciber-heroes');

/** URL de máquina externa para reenviar logs. Vacío = no ping. */
const CH_REMOTE_LOG_URL = ''; // ej. 'https://otra-maquina.fcv.org/api/score'

function ch_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function ch_respond(array $payload, int $code = 200): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function ch_db(): mysqli {
    mysqli_report(MYSQLI_REPORT_OFF);
    $db = @new mysqli(CH_DB_HOST, CH_DB_USER, CH_DB_PASS, CH_DB_NAME);
    if ($db->connect_errno) {
        ch_respond(['ok' => false, 'error' => 'No se pudo conectar a la base de datos'], 500);
    }
    $db->set_charset('utf8mb4');
    return $db;
}

function ch_forward_remote(array $payload): void {
    $url = trim(CH_REMOTE_LOG_URL);
    if ($url === '') {
        return;
    }
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\n",
            'content' => $json,
            'timeout' => 4,
            'ignore_errors' => true,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
}

/** Guarda carpeta data-ciber-heroes/DDMMYYYY - CEDULA/ */
function ch_save_participation_folder(array $payload): ?string {
    $root = trim((string)CH_DATA_DIR);
    if ($root === '') {
        return null;
    }
    $doc = preg_replace('/\D+/', '', (string)($payload['documento'] ?? ''));
    if ($doc === '') {
        return null;
    }
    $ended = $payload['endedAt'] ?? null;
    $ts = is_string($ended) ? strtotime($ended) : false;
    if ($ts === false) {
        $ts = time();
    }
    $folder = date('dmY', $ts) . ' - ' . $doc;
    $dir = rtrim($root, '/\\') . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
        return null;
    }

    $record = [
        'documento'   => $doc,
        'puntaje'     => (int)($payload['puntaje'] ?? 0),
        'gano'        => !empty($payload['gano']),
        'durationMs'  => (int)($payload['durationMs'] ?? 0),
        'startedAt'   => $payload['startedAt'] ?? null,
        'endedAt'     => $payload['endedAt'] ?? date('c', $ts),
        'resultados'  => is_array($payload['resultados'] ?? null) ? $payload['resultados'] : [],
        'rondaIdx'    => (int)($payload['rondaIdx'] ?? 0),
        'juego'       => (string)($payload['juego'] ?? 'ciber-heroes-doomsday'),
        'guardadoEn'  => date('c'),
    ];

    @file_put_contents(
        $dir . DIRECTORY_SEPARATOR . 'resultado.json',
        json_encode($record, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );

    $resumen = "Cédula: {$doc}\n"
        . 'Fecha: ' . date('dmY', $ts) . "\n"
        . 'Resultado: ' . ($record['gano'] ? 'GANÓ' : 'PERDIÓ') . "\n"
        . 'Aciertos: ' . $record['puntaje'] . "\n"
        . 'Ronda alcanzada: ' . ($record['rondaIdx'] + 1) . "\n"
        . 'Duración (s): ' . (int)round($record['durationMs'] / 1000) . "\n";
    @file_put_contents($dir . DIRECTORY_SEPARATOR . 'resumen.txt', $resumen);

    return $dir;
}
