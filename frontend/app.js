const EXTERNAL_MOCKAPI = 'https://685ffd7dc55df675589fd403.mockapi.io/fakestoreapi/productos';
const $cards = document.getElementById('cards');
const $loading = document.getElementById('loading');
const $error = document.getElementById('error');
const $dataSource = document.getElementById('dataSource');
const $reloadBtn = document.getElementById('reloadBtn');

// Obtener fuente guardada o por defecto
function getSavedSource(){
  // return localStorage.getItem('dataSource') || 'mockapi';
  return localStorage.getItem('dataSource') || 'firebase';
}

function saveSource(src){
  localStorage.setItem('dataSource', src);
}

function determineUrlForSource(source){
  switch(source){
    case 'mockapi': return EXTERNAL_MOCKAPI;
    case 'backend': return '/api/products/public';
    case 'json': return '/src/data/products.json';
    case 'firebase': return '/api/products/public?source=firebase';
    default: return EXTERNAL_MOCKAPI;
  }
}


function createCard(product){
  const el = document.createElement('article');
  el.className = 'card';

  const img = document.createElement('img');
  img.src = product.image || product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+image';
  img.alt = product.name || product.title || 'Producto';

  const title = document.createElement('h3');
  title.textContent = product.name || product.title || 'Sin nombre';

  const desc = document.createElement('p');
  desc.textContent = (product.description || '').slice(0,120);

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = `$${product.price ?? 0}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `SKU: ${product.sku || '—'} • Stock: ${product.stock ?? '—'}`;

  el.append(img, title, desc, price, meta);
  return el;
}

async function loadProducts(){
  const source = getSavedSource();
  const url = determineUrlForSource(source);

  try{
    $loading.hidden = false;
    $error.hidden = true;

    let res, data;

    if (source === 'firebase') {
      // Llamar al backend con source=firebase para que use Firestore
      // res = await fetch('/api/products/public?source=firebase');
      res = await fetch('/api/products/public?source=firebase', { cache: 'no-store' });

      if (!res.ok) {
        throw new Error('Error HTTP ' + res.status);
      }
      data = await res.json();

      // Si backend devolvió un error (por ejemplo Firebase no configurado), mostrar mensaje útil
      if (!data || data.success === false || !data.data) {
        const errMsg = data && data.message ? data.message : 'El backend no devolvió productos desde Firebase.';
        throw new Error(errMsg);
      }
    } else {
      res = await fetch(url);
      if(!res.ok) throw new Error('Error HTTP ' + res.status);
      data = await res.json();
    }

    $loading.hidden = true;
    $cards.innerHTML = '';

    // Normalizar estructura de respuesta
    const products = Array.isArray(data) ? data : (data.data || data.docs || []);

    if(!Array.isArray(products) || products.length === 0){
      $cards.innerHTML = '<p>No hay productos.</p>';
      return;
    }

    products.forEach(p => $cards.appendChild(createCard(p)));
  }catch(err){
    $loading.hidden = true;
    $error.hidden = false;
    // Mensaje más amigable para Firebase
    if (source === 'firebase') {
      $error.innerHTML = '<strong>Error cargando productos desde Firebase:</strong> ' + (err.message || err) + '<br/><small>Asegúrate de que el backend tenga credenciales de Firebase configuradas y reinícialo.</small>';
    } else {
      $error.textContent = 'No se pudieron cargar los productos: ' + err.message;
    }
  }
}

// Inicializar selector y eventos
function initControls(){
  const saved = getSavedSource();
  if($dataSource) $dataSource.value = saved;

  if($reloadBtn) $reloadBtn.addEventListener('click', () => loadProducts());

  if($dataSource) $dataSource.addEventListener('change', (e) => {
    saveSource(e.target.value);
    loadProducts();
  });
}

initControls();
loadProducts();
