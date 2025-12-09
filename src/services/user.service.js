import bcrypt from 'bcryptjs';
// import { leerBD, guardarDB } from '../models/user.model';
import { leerBD, guardarDB } from '../db/db.js';
import { collection } from 'firebase/firestore';
import { db} from '../firebase/config.js';

const ruta = "usuarios";

// export const findAllUsers = () => {return leerBD()}

export const findAllUsers = async () => {
// const bd = LeerBD()
// const users = bd[ruta] || []
// return users.map(({password, ...u})=> u)
const snapshot = await getDocs(collection(db, ruta))
// return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
return snapshot.docs.map(d => {
const {password, ...u} = d.data();
// return {id:doc.id, ...u}
return new UserModel ({id:doc.id, ...u})
})
}

export const findUserById = (id) => {
    const user = usuarios.find(u => u.id === parseInt(id))
    if(!user) return null;

    const {password, ...userData} = user;
    return userData
}

export const createUser = async (data) => {
  const {nombre, email, password, rol, ubicacion, experiencia} = data;

  if(!nombre || !email || !password) {
    throw new Error("Faltan los campos obligatorios (nombre - email - pass)")
  }

  const existingUser = usuarios.find(u => u.email === email);
  if(existingUser) {
    throw new Error("EL correo ya existe ");
  }

  const hash = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: usuarios.length + 1,
    nombre,
    email,
    password:hash,
    rol: rol || "sin asignar",
    ubicacion: ubicacion || "Desconocida"
    // experiencia: experiencia || "Sin experiencia"
  }

  usuarios.push(newUser);

  const {password: _ , ...user} = newUser
  return user
}

export const VerifyCredentials = async (email, password) => {
  const user = usuarios.find(u => u.email === email);
  if(!user) throw new Error("Mail no registrado");

  const valid = await bcrypt.compare(password, user.password);
  if(!valid) throw new Error("Contraseña incorrecta!");

  const {password: _, ...safeUser} = user
  return safeUser
}