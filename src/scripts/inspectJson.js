import { jsonDb } from '../config/json-db.js';

async function inspect(){
  try{
    const snapshot = await jsonDb.collection('products').get();
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`✅ ${items.length} productos desde JSON local:`);
    console.log(items.slice(0, 10));
  }catch(err){
    console.error('Error leyendo JSON local:', err.message);
  }
}

inspect();
