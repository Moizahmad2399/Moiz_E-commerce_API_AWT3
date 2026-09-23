/**
 * In-memory "database" of products.
 *
 * Each product intentionally has MANY fields (like a real e-commerce
 * catalog would: description, inventory metrics, vendor info, images).
 * This is on purpose — it's what lets us actually DEMONSTRATE the
 * over-fetching problem: a mobile banner only needs {title, price},
 * but a naive GET /products/:id returns all ~15 fields below.
 */
let products = [
  {
    id: 1,
    title: 'Wireless Bluetooth Earbuds',
    price: 24.99,
    category: 'electronics',
    description: 'True wireless earbuds with 20-hour battery life, active noise cancellation, and IPX5 water resistance.',
    stock: 150,
    sku: 'ELEC-EARBUD-001',
    rating: 4.3,
    reviewCount: 812,
    images: ['https://example.com/img/earbuds-1.jpg', 'https://example.com/img/earbuds-2.jpg'],
    vendor: { id: 501, name: 'SoundWave Electronics', country: 'PK' },
    weightKg: 0.05,
    dimensionsCm: { l: 6, w: 6, h: 3 },
    warrantyMonths: 12,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 2,
    title: 'Stainless Steel Water Bottle',
    price: 12.5,
    category: 'home-goods',
    description: 'Double-wall vacuum insulated bottle, keeps drinks cold for 24 hours or hot for 12 hours. 1 liter capacity.',
    stock: 300,
    sku: 'HOME-BOTTLE-014',
    rating: 4.7,
    reviewCount: 2140,
    images: ['https://example.com/img/bottle-1.jpg'],
    vendor: { id: 502, name: 'EcoLiving Co.', country: 'PK' },
    weightKg: 0.4,
    dimensionsCm: { l: 8, w: 8, h: 26 },
    warrantyMonths: 0,
    createdAt: '2026-02-02T10:30:00.000Z',
    updatedAt: '2026-02-02T10:30:00.000Z',
  },
  {
    id: 3,
    title: 'Men\'s Running Shoes',
    price: 39.99,
    category: 'fashion',
    description: 'Lightweight breathable mesh running shoes with cushioned sole, available in multiple sizes.',
    stock: 80,
    sku: 'FASH-SHOE-221',
    rating: 4.1,
    reviewCount: 456,
    images: ['https://example.com/img/shoe-1.jpg', 'https://example.com/img/shoe-2.jpg'],
    vendor: { id: 503, name: 'StrideFit', country: 'CN' },
    weightKg: 0.9,
    dimensionsCm: { l: 32, w: 20, h: 12 },
    warrantyMonths: 3,
    createdAt: '2026-02-15T14:00:00.000Z',
    updatedAt: '2026-02-15T14:00:00.000Z',
  },
  {
    id: 4,
    title: '4K Ultra HD Smart TV 43"',
    price: 289.0,
    category: 'electronics',
    description: '43-inch 4K smart TV with HDR10, built-in streaming apps, and voice remote control.',
    stock: 25,
    sku: 'ELEC-TV-043',
    rating: 4.5,
    reviewCount: 301,
    images: ['https://example.com/img/tv-1.jpg'],
    vendor: { id: 501, name: 'SoundWave Electronics', country: 'PK' },
    weightKg: 7.2,
    dimensionsCm: { l: 97, w: 57, h: 8 },
    warrantyMonths: 24,
    createdAt: '2026-03-01T09:15:00.000Z',
    updatedAt: '2026-03-01T09:15:00.000Z',
  },
  {
    id: 5,
    title: 'Ceramic Non-Stick Frying Pan',
    price: 18.75,
    category: 'home-goods',
    description: '28cm ceramic-coated non-stick frying pan, oven safe up to 200°C, suitable for all stovetops.',
    stock: 120,
    sku: 'HOME-PAN-028',
    rating: 4.4,
    reviewCount: 640,
    images: ['https://example.com/img/pan-1.jpg'],
    vendor: { id: 502, name: 'EcoLiving Co.', country: 'PK' },
    weightKg: 0.85,
    dimensionsCm: { l: 28, w: 28, h: 6 },
    warrantyMonths: 6,
    createdAt: '2026-03-20T11:45:00.000Z',
    updatedAt: '2026-03-20T11:45:00.000Z',
  },
  {
    id: 6,
    title: 'Women\'s Denim Jacket',
    price: 34.0,
    category: 'fashion',
    description: 'Classic fit denim jacket with button closure and chest pockets, available in 3 washes.',
    stock: 60,
    sku: 'FASH-JACKET-090',
    rating: 4.0,
    reviewCount: 198,
    images: ['https://example.com/img/jacket-1.jpg'],
    vendor: { id: 503, name: 'StrideFit', country: 'CN' },
    weightKg: 0.6,
    dimensionsCm: { l: 40, w: 30, h: 5 },
    warrantyMonths: 0,
    createdAt: '2026-04-05T13:20:00.000Z',
    updatedAt: '2026-04-05T13:20:00.000Z',
  },
];

let nextId = products.length + 1;

/** All field names that exist on a product — used to validate ?fields= */
const ALL_FIELDS = Object.keys(products[0]);

function getAll() {
  return products;
}

function getById(id) {
  return products.find((p) => p.id === id);
}

function create(data) {
  const now = new Date().toISOString();
  const newProduct = {
    id: nextId++,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  products.push(newProduct);
  return newProduct;
}

/** Full replace (PUT) — idempotent: same body -> same resulting state every time. */
function replace(id, data) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const existing = products[index];
  const updated = {
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  products[index] = updated;
  return updated;
}

/** Idempotent delete — removing an already-gone id is a no-op, not an error. */
function remove(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, replace, remove, ALL_FIELDS };
