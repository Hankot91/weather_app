# Nimbo

Clima en tiempo real con pronóstico por horas y por días, alertas meteorológicas, un globo 3D con la ubicación exacta de la ciudad, y un fondo que cambia de gradiente y de animación (lluvia, nieve, tormenta, niebla, estrellas) según el clima real y la hora del día.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** para estilos
- **Framer Motion** para las transiciones de la interfaz y del fondo
- **React Three Fiber / drei / three.js** para el globo 3D de ubicación
- **Axios** para las llamadas HTTP
- **Vercel Functions** (`/api/weather.ts`) como proxy serverless hacia la API de clima

## Datos del clima

Los datos salen de [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api). El frontend nunca llama directo a Visual Crossing: le pega a `/api/weather`, una función serverless de Vercel que agrega la API key desde una variable de entorno del servidor y reenvía la respuesta. Así la key nunca queda expuesta en el bundle del navegador.

## Configuración

Necesitás una API key de Visual Crossing (tienen un plan gratuito). El proyecto está pensado para correr con [Vercel](https://vercel.com):

1. Instalá las dependencias:
   ```bash
   npm install
   ```
2. Instalá la CLI de Vercel si no la tienes y logueate:
   ```bash
   npm i -g vercel
   vercel login
   ```
3. Vinculá el proyecto (crea `.vercel/` local, no se sube al repo):
   ```bash
   vercel link
   ```
4. Cargá las variables de entorno para desarrollo local:
   ```bash
   vercel env pull .env.local
   ```
   o creá `.env.local` a mano con:
   ```
   WEATHER_API_KEY=tu_api_key_de_visual_crossing
   ```

En producción, la variable `WEATHER_API_KEY` se configura desde el dashboard de Vercel (Settings → Environment Variables), no desde el repo.

## Desarrollo

`/api/weather.ts` es una función serverless: **`npm run dev` (Vite solo) no la sirve**, vas a ver un 404 al buscar una ciudad. Para tener frontend + función corriendo juntos localmente, usá la CLI de Vercel:

```bash
vercel dev
```

Si solo estás tocando UI y no necesitás pegarle a la API real, `npm run dev` alcanza.

## Scripts

| Comando           | Qué hace                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`      | Levanta Vite (sin la función serverless)   |
| `vercel dev`       | Levanta Vite + `/api/weather` localmente   |
| `npm run build`    | Type-check (`tsc -b`) y build de producción |
| `npm run preview`  | Sirve el build de producción localmente    |
| `npm run lint`     | Corre ESLint                               |

## Deploy

Con el repo conectado a Vercel alcanza con pushear a la rama principal; Vercel detecta Vite automáticamente y despliega `/api/weather.ts` como función serverless. Solo asegurate de tener `WEATHER_API_KEY` cargada en las variables de entorno del proyecto en Vercel.

## Estructura

```
api/weather.ts          → proxy serverless a Visual Crossing
src/components/         → UI (fondo animado, tarjetas de clima, globo 3D, etc.)
src/hooks/               → useWeather, usePopularCities, debounce, etc.
src/services/            → clientes HTTP (weatherApi, geocodingApi)
src/context/             → UnitContext (toggle °C/°F, también convierte viento y visibilidad)
src/utils/atmosphere.ts  → mapea el ícono de clima + hora del día al tema visual del fondo
src/utils/weatherCache.ts → caché en sessionStorage (10 min) para no repetir consultas
```
