// test-simple.js - Versión ultra simplificada
import fetch from 'node-fetch';

console.log('🔍 Probando MockAPI...');

fetch('https://685ffd7dc55df675589fd403.mockapi.io/fakestoreapi/productos')
  .then(response => response.json())
  .then(products => {
    console.log('✅ Conexión exitosa!');
    console.log(`📦 Se encontraron ${products.length} productos`);
    
    products.slice(0, 2).forEach(product => {
      console.log(`   - ${product.name || product.title}: $${product.price}`);
    });
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });