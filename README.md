# ShopProduct - Frontend (Angular 19 independiente + Bootstrap)

SPA frontend para la prueba técnica de ShopProduct. Desarrollado con las API independientes de Angular y Bootstrap para un estilo limpio y minimalista.

## Stack Técnico
- Angular 19.x (standalone)
- Bootstrap 5
- RxJS / HttpClient

## Requisitos
- Node.js 20+ recommended
- Backend running locally (default `http://localhost:3000`)

## Instalar y ejecutar
```bash
npm install
npm start
```

Servicio de pruebas por defecto:
- `http://localhost:4200`

## Configuración
Actualice la URL base de la API en el entorno/configuración que utiliza su `ProductsService` si es necesario.
Opciones típicas:
- `src/environments/environment.ts`
- o `core/config` en el archivo commo constante.

Ejemplo:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

## Características
- Lista de productos con paginación
- Búsqueda con paginación (q, página, límite)
- Crear/editar producto
- Acciones de stock (ajustar/reducir) mediante un modal de Bootstrap
- Mensajes de error fáciles de entender para 404/409

## Flujos de trabajo recomendados
1) Iniciar backend:
```bash
cd shopproduct-pro
npm run start:dev
```

2) Iniciar frontend:
```bash
cd shopproduct-frontend
npm start
```

## Build
```bash
npm run build
```
