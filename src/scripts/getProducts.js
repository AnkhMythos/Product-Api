// scripts/getProducts.mjs
const url = process.argv[2] || 'http://localhost:3000/api/products/public';
(async ()=>{
  try {
    const r = await fetch(url);
    const j = await r.json();
    console.log(JSON.stringify(j, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();