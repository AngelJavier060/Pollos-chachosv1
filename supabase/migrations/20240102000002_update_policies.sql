BEGIN;

-- Eliminar las políticas actuales
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
DROP POLICY IF EXISTS "Enable all access for all users" ON productos;

-- Crear nuevas políticas más específicas
CREATE POLICY "Lectura productos para todos" ON productos
    FOR SELECT 
    TO PUBLIC
    USING (true);

CREATE POLICY "Insertar productos autenticado" ON productos
    FOR INSERT 
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Actualizar productos autenticado" ON productos
    FOR UPDATE
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Eliminar productos autenticado" ON productos
    FOR DELETE
    TO PUBLIC
    USING (true);

-- Asegurarse que RLS está habilitado
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos básicos a la tabla
GRANT SELECT, INSERT, UPDATE, DELETE ON productos TO public;

COMMIT;
