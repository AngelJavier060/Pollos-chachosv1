-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver productos" ON productos;
DROP POLICY IF EXISTS "Solo administradores pueden modificar productos" ON productos;

-- Crear nueva política que permite acceso público a la tabla productos
CREATE POLICY "Enable read access for all users" ON productos
    FOR SELECT
    TO public
    USING (true);

-- Política para permitir todas las operaciones (temporal, para desarrollo)
CREATE POLICY "Enable all access for all users" ON productos
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
