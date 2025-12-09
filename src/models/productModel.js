const DEFAULT_SOURCE = process.env.DATA_SOURCE || 'mockapi';

let db = null;
const COLLECTION_NAME = 'products';

export class ProductModel {
  static async findAll(source) {
    try {
      await this.ensureDB(source);
      // Adapt for different adapters: mockapi/json may return arrays directly
      if (!db) return [];
      if (db.collection) {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      // If adapter exposes a findAll method
      if (typeof db.findAll === 'function') {
        return await db.findAll();
      }
      // If adapter is a simple array (unlikely), return it
      return db;
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  static async findById(id, source) {
    try {
      await this.ensureDB(source);
      if (!db) return null;
      if (db.collection) {
        const doc = await db.collection(COLLECTION_NAME).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
      }
      if (typeof db.findById === 'function') return await db.findById(id);
      return null;
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  static async create(productData, source) {
    try {
      await this.ensureDB(source);
      const productWithTimestamps = { ...productData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      if (!db) throw new Error('DB no inicializada');
      if (db.collection) {
        const docRef = await db.collection(COLLECTION_NAME).add(productWithTimestamps);
        const newDoc = await docRef.get();
        return { id: newDoc.id, ...newDoc.data() };
      }
      if (typeof db.create === 'function') return await db.create(productWithTimestamps);
      throw new Error('Operación create no soportada por el adaptador');
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  static async update(id, productData, source) {
    try {
      await this.ensureDB(source);
      const updateData = { ...productData, updatedAt: new Date().toISOString() };
      if (!db) throw new Error('DB no inicializada');
      if (db.collection) {
        await db.collection(COLLECTION_NAME).doc(id).update(updateData);
        const updatedDoc = await db.collection(COLLECTION_NAME).doc(id).get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
      }
      if (typeof db.update === 'function') return await db.update(id, updateData);
      throw new Error('Operación update no soportada por el adaptador');
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  static async delete(id, source) {
    try {
      await this.ensureDB(source);
      if (!db) throw new Error('DB no inicializada');
      if (db.collection) {
        await db.collection(COLLECTION_NAME).doc(id).delete();
        return { message: 'Producto eliminado correctamente' };
      }
      if (typeof db.delete === 'function') return await db.delete(id);
      throw new Error('Operación delete no soportada por el adaptador');
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  static async ensureDB(source) {
    const src = source || DEFAULT_SOURCE;
    if (!db || (db && db.__source !== src)) {
      if (src === 'mockapi') {
        const module = await import('../config/mockapi.js');
        db = module.mockapi;
        db.__source = 'mockapi';

      // } else if (src === 'firebase') {
      //   const module = await import('../config/firebase.js');
      //   db = module.db;
      //   db.__source = 'firebase';
      
      } else if (src === 'firebase') {
  const module = await import('../config/firebase.js');
  db = module.db; // ✅ ya viene con __source
      } else if (src === 'json') {
        const module = await import('../config/json-db.js');
        db = module.jsonDb;
        db.__source = 'json';
      } else {
        throw new Error(`Fuente de datos desconocida: ${src}`);
      }
    }
  }
}