import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msj: "Token no enviado" });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ msj: "Token inválido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; 
    /*
      req.user = {
        id,
        email,
        rol,
        iat,
        exp
      }
    */

    next();
  } catch (err) {
    return res.status(401).json({ msj: "Token inválido o expirado" });
  }
};
