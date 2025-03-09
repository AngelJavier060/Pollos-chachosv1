BEGIN;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
DROP POLICY IF EXISTS "Enable all access for all users" ON productos;
DROP POLICY IF EXISTS "Lectura productos para todos" ON productos;
DROP POLICY IF EXISTS "Insertar productos autenticado" ON productos;
DROP POLICY IF EXISTS "Actualizar productos autenticado" ON productos;
DROP POLICY IF EXISTS "Eliminar productos autenticado" ON productos;

-- Asegurarse que RLS está habilitado
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Crear una única política simple para desarrollo
CREATE POLICY "allow_all" ON productos
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Mantener los permisos existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON productos TO public;

COMMIT;

-- Verificar la nueva política
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd 
FROM pg_policies 
WHERE tablename = 'productos';
