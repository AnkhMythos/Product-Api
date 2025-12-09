import { db } from '../src/config/firebase.js';

const seedProducts = async () => {
  const products = [
    {
      name: "Laptop Gaming Pro",
      description: "Laptop de alto rendimiento para gaming",
      price: 1299.99,
      stock: 15,
      category: "Tecnología",
      sku: "LAP-GAM-001",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Smartphone Android",
      description: "Teléfono inteligente con Android latest",
      price: 599.99,
      stock: 30,
      category: "Tecnología",
      sku: "PHN-AND-001",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Auriculares Inalámbricos",
      description: "Auriculares con cancelación de ruido",
      price: 199.99,
      stock: 25,
      category: "Audio",
      sku: "AUD-WRL-001",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    for (const product of products) {
      await db.collection('products').add(product);
    }
    console.log('✅ Productos de ejemplo agregados correctamente');
  } catch (error) {
    console.error('❌ Error agregando productos:', error);
  }
};

seedProducts();