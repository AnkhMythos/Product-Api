import { ProductModel } from '../models/productModel.js';

// Datos mock para desarrollo cuando Firebase no está disponible
const mockProducts = [
  {
    id: '1',
    name: 'Laptop Gaming Pro',
    description: 'Laptop de alto rendimiento para gaming',
    price: 1299.99,
    stock: 15,
    category: 'Tecnología',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Smartphone Android',
    description: 'Teléfono inteligente con Android latest',
    price: 599.99,
    stock: 30,
    category: 'Tecnología',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class ProductService {
  static async getAllProducts(source) {
    try {
      return await ProductModel.findAll(source);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Usando datos mock para desarrollo');
        return mockProducts;
      }
      throw error;
    }
  }

  static async getProductById(id, source) {
    try {
      const product = await ProductModel.findById(id, source);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const mockProduct = mockProducts.find(p => p.id === id);
        if (mockProduct) return mockProduct;
      }
      throw error;
    }
  }

  static async createProduct(productData, source) {
    try {
      return await ProductModel.create(productData, source);
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(id, productData, source) {
    try {
      return await ProductModel.update(id, productData, source);
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id, source) {
    try {
      return await ProductModel.delete(id, source);
    } catch (error) {
      throw error;
    }
  }
}