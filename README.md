# TourClick

Aplicacion React + Vite para marketplace turistico en Huaraz.

## Modo actual

El proyecto funciona en dos modos:

- `mock`: usa `localStorage` para demo local.
- `firebase`: usa Firebase Auth, Firestore, Storage y Hosting.

El modo se define en `.env`:

```env
VITE_BACKEND_DRIVER=mock
```

Para activar Firebase:

```env
VITE_BACKEND_DRIVER=firebase
```

## QR Yape de TourClick

El pago Yape se cobra en una sola cuenta central de TourClick.

Coloca la captura real del QR en:

```text
public/payments/tourclick-yape-qr.png
```

Luego configura `.env`:

```env
VITE_TOURCLICK_YAPE_QR=/payments/tourclick-yape-qr.png
VITE_TOURCLICK_YAPE_OWNER=TourClick
VITE_TOURCLICK_YAPE_PHONE=999999999
```

Si no agregas una imagen, la app usa el placeholder:

```text
public/payments/tourclick-yape-qr.svg
```

Importante: Yape con QR estatico no divide automaticamente el 10% de comision. La app registra:

- `subtotal`: lo que paga el cliente.
- `commission`: 10% para TourClick.
- `agencyReceives`: 90% para la empresa.

La liquidacion a empresas queda como proceso administrativo. Para reparto automatico real se necesita una pasarela/API de pagos con split payments.

## Publicar en GitHub Pages

El proyecto ya esta preparado para GitHub Pages:

- Usa `HashRouter`, por eso las rutas se veran como `/#/tours` o `/#/admin`.
- `vite.config.js` usa `base: './'`, para que los assets funcionen aunque el repositorio tenga otro nombre.
- Incluye workflow en `.github/workflows/deploy.yml`.

Pasos recomendados:

1. Crea un repositorio en GitHub.
2. Sube el proyecto.
3. En GitHub ve a `Settings > Pages`.
4. En `Source`, selecciona `GitHub Actions`.
5. Haz push a la rama `main`.
6. GitHub ejecutara el workflow y publicara `dist`.

Comandos iniciales si aun no tienes git:

```bash
git init
git add .
git commit -m "Initial TourClick app"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

No subas `.env`; ya esta incluido en `.gitignore`.

## Firebase / Google Cloud

1. Crea un proyecto en Firebase Console.
2. Activa Authentication con Email/Password.
3. Crea Firestore Database.
4. Activa Cloud Storage.
5. Crea una Web App y copia sus credenciales.
6. Copia `.env.example` como `.env` y completa:

```env
VITE_BACKEND_DRIVER=firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

7. Copia `.firebaserc.example` como `.firebaserc` y coloca tu `projectId`.

## Deploy

Instala Firebase CLI si aun no lo tienes:

```bash
npm install -g firebase-tools
```

Inicia sesion:

```bash
firebase login
```

Compila:

```bash
npm run build
```

Publica reglas y hosting:

```bash
firebase deploy
```

Firebase Hosting publica la carpeta `dist` y redirige todas las rutas a `index.html`, necesario para React Router.

## Colecciones Firestore esperadas

- `users`: perfiles con `role`: `client`, `company`, `admin`.
- `agencies`: empresas/agencias.
- `tours`: catalogo de tours.
- `bookings`: reservas y pagos.
- `settings`: configuracion futura, por ejemplo QR remoto.

## Roles

- Cliente: puede registrarse y reservar.
- Empresa: ve reservas de su agencia, ingresos, historial y edita sus tours.
- Admin: controla usuarios, empresas, catalogos y reservas globales.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

El build usa `--configLoader runner` para evitar problemas de esbuild con permisos en Windows.
