<?php
/**
 * Carga ch_cedulas desde public/data/identificaciones.csv
 * Uso (CLI): php api/configuracion_inicial.php
 * Uso (browser, solo en entorno controlado): /api/configuracion_inicial.php
 */
require __DIR__ . '/config.php';

$csv = dirname(__DIR__) . '/public/data/identificaciones.csv';
if (!is_readable($csv)) {
    ch_respond(['ok' => false, 'error' => 'No se encontró identificaciones.csv'], 500);
}

$db = ch_db();
$stmt = $db->prepare('INSERT IGNORE INTO ch_cedulas (cedula) VALUES (?)');
if (!$stmt) {
    ch_respond(['ok' => false, 'error' => 'Error prepare'], 500);
}

$n = 0;
$fh = fopen($csv, 'r');
while (($line = fgets($fh)) !== false) {
    $id = preg_replace('/\D+/', '', trim($line));
    if ($id === '' || strlen($id) < 4 || strlen($id) > 15) {
        continue;
    }
    $stmt->bind_param('s', $id);
    if ($stmt->execute()) {
        $n += $stmt->affected_rows > 0 ? 1 : 0;
    }
}
fclose($fh);
$stmt->close();

ch_respond(['ok' => true, 'insertadas_o_ignoradas' => $n]);
