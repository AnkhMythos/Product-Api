import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PORJECT_ID;
let SERVICE_ACCOUNT_JSON_PATH = process.argv.find(a => a.startsWith('--path='))
  ? process.argv.find(a => a.startsWith('--path=')).split('=')[1]
  : process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const SERVICE_ACCOUNT_JSON_STRING = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

function resolveMode() {
  // Si se proporcionó explícitamente --path o variable de entorno ya, usarla
  if (SERVICE_ACCOUNT_JSON_PATH) return 'path';

  // Si no se proporcionó, buscar archivos comunes dentro del proyecto
  const candidatePaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'src', 'config', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'config', 'serviceAccountKey.json')
  ];

  for (const p of candidatePaths) {
    try {
      if (fsSync.existsSync(p)) {
        SERVICE_ACCOUNT_JSON_PATH = p;
        return 'path';
      }
    } catch (e) {
      // ignore
    }
  }
  if (SERVICE_ACCOUNT_JSON_STRING) return 'json-string';
  if (SERVICE_ACCOUNT_KEY && CLIENT_EMAIL && PROJECT_ID) return 'key-fields';
  return null;
}

async function initFirebase() {
  const mode = resolveMode();
  if (!mode) {
    throw new Error('No hay credenciales de Firebase disponibles. Usa --path=serviceAccount.json o configura FIREBASE_* en .env');
  }

  let credentialObj = null;
  if (mode === 'path') {
    const saPath = SERVICE_ACCOUNT_JSON_PATH;
    try {
      const raw = await fs.readFile(saPath, 'utf8');
      credentialObj = JSON.parse(raw);
    } catch (err) {
      // try dynamic import
      try {
        const mod = await import(pathToFileURL(saPath).href);
        credentialObj = mod.default || mod;
      } catch (err2) {
        throw new Error(`No se pudo leer/importar el archivo de credenciales: ${err.message}; ${err2?.message}`);
      }
    }
  } else if (mode === 'json-string') {
    // FIREBASE_SERVICE_ACCOUNT_JSON puede ser:
    // - un JSON literal
    // - una ruta a un archivo (cuando fue exportado como string)
    // - un JSON codificado en base64
    try {
      credentialObj = JSON.parse(SERVICE_ACCOUNT_JSON_STRING);
    } catch (errParse) {
      // intentar tratar el valor como ruta a archivo
      try {
        const raw = await fs.readFile(SERVICE_ACCOUNT_JSON_STRING, 'utf8');
        credentialObj = JSON.parse(raw);
      } catch (errFile) {
        // intentar base64
        try {
          const decoded = Buffer.from(SERVICE_ACCOUNT_JSON_STRING, 'base64').toString('utf8');
          credentialObj = JSON.parse(decoded);
        } catch (errBase64) {
          const preview = (SERVICE_ACCOUNT_JSON_STRING || '').toString().slice(0, 120).replace(/\n/g, '\\n');
          // Detectar si el usuario por error puso el client_email u otro campo en lugar del JSON
          const looksLikeEmail = /@.*gserviceaccount\.com$/.test(SERVICE_ACCOUNT_JSON_STRING.trim()) || /firebase-adminsdk-/.test(SERVICE_ACCOUNT_JSON_STRING);
          if (looksLikeEmail) {
            throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON parece contener un email o identificador de cuenta (${preview}). Probablemente quieras usar la variable FIREBASE_CLIENT_EMAIL o pasar el JSON completo vía --path. Ejemplo: --path=\"C:\\\\ruta\\serviceAccountKey.json\"`);
          }
          throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON no es JSON válido ni ruta/base64 válida. Primera parte del valor: "${preview}"`);
        }
      }
    }
  } else if (mode === 'key-fields') {
    credentialObj = {
      project_id: PROJECT_ID,
      client_email: CLIENT_EMAIL,
      private_key: SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
    };
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentialObj)
    });
  } catch (err) {
    if (!/already exists/.test(err.message)) throw err;
  }
}

async function runTest() {
  try {
    await initFirebase();
  } catch (err) {
    console.error('Fallo inicializando Firebase:', err.message);
    process.exit(1);
  }

  try {
    const db = admin.firestore();
    await db.collection('_test').doc('ping').set({ ok: true, at: new Date().toISOString() });
    console.log('🔥 Escritura de prueba OK');
    process.exit(0);
  } catch (err) {
    console.error('Error escribiendo en Firestore:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('testFirestoreWrite.js')) {
  runTest();
}

export default runTest;
