Proyecto Final - API Rest para Gestión de Productos
📋 Descripción del Proyecto
Este proyecto consiste en el desarrollo de una API Rest para la administración de productos de catálogo, permitiendo operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los productos. La aplicación incluye autenticación JWT para proteger los endpoints y utiliza Firestore de Firebase como base de datos en la nube.

🎯 Premisa
El cliente necesita una API Rest que permita a su tienda oficial administrar productos de forma segura, con autenticación y manejo adecuado de errores.

🏗️ Arquitectura
La aplicación sigue una arquitectura escalable separada en capas:

Rutas (Routes)
Controladores (Controllers)
Servicios (Services)
Modelos (Models)
Middlewares

Configuración de servicios externos

⚙️ Requisitos del Proyecto
Requerimiento #1: Configuración Inicial
Crear directorio del proyecto con archivo index.js como punto de entrada

Inicializar Node.js con npm init -y

Agregar "type": "module" en package.json para habilitar ESModules

Configurar script start en package.json

Requerimiento #2: Dependencias
Instalar las siguientes dependencias:

npm install express cors body-parser dotenv firebase jsonwebtoken
Requerimiento #3: Configuración del Servidor
Crear servidor web con Express

Configurar CORS para peticiones de origen cruzado

Configurar body-parser como middleware global para JSON

Manejar rutas desconocidas (404)

Crear archivo .env para variables de entorno

Requerimiento #4: 
Rutas
products.routes.js
GET /api/products - Devuelve todos los productos
GET /api/products/:id - Devuelve producto por ID
POST /api/products/create - Crea nuevo producto
DELETE /api/products/:id - Elimina producto por ID
auth.routes.js
POST /auth/login - Autentica usuario y devuelve Bearer token

Requerimiento #5: 
Controladores y Servicios
Crear capa de controladores para cada ruta
Crear capa de servicios para atender a los controladores

Requerimiento #6: Acceso a Datos 
Crear capa de modelos
Configurar proyecto Firestore en Firebase
Crear colección para productos con documento inicial
Conectar Firebase al proyecto
Crear métodos para interactuar con la base de datos
Conectar servicios con modelos

Requerimiento #7:
Seguridad
Configurar JWT en el proyecto
Crear middleware de autenticación
Proteger rutas correspondientes
Implementar lógica de login con validación de identidad

🛡️ Manejo de Errores
La aplicación debe manejar los siguientes códigos de estado:

404 - Rutas no definidas
401 y 403 - Errores de autenticación
400 - Errores en las peticiones
500 - Errores de servicios externos

🚀 Instrucciones de Instalación y Ejecución
Prerrequisitos
Node.js instalado
Cuenta de Firebase
Conocimientos básicos de Firestore

Pasos para la Ejecución
Clonar/Descargar el proyecto

mkdir my-project
cd my-project
Inicializar proyecto Node.js

npm init -y
Instalar dependencias

npm install express cors body-parser dotenv firebase jsonwebtoken
Configurar variables de entorno

Crear archivo .env en la raíz del proyecto

Agregar configuración de Firebase y JWT secret

Configurar estructura de carpetas
/src
  /routes
  /controllers
  /services
  /models
  /middlewares
  /config
Ejecutar la aplicación

npm run start

📁 Estructura del Proyecto
proyecto/
├── src/
│   ├── routes/
│   │   ├── products.routes.js
│   │   └── auth.routes.js
│   ├── controllers/
│   │   ├── products.controller.js
│   │   └── auth.controller.js
│   ├── services/
│   │   ├── products.service.js
│   │   └── auth.service.js
│   ├── models/
│   │   └── products.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   └── config/
│       └── firebase.js
├── index.js
├── package.json
└── .env
🔐 Autenticación
Todas las rutas de productos (excepto GET) requieren autenticación

El login devuelve un Bearer token JWT

El token debe incluirse en el header Authorization de las peticiones protegidas

📊 Base de Datos
Firestore de Firebase

Colección: products

Documento inicial para definir estructura de datos

🎉 Consideraciones Finales
Este proyecto representa el primer despliegue en producción como parte de TechLab, demostrando habilidades en desarrollo backend con Node.js, seguridad con JWT, integración con servicios en la nube y arquitectura escalable.


Como implementar Firebase

1. Crear la cuenta y el proyecto Firebase
1.1. Crear cuenta en Firebase

Entrár a: https://firebase.google.com

Hacér clic en "Ir a la consola" (arriba a la derecha).

Iniciár sesión con tu cuenta de Google.

1.2. Crear un proyecto

En Firebase Console, clic en "Agregar proyecto"

Nombre del proyecto: por ejemplo: my-shop

Desactivá Google Analytics (si no lo necesitás).

Crear el proyecto.

✅ 2. Activar Firestore Database

En la barra izquierda buscá: Build → Firestore Database.

Elegí Crear base de datos.

Modo recomendado si estás probando: "Modo de prueba" (permite leer/escribir libremente).

Elegí la región (podés usar us-central1, la más usada).

🎉 Ya tenés la base creada.

✅ 3. Crear una colección llamada "products"

En Firestore, clic en "Iniciar colección".

Nombre: products

Ahora pide un documento inicial:

Poner un ID manual (por ejemplo "2") o dejar que Firebase genere uno.

✅ 4. Agregar los campos del producto (paso a paso)

En el documento agregás cada campo exactamente así:

Campos principales (nivel 1)
Campo	Tipo	Ejemplo
id	string	"2"
title	string	"Camisetas casuales premium..."
price	number	22.3
description	string	texto largo
category	string	"men's clothing"
image	string	URL
rating	map	(esto es un objeto dentro del documento)
Cómo agregar el objeto "rating"

Agregá un campo llamado rating

Tipo: Map (Mapa / Objeto)

Dentro del mapa agregás:

rate (tipo: number) → 4.1

count (tipo: number) → 259

📌 Así queda el documento final en Firebase:

products (colección)
   └── 2 (documento)
         ├── id: "2"
         ├── title: "Camisetas casuales premium de corte entallado para hombre"
         ├── price: 22.3
         ├── description: "Estilo ajustado, ..."
         ├── category: "men's clothing"
         ├── image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png"
         └── rating (mapa)
                ├── rate: 4.1
                └── count: 259

✅ 5. (Opcional) Agregar muchos productos rápido

Si querés agregar varios productos:
Opción 1: manual por consola
Crear más documentos dentro de products.
Opción 2: subirlos por código

Ejemplo en JavaScript:
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const product = {
  id: "2",
  title: "Camisetas casuales premium de corte entallado para hombre",
  price: 22.3,
  description: "Estilo ajustado...",
  category: "men's clothing",
  image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
  rating: {
    rate: 4.1,
    count: 259
  }
};

await addDoc(collection(db, "products"), product);
