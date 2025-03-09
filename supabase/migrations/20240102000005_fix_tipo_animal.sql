BEGIN;

-- Eliminar y recrear el tipo enum para tipo_animal
DROP TYPE IF EXISTS tipo_animal CASCADE;
CREATE TYPE tipo_animal AS ENUM ('pollos', 'cerdos');

-- Actualizar la tabla productos para usar el nuevo enum
ALTER TABLE productos 
  ALTER COLUMN tipo_animal TYPE tipo_animal 
  USING 
    CASE 
      WHEN tipo_animal::text = 'chanchos' THEN 'cerdos'::tipo_animal 
      ELSE tipo_animal::text::tipo_animal 
    END;

COMMIT;
