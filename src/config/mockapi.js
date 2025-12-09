import fetch from 'node-fetch';

const API_URL = "https://685ffd7dc55df675589fd403.mockapi.io/fakestoreapi/productos";

class MockAPI {
  constructor() {
    this.baseURL = API_URL;
    console.log('✅ MockAPI configurado:', this.baseURL);
  }

  async request(endpoint = '', options = {}) {
    const url = endpoint ? `${this.baseURL}/${endpoint}` : this.baseURL;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en MockAPI request:', error.message);
      throw error;
    }
  }

  collection(collectionName) {
    // MockAPI usa endpoints directos, no colecciones como Firebase
    return {
      get: async () => {
        const data = await this.request();
        return {
          docs: data.map(item => ({
            id: item.id.toString(),
            data: () => this.transformProduct(item),
            exists: true
          }))
        };
      },

      doc: (id) => ({
        get: async () => {
          const data = await this.request(id);
          return {
            exists: !!data,
            data: () => this.transformProduct(data),
            id: data?.id?.toString() || id
          };
        },

        add: async (data) => {
          const newData = await this.request('', {
            method: 'POST',
            body: JSON.stringify(this.prepareForAPI(data)),
            headers: { 'Content-Type': 'application/json' }
          });
          
          return {
            id: newData.id.toString(),
            get: async () => ({
              exists: true,
              data: () => this.transformProduct(newData),
              id: newData.id.toString()
            })
          };
        },

        update: async (updateData) => {
          const updatedData = await this.request(id, {
            method: 'PUT',
            body: JSON.stringify(this.prepareForAPI(updateData)),
            headers: { 'Content-Type': 'application/json' }
          });
          
          return this.transformProduct(updatedData);
        },

        delete: async () => {
          await this.request(id, {
            method: 'DELETE'
          });
          return { success: true };
        }
      }),

      add: async (data) => {
        const newData = await this.request('', {
          method: 'POST',
          body: JSON.stringify(this.prepareForAPI(data)),
          headers: { 'Content-Type': 'application/json' }
        });
        
        return {
          id: newData.id.toString(),
          get: async () => ({
            exists: true,
            data: () => this.transformProduct(newData),
            id: newData.id.toString()
          })
        };
      }
    };
  }

  // Transformar datos de MockAPI a nuestro formato
  transformProduct(apiProduct) {
    return {
      name: apiProduct.name || apiProduct.title || 'Sin nombre',
      description: apiProduct.description || 'Sin descripción',
      price: apiProduct.price || 0,
      category: apiProduct.category || 'general',
      image: apiProduct.image || apiProduct.images || '',
      stock: apiProduct.stock || 10,
      sku: apiProduct.sku || `SKU-${apiProduct.id}`,
      createdAt: apiProduct.createdAt || new Date().toISOString(),
      updatedAt: apiProduct.updatedAt || new Date().toISOString(),
      // Campos específicos de MockAPI que queremos preservar
      ...apiProduct
    };
  }

  // Preparar datos para enviar a MockAPI
  prepareForAPI(productData) {
    return {
      name: productData.name,
      title: productData.name, // MockAPI usa 'title'
      description: productData.description,
      price: productData.price,
      category: productData.category,
      image: productData.image,
      images: productData.images || [productData.image],
      stock: productData.stock,
      sku: productData.sku,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
  }
}

export const mockapi = new MockAPI();