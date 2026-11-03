'use strict';
/** Configura el número real de la tienda (indicativo + número, solo dígitos). */
const WHATSAPP_NUMBER = '573001234567'; // PENDIENTE: reemplazar por tu número
const PRODUCTS = [
  {id:1,name:'Audífonos inalámbricos Pro',description:'Sonido envolvente y un diseño cómodo para acompañarte todo el día.',price:120000,category:'Audio',badge:'MÁS VENDIDO',image:'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=650&q=82&auto=format'},
  {id:2,name:'Cargador rápido USB-C 20W',description:'Práctico, compacto y perfecto para recargar tus dispositivos.',price:45000,category:'Cargadores',badge:'DESTACADO',image:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=650&q=82&auto=format'},
  {id:3,name:'Base de carga inalámbrica 3 en 1',description:'Organiza tu escritorio y recarga tus dispositivos en un solo lugar.',price:85000,category:'Cargadores',badge:'NUEVO',image:'https://images.unsplash.com/photo-1622445268121-8b1d30327f30?w=650&q=82&auto=format'},
  {id:4,name:'Cable trenzado de carga 2 m',description:'Un básico resistente y versátil, ideal para el uso diario.',price:25000,category:'Accesorios',badge:'',image:'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=650&q=82&auto=format'}
];
const $ = selector => document.querySelector(selector);
const money = number => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(number);
const STORAGE_KEY = 'techstore-cart-v2';
let cart = {};
try {
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
  if(saved && typeof saved==='object' && !Array.isArray(saved)) for(const product of PRODUCTS){const quantity=Number(saved[product.id]);if(Number.isSafeInteger(quantity)&&quantity>0)cart[product.id]=Math.min(quantity,99);}
}catch(_error){cart={};}
let filter='Todos';
let search='';
let sort='featured';
let lastFocus=null;
const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));}catch(_error){/* modo privado */}};
const qty=id=>cart[id]||0;
const escapeHTML=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function renderProducts(){
 const term=search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 let results=PRODUCTS.filter(p=>(filter==='Todos'||p.category===filter)&&`${p.name} ${p.description} ${p.category}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(term));
 if(sort==='priceAsc')results.sort((a,b)=>a.price-b.price);if(sort==='priceDesc')results.sort((a,b)=>b.price-a.price);if(sort==='name')results.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 $('#productGrid').innerHTML=results.map((p,i)=>`<article class="product-card" style="--card-index:${i}"><div class="product-image"><img loading="lazy" src="${p.image}" alt="${escapeHTML(p.name)}"><span class="category-pill">${escapeHTML(p.category)}</span>${p.badge?`<span class="product-badge">${escapeHTML(p.badge)}</span>`:''}</div><div class="product-info"><span class="product-category">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p><div class="product-bottom"><div class="price-block"><small>PRECIO</small><strong>${money(p.price)}</strong></div><button type="button" class="add-button" data-add="${p.id}" aria-label="Agregar ${escapeHTML(p.name)} al carrito"><span>Agregar</span><span aria-hidden="true">＋</span></button></div></div></article>`).join('');
 $('#emptyResults').hidden=results.length!==0;$('#resultCount').textContent=`${results.length} ${results.length===1?'producto':'productos'}`;
}
function addProduct(id){if(!PRODUCTS.some(p=>p.id===id))return;if(qty(id)>=99){toast('Máximo 99 unidades por producto');return;}cart[id]=qty(id)+1;save();renderCart();toast('Producto agregado al carrito');}
function changeQuantity(id,delta){if(!PRODUCTS.some(p=>p.id===id))return;const n=Math.min(99,qty(id)+delta);if(n<=0)delete cart[id];else cart[id]=n;save();renderCart();}
function renderCart(){
 const items=PRODUCTS.filter(p=>qty(p.id)>0);
 const count=items.reduce((sum,p)=>sum+qty(p.id),0), total=items.reduce((sum,p)=>sum+qty(p.id)*p.price,0);
 $('#cartCount').textContent=count;$('#drawerCount').textContent=`(${count})`;$('#cartTotal').textContent=money(total);
 $('#cartItems').innerHTML=items.length?items.map(p=>`<div class="cart-item"><img src="${p.image}" alt="${escapeHTML(p.name)}"><div class="cart-item-info"><h3>${escapeHTML(p.name)}</h3><strong>${money(p.price)}</strong><div class="cart-item-actions"><div class="quantity-control"><button type="button" data-minus="${p.id}" aria-label="Quitar una unidad de ${escapeHTML(p.name)}">−</button><span>${qty(p.id)}</span><button type="button" data-plus="${p.id}" aria-label="Añadir una unidad de ${escapeHTML(p.name)}" ${qty(p.id)>=99?'disabled':''}>+</button></div><button type="button" class="remove-item" data-remove="${p.id}">Eliminar</button></div></div></div>`).join(''):`<div class="cart-empty"><span>◌</span><h3>Tu carrito está vacío</h3><p>Explora nuestros productos y encuentra algo que te encante.</p><button type="button" class="button button-primary" id="emptyExplore">Explorar productos</button></div>`;
 $('#checkoutButton').disabled=items.length===0;
}
function openCart(){lastFocus=document.activeElement;$('#cartBackdrop').hidden=false;$('#cartDrawer').classList.add('is-open');$('#cartDrawer').setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');$('#closeCart').focus();}
function closeCart(){$('#cartDrawer').classList.remove('is-open');$('#cartDrawer').setAttribute('aria-hidden','true');$('#cartBackdrop').hidden=true;document.body.classList.remove('drawer-open');if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();}
let toastTimeout;function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('show'),2500);}
function openWhatsApp(message){if(WHATSAPP_NUMBER==='573001234567'||!/^[1-9]\d{9,14}$/.test(WHATSAPP_NUMBER)){toast('Configura tu WhatsApp real en static/app.js');return;}const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;window.open(url,'_blank','noopener,noreferrer');}
function checkout(){const items=PRODUCTS.filter(p=>qty(p.id));if(!items.length){toast('Agrega productos a tu carrito');return;}const lines=items.map(p=>`• ${p.name} x${qty(p.id)} — ${money(p.price*qty(p.id))}`);const total=items.reduce((sum,p)=>sum+p.price*qty(p.id),0);openWhatsApp(`¡Hola, TechStore! 👋 Quisiera consultar este pedido:\n\n${lines.join('\n')}\n\n*Subtotal: ${money(total)}*\n\n¿Me confirman disponibilidad y costo de envío?`);}
document.addEventListener('click',event=>{
 const add=event.target.closest('[data-add]');if(add){addProduct(Number(add.dataset.add));return;}
 const plus=event.target.closest('[data-plus]');if(plus){changeQuantity(Number(plus.dataset.plus),1);return;}
 const minus=event.target.closest('[data-minus]');if(minus){changeQuantity(Number(minus.dataset.minus),-1);return;}
 const remove=event.target.closest('[data-remove]');if(remove){delete cart[remove.dataset.remove];save();renderCart();return;}
 const category=event.target.closest('[data-filter]');if(category){filter=category.dataset.filter;document.querySelectorAll('[data-filter]').forEach(btn=>{const active=btn===category;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});renderProducts();return;}
 if(event.target.closest('#emptyExplore')){closeCart();$('#catalogo').scrollIntoView({behavior:'smooth'});}
});
$('#searchInput').addEventListener('input',event=>{search=event.target.value;renderProducts();});
$('#sortSelect').addEventListener('change',event=>{sort=event.target.value;renderProducts();});
$('#clearFilters').addEventListener('click',()=>{$('#searchInput').value='';search='';document.querySelector('[data-filter="Todos"]').click();});
$('#searchShortcut').addEventListener('click',()=>{$('#catalogo').scrollIntoView({behavior:'smooth'});$('#searchInput').focus({preventScroll:true});});
$('#openCart').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);$('#cartBackdrop').addEventListener('click',closeCart);$('#keepShopping').addEventListener('click',closeCart);$('#checkoutButton').addEventListener('click',checkout);$('#contactButton').addEventListener('click',()=>openWhatsApp('¡Hola, TechStore! 👋 Quisiera recibir información sobre sus productos.'));
document.addEventListener('keydown',event=>{if(!$('#cartDrawer').classList.contains('is-open'))return;if(event.key==='Escape')closeCart();if(event.key==='Tab'){const focusables=[...$('#cartDrawer').querySelectorAll('button:not(:disabled),a[href]')];const first=focusables[0],last=focusables[focusables.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
$('#year').textContent=new Date().getFullYear();renderProducts();renderCart();
