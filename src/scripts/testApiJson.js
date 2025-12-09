// Script para probar ProductService.getAllProducts con DATA_SOURCE=json
process.env.DATA_SOURCE = 'json';
import { ProductService } from '../services/productService.js';

async function test(){
  try{
    const prods = await ProductService.getAllProducts();
    console.log('✅ Productos obtenidos a través de ProductService:');
    console.log(prods);
  }catch(err){
    console.error('❌ Error al obtener productos:', err.message);
  }
}

test();
