import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Verificando configuración de Firebase...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Presente' : '❌ Faltante');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Presente' : '❌ Faltante');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Presente' : '❌ Faltante');

if (process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Longitud de private key:', process.env.FIREBASE_PRIVATE_KEY.length);
}