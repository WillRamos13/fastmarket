ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagenes TEXT;

UPDATE productos
SET imagenes = imagen
WHERE (imagenes IS NULL OR imagenes = '')
  AND imagen IS NOT NULL
  AND imagen <> '';
