BEGIN;

-- Eliminar el tipo enum existente y crear uno nuevo
DROP TYPE IF EXISTS tipo_animal CASCADE;
CREATE TYPE tipo_animal AS ENUM ('pollos', 'chanchos');

-- Modificar la tabla productos
ALTER TABLE productos 
  ALTER COLUMN tipo_animal TYPE tipo_animal 
  USING tipo_animal::text::tipo_animal;

COMMIT;
