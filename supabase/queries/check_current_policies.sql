-- Verificar las políticas actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd 
FROM pg_policies 
WHERE tablename = 'productos';

-- Verificar los permisos
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'productos';
