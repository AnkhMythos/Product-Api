import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticate, authorize } from '../middlewares/auth.js'; // ← Agregar authorize

const router = Router();

// Ruta pública (sin autenticación) para obtener productos — útil para frontend público
router.get('/public', ProductController.getProducts);

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/products - Obtener todos los productos (cualquier usuario autenticado)
router.get('/', ProductController.getProducts);

// GET /api/products/:id - Obtener un producto por ID (cualquier usuario autenticado)
router.get('/:id', ProductController.getProduct);

// POST /api/products/create - Crear nuevo producto (solo admin/manager)
router.post('/create', authorize('admin', 'manager'), ProductController.createProduct);

// PUT /api/products/:id - Actualizar producto (solo admin/manager)
router.put('/:id', authorize('admin', 'manager'), ProductController.updateProduct);

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', authorize('admin'), ProductController.deleteProduct);

export default router;