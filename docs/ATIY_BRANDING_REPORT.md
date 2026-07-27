# Informe de integración de marca ATIY

## Resultado

La identidad visual anterior fue reemplazada por ATIY sin modificar dominio, servicios, persistencia, autenticación, permisos, mapa ni reglas de negocio.

Marca:

- Nombre: **ATIY**
- Slogan: **Inteligencia para transformar el territorio.**
- Primary: `#0A1D3D`
- Accent: `#00BBD4`
- Background: `#F8FAFC`
- Dark background: `#081426`
- Text: `#0F172A`

## Activos integrados

- `public/brand/atiy-logo-primary.png`
- `public/brand/atiy-logo-white.png`
- `public/brand/atiy-logo-black.png`
- `public/brand/atiy-isotipo.png`
- `public/brand/atiy-app-icon.png`
- `public/brand/atiy-favicon.png`
- `public/brand/atiy-brand-guide.png`

## Componentes actualizados

- Shell, header, sidebar y navegación móvil.
- Home y hero institucional.
- Login, registro y recuperación de contraseña.
- Splash, instalación y actualización PWA.
- Demo guiada.
- Presentación y dashboard ejecutivo.
- Modo Recorrida.
- Botones de acciones principales.
- Cards y métricas.
- Loaders de mapa.
- Tours contextuales.

Se creó `BrandLogo`/`BrandMark` como única interfaz reutilizable para aplicar las variantes correctas del logo en superficies claras y oscuras.

## Sistema visual

`src/styles/tokens.css` contiene los colores oficiales y tokens semánticos para superficies, bordes, texto, estados, radios, sombras y foco. La variante oscura utiliza el fondo oficial y activos blancos, sin inversión por CSS.

Los colores territoriales del mapa se conservaron porque representan capas funcionales, no branding, y estaban fuera del alcance de modificación.

## Metadata y favicon

`src/app/layout.tsx` incorpora:

- título y template ATIY;
- descripción oficial;
- application name;
- theme color;
- favicon y Apple icon;
- Open Graph;
- Twitter Card;
- metadata base configurable mediante `NEXT_PUBLIC_SITE_URL`.

El favicon anterior fue eliminado y reemplazado por `atiy-favicon.png`.

## Manifest y PWA

`src/app/manifest.ts` incorpora:

- `name`: ATIY;
- `short_name`: ATIY;
- descripción oficial;
- `theme_color`: `#0A1D3D`;
- `background_color`: `#0A1D3D`;
- icono ATIY normal y maskable.

El service worker utiliza una nueva versión de caché ATIY. La pantalla splash muestra el isotipo y el slogan oficial.

## Referencias de marca

Las referencias editoriales a la marca anterior fueron reemplazadas también en la documentación. Se conservaron únicamente nombres técnicos internos como `CampaignDiary`, `CampaignSummary`, `campaignTags` y claves históricas de almacenamiento cuando renombrarlos podía romper compatibilidad o alterar lógica.

## Archivos modificados

Áreas principales:

- `.env.example`
- `public/sw.js`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/manifest.ts`
- `src/styles/tokens.css`
- `src/components/brand/*`
- `src/components/layout/*`
- `src/components/auth/*`
- `src/components/dashboard/*`
- `src/components/demo/*`
- `src/components/presentation/*`
- `src/components/pwa/*`
- `src/components/recorrido/*`
- componentes visuales de Diario, Relaciones, Territorio y Tours
- documentación histórica con referencias de marca

## Validaciones

Ejecutadas correctamente:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

El build de producción finalizó sin errores ni advertencias de metadata.
