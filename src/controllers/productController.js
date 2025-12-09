import { ProductService } from '../services/productService.js';

export class ProductController {
  static async getProducts(req, res, next) {
    try {
      const source = req.query.source || process.env.DATA_SOURCE || 'mockapi';
      const products = await ProductService.getAllProducts(source);
      res.status(200).json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const source = req.query.source || process.env.DATA_SOURCE || 'mockapi';
      const product = await ProductService.getProductById(id, source);
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const productData = req.body;
      const source = req.query.source || process.env.DATA_SOURCE || 'mockapi';
      const newProduct = await ProductService.createProduct(productData, source);
      
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente', 
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const source = req.query.source || process.env.DATA_SOURCE || 'mockapi';
      const updatedProduct = await ProductService.updateProduct(id, productData, source);
      
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const source = req.query.source || process.env.DATA_SOURCE || 'mockapi';
      await ProductService.deleteProduct(id, source);
      
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}