BEGIN;

-- Primero, asegúrate de que RLS está habilitado
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Elimina todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
DROP POLICY IF EXISTS "Enable all access for all users" ON productos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver productos" ON productos;
DROP POLICY IF EXISTS "Solo administradores pueden modificar productos" ON productos;

-- Crea una única política que permite todo durante desarrollo
CREATE POLICY "Allow all operations for development" ON productos
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Verifica que la tabla es accesible
GRANT ALL ON productos TO public;

COMMIT;
