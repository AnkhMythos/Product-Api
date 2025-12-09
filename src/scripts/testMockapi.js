import { mockapi } from '../config/mockapi.js';

async function testMockAPI() {
  console.log('🧪 Probando conexión con MockAPI...\n');

  try {
    // Test 1: Obtener todos los productos
    console.log('1. Obteniendo todos los productos...');
    const products = await mockapi.collection('products').get();
    console.log(`✅ ${products.docs.length} productos obtenidos`);
    
    if (products.docs.length > 0) {
      products.docs.slice(0, 2).forEach(doc => {
        console.log(`   - ${doc.data().name}: $${doc.data().price}`);
      });
    }

    // Test 2: Obtener un producto específico
    if (products.docs.length > 0) {
      const firstProduct = products.docs[0];
      console.log(`\n2. Obteniendo producto ID: ${firstProduct.id}...`);
      const singleProduct = await mockapi.collection('products').doc(firstProduct.id).get();
      console.log(`✅ Producto: ${singleProduct.data().name}`);
    }

    // Test 3: Crear nuevo producto
    console.log('\n3. Creando nuevo producto...');
    const newProduct = {
      name: 'Producto de Prueba desde API',
      description: 'Este es un producto de prueba',
      price: 99.99,
      category: 'testing',
      stock: 50,
      sku: 'TEST-001'
    };

    const created = await mockapi.collection('products').add(newProduct);
    const createdData = await created.get();
    console.log(`✅ Producto creado: ${createdData.data().name} (ID: ${created.id})`);

    console.log('\n🎉 Todas las pruebas pasaron correctamente!');

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

testMockAPI();