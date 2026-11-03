# TechStore — Página renovada

## Abrir la tienda

**Sin instalar nada:** abre `index.html` en Chrome, Edge o cualquier navegador moderno. La tienda también puede publicarse como sitio estático en Amazon S3 (subir `index.html` y el directorio `static/` respetando las rutas).

**Con Flask (opcional):** desde esta carpeta ejecuta `pip install -r requirements.txt` y `python app.py`. Abre `http://127.0.0.1:5000`.

## Configuración obligatoria antes de recibir pedidos

En `static/app.js`, modifica `WHATSAPP_NUMBER` y reemplaza el número de ejemplo `573001234567` por tu número comercial real, con indicativo de país y **sin** `+` ni espacios. Para evitar enviar pedidos a un número de ejemplo, el botón no abrirá WhatsApp mientras ese valor siga sin configurar.

## Catálogo

Edita el array `PRODUCTS` dentro de `static/app.js` para cambiar los productos, nombres, categorías, imágenes, descripciones y precios. Los productos y precios originales se preservaron como punto de partida, con textos comerciales generales. Confirma modelos, especificaciones, precios, fotos, inventario y condiciones de entrega antes de publicarlos.

## Funciones

- Diseño adaptable a móvil, tablet y escritorio.
- Búsqueda sin distinguir tildes, filtros por categoría y ordenamiento.
- Carrito lateral con unidades, eliminación, subtotal y persistencia local.
- Pedido estructurado por WhatsApp, previa configuración del número.
- Navegación con teclado, indicadores de foco y cierre de carrito con Escape.
- No hay pasarela de pagos ni sistema de inventario: el pedido se consulta por WhatsApp.

## Archivos conservados

- `s3_Menu.py`: utilidad de consola para gestionar archivos de un bucket S3 (no forma parte de la tienda).
- `legacy/laboratorio_s3.html`: página antigua de laboratorio S3, con una API de ejemplo sin configurar; se conserva para referencia y no se usa en el sitio.

El sitio carga fotos externas desde Unsplash y, cuando hay Internet, las fuentes desde Google Fonts. Si necesitas que el sitio funcione completamente sin conexión, sustituye las imágenes por archivos locales.
