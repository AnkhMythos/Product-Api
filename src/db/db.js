import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const fileName = fileURLToPath (import.meta.url);
const dirname = path.dirname(fileName)
const filePath = path.join(dirname, "user.json")
export function leerBD(){
try{
const data = fs.readFileSync (filePath, "utf8");
console.log(data)
return JSON.parse(data)
} 
catch (err) {
console.error("Error leyendo la BD: ", err)
return [];
}
}
export function guardarDB (data) {
try{
fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
catch(err) {
console.error("Error al guardar.");
}
}
