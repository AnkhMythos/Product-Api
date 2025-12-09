import {
  findAllUsers,
  findUserById,
  createUser,
  VerifyCredentials
} from "../services/user.service.js";

import jwt from "jsonwebtoken";

/* =========================
   GET TODOS LOS USUARIOS
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await findAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET USUARIO POR ID
========================= */
export const getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREAR USUARIO
========================= */
export const createUserController = async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ msj: "Email y password son obligatorios" });
    }

    const user = await VerifyCredentials(email, password);

    if (!user) {
      return res
        .status(401)
        .json({ msj: "Credenciales inválidas" });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      msj: "Login exitoso",
      token,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msj: "Error interno del servidor" });
  }
};
