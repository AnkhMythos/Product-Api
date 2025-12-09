import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

function checkStructure(basePath = '.', indent = '') {
  const items = readdirSync(basePath, { withFileTypes: true });
  
  items.forEach(item => {
    if (item.name === 'node_modules') return; // Saltar node_modules
    
    console.log(indent + (item.isDirectory() ? '📁 ' : '📄 ') + item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.')) {
      checkStructure(join(basePath, item.name), indent + '  ');
    }
  });
}

console.log('🏗️  Estructura del proyecto:');
checkStructure();