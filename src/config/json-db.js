import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('src', 'data', 'products.json');

class JsonDb {
  constructor(file) {
    this.file = file;
    console.log('✅ JSON DB configurado:', this.file);
  }

  async readAll() {
    const content = await fs.readFile(this.file, 'utf8');
    return JSON.parse(content || '[]');
  }

  async writeAll(data) {
    await fs.writeFile(this.file, JSON.stringify(data, null, 2), 'utf8');
  }

  collection() {
    return {
      get: async () => {
        const data = await this.readAll();
        return {
          docs: data.map(item => ({
            id: item.id?.toString() ?? '',
            data: () => item,
            exists: true
          }))
        };
      },

      doc: (id) => ({
        get: async () => {
          const data = await this.readAll();
          const item = data.find(x => x.id?.toString() === id?.toString());
          return {
            exists: !!item,
            data: () => item,
            id: item?.id?.toString() || id
          };
        },

        add: async (docData) => {
          const data = await this.readAll();
          const nextId = (data.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0) + 1).toString();
          const newDoc = { id: nextId, ...docData };
          data.push(newDoc);
          await this.writeAll(data);
          return {
            id: newDoc.id.toString(),
            get: async () => ({ exists: true, data: () => newDoc, id: newDoc.id.toString() })
          };
        },

        update: async (updateData) => {
          const data = await this.readAll();
          const idx = data.findIndex(x => x.id?.toString() === id?.toString());
          if (idx === -1) throw new Error('Documento no encontrado');
          data[idx] = { ...data[idx], ...updateData };
          await this.writeAll(data);
          return data[idx];
        },

        delete: async () => {
          const data = await this.readAll();
          const idx = data.findIndex(x => x.id?.toString() === id?.toString());
          if (idx === -1) throw new Error('Documento no encontrado');
          data.splice(idx, 1);
          await this.writeAll(data);
          return { success: true };
        }
      }),

      add: async (doc) => {
        const data = await this.readAll();
        const nextId = (data.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0) + 1).toString();
        const newDoc = { id: nextId, ...doc };
        data.push(newDoc);
        await this.writeAll(data);
        return {
          id: newDoc.id.toString(),
          get: async () => ({ exists: true, data: () => newDoc, id: newDoc.id.toString() })
        };
      }
    };
  }
}

export const jsonDb = new JsonDb(DATA_FILE);
