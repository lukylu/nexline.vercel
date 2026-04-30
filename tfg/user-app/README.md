# VOID Streetwear — E-commerce TFG

Proyecto de Trabajo Fin de Grado (TFG) — E-commerce de streetwear con frontend en Angular 21 y backend en Node.js + Express + SQLite.

---

## 📁 Estructura del Proyecto

```
tfg/
├── backend/                    # API REST Backend
│   ├── src/
│   │   ├── controllers/        # Lógica de endpoints
│   │   ├── models/             # Modelos de base de datos
│   │   ├── routes/             # Rutas de la API
│   │   ├── middleware/         # Auth, validaciones
│   │   └── index.js            # Punto de entrada
│   ├── database/
│   │   └── void.db             # SQLite (se genera al iniciar)
│   ├── uploads/                # Imágenes subidas
│   ├── .env                    # Variables de entorno
│   └── package.json
│
├── nexline-angular/            # Frontend Angular 21
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   ├── pages/          # Componentes de página
│   │   │   ├── services/       # Servicios (API, Auth, Cart)
│   │   │   ├── models/         # Interfaces TypeScript
│   │   │   └── app.ts          # Componente raíz
│   │   ├── styles.scss         # Estilos globales
│   │   └── index.html
│   └── package.json
│
└── nexline.vercel/             # Frontend legacy (HTML único)
    ├── index.html              # Versión anterior (solo referencia)
    ├── admin-panel.css         # Estilos panel admin
    └── admin-panel.js          # Lógica panel admin
```

---

## 🚀 Backend (Node.js + Express + SQLite)

### Instalación

```bash
cd backend
npm install
npm run dev
```

El servidor se inicia en `http://localhost:3000`

### Endpoints de la API

#### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login usuario |
| POST | `/api/auth/login-admin` | Login administrador |
| GET | `/api/auth/me` | Obtener usuario actual |

#### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos los productos |
| GET | `/api/products/:id` | Obtener producto por ID |
| GET | `/api/products/category/:cat` | Productos por categoría |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| POST | `/api/products/upload` | Subir imagen (admin) |

#### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders/my-orders` | Mis pedidos (usuario) |
| GET | `/api/orders` | Todos los pedidos (admin) |
| GET | `/api/orders/:id` | Pedido por ID |
| PUT | `/api/orders/:id/status` | Cambiar estado (admin) |

#### Admin Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Estadísticas del dashboard |
| GET | `/api/admin/users` | Listar usuarios |

### Credenciales por Defecto

**Admin:**
- Contraseña: `Password`
- Usuario admin (BD): `admin@void.com` / `Admin123!`

---

## 🎨 Frontend Angular 21

### Instalación

```bash
cd nexline-angular
npm install
ng serve
```

La aplicación se inicia en `http://localhost:4200`

### Servicios Principales

#### `ApiService`
Maneja todas las peticiones HTTP al backend.

```typescript
// Ejemplo de uso
this.api.getProducts().subscribe(data => {
  this.products = data.products;
});
```

#### `AuthService`
Gestiona autenticación de usuarios y admin.

```typescript
// Login usuario
this.auth.login(user, token);

// Login admin
this.auth.adminLogin(token);

// Logout
this.auth.logout();
```

#### `CartService`
Gestión del carrito con signals de Angular.

```typescript
// Añadir al carrito
this.cart.addToCart({ product_id, size, quantity, price, name, image });

// Eliminar del carrito
this.cart.removeFromCart(productId, size);

// Obtener total
const total = this.cart.cartTotal();
```

### Componentes

| Componente | Descripción |
|------------|-------------|
| `HeaderComponent` | Navegación superior |
| `FooterComponent` | Pie de página con botón admin |
| `HeroComponent` | Sección hero de la home |
| `ProductCardComponent` | Tarjeta de producto individual |
| `CartDrawerComponent` | Drawer lateral del carrito |
| `AdminPanelComponent` | Panel de administración completo |
| `HomeComponent` | Página principal |
| `ProductsComponent` | Listado de productos |
| `CheckoutComponent` | Proceso de pago |

---

## 🎯 Funcionalidades Implementadas

### Frontend
- ✅ Catálogo de productos con filtrado por categoría
- ✅ Carrito de compra persistente (localStorage)
- ✅ Checkout en 3 pasos (resumen, envío, pago)
- ✅ Sistema de autenticación (login/registro)
- ✅ Panel de administración (CRUD productos, ver pedidos)
- ✅ Wishlist / Favoritos
- ✅ Diseño responsive
- ✅ Animaciones y efectos UI
- ✅ Toast notifications

### Backend
- ✅ API REST completa
- ✅ Autenticación JWT (sin expiración)
- ✅ Base de datos SQLite
- ✅ CRUD de productos
- ✅ Gestión de pedidos
- ✅ Dashboard de estadísticas
- ✅ Upload de imágenes (multer)

---

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT sin expiración (configurable)
- Middleware de autenticación para rutas protegidas
- Validación de inputs en backend
- CORS configurado

---

## 📦 Despliegue

### Backend (Render/Railway)

1. Subir el backend a GitHub
2. Conectar repositorio en Render/Railway
3. Configurar variables de entorno:
   - `PORT` (automático en la plataforma)
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`

### Frontend (Vercel)

1. Subir `nexline-angular` a GitHub
2. Importar proyecto en Vercel
3. Configurar build:
   - Build Command: `ng build --configuration production`
   - Output Directory: `dist/nexline-angular/browser`
4. Actualizar `API_URL` en el servicio para apuntar al backend desplegado

---

## 🛠️ Desarrollo

### Comandos Útiles

**Backend:**
```bash
npm start       # Iniciar servidor
npm run dev     # Desarrollo con nodemon
npm test        # Ejecutar tests
```

**Angular:**
```bash
ng serve        # Servidor de desarrollo
ng build        # Build de producción
ng test         # Ejecutar tests
ng lint         # Linting
```

---

## 📝 Notas Importantes

1. **Base de datos**: SQLite se guarda en `backend/database/void.db`. Se genera automáticamente al iniciar el backend por primera vez.

2. **Productos iniciales**: El backend incluye 5 productos de ejemplo que se insertan automáticamente.

3. **Imágenes**: Las imágenes subidas se guardan en `backend/uploads/` y son accesibles vía `http://localhost:3000/uploads/filename.jpg`.

4. **Frontend legacy**: La carpeta `nexline.vercel/` contiene la versión original en HTML único. Se mantiene como referencia pero el desarrollo activo está en `nexline-angular/`.

---

## 👨‍💻 Autor

TFG — Último año de estudios

---

## 📄 Licencia

MIT
