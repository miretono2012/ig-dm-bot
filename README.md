# Bot de Auto-respuesta para DMs de Instagram

Este bot responde automáticamente los mensajes directos (DMs) de tu cuenta de Instagram, las 24 horas, sin depender de que tu computadora esté encendida. Corre en un servidor en la nube (gratis con Render) y usa la **API oficial de Instagram Messaging** de Meta — la única forma permitida de automatizar respuestas sin violar los términos de servicio de Instagram.

## Requisitos previos

1. Tu cuenta de Instagram debe ser **Business** o **Creator** (no personal).
   - Configuración > Cuenta > Cambiar a cuenta profesional.
2. Esa cuenta debe estar vinculada a una **Página de Facebook**.
3. Necesitás una cuenta en [Meta for Developers](https://developers.facebook.com/).

## Paso 1: Crear la App en Meta for Developers

1. Entrá a https://developers.facebook.com/apps y creá una app nueva.
2. Elegí el tipo "Business".
3. Dentro de la app, agregá el producto **"Instagram"** (Instagram API setup with Facebook Login) desde el panel de productos.
4. Seguí el asistente para vincular tu Página de Facebook y tu cuenta de Instagram.

## Paso 2: Obtener el Access Token

1. En el panel de tu app, andá a la sección de Instagram / Configuración de la API.
2. Generá un **Access Token** de larga duración para tu cuenta.
3. Guardalo — lo vas a necesitar como `PAGE_ACCESS_TOKEN`.

## Paso 3: Elegir tu Verify Token

Este lo inventás vos mismo/a. Puede ser cualquier texto, por ejemplo: `mi_bot_ig_2026`. Lo vas a usar dos veces: en tu archivo `.env` y al configurar el webhook en Meta (deben ser idénticos).

## Paso 4: Editar tus respuestas automáticas

Abrí `rules.json` y personalizá:
- `default_reply`: lo que se responde cuando ningún mensaje coincide con una regla.
- `rules`: lista de reglas. Cada una tiene:
  - `keywords`: palabras o frases que, si aparecen en el mensaje del usuario, activan esa respuesta.
  - `reply`: el texto que el bot va a enviar.

Podés agregar tantas reglas como quieras, no hace falta tocar el código.

## Paso 5: Desplegar en Render (gratis, corre 24/7)

1. Subí esta carpeta a un repositorio de GitHub (podés crear uno nuevo y arrastrar los archivos).
2. Andá a https://render.com y creá una cuenta gratuita.
3. Click en "New +" > "Web Service".
4. Conectá tu repositorio de GitHub.
5. Configurá:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. En la sección "Environment Variables", agregá:
   - `VERIFY_TOKEN` = el token que inventaste en el Paso 3
   - `PAGE_ACCESS_TOKEN` = el token del Paso 2
7. Deploy. Render te va a dar una URL pública, por ejemplo:
   `https://tu-bot-ig.onrender.com`

> Nota: el plan gratuito de Render "duerme" el servicio tras un rato de inactividad y tarda unos segundos en despertar con el primer mensaje. Si necesitás que responda instantáneamente siempre, considerá el plan pago más económico de Render, o alternativas como Railway o Fly.io.

## Paso 6: Configurar el Webhook en Meta

1. En tu app de Meta for Developers, andá a Instagram > Webhooks (o Messenger > Webhooks, según la versión del panel).
2. Configurá:
   - **Callback URL**: `https://tu-bot-ig.onrender.com/webhook`
   - **Verify Token**: el mismo que pusiste en Render.
3. Suscribite al campo/evento **"messages"**.
4. Guardá. Meta va a hacer una petición GET a tu URL para verificarla — si todo está bien configurado, vas a ver "Webhook verificado correctamente" en los logs de Render.

## Paso 7: Probar

Escribile un DM a tu propia cuenta de Instagram desde otra cuenta (o pedile a alguien que lo haga). El bot debería responder automáticamente según las reglas en `rules.json`.

## Estructura del proyecto

```
ig-dm-bot/
├── server.js        # Lógica del bot y del webhook
├── rules.json        # Tus reglas de auto-respuesta (editable sin tocar código)
├── package.json       # Dependencias
├── .env.example       # Plantilla de variables de entorno
└── README.md         # Esta guía
```

## Notas importantes

- **No compartas tu `PAGE_ACCESS_TOKEN`** con nadie ni lo subas a un repositorio público. Si usás GitHub, agregá un archivo `.gitignore` con la línea `.env`.
- Instagram limita la ventana de tiempo en la que se puede responder a un usuario sin que haya iniciado la conversación en las últimas 24hs (política estándar de Meta para mensajería). Esto es normal y aplica a cualquier bot oficial.
- Cualquier cambio en `rules.json` requiere volver a desplegar (o hacer commit + push si Render está conectado a auto-deploy de GitHub).
