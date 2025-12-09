const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Errores de validación
  if (err.message.includes('requeridos') || 
      err.message.includes('debe ser') || 
      err.message.includes('cadena de texto') ||
      err.message.includes('número mayor')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Producto no encontrado
  if (err.message.includes('no encontrado')) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  // // Errores de autenticación
  // if (err.message.includes('Credenciales inválidas')) {
  //   return res.status(401).json({
  //     success: false,
  //     message: err.message
  //   });
  // }

  // Error de autenticación
  if (err.message.includes('auth') || err.message.includes('token') || err.message.includes('credential')) {
    return res.status(401).json({
      success: false,
      message: 'Error de autenticación'
    });
  }

  // Errores de token
  if (err.message.includes('Token')) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }

  // Errores de Firebase
  if (err.message.includes('Firebase') || err.message.includes('Firestore')) {
    return res.status(500).json({
      success: false,
      message: 'Error en el servicio de base de datos'
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};

export default errorHandler;