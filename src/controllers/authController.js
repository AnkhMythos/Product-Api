import { AuthService } from '../services/authService.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

export class AuthController {
  // Login de usuario
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
          code: 'MISSING_CREDENTIALS'
        });
      }

      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña deben ser cadenas de texto',
          code: 'INVALID_CREDENTIALS_FORMAT'
        });
      }

      // Autenticar usuario
      const authResult = await AuthService.authenticateUser(email, password);

      res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        data: authResult
      });
    } catch (error) {
      next(error);
    }
  }

  // Validar token
  static async validate(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.TOKEN_REQUIRED,
          code: 'TOKEN_REQUIRED'
        });
      }

      const validation = await AuthService.validateToken(token);
      
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: validation
      });
    } catch (error) {
      next(error);
    }
  }

  // Refrescar token
  static async refresh(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token es requerido',
          code: 'TOKEN_REQUIRED'
        });
      }

      const refreshResult = await AuthService.refreshToken(token);
      
      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: refreshResult
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil de usuario autenticado
  static async getProfile(req, res, next) {
    try {
      // El usuario ya está en req.user gracias al middleware de autenticación
      const userProfile = {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      };

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: userProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout (simulado - en JWT es del lado cliente)
  static async logout(req, res, next) {
    try {
      // En JWT stateless, el logout se maneja del lado cliente
      // eliminando el token. Aquí podríamos blacklistear el token
      // si quisiéramos invalidarlo antes de su expiración.
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso. Elimine el token del cliente.',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}