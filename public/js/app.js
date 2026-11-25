import { GarmentViewport, AuthPrismScene, renderGarmentSnapshot } from '/js/garment3d.js';

const AUTH_TOKEN_KEY = 'noor_silk_token';

const state = {
  products: [],
  colors: [],
  fabrics: [],
  hardwareFinishes: [],
  activeCategory: 'all',
  searchQuery: '',
  sortAZ: false,
  user: null,
  token: localStorage.getItem(AUTH_TOKEN_KEY) || null,
  studio: {
    productId: null,
    colorId: null,
    fabricId: null,
    hardwareId: null,
    size: null,
    mannequinVisible: true,
    autoRotate: true,
    wireframe: false
  },
  modal: {
    isOpen: false,
    productId: null,
    colorId: null,
    fabricId: null,
    hardwareId: null,
    size: null,
    viewMode: '3d',
    mannequinVisible: true
  },
  heroColorId: 'maroon',
  cart: {
    items: [],
    itemCount: 0,
    subtotal: 0,
    freeShippingRemaining: 7500,
    freeWashBagRemaining: 10000
  }
};

let heroViewport = null;
let studioViewport = null;
let modalViewport = null;
let relatedViewports = [];
let cardViewports = [];
let authPrismScene = null;
let welcomePrismScene = null;

const WELCOME_SEEN_KEY = 'noor_silk_welcome_seen';

const els = {
  heroCanvas: document.getElementById('heroCanvas'),
  heroStageCard: document.getElementById('heroStageCard'),
  heroPhotoThumbs: document.getElementById('heroPhotoThumbs'),
  heroSwatchStrip: document.getElementById('heroSwatchStrip'),
  heroCustomizeBtn: document.getElementById('heroCustomizeBtn'),

  lookbookStrip: document.getElementById('lookbookStrip'),

  studioCanvas: document.getElementById('studioCanvas'),
  studioCanvasWrap: document.getElementById('studioCanvasWrap'),
  studioProductPills: document.getElementById('studioProductPills'),
  studioPhotoPreview: document.getElementById('studioPhotoPreview'),
  liveSpecSwatch: document.getElementById('liveSpecSwatch'),
  liveSpecText: document.getElementById('liveSpecText'),
  toggleMannequinBtn: document.getElementById('toggleMannequinBtn'),
  toggleRotateBtn: document.getElementById('toggleRotateBtn'),
  toggleSeamsBtn: document.getElementById('toggleSeamsBtn'),

  studioBadge: document.getElementById('studioBadge'),
  studioRating: document.getElementById('studioRating'),
  studioTitle: document.getElementById('studioTitle'),
  studioSubtitle: document.getElementById('studioSubtitle'),
  studioPrice: document.getElementById('studioPrice'),
  studioDescription: document.getElementById('studioDescription'),
  studioColorSwatches: document.getElementById('studioColorSwatches'),
  selectedColorName: document.getElementById('selectedColorName'),
  studioFabricOptions: document.getElementById('studioFabricOptions'),
  selectedFabricName: document.getElementById('selectedFabricName'),
  studioHardwareOptions: document.getElementById('studioHardwareOptions'),
  selectedHardwareName: document.getElementById('selectedHardwareName'),
  studioSizeOptions: document.getElementById('studioSizeOptions'),
  studioFitNote: document.getElementById('studioFitNote'),
  studioDetailsList: document.getElementById('studioDetailsList'),
  addToBagBtn: document.getElementById('addToBagBtn'),
  addToBagPrice: document.getElementById('addToBagPrice'),

  categoryFilters: document.getElementById('categoryFilters'),
  collectionGrid: document.getElementById('collectionGrid'),
  catalogSearchInput: document.getElementById('catalogSearchInput'),
  azSortBtn: document.getElementById('azSortBtn'),

  // Item Detail Modal + Related 3D Motion
  itemModalBackdrop: document.getElementById('itemModalBackdrop'),
  closeItemModalBtn: document.getElementById('closeItemModalBtn'),
  modal3dWrap: document.getElementById('modal3dWrap'),
  modal3dCanvas: document.getElementById('modal3dCanvas'),
  modalRealPhoto: document.getElementById('modalRealPhoto'),
  modalView3dBtn: document.getElementById('modalView3dBtn'),
  modalViewPhotoBtn: document.getElementById('modalViewPhotoBtn'),
  modalFormToggleBtn: document.getElementById('modalFormToggleBtn'),
  modalLiveShadeText: document.getElementById('modalLiveShadeText'),
  modalBadge: document.getElementById('modalBadge'),
  modalRating: document.getElementById('modalRating'),
  modalItemTitle: document.getElementById('modalItemTitle'),
  modalItemSubtitle: document.getElementById('modalItemSubtitle'),
  modalItemPrice: document.getElementById('modalItemPrice'),
  modalItemDesc: document.getElementById('modalItemDesc'),
  modalColorName: document.getElementById('modalColorName'),
  modalColorSwatches: document.getElementById('modalColorSwatches'),
  modalFabricName: document.getElementById('modalFabricName'),
  modalFabricOptions: document.getElementById('modalFabricOptions'),
  modalSizeOptions: document.getElementById('modalSizeOptions'),
  modalSizeGuideBtn: document.getElementById('modalSizeGuideBtn'),
  modalAddToBagBtn: document.getElementById('modalAddToBagBtn'),
  modalAddPrice: document.getElementById('modalAddPrice'),
  modalOpenInStudioBtn: document.getElementById('modalOpenInStudioBtn'),
  related3dGrid: document.getElementById('related3dGrid'),

  cartBadge: document.getElementById('cartBadge'),
  openCartBtn: document.getElementById('openCartBtn'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartBackdrop: document.getElementById('cartBackdrop'),
  cartDrawer: document.getElementById('cartDrawer'),
  perkProgress: document.getElementById('perkProgress'),
  cartItemsContainer: document.getElementById('cartItemsContainer'),
  cartFooter: document.getElementById('cartFooter'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartDiscount: document.getElementById('cartDiscount'),
  cartShipping: document.getElementById('cartShipping'),
  cartTotal: document.getElementById('cartTotal'),
  proceedCheckoutBtn: document.getElementById('proceedCheckoutBtn'),
  checkoutForm: document.getElementById('checkoutForm'),
  backToBagBtn: document.getElementById('backToBagBtn'),
  orderConfirmation: document.getElementById('orderConfirmation'),

  studioOriginalPrice: document.getElementById('studioOriginalPrice'),
  modalOriginalPrice: document.getElementById('modalOriginalPrice'),

  openOrdersBtn: document.getElementById('openOrdersBtn'),
  ordersModalBackdrop: document.getElementById('ordersModalBackdrop'),
  closeOrdersModalBtn: document.getElementById('closeOrdersModalBtn'),
  ordersListContainer: document.getElementById('ordersListContainer'),

  welcomeOverlay: document.getElementById('welcomeOverlay'),
  welcome3dCanvas: document.getElementById('welcome3dCanvas'),
  enterAtelierBtn: document.getElementById('enterAtelierBtn'),
  welcomeSignInBtn: document.getElementById('welcomeSignInBtn'),
  replayWelcomeBtn: document.getElementById('replayWelcomeBtn'),

  sizeModalBackdrop: document.getElementById('sizeModalBackdrop'),
  openSizeFinderBtn: document.getElementById('openSizeFinderBtn'),
  openSizeFinderNav: document.getElementById('openSizeFinderNav'),
  studioSizeGuideBtn: document.getElementById('studioSizeGuideBtn'),
  footerSizeBtn: document.getElementById('footerSizeBtn'),
  closeSizeModalBtn: document.getElementById('closeSizeModalBtn'),
  sizeFinderForm: document.getElementById('sizeFinderForm'),
  sizeResultBox: document.getElementById('sizeResultBox'),

  // 3D Auth Login
  openAuthBtn: document.getElementById('openAuthBtn'),
  memberAvatar: document.getElementById('memberAvatar'),
  memberBtnLabel: document.getElementById('memberBtnLabel'),
  authModalBackdrop: document.getElementById('authModalBackdrop'),
  closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
  auth3dStage: document.getElementById('auth3dStage'),
  auth3dCanvas: document.getElementById('auth3dCanvas'),
  authGlassCard: document.getElementById('authGlassCard'),
  authThemeOrbs: document.getElementById('authThemeOrbs'),
  authFormsWrap: document.getElementById('authFormsWrap'),
  authTabLogin: document.getElementById('authTabLogin'),
  authTabRegister: document.getElementById('authTabRegister'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  demoLoginBtn: document.getElementById('demoLoginBtn'),
  authProfileView: document.getElementById('authProfileView'),
  profileTierLabel: document.getElementById('profileTierLabel'),
  profileNameHeading: document.getElementById('profileNameHeading'),
  profileEmailSub: document.getElementById('profileEmailSub'),
  profileSizeVal: document.getElementById('profileSizeVal'),
  profileCityVal: document.getElementById('profileCityVal'),
  profileContinueBtn: document.getElementById('profileContinueBtn'),
  logoutBtn: document.getElementById('logoutBtn'),

  toast: document.getElementById('toast')
};

function formatPKR(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}

function applyDiscount10(price) {
  return Math.round(Number(price) * 0.9);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove('visible');
  }, 2800);
}

function getProduct(id) {
  return state.products.find((p) => p.id === id) || state.products[0];
}

function getColor(id) {
  return state.colors.find((c) => c.id === id) || state.colors[0];
}

function getFabric(id) {
  return state.fabrics.find((f) => f.id === id) || state.fabrics[0];
}

function getHardware(id) {
  return state.hardwareFinishes.find((h) => h.id === id) || state.hardwareFinishes[0];
}

function getBottleLabel(product) {
  if (!product || product.modelType !== 'perfume-bottle') return '';
  return product.name.split(' ')[0].replace(/-Style/i, '').toUpperCase();
}

function renderHeroThumbsAndLookbook() {
  els.heroPhotoThumbs.innerHTML = state.products
    .slice(0, 5)
    .map(
      (p) =>
        `<img class="hero-thumb-img" src="${p.image}" alt="${p.name}" title="${p.name}" />`
    )
    .join('');

  // Pick 6 diverse visual highlights across Bridal Clothes, Nighty, Bra, Panty, Set, & Lehenga
  const lookbookFeaturedIds = [
    'zardozi-bridal-lehenga',
    'rani-nighty-robe-set',
    'mehreen-bridal-set',
    'haya-cotton-bralette',
    'lace-hipster-panty-trio',
    'noor-nikkah-chemise'
  ];
  const lookbookItems = lookbookFeaturedIds
    .map((id) => state.products.find((p) => p.id === id))
    .filter(Boolean);

  els.lookbookStrip.innerHTML = lookbookItems
    .map((p) => {
      const defColor = getColor(p.defaultColor);
      return `<button type="button" class="lookbook-tile" data-open-item="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <div class="lookbook-caption">
          <strong>${p.badge}</strong>
          <span>${defColor.name} &bull; ${formatPKR(applyDiscount10(p.price))}</span>
        </div>
      </button>`;
    })
    .join('');

  els.lookbookStrip.querySelectorAll('[data-open-item]').forEach((tile) => {
    tile.addEventListener('click', () => openItemModal(tile.dataset.openItem));
  });
}

function renderHeroStage() {
  if (!heroViewport) {
    heroViewport = new GarmentViewport(els.heroCanvas, {
      autoRotate: true,
      autoRotateSpeed: 0.95,
      showMannequin: true
    });
  }
  const heroProduct =
    state.products.find((p) => p.id === 'mehreen-bridal-set') || state.products[0];
  const color = getColor(state.heroColorId);
  const fabric = getFabric('mulberry-silk');
  const hardware = getHardware('champagne-gold');

  els.heroStageCard.style.setProperty('--hero-aura', color.aura || 'rgba(217,38,107,0.22)');

  heroViewport.renderGarment({
    modelType: heroProduct.modelType,
    color,
    fabric,
    hardware
  });

  els.heroSwatchStrip.innerHTML = state.colors
    .map(
      (c) => `<button
        type="button"
        class="hero-swatch-dot ${c.id === state.heroColorId ? 'active' : ''}"
        style="background:${c.hex}"
        title="${c.name}"
        data-hero-color="${c.id}"
        aria-label="Preview ${c.name}"
      ></button>`
    )
    .join('');

  els.heroSwatchStrip.querySelectorAll('[data-hero-color]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.heroColorId = btn.dataset.heroColor;
      renderHeroStage();
    });
  });
}

function selectProductInStudio(productId, scrollIntoView = false, animateTransition = true) {
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;

  state.studio.productId = product.id;
  state.studio.colorId = product.defaultColor;
  state.studio.fabricId = product.defaultFabric;
  state.studio.hardwareId = product.defaultHardware;
  state.studio.size = product.sizes[Math.min(2, product.sizes.length - 1)];

  renderStudio(animateTransition);

  if (scrollIntoView) {
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
  }
}

function renderStudio(animateTransition = false) {
  const product = getProduct(state.studio.productId);
  if (!product) return;

  const color = getColor(state.studio.colorId);
  const fabric = getFabric(state.studio.fabricId);
  const hardware = getHardware(state.studio.hardwareId);

  if (!studioViewport) {
    studioViewport = new GarmentViewport(els.studioCanvas, {
      autoRotate: state.studio.autoRotate,
      autoRotateSpeed: 0.9,
      showMannequin: state.studio.mannequinVisible
    });
  }

  els.studioCanvasWrap.style.setProperty('--studio-aura', color.aura || 'rgba(217,38,107,0.22)');

  studioViewport.renderGarment({
    modelType: product.modelType,
    color,
    fabric,
    hardware,
    labelText: getBottleLabel(product),
    animateTransition
  });

  els.studioProductPills.innerHTML = state.products
    .map(
      (p) => `<button
        type="button"
        class="studio-pill ${p.id === product.id ? 'active' : ''}"
        data-studio-product="${p.id}"
      >
        <img class="studio-pill-thumb" src="${p.image}" alt="" />
        <span>${p.name.split('(')[0].trim().split(' ').slice(0, 2).join(' ')}</span>
      </button>`
    )
    .join('');

  els.studioProductPills.querySelectorAll('[data-studio-product]').forEach((btn) => {
    btn.addEventListener('click', () => selectProductInStudio(btn.dataset.studioProduct, false, true));
  });

  els.liveSpecSwatch.style.background = color.hex;
  els.liveSpecText.textContent = `${color.name} • ${fabric.name}`;
  els.studioPhotoPreview.src = product.image;
  els.studioPhotoPreview.alt = product.name;

  els.studioBadge.textContent = product.badge;
  els.studioRating.textContent = `★ ${product.rating} (${product.reviewCount})`;
  els.studioTitle.textContent = product.name;
  els.studioSubtitle.textContent = product.subtitle;
  els.studioPrice.textContent = formatPKR(applyDiscount10(product.price));
  els.studioOriginalPrice.textContent = formatPKR(product.price);
  els.addToBagPrice.textContent = formatPKR(applyDiscount10(product.price));
  els.studioDescription.textContent = product.description;
  els.studioFitNote.textContent = product.fitNote;
  els.studioDetailsList.innerHTML = product.details.map((d) => `<li>${d}</li>`).join('');

  els.selectedColorName.textContent = color.name;
  els.studioColorSwatches.innerHTML = state.colors
    .map(
      (c) => `<button
        type="button"
        class="swatch-btn ${c.id === color.id ? 'active' : ''}"
        style="background:${c.hex}"
        title="${c.name}"
        data-color-id="${c.id}"
        aria-label="${c.name}"
      ></button>`
    )
    .join('');

  els.studioColorSwatches.querySelectorAll('[data-color-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.studio.colorId = btn.dataset.colorId;
      renderStudio(false);
    });
  });

  els.selectedFabricName.textContent = fabric.name;
  els.studioFabricOptions.innerHTML = state.fabrics
    .map(
      (f) => `<button
        type="button"
        class="fabric-btn ${f.id === fabric.id ? 'active' : ''}"
        data-fabric-id="${f.id}"
      >
        <strong>${f.shortName}</strong>
        <span>${f.pattern === 'lace' ? 'Bridal weave' : f.pattern === 'mesh' ? 'Airy lift' : f.pattern === 'silk' ? 'Liquid silk' : 'Cooling knit'}</span>
      </button>`
    )
    .join('');

  els.studioFabricOptions.querySelectorAll('[data-fabric-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.studio.fabricId = btn.dataset.fabricId;
      renderStudio(false);
    });
  });

  els.selectedHardwareName.textContent = hardware.name;
  els.studioHardwareOptions.innerHTML = state.hardwareFinishes
    .map(
      (h) => `<button
        type="button"
        class="hardware-btn ${h.id === hardware.id ? 'active' : ''}"
        data-hardware-id="${h.id}"
      >
        <span class="hardware-chip" style="background:${h.hex}"></span>
        <span>${h.name}</span>
      </button>`
    )
    .join('');

  els.studioHardwareOptions.querySelectorAll('[data-hardware-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.studio.hardwareId = btn.dataset.hardwareId;
      renderStudio(false);
    });
  });

  els.studioSizeOptions.innerHTML = product.sizes
    .map(
      (s) => `<button
        type="button"
        class="size-btn ${s === state.studio.size ? 'active' : ''}"
        data-size="${s}"
      >${s}</button>`
    )
    .join('');

  els.studioSizeOptions.querySelectorAll('[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.studio.size = btn.dataset.size;
      renderStudio(false);
    });
  });
}

function disposeCardViewports() {
  cardViewports.forEach((vp) => vp.dispose());
  cardViewports = [];
}

function renderCollection() {
  disposeCardViewports();

  let filtered =
    state.activeCategory === 'all'
      ? [...state.products]
      : state.products.filter((p) => p.category === state.activeCategory);

  if (state.searchQuery.trim()) {
    const term = state.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.subtitle.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.badge.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  if (state.sortAZ) {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (filtered.length === 0) {
    els.collectionGrid.innerHTML =
      '<div class="cart-empty" style="grid-column:1/-1"><p>No matching pieces found. Try searching "nighty", "bra", "panty", "lehenga", "khussa", or "sandal".</p></div>';
    return;
  }

  els.collectionGrid.innerHTML = filtered
    .map((p) => {
      const defColor = getColor(p.defaultColor);
      return `<article class="product-card" data-card-product="${p.id}">
        <div class="card-visual">
          <img class="card-product-photo" id="cardImg_${p.id}" src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="card-visual-scrim">
            <div class="card-visual-top">
              <span class="badge-tag">${p.badge}</span>
              <span class="card-rating-glass">★ ${p.rating}</span>
            </div>
            <div class="card-visual-bottom">
              <span class="card-shade-tag">${defColor.name}</span>
              <button type="button" class="view-3d-btn" data-open-item="${p.id}">Open 3D View</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3>${p.name}</h3>
            <div style="text-align:right">
              <span class="card-price">${formatPKR(applyDiscount10(p.price))}</span>
              <span class="price-original" style="display:block;font-size:0.74rem">${formatPKR(p.price)}</span>
            </div>
          </div>
          <p class="card-sub">${p.subtitle}</p>
          <div class="card-swatches">
            ${state.colors
              .map(
                (c) =>
                  `<span class="card-swatch-mini" style="background:${c.hex}" title="${c.name}"></span>`
              )
              .join('')}
          </div>
          <div class="card-actions">
            <button type="button" class="btn-secondary full-width" data-quick-add="${p.id}">
              Quick Add (${p.sizes[1] || p.sizes[0]})
            </button>
          </div>
        </div>
      </article>`;
    })
    .join('');

  // Render real 3D studio snapshots on preferLive3d cards using 1 shared WebGL context (never exhausts GPU contexts!)
  filtered
    .filter((p) => p.preferLive3d)
    .forEach((p) => {
      const imgEl = document.getElementById(`cardImg_${p.id}`);
      if (!imgEl) return;
      try {
        const snapUrl = renderGarmentSnapshot({
          modelType: p.modelType,
          color: getColor(p.defaultColor),
          fabric: getFabric(p.defaultFabric),
          hardware: getHardware(p.defaultHardware),
          labelText: getBottleLabel(p)
        });
        imgEl.src = snapUrl;
      } catch {
        // Keep clean SVG fallback if WebGL unavailable
      }
    });

  // Clicking anywhere on a product card opens its 3D Item Modal + Related 3D Motion Items
  els.collectionGrid.querySelectorAll('[data-card-product]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-add]')) return;
      openItemModal(card.dataset.cardProduct);
    });
  });

  els.collectionGrid.querySelectorAll('[data-quick-add]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const p = getProduct(btn.dataset.quickAdd);
      if (!p) return;
      await addToCart({
        productId: p.id,
        size: p.sizes[1] || p.sizes[0],
        colorId: p.defaultColor,
        fabricId: p.defaultFabric,
        hardwareId: p.defaultHardware
      });
    });
  });
}

// ---------- Opened Item Modal + Related Items in Live 3D Motion ----------
function disposeRelatedViewports() {
  relatedViewports.forEach((vp) => vp.dispose());
  relatedViewports = [];
}

async function openItemModal(productId, overrideColorId = null) {
  let product = getProduct(productId);
  let related = [];

  try {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
    if (res.ok) {
      const data = await res.json();
      product = data.product;
      related = data.related;
    }
  } catch {
    related = state.products.filter((p) => p.id !== productId).slice(0, 4);
  }

  state.modal.isOpen = true;
  state.modal.productId = product.id;
  state.modal.colorId = overrideColorId || product.defaultColor;
  state.modal.fabricId = product.defaultFabric;
  state.modal.hardwareId = product.defaultHardware;
  state.modal.size = product.sizes[Math.min(2, product.sizes.length - 1)];
  state.modal.viewMode = '3d';

  els.itemModalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  renderItemModal(true);
  renderRelated3DMotion(related);
}

function closeItemModal() {
  state.modal.isOpen = false;
  els.itemModalBackdrop.hidden = true;
  document.body.style.overflow = '';
  disposeRelatedViewports();
  if (modalViewport) {
    modalViewport.dispose();
    modalViewport = null;
  }
}

function renderItemModal(animateTransition = false) {
  const product = getProduct(state.modal.productId);
  const color = getColor(state.modal.colorId);
  const fabric = getFabric(state.modal.fabricId);
  const hardware = getHardware(state.modal.hardwareId);

  els.modal3dWrap.style.setProperty('--modal-aura', color.aura || 'rgba(217,38,107,0.22)');

  const is3d = state.modal.viewMode === '3d';
  els.modalView3dBtn.classList.toggle('active', is3d);
  els.modalViewPhotoBtn.classList.toggle('active', !is3d);
  els.modal3dCanvas.hidden = !is3d;
  els.modalRealPhoto.hidden = is3d;
  els.modalRealPhoto.src = product.image;
  els.modalRealPhoto.alt = product.name;

  if (is3d) {
    if (!modalViewport) {
      modalViewport = new GarmentViewport(els.modal3dCanvas, {
        autoRotate: true,
        autoRotateSpeed: 1.35,
        showMannequin: state.modal.mannequinVisible
      });
    }
    modalViewport.setMannequinVisible(state.modal.mannequinVisible);
    modalViewport.renderGarment({
      modelType: product.modelType,
      color,
      fabric,
      hardware,
      labelText: getBottleLabel(product),
      animateTransition
    });
  }

  els.modalLiveShadeText.textContent = is3d
    ? `${color.name} • ${fabric.shortName} • Drag to rotate 360°`
    : `${product.name} • Real Atelier Photo`;

  els.modalBadge.textContent = product.badge;
  els.modalRating.textContent = `★ ${product.rating} (${product.reviewCount})`;
  els.modalItemTitle.textContent = product.name;
  els.modalItemSubtitle.textContent = product.subtitle;
  els.modalItemPrice.textContent = formatPKR(applyDiscount10(product.price));
  els.modalOriginalPrice.textContent = formatPKR(product.price);
  els.modalAddPrice.textContent = formatPKR(applyDiscount10(product.price));
  els.modalItemDesc.textContent = product.description;

  els.modalColorName.textContent = color.name;
  els.modalColorSwatches.innerHTML = state.colors
    .map(
      (c) => `<button
        type="button"
        class="swatch-btn ${c.id === color.id ? 'active' : ''}"
        style="background:${c.hex}"
        title="${c.name}"
        data-modal-color="${c.id}"
      ></button>`
    )
    .join('');
  els.modalColorSwatches.querySelectorAll('[data-modal-color]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.modal.colorId = btn.dataset.modalColor;
      state.modal.viewMode = '3d';
      renderItemModal(false);
    });
  });

  els.modalFabricName.textContent = fabric.name;
  els.modalFabricOptions.innerHTML = state.fabrics
    .map(
      (f) => `<button
        type="button"
        class="fabric-btn ${f.id === fabric.id ? 'active' : ''}"
        data-modal-fabric="${f.id}"
      >
        <strong>${f.shortName}</strong>
        <span>${f.pattern === 'silk' ? 'Iridescent' : f.pattern === 'lace' ? 'Floral lace' : f.pattern === 'mesh' ? 'Sheer lift' : 'Cooling'}</span>
      </button>`
    )
    .join('');
  els.modalFabricOptions.querySelectorAll('[data-modal-fabric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.modal.fabricId = btn.dataset.modalFabric;
      state.modal.viewMode = '3d';
      renderItemModal(false);
    });
  });

  els.modalSizeOptions.innerHTML = product.sizes
    .map(
      (s) => `<button
        type="button"
        class="size-btn ${s === state.modal.size ? 'active' : ''}"
        data-modal-size="${s}"
      >${s}</button>`
    )
    .join('');
  els.modalSizeOptions.querySelectorAll('[data-modal-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.modal.size = btn.dataset.modalSize;
      renderItemModal(false);
    });
  });
}

function renderRelated3DMotion(relatedProducts) {
  disposeRelatedViewports();

  els.related3dGrid.innerHTML = relatedProducts
    .map((rp, idx) => {
      const c = getColor(rp.defaultColor);
      return `<button type="button" class="related-3d-card" data-related-id="${rp.id}">
        <div class="related-canvas-box" style="--rel-aura:${c.aura || 'rgba(217,38,107,0.18)'}">
          <canvas class="three-canvas" id="relatedCanvas_${idx}"></canvas>
          <span class="related-3d-badge">3D Live</span>
        </div>
        <div class="related-3d-meta">
          <strong>${rp.name}</strong>
          <span>${formatPKR(applyDiscount10(rp.price))} <s style="color:var(--ink-muted);font-weight:400">${formatPKR(rp.price)}</s> &bull; 10% OFF</span>
        </div>
      </button>`;
    })
    .join('');

  relatedProducts.forEach((rp, idx) => {
    const canvas = document.getElementById(`relatedCanvas_${idx}`);
    if (!canvas) return;
    const vp = new GarmentViewport(canvas, {
      compact: true,
      autoRotate: true,
      autoRotateSpeed: 2.3 + idx * 0.25,
      showMannequin: false,
      motionPhase: idx * 1.4
    });
    vp.renderGarment({
      modelType: rp.modelType,
      color: getColor(rp.defaultColor),
      fabric: getFabric(rp.defaultFabric),
      hardware: getHardware(rp.defaultHardware),
      labelText: getBottleLabel(rp),
      animateTransition: true
    });
    relatedViewports.push(vp);
  });

  els.related3dGrid.querySelectorAll('[data-related-id]').forEach((card) => {
    card.addEventListener('click', () => {
      openItemModal(card.dataset.relatedId);
      document.querySelector('.item-detail-modal')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ---------- Cart & Checkout ----------
async function fetchCart() {
  const res = await fetch('/api/cart');
  state.cart = await res.json();
  renderCart();
}

async function addToCart(payload) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showToast(err.error || 'Could not add item to bag');
    return;
  }
  state.cart = await res.json();
  renderCart();
  openCartDrawer();
  showToast('Added to your Discreet Atelier Bag');
}

async function updateCartQty(itemId, quantity) {
  const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  state.cart = await res.json();
  renderCart();
}

async function removeCartItem(itemId) {
  const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
    method: 'DELETE'
  });
  state.cart = await res.json();
  renderCart();
}

function renderCart() {
  els.cartBadge.textContent = state.cart.itemCount;
  const discountedSub = state.cart.discountedSubtotal ?? state.cart.subtotal;
  const discountAmt = state.cart.discountAmount ?? 0;
  const shippingFee = state.cart.shippingFee ?? 0;
  const finalTotal = state.cart.total ?? discountedSub;

  els.cartSubtotal.textContent = formatPKR(state.cart.subtotal);
  els.cartDiscount.textContent = `-${formatPKR(discountAmt)}`;
  els.cartShipping.textContent = shippingFee === 0 ? 'Free' : formatPKR(shippingFee);
  els.cartTotal.textContent = formatPKR(finalTotal);

  const progressPct = Math.min(100, Math.round((discountedSub / 10000) * 100));
  const perkMsg =
    discountedSub >= 10000
      ? '10% OFF + Free nationwide delivery & silk potli wash pouch unlocked!'
      : discountedSub >= 7500
      ? `10% OFF + Free delivery unlocked! Add ${formatPKR(state.cart.freeWashBagRemaining)} more for a free silk potli pouch.`
      : `10% OFF applied! Add ${formatPKR(state.cart.freeShippingRemaining)} for free nationwide delivery.`;

  els.perkProgress.innerHTML = `
    <div>${perkMsg}</div>
    <div class="perk-bar-track"><div class="perk-bar-fill" style="width:${progressPct}%"></div></div>
  `;

  if (state.cart.items.length === 0) {
    els.cartItemsContainer.innerHTML =
      '<div class="cart-empty"><p>Your atelier bag is currently empty.</p><p style="font-size:0.84rem">Click any piece to inspect in 3D and add it to your bag.</p></div>';
    els.proceedCheckoutBtn.disabled = true;
    els.proceedCheckoutBtn.style.opacity = '0.5';
    return;
  }

  els.proceedCheckoutBtn.disabled = false;
  els.proceedCheckoutBtn.style.opacity = '1';

  els.cartItemsContainer.innerHTML = state.cart.items
    .map((item) => {
      const prod = getProduct(item.productId);
      const imgSrc = item.image || prod.image;
      return `<div class="cart-item-card">
        <div class="cart-item-left">
          <img class="cart-item-thumb" src="${imgSrc}" alt="${item.name}" />
          <div>
            <strong style="font-family:var(--font-serif);font-size:1.1rem">${item.name}</strong>
            <div class="cart-item-meta">
              <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${item.colorHex};margin-right:4px;vertical-align:middle"></span>
              ${item.colorName} &bull; ${item.fabricName} &bull; ${item.size}
            </div>
            <div class="cart-item-meta">${item.hardwareName}</div>
            <div class="cart-qty-row">
              <button type="button" class="qty-btn" data-qty-dec="${item.itemId}">-</button>
              <span>${item.quantity}</span>
              <button type="button" class="qty-btn" data-qty-inc="${item.itemId}">+</button>
              <button type="button" class="remove-item-btn" data-remove-item="${item.itemId}">Remove</button>
            </div>
          </div>
        </div>
        <div style="font-weight:700;color:var(--accent);white-space:nowrap">${formatPKR(item.price * item.quantity)}</div>
      </div>`;
    })
    .join('');

  els.cartItemsContainer.querySelectorAll('[data-qty-dec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = state.cart.items.find((i) => i.itemId === btn.dataset.qtyDec);
      if (item) updateCartQty(item.itemId, item.quantity - 1);
    });
  });

  els.cartItemsContainer.querySelectorAll('[data-qty-inc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = state.cart.items.find((i) => i.itemId === btn.dataset.qtyInc);
      if (item) updateCartQty(item.itemId, item.quantity + 1);
    });
  });

  els.cartItemsContainer.querySelectorAll('[data-remove-item]').forEach((btn) => {
    btn.addEventListener('click', () => removeCartItem(btn.dataset.removeItem));
  });
}

function openCartDrawer() {
  els.orderConfirmation.hidden = true;
  els.checkoutForm.hidden = true;
  els.cartItemsContainer.hidden = false;
  els.cartFooter.hidden = false;
  els.cartBackdrop.hidden = false;
  els.cartDrawer.classList.add('open');
  els.cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCartDrawer() {
  els.cartDrawer.classList.remove('open');
  els.cartDrawer.setAttribute('aria-hidden', 'true');
  els.cartBackdrop.hidden = true;
}

function openWelcomeOverlay(force = false) {
  if (!force && sessionStorage.getItem(WELCOME_SEEN_KEY) === '1') {
    els.welcomeOverlay.hidden = true;
    return;
  }
  els.welcomeOverlay.hidden = false;
  els.welcomeOverlay.classList.remove('leaving');
  document.body.style.overflow = 'hidden';

  if (!welcomePrismScene && els.welcome3dCanvas) {
    welcomePrismScene = new AuthPrismScene(els.welcome3dCanvas);
    welcomePrismScene.setThemeColor('#8E1632', '#F48FA3');
  }
}

function dismissWelcomeOverlay(targetCategory = null) {
  sessionStorage.setItem(WELCOME_SEEN_KEY, '1');
  els.welcomeOverlay.classList.add('leaving');
  document.body.style.overflow = '';

  setTimeout(() => {
    els.welcomeOverlay.hidden = true;
    if (welcomePrismScene) {
      welcomePrismScene.dispose();
      welcomePrismScene = null;
    }
  }, 420);

  if (targetCategory) {
    state.activeCategory = targetCategory;
    els.categoryFilters.querySelectorAll('.filter-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.category === targetCategory);
    });
    renderCollection();
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function openSizeModal() {
  els.sizeModalBackdrop.hidden = false;
}

function closeSizeModal() {
  els.sizeModalBackdrop.hidden = true;
}

// ---------- 3D Aesthetic Login & Member Atelier ----------
function updateMemberUI() {
  if (state.user) {
    const firstName = state.user.name.split(' ')[0];
    els.memberAvatar.textContent = firstName.charAt(0).toUpperCase();
    els.memberBtnLabel.textContent = `${firstName} • ${state.user.city}`;
    els.authFormsWrap.hidden = true;
    els.authProfileView.hidden = false;
    els.profileTierLabel.textContent = (state.user.tier || 'Atelier Member').toUpperCase();
    els.profileNameHeading.textContent = state.user.name;
    els.profileEmailSub.textContent = `${state.user.email}${state.user.phone ? ' • ' + state.user.phone : ''}`;
    els.profileSizeVal.textContent = state.user.preferredSize || '34C / M';
    els.profileCityVal.textContent = state.user.city || 'Lahore';

    // Pre-fill Pakistan COD checkout details
    const nameInput = els.checkoutForm.querySelector('[name="customerName"]');
    const phoneInput = els.checkoutForm.querySelector('[name="phone"]');
    const citySelect = els.checkoutForm.querySelector('[name="city"]');
    if (nameInput && !nameInput.value) nameInput.value = state.user.name;
    if (phoneInput && !phoneInput.value && state.user.phone) phoneInput.value = state.user.phone;
    if (citySelect && state.user.city) citySelect.value = state.user.city;
  } else {
    els.memberAvatar.textContent = '✦';
    els.memberBtnLabel.textContent = 'Member Sign In';
    els.authFormsWrap.hidden = false;
    els.authProfileView.hidden = true;
  }
}

function openAuthModal(defaultTab = 'login') {
  els.authModalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  if (defaultTab === 'register') {
    els.authTabRegister.classList.add('active');
    els.authTabLogin.classList.remove('active');
    els.loginForm.hidden = true;
    els.registerForm.hidden = false;
  } else {
    els.authTabLogin.classList.add('active');
    els.authTabRegister.classList.remove('active');
    els.loginForm.hidden = false;
    els.registerForm.hidden = true;
  }

  updateMemberUI();

  if (!authPrismScene) {
    authPrismScene = new AuthPrismScene(els.auth3dCanvas);
  }
}

function closeAuthModal() {
  els.authModalBackdrop.hidden = true;
  document.body.style.overflow = '';
  if (authPrismScene) {
    authPrismScene.dispose();
    authPrismScene = null;
  }
}

async function restoreSession() {
  if (!state.token) {
    updateMemberUI();
    return;
  }
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    if (!res.ok) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      const data = await res.json();
      state.user = data.user;
    }
  } catch {
    state.user = null;
  }
  updateMemberUI();
}

async function handleAuthSuccess(data, greeting) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  updateMemberUI();
  showToast(greeting);
}

function bindEvents() {
  els.heroCustomizeBtn.addEventListener('click', () => {
    openItemModal('mehreen-bridal-set', state.heroColorId);
  });

  // Modal controls
  els.closeItemModalBtn.addEventListener('click', closeItemModal);
  els.itemModalBackdrop.addEventListener('click', (e) => {
    if (e.target === els.itemModalBackdrop) closeItemModal();
  });

  els.modalView3dBtn.addEventListener('click', () => {
    state.modal.viewMode = '3d';
    renderItemModal(true);
  });
  els.modalViewPhotoBtn.addEventListener('click', () => {
    state.modal.viewMode = 'photo';
    renderItemModal(false);
  });

  document.querySelectorAll('[data-modal-cam]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-modal-cam]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.modal.viewMode = '3d';
      renderItemModal(false);
      modalViewport?.setCameraPreset(btn.dataset.modalCam);
    });
  });

  els.modalFormToggleBtn.addEventListener('click', () => {
    state.modal.mannequinVisible = !state.modal.mannequinVisible;
    els.modalFormToggleBtn.classList.toggle('active', !state.modal.mannequinVisible);
    els.modalFormToggleBtn.textContent = state.modal.mannequinVisible ? 'Ghost' : 'Form';
    modalViewport?.setMannequinVisible(state.modal.mannequinVisible);
  });

  els.modalAddToBagBtn.addEventListener('click', () => {
    addToCart({
      productId: state.modal.productId,
      size: state.modal.size,
      colorId: state.modal.colorId,
      fabricId: state.modal.fabricId,
      hardwareId: state.modal.hardwareId
    });
  });

  els.modalOpenInStudioBtn.addEventListener('click', () => {
    const pid = state.modal.productId;
    const cid = state.modal.colorId;
    const fid = state.modal.fabricId;
    const sz = state.modal.size;
    closeItemModal();
    selectProductInStudio(pid, true, true);
    state.studio.colorId = cid;
    state.studio.fabricId = fid;
    state.studio.size = sz;
    renderStudio(true);
  });

  els.modalSizeGuideBtn.addEventListener('click', openSizeModal);

  // Studio viewport controls
  els.toggleMannequinBtn.addEventListener('click', () => {
    state.studio.mannequinVisible = !state.studio.mannequinVisible;
    studioViewport?.setMannequinVisible(state.studio.mannequinVisible);
    els.toggleMannequinBtn.classList.toggle('active', state.studio.mannequinVisible);
    els.toggleMannequinBtn.textContent = state.studio.mannequinVisible ? 'Form: On' : 'Ghost Mode';
  });

  els.toggleRotateBtn.addEventListener('click', () => {
    state.studio.autoRotate = !state.studio.autoRotate;
    studioViewport?.setAutoRotate(state.studio.autoRotate);
    els.toggleRotateBtn.classList.toggle('active', state.studio.autoRotate);
    els.toggleRotateBtn.textContent = state.studio.autoRotate ? 'Turntable: On' : 'Turntable: Off';
  });

  els.toggleSeamsBtn.addEventListener('click', () => {
    state.studio.wireframe = !state.studio.wireframe;
    studioViewport?.setWireframe(state.studio.wireframe);
    els.toggleSeamsBtn.classList.toggle('active', state.studio.wireframe);
  });

  document.querySelectorAll('.cam-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      studioViewport?.setCameraPreset(btn.dataset.cam);
    });
  });

  document.querySelectorAll('.light-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.light-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      studioViewport?.setLightingPreset(btn.dataset.light);
    });
  });

  els.addToBagBtn.addEventListener('click', () => {
    const product = getProduct(state.studio.productId);
    if (!product) return;
    addToCart({
      productId: product.id,
      size: state.studio.size,
      colorId: state.studio.colorId,
      fabricId: state.studio.fabricId,
      hardwareId: state.studio.hardwareId
    });
  });

  els.categoryFilters.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      els.categoryFilters.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeCategory = tab.dataset.category;
      renderCollection();
    });
  });

  els.catalogSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value || '';
    renderCollection();
  });

  els.azSortBtn.addEventListener('click', () => {
    state.sortAZ = !state.sortAZ;
    els.azSortBtn.classList.toggle('active', state.sortAZ);
    els.azSortBtn.textContent = state.sortAZ ? 'A–Z: On' : 'A–Z Sort';
    renderCollection();
  });

  // Cart drawer & checkout
  els.openCartBtn.addEventListener('click', openCartDrawer);
  els.closeCartBtn.addEventListener('click', closeCartDrawer);
  els.cartBackdrop.addEventListener('click', closeCartDrawer);

  els.proceedCheckoutBtn.addEventListener('click', () => {
    els.cartItemsContainer.hidden = true;
    els.cartFooter.hidden = true;
    els.checkoutForm.hidden = false;
  });

  els.backToBagBtn.addEventListener('click', () => {
    els.checkoutForm.hidden = true;
    els.cartItemsContainer.hidden = false;
    els.cartFooter.hidden = false;
  });

  els.checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(els.checkoutForm);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Could not submit order');
      return;
    }

    els.checkoutForm.hidden = true;
    els.orderConfirmation.hidden = false;
    els.orderConfirmation.innerHTML = `
      <p class="eyebrow">ORDER CONFIRMED</p>
      <h4 style="font-size:1.5rem;margin-bottom:0.4rem">Shukriya, ${data.order.customerName}</h4>
      <p style="font-size:0.86rem;color:var(--ink-muted)">
        Order <strong>${data.order.orderId}</strong> &bull; ${data.order.city} (${data.order.paymentMethod})<br/>
        10% Everyone Discount: <strong style="color:#059669">-${formatPKR(data.order.discountAmount)}</strong><br/>
        Final Total: <strong>${formatPKR(data.order.total)}</strong>
      </p>
      <p style="font-size:0.82rem;color:var(--ink-muted)">
        Discreet unmarked parcel will be dispatched shortly.
        ${data.order.complimentaryWashBag ? 'Includes complimentary silk potli wash pouch!' : ''}
      </p>
      <div style="display:grid;gap:0.5rem">
        <button type="button" class="btn-primary full-width" id="viewOrderHistoryBtn">View My Orders</button>
        <button type="button" class="btn-secondary full-width" id="doneOrderBtn">Continue Exploring</button>
      </div>
    `;
    document.getElementById('viewOrderHistoryBtn').addEventListener('click', () => {
      closeCartDrawer();
      openOrdersModal();
    });
    document.getElementById('doneOrderBtn').addEventListener('click', closeCartDrawer);
    els.checkoutForm.reset();
    await fetchCart();
  });

  [els.openSizeFinderBtn, els.openSizeFinderNav, els.studioSizeGuideBtn, els.footerSizeBtn].forEach(
    (btn) => btn.addEventListener('click', openSizeModal)
  );
  els.closeSizeModalBtn.addEventListener('click', closeSizeModal);
  els.sizeModalBackdrop.addEventListener('click', (e) => {
    if (e.target === els.sizeModalBackdrop) closeSizeModal();
  });

  els.sizeFinderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(els.sizeFinderForm);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch('/api/size-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Check measurements');
      return;
    }

    els.sizeResultBox.hidden = false;
    els.sizeResultBox.innerHTML = `
      <div class="size-result-badges">
        <span class="size-pill-big">Bra Size: <strong>${data.braSize}</strong></span>
        <span class="size-pill-big">Brief / Slip: <strong>${data.briefSize}</strong></span>
      </div>
      <p style="margin:0 0 0.4rem;font-size:0.86rem">${data.fitSummary}</p>
      ${
        data.sisterSizes.length
          ? `<p style="margin:0 0 0.65rem;font-size:0.8rem;color:var(--ink-muted)">Sister sizes: ${data.sisterSizes.join(', ')}</p>`
          : ''
      }
      <button type="button" class="btn-secondary" id="applyRecommendedBtn">
        Open Recommended in 3D: ${data.recommendedProduct.name} &rarr;
      </button>
    `;

    document.getElementById('applyRecommendedBtn').addEventListener('click', () => {
      closeSizeModal();
      openItemModal(data.recommendedProduct.id);
    });
  });

async function openOrdersModal() {
  els.ordersModalBackdrop.hidden = false;
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    const orders = data.orders || [];
    if (orders.length === 0) {
      els.ordersListContainer.innerHTML =
        '<div class="cart-empty"><p>No orders placed yet.</p><p style="font-size:0.84rem">Add any item to your bag and place your order to enjoy 10% off automatically!</p></div>';
      return;
    }
    els.ordersListContainer.innerHTML = orders
      .map(
        (o) => `<div class="order-history-card">
          <div class="order-history-top">
            <div>
              <strong>${o.orderId}</strong> &bull; <span style="font-size:0.82rem;color:var(--ink-muted)">${o.city} (${o.paymentMethod})</span>
            </div>
            <span class="order-status-pill">${o.status || 'Confirmed'}</span>
          </div>
          <div style="font-size:0.84rem;margin-bottom:0.4rem">
            ${o.items.map((it) => `${it.quantity}x ${it.name} (${it.colorName}, ${it.size})`).join(' &bull; ')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.84rem;color:var(--ink-muted)">
            <span>10% Discount Saved: <strong style="color:#059669">-${formatPKR(o.discountAmount || 0)}</strong></span>
            <strong style="color:var(--ink)">Paid: ${formatPKR(o.total)}</strong>
          </div>
        </div>`
      )
      .join('');
  } catch {
    els.ordersListContainer.innerHTML = '<p>Unable to load orders right now.</p>';
  }
}

function closeOrdersModal() {
  els.ordersModalBackdrop.hidden = true;
}

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.modal.isOpen) closeItemModal();
      if (!els.authModalBackdrop.hidden) closeAuthModal();
      if (!els.ordersModalBackdrop.hidden) closeOrdersModal();
      if (!els.welcomeOverlay.hidden) dismissWelcomeOverlay();
    }
  });

  // Welcome overlay events
  els.enterAtelierBtn?.addEventListener('click', () => dismissWelcomeOverlay());
  els.welcomeSignInBtn?.addEventListener('click', () => {
    dismissWelcomeOverlay();
    setTimeout(() => openAuthModal('login'), 260);
  });
  els.replayWelcomeBtn?.addEventListener('click', () => openWelcomeOverlay(true));
  document.querySelectorAll('[data-welcome-cat]').forEach((btn) => {
    btn.addEventListener('click', () => dismissWelcomeOverlay(btn.dataset.welcomeCat));
  });

  // Orders modal events
  els.openOrdersBtn.addEventListener('click', openOrdersModal);
  els.closeOrdersModalBtn.addEventListener('click', closeOrdersModal);
  els.ordersModalBackdrop.addEventListener('click', (e) => {
    if (e.target === els.ordersModalBackdrop) closeOrdersModal();
  });

  // 3D Auth Login Modal events
  els.openAuthBtn.addEventListener('click', () => openAuthModal('login'));
  els.closeAuthModalBtn.addEventListener('click', closeAuthModal);
  els.profileContinueBtn.addEventListener('click', closeAuthModal);
  els.authModalBackdrop.addEventListener('click', (e) => {
    if (e.target === els.authModalBackdrop) closeAuthModal();
  });

  els.authTabLogin.addEventListener('click', () => {
    els.authTabLogin.classList.add('active');
    els.authTabRegister.classList.remove('active');
    els.loginForm.hidden = false;
    els.registerForm.hidden = true;
  });

  els.authTabRegister.addEventListener('click', () => {
    els.authTabRegister.classList.add('active');
    els.authTabLogin.classList.remove('active');
    els.registerForm.hidden = false;
    els.loginForm.hidden = true;
  });

  // 3D mood theme orbs inside the 3D Login Stage
  els.authThemeOrbs.querySelectorAll('[data-orb-hex]').forEach((orb) => {
    orb.addEventListener('click', () => {
      els.authThemeOrbs.querySelectorAll('.auth-orb').forEach((o) => o.classList.remove('active'));
      orb.classList.add('active');
      const hex = orb.dataset.orbHex;
      const sheen = orb.dataset.orbSheen;
      authPrismScene?.setThemeColor(hex, sheen);
      els.auth3dStage.style.setProperty('--auth-glow', `${hex}66`);
    });
  });

  // Subtle 3D glass card perspective tilt on hover
  els.authGlassCard.addEventListener('pointermove', (e) => {
    const rect = els.authGlassCard.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    els.authGlassCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  els.authGlassCard.addEventListener('pointerleave', () => {
    els.authGlassCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });

  // Password show/hide toggles
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePw);
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
    });
  });

  els.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(els.loginForm).entries());
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Could not sign in');
      return;
    }
    await handleAuthSuccess(data, `Assalam-o-Alaikum, ${data.user.name.split(' ')[0]}!`);
  });

  els.demoLoginBtn.addEventListener('click', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ayesha@noorandsilk.pk', password: 'noor1234' })
    });
    const data = await res.json();
    if (res.ok) {
      await handleAuthSuccess(data, `Welcome back, ${data.user.name.split(' ')[0]}!`);
    }
  });

  els.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(els.registerForm).entries());
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Could not create account');
      return;
    }
    await handleAuthSuccess(data, `Welcome to NOOR & SILK, ${data.user.name.split(' ')[0]}!`);
  });

  els.logoutBtn.addEventListener('click', async () => {
    if (state.token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.token}` }
      }).catch(() => {});
    }
    state.token = null;
    state.user = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    updateMemberUI();
    showToast('Signed out from Atelier');
  });
}

async function init() {
  try {
    const res = await fetch('/api/catalog');
    const catalog = await res.json();

    state.products = catalog.products;
    state.colors = catalog.colors;
    state.fabrics = catalog.fabrics;
    state.hardwareFinishes = catalog.hardwareFinishes;

    renderHeroThumbsAndLookbook();
    renderHeroStage();
    selectProductInStudio(state.products[0].id, false, false);
    renderCollection();
    bindEvents();
    openWelcomeOverlay(false);
    await Promise.all([fetchCart(), restoreSession()]);
  } catch (err) {
    console.error('Failed to initialize NOOR & SILK 3D Atelier:', err);
    showToast('Unable to reach Node.js server');
  }
}

init();
