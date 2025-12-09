import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';


dotenv.config();
console.log("ENV PATH =", process.env.SERVICE_ACCOUNT_JSON_PATH);

const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID; // ✅ Corregido: eliminado typo
// let SERVICE_ACCOUNT_JSON_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const SERVICE_ACCOUNT_JSON_STRING = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let SERVICE_ACCOUNT_JSON_PATH="src/credentials/node-api-rest-2024-firebase-adminsdk-fbsvc-c96f8e0a00.json";
const mode = ensureFirebaseConfig();
console.log('🔧 Modo de credenciales detectado:', mode);
console.log('   - SERVICE_ACCOUNT_JSON_PATH:', SERVICE_ACCOUNT_JSON_PATH);
console.log('   - SERVICE_ACCOUNT_JSON_STRING definida:', !!SERVICE_ACCOUNT_JSON_STRING);
console.log('   - Campos individuales completos:', !!(SERVICE_ACCOUNT_KEY && CLIENT_EMAIL && PROJECT_ID));

function ensureFirebaseConfig() {
  if (SERVICE_ACCOUNT_JSON_PATH) return 'path';
  if (SERVICE_ACCOUNT_JSON_STRING) return 'json-string';
  if (SERVICE_ACCOUNT_KEY && CLIENT_EMAIL && PROJECT_ID) return 'key-fields';

  // Buscar serviceAccountKey.json en ubicaciones comunes del proyecto
  const candidate = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'src', 'config', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'config', 'serviceAccountKey.json')
  ];
  for (const p of candidate) {
    try {
      if (fsSync.existsSync(p)) {
        SERVICE_ACCOUNT_JSON_PATH = p;
        return 'path';
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

console.log('Using credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

async function initFirebase() {
  const mode = ensureFirebaseConfig();
  if (!mode) {
    throw new Error(
      'Faltan credenciales de Firebase. Define una de las opciones: GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON), FIREBASE_SERVICE_ACCOUNT_JSON (JSON en env) o FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID.'
    );
  }

  let credentialObj = null;
  let projectId = null;

  try {
    if (mode === 'path') {
      const saPath = SERVICE_ACCOUNT_JSON_PATH;
      let saJson;
      try {
        const content = await fs.readFile(saPath, 'utf8');
        saJson = JSON.parse(content);
      } catch (err) {
        try {
          const moduleUrl = pathToFileURL(saPath).href;
          const mod = await import(moduleUrl);
          saJson = mod.default || mod;
        } catch (err2) {
          throw new Error(`No se pudo leer o importar el archivo de credenciales en ruta: ${saPath}. Error: ${err.message}; ${err2?.message}`);
        }
      }
      credentialObj = saJson;
      projectId = saJson.project_id; // snake_case en archivo JSON
    } else if (mode === 'json-string') {
      // Intentar parsear FIREBASE_SERVICE_ACCOUNT_JSON de forma robusta:
      // 1) JSON.parse directo
      // 2) tratarlo como ruta a archivo y leerlo
      // 3) intentar base64 decode
      try {
        credentialObj = JSON.parse(SERVICE_ACCOUNT_JSON_STRING);
      } catch (errParse) {
        // intentar leer como archivo
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
            const looksLikeEmail = /@.*gserviceaccount\.com$/.test(SERVICE_ACCOUNT_JSON_STRING.trim()) || /firebase-adminsdk-/.test(SERVICE_ACCOUNT_JSON_STRING);
            if (looksLikeEmail) {
              throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON parece contener un email o identificador de cuenta (${preview}). Probablemente quieras usar FIREBASE_CLIENT_EMAIL o pasar el JSON completo vía --path.`);
            }
            throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON no es JSON válido ni ruta/base64 válida. Primera parte del valor: "${preview}"`);
          }
        }
      }
      projectId = credentialObj.project_id;
    } else if (mode === 'key-fields') {
      const privateKey = SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
      credentialObj = {
        project_id: PROJECT_ID,
        client_email: CLIENT_EMAIL,
        private_key: privateKey
      };
      projectId = PROJECT_ID; // ✅ clave: usamos el projectId del entorno
    }

    if (!projectId) {
      throw new Error('No se pudo determinar el PROJECT_ID. Asegúrate de que esté definido en tus variables de entorno.');
    }

    // Log seguro de resumen de credenciales (NO imprimir private_key completo)
    try {
      const clientEmail = credentialObj.client_email || credentialObj.clientEmail || CLIENT_EMAIL || '-';
      const hasPrivateKey = !!(credentialObj.private_key || credentialObj.privateKey || SERVICE_ACCOUNT_KEY);
      console.log('🔐 Resumen de credenciales:');
      console.log(`   - project_id: ${projectId}`);
      console.log(`   - client_email: ${clientEmail}`);
      console.log(`   - private_key presente: ${hasPrivateKey}`);
    } catch (e) {
      // no bloquear por logs
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(credentialObj),
        projectId: projectId // ✅ ¡ES IMPRESCINDIBLE!
      });
      console.log(`✅ Firebase admin inicializado (projectId: ${projectId})`);
    } catch (err) {
      if (!/already exists/.test(err.message)) {
        throw err;
      }
      console.log('ℹ️ Firebase admin ya estaba inicializado');
    }
  } catch (err) {
    throw new Error(`Error inicializando Firebase: ${err.message}`);
  }
}

async function readProductsFile() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('El archivo products.json no contiene un array.');
  return data;
}

async function importProducts(collectionName = 'products', dryRun = false) {
  const products = await readProductsFile();
  console.log(`ℹ️ Se encontraron ${products.length} productos en src/data/products.json`);

  if (dryRun) {
    console.log('🔎 Modo dry-run activado: no se realizará ninguna operación sobre Firestore.');
    console.log('Primeros 5 productos (previa limpieza):', products.slice(0, 5).map(p => JSON.parse(JSON.stringify(p))));
    return;
  }

  await initFirebase();
  const db = admin.firestore();

  const BATCH_SIZE = 500;
  let batch = db.batch();
  let opCount = 0;
  let total = 0;

  for (const p of products) {
    const docRef = p.id ? db.collection(collectionName).doc(String(p.id)) : db.collection(collectionName).doc();
    const safePayload = JSON.parse(JSON.stringify(p)); // Sanitiza

    batch.set(docRef, safePayload, { merge: true });
    opCount += 1;
    total += 1;

    if (opCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`✅ Commit de ${opCount} documentos (total ${total})`);
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    console.log(`✅ Commit final de ${opCount} documentos (total ${total})`);
  }

  console.log(`🎉 Import completado. ${total} documentos subidos a la colección '${collectionName}'.`);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('importProductsToFirestore.js')) {
  const collection = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'products';
  const dry = process.argv.includes('--dry') || process.env.DRY_RUN === 'true';
  importProducts(collection, dry).catch(err => {
    console.error('Error importando productos:', err);
    process.exit(1);
  });
}

export default importProducts;


// import fs from 'fs/promises';
// import path from 'path';
// import admin from 'firebase-admin';
// import dotenv from 'dotenv';
// import { pathToFileURL } from 'url';

// dotenv.config();

// const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_PRIVATE_KEY;
// const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
// const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PORJECT_ID;
// const SERVICE_ACCOUNT_JSON_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
// const SERVICE_ACCOUNT_JSON_STRING = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// function ensureFirebaseConfig() {
//   // Allow several ways to provide credentials:
//   // 1) GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
//   // 2) FIREBASE_SERVICE_ACCOUNT_JSON (whole JSON as string in env)
//   // 3) FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID
//   if (SERVICE_ACCOUNT_JSON_PATH) return 'path';
//   if (SERVICE_ACCOUNT_JSON_STRING) return 'json-string';
//   if (SERVICE_ACCOUNT_KEY && CLIENT_EMAIL && PROJECT_ID) return 'key-fields';

//   return null;
// }

// console.log('Using credentials:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// async function initFirebase() {
//   const mode = ensureFirebaseConfig();
//   if (!mode) {
//     throw new Error(
//       'Faltan credenciales de Firebase. Define una de las opciones: GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON), FIREBASE_SERVICE_ACCOUNT_JSON (JSON en env) o FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID.'
//     );
//   }

//   let credentialObj = null;
//   let projectId = null;

//   try {
//     if (mode === 'path') {
//       // Use file path to service account
//       const saPath = SERVICE_ACCOUNT_JSON_PATH;
//       // Try to read JSON file asynchronously
//       let saJson;
//       try {
//         const content = await fs.readFile(saPath, 'utf8');
//         saJson = JSON.parse(content);
//       } catch (err) {
//         // If reading/parsing fails, try dynamic import (handles JS/JSON modules)
//         try {
//           const moduleUrl = pathToFileURL(saPath).href;
//           const mod = await import(moduleUrl);
//           saJson = mod.default || mod;
//         } catch (err2) {
//           throw new Error(`No se pudo leer o importar el archivo de credenciales en ruta: ${saPath}. Error: ${err.message}; ${err2?.message}`);
//         }
//       }
//       credentialObj = saJson;
//     } else if (mode === 'json-string') {
//       credentialObj = JSON.parse(SERVICE_ACCOUNT_JSON_STRING);
//     } else if (mode === 'key-fields') {
//       const privateKey = SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
//       credentialObj = {
//         projectId: PROJECT_ID,
//         clientEmail: CLIENT_EMAIL,
//         privateKey
//       };
//     }

//     try {
//       admin.initializeApp({
//         credential: admin.credential.cert(credentialObj)
//       });
//       console.log('✅ Firebase admin inicializado');
//     } catch (err) {
//       if (!/already exists/.test(err.message)) {
//         throw err;
//       }
//       console.log('ℹ️ Firebase admin ya estaba inicializado');
//     }
//   } catch (err) {
//     // Re-throw with more context
//     throw new Error(`Error inicializando Firebase: ${err.message}`);
//   }
// }

// async function readProductsFile() {
//   const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
//   const raw = await fs.readFile(filePath, 'utf8');
//   const data = JSON.parse(raw);
//   if (!Array.isArray(data)) throw new Error('El archivo products.json no contiene un array.');
//   return data;
// }

// async function importProducts(collectionName = 'products', dryRun = false) {
//   const products = await readProductsFile();

//   console.log(`ℹ️ Se encontraron ${products.length} productos en src/data/products.json`);

//   if (dryRun) {
//     console.log('🔎 Modo dry-run activado: no se realizará ninguna operación sobre Firestore.');
//     console.log('Primeros 5 productos (previa limpieza):', products.slice(0, 5).map(p => JSON.parse(JSON.stringify(p))));
//     return;
//   }

//   // initFirebase will validate config and initialize admin
//   await initFirebase();
//   const db = admin.firestore();

//   // Firestore batch limit 500
//   const BATCH_SIZE = 500;
//   let batch = db.batch();
//   let opCount = 0;
//   let total = 0;

//   for (const p of products) {
//     // Use id if present, otherwise let Firestore generar id
//     const docRef = p.id ? db.collection(collectionName).doc(String(p.id)) : db.collection(collectionName).doc();
//     // Remove fields that could be problematic (like nested undefined)
//     const payload = { ...p };
//     // Ensure no functions or undefined
//     // (JSON.parse(JSON.stringify())) is a simple way to sanitize
//     const safePayload = JSON.parse(JSON.stringify(payload));

//     batch.set(docRef, safePayload, { merge: true });
//     opCount += 1;
//     total += 1;

//     if (opCount >= BATCH_SIZE) {
//       await batch.commit();
//       console.log(`✅ Commit de ${opCount} documentos (total ${total})`);
//       batch = db.batch();
//       opCount = 0;
//     }
//   }

//   if (opCount > 0) {
//     await batch.commit();
//     console.log(`✅ Commit final de ${opCount} documentos (total ${total})`);
//   }

//   console.log(`🎉 Import completado. ${total} documentos subidos a la colección '${collectionName}'.`);
// }

// // Ejecutar si se llama directamente
// if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('importProductsToFirestore.js')) {
//   const collection = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'products';
//   const dry = process.argv.includes('--dry') || process.env.DRY_RUN === 'true';
//   importProducts(collection, dry).catch(err => {
//     console.error('Error importando productos:', err);
//     process.exit(1);
//   });
// }

// export default importProducts;
