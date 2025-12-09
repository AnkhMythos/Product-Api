import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Configurar dotenv primero
dotenv.config();

// Importar rutas
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Importar middleware de errores
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet());

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir frontend estático en /app (opcional)
app.use('/app', express.static('frontend'));

// Servir datos JSON locales (por ejemplo `src/data/products.json`) en /data
app.use('/data', express.static('src/data'));

// Rutas
app.use('/api/products', productRoutes);
app.use('/auth', authRoutes);

// Ruta de salud (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a la API de Productos',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      auth: '/auth',
      health: '/health'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    availableEndpoints: ['/api/products', '/auth', '/health']
  });
});

// Manejo centralizado de errores
app.use(errorHandler);

// Inicializar servidor
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  // console.log('='.repeat(50));
});

export default app;