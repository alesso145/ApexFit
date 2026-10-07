-- Corrige la tabla asistencia_entrenador para el módulo de asistencia de profesores/entrenadores.
-- Ejecutar en pgAdmin si el botón "Registrar Entrada" falla por columnas duplicadas.

ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS entrenador_id BIGINT;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS clase_id BIGINT;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS fecha TIMESTAMP;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS presente BOOLEAN DEFAULT TRUE;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS hora_entrada TIME;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS hora_salida TIME;
ALTER TABLE asistencia_entrenador ADD COLUMN IF NOT EXISTS tiempo_minutos BIGINT;

ALTER TABLE asistencia_entrenador ALTER COLUMN entrenador_id DROP NOT NULL;
ALTER TABLE asistencia_entrenador ALTER COLUMN clase_id DROP NOT NULL;
ALTER TABLE asistencia_entrenador ALTER COLUMN fecha DROP NOT NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='asistencia_entrenador' AND column_name='id_entrenador') THEN
        EXECUTE 'UPDATE asistencia_entrenador SET entrenador_id = COALESCE(entrenador_id, id_entrenador)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='asistencia_entrenador' AND column_name='id_clase') THEN
        EXECUTE 'UPDATE asistencia_entrenador SET clase_id = COALESCE(clase_id, id_clase)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='asistencia_entrenador' AND column_name='fecha_asistencia') THEN
        EXECUTE 'UPDATE asistencia_entrenador SET fecha = COALESCE(fecha, fecha_asistencia::timestamp)';
    END IF;
END $$;
