ALTER TABLE pago ADD COLUMN IF NOT EXISTS id_venta INTEGER;
ALTER TABLE pago ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(30);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_pago_venta'
    ) THEN
        ALTER TABLE pago
        ADD CONSTRAINT fk_pago_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta);
    END IF;
END $$;

UPDATE pago
SET tipo_pago = 'MEMBRESIA'
WHERE tipo_pago IS NULL AND id_inscripcion IS NOT NULL;

UPDATE pago
SET tipo_pago = 'PRODUCTO'
WHERE tipo_pago IS NULL AND id_venta IS NOT NULL;
