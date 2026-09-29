-- Ciber Héroes Doomsday — schema propio (NO usar la DB del Mundial)
-- Crear DB: CREATE DATABASE ciberheroes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ch_cedulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_ch_cedula (cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ch_sesiones (
  documento VARCHAR(20) NOT NULL PRIMARY KEY,
  pantalla VARCHAR(32) NOT NULL DEFAULT 'intro',
  ronda_idx INT NOT NULL DEFAULT 0,
  resultados_json TEXT,
  puntaje INT NOT NULL DEFAULT 0,
  started_at VARCHAR(40) NULL,
  updated_at DATETIME NOT NULL,
  estado VARCHAR(16) NOT NULL DEFAULT 'en_curso',
  gano TINYINT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ch_resultados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) NOT NULL,
  puntaje INT NOT NULL DEFAULT 0,
  gano TINYINT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0,
  started_at VARCHAR(40) NULL,
  ended_at VARCHAR(40) NULL,
  resultados_json TEXT,
  ronda_idx INT NOT NULL DEFAULT 0,
  juego VARCHAR(64) NOT NULL DEFAULT 'ciber-heroes-doomsday',
  fecha DATETIME NOT NULL,
  KEY idx_ch_res_doc (documento),
  KEY idx_ch_res_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ejemplo: cargar cédulas (ajusta o usa configuracion_inicial.php)
-- INSERT IGNORE INTO ch_cedulas (cedula) VALUES ('1234567890');
