<?php
require __DIR__ . '/config.php';

$body = ch_json_body();
$documento = preg_replace('/\D+/', '', (string)($body['documento'] ?? ''));

if ($documento === '') {
    ch_respond(['ok' => false, 'error' => 'Falta documento'], 400);
}

$pantalla   = (string)($body['pantalla'] ?? 'intro');
$rondaIdx   = (int)($body['rondaIdx'] ?? 0);
$resultados = $body['resultados'] ?? [];
$puntaje    = (int)($body['puntaje'] ?? 0);
$startedAt  = $body['startedAt'] ?? null;
$estado     = (string)($body['estado'] ?? 'en_curso');
$gano       = array_key_exists('gano', $body) ? $body['gano'] : null;

if (!is_array($resultados)) {
    $resultados = [];
}
$resultadosJson = json_encode(array_values($resultados), JSON_UNESCAPED_UNICODE);
$startedSql = (is_string($startedAt) && $startedAt !== '') ? $startedAt : null;
$ganoSql = is_null($gano) ? null : ($gano ? 1 : 0);

$db = ch_db();

$sql = 'INSERT INTO ch_sesiones
  (documento, pantalla, ronda_idx, resultados_json, puntaje, started_at, updated_at, estado, gano)
  VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)
  ON DUPLICATE KEY UPDATE
    pantalla = VALUES(pantalla),
    ronda_idx = VALUES(ronda_idx),
    resultados_json = VALUES(resultados_json),
    puntaje = VALUES(puntaje),
    started_at = VALUES(started_at),
    updated_at = NOW(),
    estado = VALUES(estado),
    gano = VALUES(gano)';

$stmt = $db->prepare($sql);
if (!$stmt) {
    ch_respond(['ok' => false, 'error' => 'Error al preparar sesión'], 500);
}

$stmt->bind_param(
    'ssisissi',
    $documento,
    $pantalla,
    $rondaIdx,
    $resultadosJson,
    $puntaje,
    $startedSql,
    $estado,
    $ganoSql
);

if (!$stmt->execute()) {
    ch_respond(['ok' => false, 'error' => 'Error al guardar sesión: ' . $stmt->error], 500);
}
$stmt->close();

ch_respond(['ok' => true]);
