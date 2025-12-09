// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager'
};

// Mensajes de error
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  TOKEN_REQUIRED: 'Token de autenticación requerido',
  TOKEN_INVALID: 'Token inválido o expirado',
  ACCESS_DENIED: 'Acceso denegado',
  USER_NOT_FOUND: 'Usuario no encontrado'
};

// Configuración de autenticación
export const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
  PASSWORD_MIN_LENGTH: 6
};