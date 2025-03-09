BEGIN;

-- Eliminar y recrear el tipo enum para tipo_animal
DROP TYPE IF EXISTS tipo_animal CASCADE;
CREATE TYPE tipo_animal AS ENUM ('pollos', 'chanchos', 'cerdos');

-- Modificar la tabla para usar el nuevo enum
ALTER TABLE productos 
  ALTER COLUMN tipo_animal TYPE tipo_animal 
  USING tipo_animal::text::tipo_animal;

COMMIT;
