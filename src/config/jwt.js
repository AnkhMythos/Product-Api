import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class JWTConfig {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    if (!this.secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    console.log('✅ JWT configurado correctamente');
  }

  // Generar token
  generateToken(payload) {
    return jwt.sign(payload, this.secret, { 
      expiresIn: this.expiresIn,
      issuer: 'product-api',
      audience: 'product-api-users'
    });
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'product-api',
        audience: 'product-api-users'
      });
    } catch (error) {
      throw this.handleJWTError(error);
    }
  }

  // Decodificar token sin verificar (útil para debugging)
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Manejar errores de JWT
  handleJWTError(error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return new Error('Token expirado');
      case 'JsonWebTokenError':
        return new Error('Token inválido');
      case 'NotBeforeError':
        return new Error('Token no activo');
      default:
        return new Error('Error de autenticación');
    }
  }

  // Generar payload estándar
  generatePayload(user) {
    return {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
  }
}

// Exportar instancia única
export const jwtConfig = new JWTConfig();
export default jwtConfig;
