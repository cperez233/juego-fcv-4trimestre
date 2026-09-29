<?php
require __DIR__ . '/config.php';

$body = ch_json_body();
$documento = preg_replace('/\D+/', '', (string)($body['documento'] ?? ''));

if ($documento === '') {
    ch_respond(['ok' => false, 'error' => 'Falta documento'], 400);
}

$puntaje    = (int)($body['puntaje'] ?? 0);
$gano       = !empty($body['gano']) ? 1 : 0;
$durationMs = (int)($body['durationMs'] ?? 0);
$startedAt  = is_string($body['startedAt'] ?? null) ? $body['startedAt'] : null;
$endedAt    = is_string($body['endedAt'] ?? null) ? $body['endedAt'] : date('c');
$resultados = $body['resultados'] ?? [];
$rondaIdx   = (int)($body['rondaIdx'] ?? 0);
$juego      = (string)($body['juego'] ?? 'ciber-heroes-doomsday');

if (!is_array($resultados)) {
    $resultados = [];
}
$resultadosJson = json_encode(array_values($resultados), JSON_UNESCAPED_UNICODE);

$db = ch_db();

$stmt = $db->prepare(
    'INSERT INTO ch_resultados
      (documento, puntaje, gano, duration_ms, started_at, ended_at, resultados_json, ronda_idx, juego, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
);
if (!$stmt) {
    ch_respond(['ok' => false, 'error' => 'Error al preparar score'], 500);
}

$stmt->bind_param(
    'siiisssis',
    $documento,
    $puntaje,
    $gano,
    $durationMs,
    $startedAt,
    $endedAt,
    $resultadosJson,
    $rondaIdx,
    $juego
);

if (!$stmt->execute()) {
    ch_respond(['ok' => false, 'error' => 'Error al guardar score: ' . $stmt->error], 500);
}
$stmt->close();

// Cerrar sesión al terminar la participación (victoria o derrota)
$u = $db->prepare('UPDATE ch_sesiones SET estado = \'cerrada\', gano = ?, updated_at = NOW() WHERE documento = ?');
if ($u) {
    $u->bind_param('is', $gano, $documento);
    $u->execute();
    $u->close();
}

$payload = [
    'documento'   => $documento,
    'puntaje'     => $puntaje,
    'gano'        => (bool)$gano,
    'durationMs'  => $durationMs,
    'startedAt'   => $startedAt,
    'endedAt'     => $endedAt,
    'resultados'  => $resultados,
    'rondaIdx'    => $rondaIdx,
    'juego'       => $juego,
];

ch_forward_remote($payload);
ch_save_participation_folder($payload);

ch_respond(['ok' => true]);
