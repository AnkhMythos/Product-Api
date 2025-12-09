// Versión para base de datos JSON local
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class JSONDatabase {
  constructor() {
    this.dataPath = join(__dirname, '../../data');
    this.ensureDataDirectory();
    console.log('✅ Base de datos JSON local configurada');
  }

  ensureDataDirectory() {
    if (!existsSync(this.dataPath)) {
      const fs = require('fs');
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  readCollection(collectionName) {
    try {
      const filePath = join(this.dataPath, `${collectionName}.json`);
      if (!existsSync(filePath)) {
        // Crear archivo con array vacío si no existe
        this.writeCollection(collectionName, []);
        return [];
      }
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error leyendo ${collectionName}:`, error);
      return [];
    }
  }

  writeCollection(collectionName, data) {
    try {
      const filePath = join(this.dataPath, `${collectionName}.json`);
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error escribiendo ${collectionName}:`, error);
      throw error;
    }
  }

  collection(collectionName) {
    return {
      get: async () => ({
        docs: this.readCollection(collectionName).map((item, index) => ({
          id: item.id || `temp-${index}`,
          data: () => item,
          exists: true
        }))
      }),

      doc: (id) => ({
        get: async () => {
          const items = this.readCollection(collectionName);
          const item = items.find(item => item.id === id);
          return {
            exists: !!item,
            data: () => item,
            id: item?.id || id
          };
        },

        set: async (data) => {
          const items = this.readCollection(collectionName);
          const index = items.findIndex(item => item.id === id);
          if (index >= 0) {
            items[index] = { ...items[index], ...data, id };
          } else {
            items.push({ ...data, id });
          }
          this.writeCollection(collectionName, items);
        },

        update: async (data) => {
          const items = this.readCollection(collectionName);
          const index = items.findIndex(item => item.id === id);
          if (index >= 0) {
            items[index] = { ...items[index], ...data, id };
            this.writeCollection(collectionName, items);
          } else {
            throw new Error('Documento no encontrado');
          }
        },

        delete: async () => {
          const items = this.readCollection(collectionName);
          const filteredItems = items.filter(item => item.id !== id);
          this.writeCollection(collectionName, filteredItems);
        }
      }),

      add: async (data) => {
        const items = this.readCollection(collectionName);
        const newId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem = { ...data, id: newId };
        items.push(newItem);
        this.writeCollection(collectionName, items);
        return {
          id: newId,
          get: async () => ({
            exists: true,
            data: () => newItem,
            id: newId
          })
        };
      },

      where: (field, operator, value) => ({
        get: async () => {
          const items = this.readCollection(collectionName);
          let filteredItems = [];

          switch (operator) {
            case '==':
              filteredItems = items.filter(item => item[field] === value);
              break;
            default:
              filteredItems = items;
          }

          return {
            docs: filteredItems.map(item => ({
              id: item.id,
              data: () => item,
              exists: true
            }))
          };
        }
      }),

      orderBy: (field, direction = 'asc') => ({
        get: async () => {
          const items = this.readCollection(collectionName);
          const sortedItems = [...items].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
          });

          return {
            docs: sortedItems.map(item => ({
              id: item.id,
              data: () => item,
              exists: true
            }))
          };
        }
      })
    };
  }
}

// Exportar una instancia simulando Firebase
export const db = new JSONDatabase();