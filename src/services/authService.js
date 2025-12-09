import { jwtConfig } from '../config/jwt.js';
import { UserModel } from '../models/userModel.js';
import { ERROR_MESSAGES, USER_ROLES } from '../utils/constants.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  // Autenticar usuario
  static async authenticateUser(email, password) {
    try {
      // Validar campos requeridos
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Buscar y validar usuario
      const user = await UserModel.validateCredentials(email, password);
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Generar token JWT
      const tokenPayload = jwtConfig.generatePayload(user);
      const token = jwtConfig.generateToken(tokenPayload);

      // Registrar login exitoso
      await UserModel.recordLogin(user.id);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        tokenType: 'Bearer'
      };
    } catch (error) {
      throw error;
    }
  }

  // Validar token
  static async validateToken(token) {
    try {
      if (!token) {
        throw new Error(ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      const decoded = jwtConfig.verifyToken(token);
      
      // Verificar que el usuario aún existe
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return {
        valid: true,
        user: decoded,
        message: 'Token válido'
      };
    } catch (error) {
      throw error;
    }
  }

  // Refrescar token
  static async refreshToken(oldToken) {
    try {
      const validation = await this.validateToken(oldToken);
      
      if (!validation.valid) {
        throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
      }

      // Generar nuevo token
      const newToken = jwtConfig.generateToken({
        userId: validation.user.userId,
        email: validation.user.email,
        role: validation.user.role,
        name: validation.user.name
      });

      return {
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar permisos de usuario
  static async authorizeUser(user, requiredRole) {
    const rolesHierarchy = {
      [USER_ROLES.USER]: 1,
      [USER_ROLES.MANAGER]: 2,
      [USER_ROLES.ADMIN]: 3
    };

    const userLevel = rolesHierarchy[user.role] || 0;
    const requiredLevel = rolesHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }

    return true;
  }

  // Hashear contraseña (para cuando creemos usuarios)
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Comparar contraseña
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}