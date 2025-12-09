import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const router = Router();

// POST /auth/login - Login de usuario (versión simplificada)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@tienda.com' && password === 'admin123') {
    const token = 'jwt-token-simulado-' + Date.now();

    return res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: 'admin-001',
          email: 'admin@tienda.com',
          role: 'admin',
          name: 'Administrador'
        },
        expiresIn: '24h'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Credenciales inválidas'
  });
});

// GET /auth/health - Para probar
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Auth routes funcionando' });
});

export default router;