export const verifyRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        msj: "No tenés permisos para esta acción"
      });
    }
    next();
  };
};
