# auth-dashboard

Panel de administración para AuthServer.

## Requisitos
- Node.js 18+
- Backend AuthServer corriendo en `localhost:8080`

## Instalación

```bash
pnpm install
pnpm dev
```

La app corre en `http://localhost:5173`.
Vite redirige `/api/*` al backend en `localhost:8080` automáticamente.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Build de producción |
| `pnpm preview` | Previsualizar el build |
| `pnpm test` | Tests con Vitest |
