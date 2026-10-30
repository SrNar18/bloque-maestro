# Bloque Maestro

Maqueta web de **Bloque Maestro**, la revista de proyectos de construcción: cada obra se publica como una ficha técnica (terreno, materiales, equipos, iluminación, equipo humano) y los lectores pueden solicitar información directamente al promotor. La web se monetiza con la publicación de proyectos ("Anúnciate").

> Es una maqueta navegable para presentar al cliente. Los proyectos, cifras, empresas y testimonios son de muestra, las fotos vienen de Unsplash y los formularios todavía no envían datos.

## Páginas

| Página | Archivo |
|---|---|
| Inicio | `index.html` |
| Catálogo de proyectos (filtros y búsqueda) | `proyectos.html` |
| Ficha de proyecto + formulario "Me interesa" | `proyecto.html?id=…` |
| Proyectos destacados | `destacados.html` |
| Para promotores (cómo funciona y planes) | `anunciate.html` |
| Solicitud para anunciar un proyecto (4 pasos + vista previa) | `solicitud.html` |
| Contacto | `contacto.html` |

## Estructura

- `assets/styles.css` — sistema de diseño (Manrope, Inter y Michroma; 3 tipos de botón)
- `assets/content.js` — **todo el contenido editable** (proyectos, sectores y textos de cada página). Lo escribe el panel `/admin`.
- `assets/data.js` — prepara el contenido para las páginas
- `assets/uploads/` — imágenes subidas desde el panel
- `admin/` — panel de administración
- `assets/app.js` — header, footer, buscador (Ctrl+K) y utilidades compartidas
- `assets/*.png` — logos recortados para la web
- `sources/` — logos originales del cliente

## Panel de administración (`/admin`)

El cliente edita textos, imágenes y proyectos desde `/admin` con usuario y contraseña. Al pulsar **Publicar**, el panel hace un commit en GitHub (contenido + imágenes) y la web se actualiza sola en 1–2 minutos.

- No hay servidor: el panel usa la API de GitHub con un *fine-grained token* limitado a este repositorio (**Contents: Read and write**).
- El token se guarda **cifrado** (AES-GCM, clave derivada de la contraseña con PBKDF2) en `admin/config.json`. Sin la contraseña no sirve de nada, así que usa contraseñas largas.
- **Configuración inicial** (una vez): abrir `/admin/#setup`, pegar el token y elegir usuario y contraseña. Se puede repetir para añadir usuarios o cambiar la contraseña (también cuando caduque el token).
- **Vista previa**: muestra la web con los cambios sin publicar (solo en ese navegador).

## Verla en local

```bash
python -m http.server 8765
```

y abrir http://localhost:8765

## Pendiente para producción

- Conectar los formularios (solicitud, contacto, ficha y newsletter) a un correo o servicio de formularios.
- Sustituir datos, fotos, logos de la franja de confianza y testimonio por contenido real.
- Confirmar precios de los planes.
