export class UserModel {
  constructor({ id, nombre, email, rol, ubicacion, experiencia }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.rol = rol || "sin rol";
    this.ubicacion = ubicacion || "desconocido";
    this.experiencia = experiencia || "Sin experiencia";
  }
}
