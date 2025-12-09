import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

if (!admin.apps.length) {
  let credential;

  if (process.env.SERVICE_ACCOUNT_JSON_PATH) {
    const json = fs.readFileSync(process.env.SERVICE_ACCOUNT_JSON_PATH, 'utf8');
    credential = JSON.parse(json);
  } else {
    throw new Error('No hay credenciales Firebase configuradas');
  }

  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });
}

export const db = admin.firestore();




import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Intenta cargar las credenciales de varias maneras:
// 1) GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_PATH -> archivo JSON
// 2) FIREBASE_SERVICE_ACCOUNT_JSON -> JSON literal | ruta a archivo | base64
// 3) Variables individuales (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID)
// 4) Buscar serviceAccountKey.json en la raíz del proyecto o en src/config
function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const { FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID } = process.env;

  // 1) ruta explicita
  if (envPath) {
    try {
      const raw = fs.readFileSync(envPath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`No se pudo leer o parsear la ruta de credenciales: ${envPath}: ${err.message}`);
    }
  }

  // 2) JSON en la variable de entorno
  if (envJson) {
    // intentar parsear
    try {
      return JSON.parse(envJson);
    } catch (errParse) {
      // intentar tratar como ruta a archivo
      try {
        const raw = fs.readFileSync(envJson, 'utf8');
        return JSON.parse(raw);
      } catch (errFile) {
        // intentar base64
        try {
          const decoded = Buffer.from(envJson, 'base64').toString('utf8');
          return JSON.parse(decoded);
        } catch (errBase64) {
          const preview = (envJson || '').toString().slice(0, 120).replace(/\n/g, '\\n');
          const looksLikeEmail = /@.*gserviceaccount\.com$/.test(envJson.trim()) || /firebase-adminsdk-/.test(envJson);
          if (looksLikeEmail) {
            throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON parece contener un email o identificador (${preview}). Debe ser el JSON completo del service account o la ruta al archivo.`);
          }
          throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON no es JSON válido ni ruta/base64 válida. Primera parte: "${preview}"`);
        }
      }
    }
  }

  // 3) campos individuales
  if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL && FIREBASE_PROJECT_ID) {
    return {
      type: 'service_account',
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: FIREBASE_CLIENT_EMAIL
    };
  }

  // 4) buscar serviceAccountKey.json en ubicaciones comunes
  const candidates = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'src', 'config', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'src', 'credentials', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'src', 'credentials'),
    path.resolve(process.cwd(), 'config', 'serviceAccountKey.json')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
          // si es directorio, buscar el primer .json dentro
          const files = fs.readdirSync(p).filter(f => f.endsWith('.json'));
          if (files.length > 0) {
            const candidate = path.join(p, files[0]);
            const raw = fs.readFileSync(candidate, 'utf8');
            return JSON.parse(raw);
          }
        } else {
          const raw = fs.readFileSync(p, 'utf8');
          return JSON.parse(raw);
        }
      }
    } catch (e) {
      // continue
    }
  }

  return null;
}

let db = null;
try {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) throw new Error('No se encontraron credenciales de Firebase en el entorno ni en archivos comunes.');

  const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;

  // Log seguro
  try {
    console.log('🔐 Firebase creds summary: project_id=', projectId, 'client_email=', (serviceAccount.client_email || '-'), 'private_key_present=', !!serviceAccount.private_key);
  } catch (e) {}

  initializeApp({
    credential: cert(serviceAccount),
    projectId: projectId
  });

  db = getFirestore();
  console.log('✅ Firebase configurado correctamente');
  console.log(`📁 Proyecto: ${projectId}`);
} catch (error) {
  console.error('❌ Error configurando Firebase:', error.message);
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Continuando en modo desarrollo sin Firebase...');
    db = null;
  } else {
    process.exit(1);
  }
}

// export { db };
// 👇 Wrapper mínimo para permitir metadatos sin tocar Firestore

const firebaseAdapter = {
  collection: (...args) => db.collection(...args),
  __source: 'firebase',
  __type: 'firestore'
};

export { firebaseAdapter as db };
