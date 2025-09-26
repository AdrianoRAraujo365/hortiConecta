// script.js - carrinho simples (localStorage) e injeção de produtos
const products = [
  { id:1, name:"Alface Crespa (un)", category:"hortaliças", price:3.50, img:"img/prod_alface.jpg", desc:"Alface orgânica, colheita fresca." },
  { id:2, name:"Tomate Italiano (kg)", category:"hortaliças", price:8.90, img:"img/prod_tomate.jpg", desc:"Tomate orgânico para saladas e molhos." },
  { id:3, name:"Banana Prata (kg)", category:"frutas", price:6.20, img:"img/prod_banana.jpg", desc:"Banana orgânica - unidade da agricultura familiar." },
  { id:4, name:"Cebolinha (maço)", category:"temperos", price:2.80, img:"img/prod_cebolinha.jpg", desc:"Cebolinha fresca e orgânica." },
  { id:5, name:"Morango (caixa)", category:"frutas", price:12.50, img:"img/prod_morango.jpg", desc:"Morango orgânico, embalagem 250g." }
];

// util helpers
const formatBRL = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

// CART (localStorage)
const CART_KEY = 'horticonecta_cart';
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }

function addToCart(productId, qty=1){
  const cart = getCart();
  const item = cart.find(i=>i.id===productId);
  if(item) item.qty += qty;
  else {
    const p = products.find(x=>x.id===productId);
    cart.push({ id: p.id, name: p.name, price: p.price, qty });
  }
  saveCart(cart);
}

// render products grid
function renderProducts(list){
  const grid = $('#product-grid').empty();
  list.forEach(p=>{
    const col = $(`
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card product-card h-100">
          <img src="${p.img}" class="card-img-top" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title mb-1">${p.name}</h6>
            <p class="text-muted small mb-2">${p.category}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <div>
                <div class="price">${formatBRL(p.price)}</div>
              </div>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-secondary btn-view" data-id="${p.id}">Ver</button>
                <button class="btn btn-sm btn-success btn-add" data-id="${p.id}">+ Carrinho</button>
              </div>
            </div>
          </div>
        </div>
      </div>`);
    grid.append(col);
  });
}

// update cart UI (badge + offcanvas list)
function updateCartUI(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  $('#cart-count').text(count);
  const container = $('#cart-items').empty();
  if(cart.length===0){ container.append('<div class="text-muted">Seu carrinho está vazio.</div>'); $('#cart-total').text(formatBRL(0)); return; }
  cart.forEach(i=>{
    const line = $(`<div class="cart-item d-flex justify-content-between align-items-center">
      <div>
        <div class="fw-bold">${i.name}</div>
        <div class="small text-muted">${i.qty} x ${formatBRL(i.price)}</div>
      </div>
      <div class="text-end">
        <div class="fw-bold">${formatBRL(i.qty * i.price)}</div>
        <div class="mt-1">
          <button class="btn btn-sm btn-outline-secondary btn-decrease" data-id="${i.id}">-</button>
          <button class="btn btn-sm btn-outline-secondary btn-increase" data-id="${i.id}">+</button>
          <button class="btn btn-sm btn-danger btn-remove" data-id="${i.id}">x</button>
        </div>
      </div>
    </div>`);
    container.append(line);
  });
  const total = cart.reduce((s,i)=>s + i.qty*i.price, 0);
  $('#cart-total').text(formatBRL(total));
}

// cart item actions (event delegation)
$(document).on('click', '.btn-add', function(){
  const id = Number($(this).data('id'));
  addToCart(id,1);
});
$(document).on('click', '.btn-increase', function(){
  const id = Number($(this).data('id'));
  const cart = getCart(); const item = cart.find(x=>x.id===id); if(item){ item.qty++; saveCart(cart); } 
});
$(document).on('click', '.btn-decrease', function(){
  const id = Number($(this).data('id'));
  const cart = getCart(); const item = cart.find(x=>x.id===id); if(item){ item.qty = Math.max(1, item.qty-1); saveCart(cart); }
});
$(document).on('click', '.btn-remove', function(){
  const id = Number($(this).data('id'));
  let cart = getCart(); cart = cart.filter(x=>x.id!==id); saveCart(cart);
});

// view product -> modal
$(document).on('click', '.btn-view', function(){
  const id = Number($(this).data('id'));
  const p = products.find(x=>x.id===id);
  $('#modal-title').text(p.name);
  $('#modal-img').attr('src', p.img);
  $('#modal-desc').text(p.desc);
  $('#modal-cat').text(p.category);
  $('#modal-price').text(formatBRL(p.price));
  $('#modal-qty').val(1);
  $('#modal-add').data('id', p.id);
  const m = new bootstrap.Modal($('#productModal'));
  m.show();
});
$('#modal-add').on('click', function(){
  const id = Number($(this).data('id'));
  const qty = Math.max(1, Number($('#modal-qty').val()));
  addToCart(id, qty);
  bootstrap.Modal.getInstance($('#productModal')).hide();
});

// category filter
$('#category-filter').on('change', function(){
  const val = $(this).val();
  if(val==='all') renderProducts(products);
  else renderProducts(products.filter(p=>p.category===val));
});

// open cart offcanvas
$('#open-cart').on('click', function(e){
  e.preventDefault();
  const off = new bootstrap.Offcanvas(document.getElementById('cartCanvas'));
  off.show();
});

// checkout (example)
$('#checkout').on('click', function(){
  alert('Exemplo: redirecionar para checkout / integração de pagamento.');
  // limpar carrinho (para demonstração)
  localStorage.removeItem(CART_KEY);
  updateCartUI();
});

// initial render
$(function(){
  renderProducts(products);
  updateCartUI();
});
