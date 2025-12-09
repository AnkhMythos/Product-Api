import fs from 'fs';
const filePath = 'src/data/products.json';
try {
  const txt = fs.readFileSync(filePath, 'utf8');
  JSON.parse(txt);
  console.log('✅ products.json es un JSON válido. Tamaño (bytes):', Buffer.byteLength(txt, 'utf8'));
} catch (e) {
  console.error('❌ Error al parsear products.json:', e.message);
  process.exit(1);
}
