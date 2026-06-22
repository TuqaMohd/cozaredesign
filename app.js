const API_URL = "https://ecommerce.routemisr.com/api/v1";

function formatPrice(price) {
  return "$" + Number(price).toFixed(2);
}

function getStars(rating) {
  let stars = Math.round(rating || 0);
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += i < stars ? "★" : "☆";
  }
  return result;
}

function shortenText(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;");
}

function getCartCount() {
  return Number(localStorage.getItem("cartCount") || 0);
}
function setCartCount(num) {
  localStorage.setItem("cartCount", num);
}

let allProducts = [];
let allCategories = [];

async function getProducts() {
  if (allProducts.length > 0) return allProducts;
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();
  allProducts = data.data || [];
  return allProducts;
}

async function getCategories() {
  if (allCategories.length > 0) return allCategories;
  const response = await fetch(`${API_URL}/categories`);
  const data = await response.json();
  allCategories = data.data || [];
  return allCategories;
}

function renderHeader(page) {
  const header = document.getElementById("site-header");
  if (!header) return;

  header.innerHTML = `

    <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
      <a href="index.html" class="font-serif text-2xl font-bold">COZA<span class="text-amber-700">.</span></a>

      <button id="burgerBtn" class="md:hidden text-2xl">☰</button>

      <nav id="mainNav" class="hidden md:flex gap-8">
        <a href="index.html" class="text-sm uppercase ${page === "home" ? "text-amber-700 font-semibold" : ""}">Home</a>
        <a href="products.html" class="text-sm uppercase ${page === "products" ? "text-amber-700 font-semibold" : ""}">Shop</a>
        <a href="#footer-newsletter" class="text-sm uppercase">Features</a>
        <a href="#footer-about" class="text-sm uppercase">About</a>
        <a href="#footer-contact" class="text-sm uppercase">Contact</a>
      </nav>

      <div class="flex items-center gap-4">
        <form id="headerSearchForm" class="hidden sm:flex">
          <input id="headerSearchInput" type="search" placeholder="Search products..."
            class="border rounded px-3 py-2 text-sm w-48">
        </form>
        <a href="#" title="Wishlist">♡</a>
        <a href="#" class="relative" title="Cart">
          🛒
          <span id="cartCount" class="absolute -top-2 -right-3 bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">${getCartCount()}</span>
        </a>
      </div>
    </div>
  `;

  document.getElementById("burgerBtn").addEventListener("click", function () {
    document.getElementById("mainNav").classList.toggle("hidden");
    document.getElementById("mainNav").classList.toggle("flex");
    document.getElementById("mainNav").classList.toggle("flex-col");
  });

  const searchForm = document.getElementById("headerSearchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = document.getElementById("headerSearchInput").value;
    window.location.href = "products.html?q=" + encodeURIComponent(value);
  });
}

async function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12">
      <div id="footer-about">
        <span class="font-serif text-xl font-bold text-white">Coza.</span>
        <p class="text-sm text-gray-400 mt-3">This is my Coza Store redesign.</p>
      </div>

      <div>
        <h4 class="text-white text-sm font-semibold mb-3">Categories</h4>
        <ul id="footerCategoryList" class="text-sm space-y-2">
          <li><a href="products.html">All Products</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-white text-sm font-semibold mb-3">Help</h4>
        <ul class="text-sm space-y-2">
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Our Team</a></li>
          <li><a href="#">Support</a></li>
          <li><a href="#">FAQs</a></li>
        </ul>
      </div>

      <div id="footer-contact">
        <h4 id="footer-newsletter" class="text-white text-sm font-semibold mb-3">Tuqa's Newsletter</h4>
        <p class="text-sm text-gray-400 mb-3">Sign up to join our community!</p>
        <form id="newsletterForm" class="flex border border-gray-700 rounded overflow-hidden">
          <input type="email" required placeholder="Your email" class="flex-1 bg-transparent px-3 py-2 text-white text-sm outline-none">
          <button type="submit" class="bg-amber-700 text-white px-4 text-xs uppercase">Join</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById("newsletterForm").addEventListener("submit", function (e) {
    e.preventDefault();
    e.target.querySelector("button").textContent = "Joined!";
  });

  try {
    const categories = await getCategories();
    const list = document.getElementById("footerCategoryList");
    for (let i = 0; i < Math.min(5, categories.length); i++) {
      const c = categories[i];
      list.innerHTML += `<li><a href="products.html?category=${c._id}">${escapeHtml(c.name)}</a></li>`;
    }
  } catch (e) {
    
  }
}

function showLoader() {

  const loader = document.createElement("div");

  loader.id = "pageLoader";

  loader.innerHTML = `
    <div class="text-center">

      <div class="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>

      <p class="mt-4 uppercase tracking-widest text-sm">
        Loading Product...
      </p>

    </div>
  `;

  loader.className =
    "fixed inset-0 bg-white/90 z-[9999] flex items-center justify-center";

  document.body.appendChild(loader);

}

function goToProducts(params) {

  showLoader();

  params = params || {};

  let qs = "";

  for (const key in params) {

    if (params[key]) {

      qs +=
        (qs ? "&" : "?") +
        key +
        "=" +
        encodeURIComponent(params[key]);

    }

  }

  setTimeout(() => {

    window.location.href = "products.html" + qs;

  }, 800);

}


function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  const dotsBox = document.getElementById("slideDots");
  if (!slides.length) return;

  let current = 0;

  dotsBox.innerHTML = "";
  slides.forEach((slide, i) => {
    const dot = document.createElement("button");
    dot.className = "w-2.5 h-2.5 rounded-full " + (i === 0 ? "bg-white" : "bg-white/40");
    dot.addEventListener("click", () => showSlide(i));
    dotsBox.appendChild(dot);
  });

  function showSlide(index) {
    slides[current].classList.add("opacity-0");
    slides[current].classList.remove("opacity-100");
    current = (index + slides.length) % slides.length;
    slides[current].classList.remove("opacity-0");
    slides[current].classList.add("opacity-100");

    const dots = dotsBox.querySelectorAll("button");
    dots.forEach((d, i) => {
      d.className = "w-2.5 h-2.5 rounded-full " + (i === current ? "bg-white" : "bg-white/40");
    });
  }

  document.getElementById("slideNext").addEventListener("click", () => showSlide(current + 1));
  document.getElementById("slidePrev").addEventListener("click", () => showSlide(current - 1));

  setInterval(() => showSlide(current + 1), 5000);
}

async function initHomepage() {
  renderHeader("home");
  renderFooter();

  const heroForm = document.getElementById("heroSearchForm");
  heroForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = document.getElementById("heroSearchInput").value;
    goToProducts({ q: value });
  });
}

function productCardHtml(p) {
  const hasDiscount = p.priceAfterDiscount && p.priceAfterDiscount < p.price;
  const price = hasDiscount ? p.priceAfterDiscount : p.price;

  return `
    <div class="product-card cursor-pointer" data-id="${p._id}">
      <div class="relative aspect-square bg-gray-100 rounded overflow-hidden mb-3">
        ${hasDiscount ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Sale</span>` : ""}
        <img src="${p.imageCover}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover">
      </div>
      <div class="text-xs uppercase text-amber-700 font-semibold mb-1">${escapeHtml(p.category ? p.category.name : "")}</div>
      <div class="text-sm font-medium mb-1">${escapeHtml(shortenText(p.title, 48))}</div>
      <div class="flex items-center gap-2 text-sm">
        <span class="font-semibold">${formatPrice(price)}</span>
        ${hasDiscount ? `<span class="line-through text-gray-400 text-xs">${formatPrice(p.price)}</span>` : ""}
      </div>
      <div class="text-xs text-amber-700">${getStars(p.ratingsAverage)} <span class="text-gray-500">(${p.ratingsQuantity || 0})</span></div>
    </div>
  `;
}

function loadingCards(count) {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `<div class="aspect-square bg-gray-100 rounded animate-pulse"></div>`;
  }
  return html;
}

function wireProductCards(container) {
  const cards = container.querySelectorAll(".product-card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      goToProducts({ id: card.dataset.id });
    });
  });
}

async function renderFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  grid.innerHTML = loadingCards(6);

  try {
    const products = await getProducts();
    const sorted = products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0));
    const featured = sorted.slice(0, 6);
    grid.innerHTML = featured.map(productCardHtml).join("");
    wireProductCards(grid);
  } catch (err) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-500">Could not load products.</p>`;
  }
}

const shopState = {
  all: [],
  categories: [],
  filtered: [],
  category: null,
  query: "",
  sort: "default",
  priceMax: null,
  page: 1,
  perPage: 9,
};

async function initProductsPage() {
  renderHeader("products");
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const directId = params.get("id");

  if (directId) {
    await showProductDetail(directId);
    return;
  }

  shopState.category = params.get("category");
  shopState.query = params.get("q") || "";

  document.getElementById("shopGrid").innerHTML = loadingCards(9);

  try {
    shopState.all = await getProducts();
    shopState.categories = await getCategories();

    renderFilters();
    filterAndRender();
    wireToolbar();
  } catch (err) {
    document.getElementById("shopGrid").innerHTML = `<p class="col-span-full text-center text-gray-500">Could not load the shop.</p>`;
  }
}

function renderFilters() {
  const catList = document.getElementById("categoryFilterList");
  if (!catList) return;

  let html = `<li><button data-cat="" class="text-sm">All Products</button></li>`;
  shopState.categories.forEach(function (c) {
    html += `<li><button data-cat="${c._id}" class="text-sm">${escapeHtml(c.name)}</button></li>`;
  });
  catList.innerHTML = html;

  catList.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      shopState.category = btn.dataset.cat || null;
      shopState.page = 1;
      filterAndRender();
    });
  });

  const priceList = document.getElementById("priceFilterList");
  if (priceList) {
    const ranges = [
      { label: "All", max: null },
      { label: "Under $50", max: 50 },
      { label: "Under $150", max: 150 },
      { label: "Under $500", max: 500 },
    ];
    priceList.innerHTML = ranges
      .map((r) => `<li><button data-max="${r.max || ""}" class="text-sm">${r.label}</button></li>`)
      .join("");
    priceList.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        shopState.priceMax = btn.dataset.max ? Number(btn.dataset.max) : null;
        shopState.page = 1;
        filterAndRender();
      });
    });
  }
}

function wireToolbar() {
  document.getElementById("sortSelect").addEventListener("change", function (e) {
    shopState.sort = e.target.value;
    filterAndRender();
  });

  document.getElementById("clearFiltersBtn").addEventListener("click", function () {
    shopState.category = null;
    shopState.query = "";
    shopState.priceMax = null;
    shopState.page = 1;
    filterAndRender();
  });

  document.getElementById("mobileFilterToggle").addEventListener("click", function () {
    document.getElementById("filterCol").classList.toggle("hidden");
  });
}

function filterAndRender() {
  let list = shopState.all.slice();

  if (shopState.category) {
    list = list.filter((p) => p.category && p.category._id === shopState.category);
  }
  if (shopState.query) {
    const q = shopState.query.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (shopState.priceMax) {
    list = list.filter((p) => (p.priceAfterDiscount || p.price) <= shopState.priceMax);
  }

  if (shopState.sort === "price-asc") {
    list.sort((a, b) => (a.priceAfterDiscount || a.price) - (b.priceAfterDiscount || b.price));
  } else if (shopState.sort === "price-desc") {
    list.sort((a, b) => (b.priceAfterDiscount || b.price) - (a.priceAfterDiscount || a.price));
  } else if (shopState.sort === "rating") {
    list.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
  } else if (shopState.sort === "newest") {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  shopState.filtered = list;
  renderShopGrid();
  document.getElementById("resultsSummary").textContent = list.length + " products";
}

function renderShopGrid() {
  const grid = document.getElementById("shopGrid");
  const pagination = document.getElementById("shopPagination");

  const list = shopState.filtered;
  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">No products found.</p>`;
    pagination.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(list.length / shopState.perPage);
  if (shopState.page > totalPages) shopState.page = totalPages;

  const start = (shopState.page - 1) * shopState.perPage;
  const pageItems = list.slice(start, start + shopState.perPage);

  grid.innerHTML = pageItems.map(productCardHtml).join("");
  wireProductCards(grid);

  let pagesHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `<button data-page="${i}" class="w-8 h-8 border rounded ${i === shopState.page ? "bg-gray-900 text-white" : "bg-white"}">${i}</button>`;
  }
  pagination.innerHTML = pagesHtml;
  pagination.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      shopState.page = Number(btn.dataset.page);
      renderShopGrid();
    });
  });
}

async function showProductDetail(id) {
  document.getElementById("shopLayout").classList.add("hidden");
  const mount = document.getElementById("productDetailMount");
  mount.classList.remove("hidden");
  mount.innerHTML = `<div class="py-16 text-center text-gray-500">Loading...</div>`;

  try {
    const products = await getProducts();
    const product = products.find((p) => p._id === id);

    if (!product) {
      mount.innerHTML = `<div class="py-16 text-center text-gray-500">Product not found.</div>`;
      return;
    }

renderProductDetail(product, mount);
renderRelatedProducts(product, products);

const loader = document.getElementById("productLoader");

if (loader) {

  loader.remove();

}
  } catch (err) {
    mount.innerHTML = `<div class="py-16 text-center text-gray-500">Could not load this product.</div>`;
  }
}

function renderProductDetail(p, mount) {
  const hasDiscount = p.priceAfterDiscount && p.priceAfterDiscount < p.price;
  const price = hasDiscount ? p.priceAfterDiscount : p.price;
  const images = p.images && p.images.length ? p.images : [p.imageCover];

  mount.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 py-10">
      <div>
        <div class="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
          <img id="mainProductImage" src="${images[0]}" class="w-full h-full object-cover">
        </div>
        <div class="flex gap-2">
          ${images
            .map(
              (img) =>
                `<button class="thumb-btn w-16 h-16 rounded overflow-hidden border" data-img="${img}"><img src="${img}" class="w-full h-full object-cover"></button>`
            )
            .join("")}
        </div>
      </div>

      <div>
        <div class="text-xs uppercase text-amber-700 font-semibold mb-2">${escapeHtml(p.category ? p.category.name : "")}</div>
        <h1 class="font-serif text-3xl font-bold mb-3">${escapeHtml(p.title)}</h1>
        <div class="text-sm text-gray-500 mb-4">${getStars(p.ratingsAverage)} ${(p.ratingsAverage || 0).toFixed(1)} (${p.ratingsQuantity || 0} reviews)</div>
        <p class="text-gray-600 mb-5">${escapeHtml(shortenText(p.description || "No description.", 400))}</p>

        <div class="text-2xl font-semibold mb-5">${formatPrice(price)} ${hasDiscount ? `<span class="line-through text-gray-400 text-base">${formatPrice(p.price)}</span>` : ""}</div>

        <div class="flex items-center gap-3 mb-5">
          <button id="qtyMinus" class="w-8 h-8 border rounded">-</button>
          <span id="qtyValue">1</span>
          <button id="qtyPlus" class="w-8 h-8 border rounded">+</button>
        </div>

        <button id="addToCartBtn" class="bg-gray-900 text-white px-6 py-3 rounded text-sm uppercase">Add to cart</button>
      </div>
    </div>
  `;

  mount.querySelectorAll(".thumb-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("mainProductImage").src = btn.dataset.img;
    });
  });

  let qty = 1;
  document.getElementById("qtyMinus").addEventListener("click", function () {
    if (qty > 1) qty--;
    document.getElementById("qtyValue").textContent = qty;
  });
  document.getElementById("qtyPlus").addEventListener("click", function () {
    qty++;
    document.getElementById("qtyValue").textContent = qty;
  });

  document.getElementById("addToCartBtn").addEventListener("click", function () {
    setCartCount(getCartCount() + qty);
    document.getElementById("cartCount").textContent = getCartCount();
    this.textContent = "Added!";
    setTimeout(() => (this.textContent = "Add to cart"), 1500);
  });
}

function renderRelatedProducts(current, products) {
  const mount = document.getElementById("relatedMount");
  if (!mount) return;

  const related = products
    .filter((p) => p.category && current.category && p.category._id === current.category._id && p._id !== current._id)
    .slice(0, 4);

  if (related.length === 0) {
    mount.innerHTML = "";
    return;
  }

  mount.innerHTML = `
    <div class="py-10">
      <h2 class="font-serif text-2xl font-bold mb-5">You may also like</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        ${related.map(productCardHtml).join("")}
      </div>
    </div>
  `;
  wireProductCards(mount);
}
