<?php
require __DIR__ . '/config.php';

$body = ch_json_body();
$documento = preg_replace('/\D+/', '', (string)($body['documento'] ?? ''));

if ($documento === '' || strlen($documento) < 4 || strlen($documento) > 15) {
    ch_respond(['ok' => false, 'error' => 'Documento inválido'], 400);
}

$db = ch_db();

$stmt = $db->prepare('SELECT 1 FROM ch_cedulas WHERE cedula = ? LIMIT 1');
if (!$stmt) {
    ch_respond(['ok' => false, 'error' => 'Error de consulta'], 500);
}
$stmt->bind_param('s', $documento);
$stmt->execute();
$stmt->store_result();
$allowed = $stmt->num_rows > 0;
$stmt->close();

if (!$allowed) {
    ch_respond(['ok' => false, 'error' => 'Esta identificación no está autorizada para jugar.'], 403);
}

// Una sola participación por cédula
$participo = $db->prepare('SELECT 1 FROM ch_resultados WHERE documento = ? LIMIT 1');
if ($participo) {
    $participo->bind_param('s', $documento);
    $participo->execute();
    $participo->store_result();
    if ($participo->num_rows > 0) {
        $participo->close();
        ch_respond([
            'ok' => false,
            'error' => 'Ya se participó en el juego con esta cédula. Ya no puede volver a participar.',
        ], 403);
    }
    $participo->close();
}

// Sesión abierta (solo reanudar si quedó en curso por cierre/congelamiento)
$sesion = null;
$q = $db->prepare(
    'SELECT documento, pantalla, ronda_idx, resultados_json, puntaje, started_at, updated_at, estado, gano
     FROM ch_sesiones WHERE documento = ? AND estado = \'en_curso\' LIMIT 1'
);
if ($q) {
    $q->bind_param('s', $documento);
    $q->execute();
    $res = $q->get_result();
    if ($row = $res->fetch_assoc()) {
        $sesion = [
            'documento'  => $row['documento'],
            'pantalla'   => $row['pantalla'],
            'rondaIdx'   => (int)$row['ronda_idx'],
            'resultados' => json_decode($row['resultados_json'] ?: '[]', true) ?: [],
            'puntaje'    => (int)$row['puntaje'],
            'startedAt'  => $row['started_at'],
            'updatedAt'  => $row['updated_at'],
            'estado'     => $row['estado'],
            'gano'       => isset($row['gano']) ? (bool)$row['gano'] : null,
        ];
    }
    $q->close();
}

ch_respond(['ok' => true, 'sesion' => $sesion]);
