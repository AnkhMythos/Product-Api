import { AuthService } from "../services/authService.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

/* =========================
   AUTHENTICATE
========================= */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
        code: "TOKEN_REQUIRED"
      });
    }

    const token = authHeader.split(" ")[1];

    const validation = await AuthService.validateToken(token);

    req.user = validation.user; // ✅ contiene { id, email, role }
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
      code: "AUTH_ERROR"
    });
  }
};

/* =========================
   AUTHORIZE
========================= */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
        code: "UNAUTHENTICATED"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.ACCESS_DENIED,
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/* =========================
   OPTIONAL AUTH
========================= */
export const optionalAuth = async (req, res, next) => {
  req.isAuthenticated = false;
  req.user = null;

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const validation = await AuthService.validateToken(token);

      if (validation?.valid !== false) {
        req.user = validation.user;
        req.token = token;
        req.isAuthenticated = true;
      }
    }

    next();
  } catch {
    next();
  }
};




// import { AuthService } from '../services/authService.js';
// import { ERROR_MESSAGES } from '../utils/constants.js';

// // Middleware de autenticación básica
// export const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: ERROR_MESSAGES.TOKEN_REQUIRED,
//         code: 'TOKEN_REQUIRED'
//       });
//     }

//     const token = authHeader.split(' ')[1];
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: ERROR_MESSAGES.TOKEN_REQUIRED,
//         code: 'TOKEN_REQUIRED'
//       });
//     }

//     // Validar token
//     const validation = await AuthService.validateToken(token);
    
//     // Agregar información del usuario al request
//     req.user = validation.user;
//     req.token = token;
    
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: error.message,
//       code: 'AUTH_ERROR'
//     });
//   }
// };

// // Middleware de autorización por roles
// export const authorize = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: ERROR_MESSAGES.TOKEN_REQUIRED,
//         code: 'UNAUTHENTICATED'
//       });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: ERROR_MESSAGES.ACCESS_DENIED,
//         code: 'INSUFFICIENT_PERMISSIONS',
//         requiredRoles: allowedRoles,
//         userRole: req.user.role
//       });
//     }

//     next();
//   };
// };

// // Middleware opcional de autenticación (no bloquea si no hay token)
// export const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.split(' ')[1];
//       const validation = await AuthService.validateToken(token);
      
//       if (validation.valid) {
//         req.user = validation.user;
//         req.token = token;
//         req.isAuthenticated = true;
//       }
//     } else {
//       req.isAuthenticated = false;
//     }
    
//     next();
//   } catch (error) {
//     // En auth opcional, no bloqueamos por errores de token
//     req.isAuthenticated = false;
//     next();
//   }
// };