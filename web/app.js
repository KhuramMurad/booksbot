const state = {
  books: [],
  filtered: [],
  category: "all",
  query: "",
  sort: "title-asc",
};

const palette = [
  ["#0f766e", "#2563eb"],
  ["#c2412d", "#b7791f"],
  ["#6d5bd0", "#0f766e"],
  ["#1f6feb", "#c2412d"],
  ["#2f855a", "#805ad5"],
  ["#b7791f", "#2563eb"],
];

const els = {
  totalBooks: document.querySelector("#totalBooks"),
  totalCategories: document.querySelector("#totalCategories"),
  averagePrice: document.querySelector("#averagePrice"),
  visibleCount: document.querySelector("#visibleCount"),
  spotlightCategory: document.querySelector("#spotlightCategory"),
  spotlightBook: document.querySelector("#spotlightBook"),
  categoryBars: document.querySelector("#categoryBars"),
  bookGrid: document.querySelector("#bookGrid"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  categorySelect: document.querySelector("#categorySelect"),
  sortSelect: document.querySelector("#sortSelect"),
  resetButton: document.querySelector("#resetButton"),
};

async function loadBooks() {
  const response = await fetch("../books_output.json");
  if (!response.ok) {
    throw new Error("Could not load books_output.json");
  }

  state.books = (await response.json()).map((book, index) => ({
    id: index,
    title: book.title || "Untitled",
    category: book.category || "Uncategorized",
    description: book.description || "No description available.",
    price: book.price || "",
    priceValue: parsePrice(book.price),
  }));

  buildCategoryOptions();
  renderSummary();
  applyFilters();
}

function parsePrice(price) {
  const match = String(price || "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function buildCategoryOptions() {
  const categories = getCategories(state.books);
  els.categorySelect.append(
    ...categories.map((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      return option;
    }),
  );
}

function getCategories(books) {
  return [...new Set(books.map((book) => book.category))].sort((a, b) => a.localeCompare(b));
}

function renderSummary() {
  const total = state.books.length;
  const categories = getCategories(state.books).length;
  const average = state.books.reduce((sum, book) => sum + book.priceValue, 0) / Math.max(total, 1);

  els.totalBooks.textContent = total.toLocaleString();
  els.totalCategories.textContent = categories.toLocaleString();
  els.averagePrice.textContent = `GBP ${average.toFixed(2)}`;
}

function applyFilters() {
  const query = state.query.trim().toLowerCase();

  state.filtered = state.books.filter((book) => {
    const matchesCategory = state.category === "all" || book.category === state.category;
    const searchable = `${book.title} ${book.category} ${book.description}`.toLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });

  state.filtered.sort(getSorter(state.sort));
  render();
}

function getSorter(sort) {
  const sorters = {
    "title-asc": (a, b) => a.title.localeCompare(b.title),
    "price-asc": (a, b) => a.priceValue - b.priceValue || a.title.localeCompare(b.title),
    "price-desc": (a, b) => b.priceValue - a.priceValue || a.title.localeCompare(b.title),
    "category-asc": (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
  };

  return sorters[sort] || sorters["title-asc"];
}

function render() {
  els.visibleCount.textContent = `Showing ${state.filtered.length.toLocaleString()} books`;
  els.spotlightCategory.textContent = state.category === "all" ? "All categories" : state.category;
  renderCategoryBars();
  renderSpotlight();
  renderBooks();
}

function renderCategoryBars() {
  const counts = new Map();
  state.filtered.forEach((book) => counts.set(book.category, (counts.get(book.category) || 0) + 1));

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);
  const max = Math.max(...rows.map(([, count]) => count), 1);

  els.categoryBars.replaceChildren(
    ...rows.map(([category, count]) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <span class="bar-label" title="${escapeHtml(category)}">${escapeHtml(category)}</span>
        <span class="bar-track"><span class="bar-fill" style="width: ${(count / max) * 100}%"></span></span>
        <span class="bar-count">${count}</span>
      `;
      return row;
    }),
  );
}

function renderSpotlight() {
  const book = state.filtered.reduce((best, item) => {
    if (!best) return item;
    return item.description.length > best.description.length ? item : best;
  }, null);

  if (!book) {
    els.spotlightBook.replaceChildren();
    return;
  }

  els.spotlightBook.replaceChildren(createCover(book, "large"), createBookDetails(book));
}

function renderBooks() {
  const fragment = document.createDocumentFragment();
  state.filtered.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.append(createCover(book), createBookDetails(book));
    fragment.append(card);
  });

  els.bookGrid.replaceChildren(fragment);
  els.emptyState.hidden = state.filtered.length > 0;
}

function createCover(book) {
  const cover = document.createElement("div");
  const [from, to] = palette[book.id % palette.length];
  cover.className = "cover-art";
  cover.style.background = `linear-gradient(145deg, ${from}, ${to})`;
  cover.innerHTML = `<span>${escapeHtml(getInitials(book.title))}</span>`;
  return cover;
}

function createBookDetails(book) {
  const details = document.createElement("div");
  details.className = "book-details";
  details.innerHTML = `
    <h3 class="book-title">${escapeHtml(book.title)}</h3>
    <div class="book-meta">
      <span>${escapeHtml(book.category)}</span>
      <span class="price-pill">${escapeHtml(book.price)}</span>
    </div>
    <p class="book-description">${escapeHtml(book.description)}</p>
  `;
  return details;
}

function getInitials(title) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  applyFilters();
});

els.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  applyFilters();
});

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  applyFilters();
});

els.resetButton.addEventListener("click", () => {
  state.query = "";
  state.category = "all";
  state.sort = "title-asc";
  els.searchInput.value = "";
  els.categorySelect.value = "all";
  els.sortSelect.value = "title-asc";
  applyFilters();
});

loadBooks().catch((error) => {
  els.emptyState.hidden = false;
  els.emptyState.textContent = error.message;
});
