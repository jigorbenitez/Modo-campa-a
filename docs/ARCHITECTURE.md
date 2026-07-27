# Arquitectura de ATIY

La aplicación usa Next.js con App Router, TypeScript estricto y Tailwind CSS.

- `src/app`: rutas, metadata y manifiesto PWA.
- `src/components`: interfaz reutilizable, separada por propósito.
- `src/data`: datos estáticos simples y navegación.
- `src/hooks`: estado reutilizable del cliente.
- `src/lib`: utilidades sin dependencias de React.
- `src/styles`: variables visuales y temas.
- `src/types`: contratos compartidos.

## Evolución prevista

La capa visual no depende de un proveedor de datos. La autenticación y Supabase
podrán agregarse después mediante servicios en `src/lib`, sin acoplar las páginas.

