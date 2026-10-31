/**
 * inventoryService — Grocery & Vegetable Inventory Management System
 * Data persistence using localStorage with snapshots for past documents.
 */
import type {
  InventoryCategory,
  InventoryItem,
  InventoryDocument,
} from '../types/inventory';

const INVENTORY_ITEMS_KEY = 'kanchi_inventory_items';
const INVENTORY_CATEGORIES_KEY = 'kanchi_inventory_categories';
const INVENTORY_DOCS_KEY = 'kanchi_inventory_documents';
const INVENTORY_COUNTER_KEY = 'kanchi_inventory_counter';

export const DEFAULT_INVENTORY_CATEGORIES: InventoryCategory[] = [
  { id: 'cat-grocery', nameEn: 'Grocery Items', nameTa: 'மளிகைப் பொருட்கள்' },
  { id: 'cat-vegetables', nameEn: 'Vegetables', nameTa: 'காய்கறிகள்' },
  { id: 'cat-fruits', nameEn: 'Fruits', nameTa: 'பழங்கள்' },
  { id: 'cat-spices', nameEn: 'Spices & Masala', nameTa: 'மசாலாப் பொருட்கள்' },
  { id: 'cat-oils', nameEn: 'Oils & Other Ingredients', nameTa: 'எண்ணெய் மற்றும் பிற பொருட்கள்' },
  { id: 'cat-other', nameEn: 'Other Items', nameTa: 'பிற பொருட்கள்' },
];

export interface UnitDefinition {
  id: string;
  labelEn: string;
  labelTa: string;
  shortEn: string;
  shortTa: string;
}

export const SUPPORTED_UNITS: UnitDefinition[] = [
  { id: 'kg', labelEn: 'Kilogram (kg)', labelTa: 'கிலோகிராம் (கிலோ)', shortEn: 'kg', shortTa: 'கிலோ' },
  { id: 'g', labelEn: 'Gram (g)', labelTa: 'கிராம் (கி)', shortEn: 'g', shortTa: 'கி' },
  { id: 'L', labelEn: 'Litre (L)', labelTa: 'லிட்டர் (லி)', shortEn: 'L', shortTa: 'லி' },
  { id: 'ml', labelEn: 'Millilitre (ml)', labelTa: 'மில்லிலிட்டர் (மி.லி)', shortEn: 'ml', shortTa: 'மி.லி' },
  { id: 'pcs', labelEn: 'Pieces (pcs)', labelTa: 'எண்ணிக்கை (பீஸ்)', shortEn: 'pcs', shortTa: 'பீஸ்' },
  { id: 'packets', labelEn: 'Packets', labelTa: 'பாக்கெட்', shortEn: 'pkts', shortTa: 'பாக்கெட்' },
  { id: 'bags', labelEn: 'Bags', labelTa: 'மூட்டை / பை', shortEn: 'bags', shortTa: 'மூட்டை' },
  { id: 'boxes', labelEn: 'Boxes', labelTa: 'பெட்டி', shortEn: 'boxes', shortTa: 'பெட்டி' },
  { id: 'bundles', labelEn: 'Bundles', labelTa: 'கட்டு', shortEn: 'bundles', shortTa: 'கட்டு' },
  { id: 'dozens', labelEn: 'Dozens', labelTa: 'டஜன்', shortEn: 'doz', shortTa: 'டஜன்' },
];

export function formatUnitLabel(unit: string, lang: 'en' | 'ta' = 'en'): string {
  const found = SUPPORTED_UNITS.find((u) => u.id === unit || u.shortEn.toLowerCase() === unit.toLowerCase());
  if (found) {
    return lang === 'ta' ? found.shortTa : found.shortEn;
  }
  return unit;
}

/**
 * Initial catalogue containing common catering ingredients in English & Tamil.
 * Note: No stock or price data is assigned by default to respect user rule.
 */
export const INITIAL_INVENTORY_ITEMS: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Grocery Items
  { nameEn: 'Rice', nameTa: 'அரிசி', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Idli Rice', nameTa: 'இட்லி அரிசி', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Raw Rice', nameTa: 'பச்சரிசி', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Basmati Rice', nameTa: 'பாஸ்மதி அரிசி', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Wheat Flour', nameTa: 'கோதுமை மாவு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Maida', nameTa: 'மைதா', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Rava / Sooji', nameTa: 'ரவை', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Vermicelli', nameTa: 'சேமியா', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Toor Dal', nameTa: 'துவரம் பருப்பு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Urad Dal', nameTa: 'உளுத்தம் பருப்பு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Moong Dal', nameTa: 'பாசிப் பருப்பு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Chana Dal', nameTa: 'கடலைப் பருப்பு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Chickpeas', nameTa: 'கொண்டைக்கடலை', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Green Gram', nameTa: 'பச்சைப்பயறு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Tamarind', nameTa: 'புளி', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Jaggery', nameTa: 'வெல்லம்', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Sugar', nameTa: 'சர்க்கரை', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Salt', nameTa: 'உப்பு', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Cashew Nuts', nameTa: 'முந்திரிப் பருப்பு', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Raisins', nameTa: 'உலர் திராட்சை', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Coconut', nameTa: 'தேங்காய்', categoryId: 'cat-grocery', unit: 'pcs' },
  { nameEn: 'Desiccated Coconut', nameTa: 'கொப்பரைத் தேங்காய்', categoryId: 'cat-grocery', unit: 'kg' },
  { nameEn: 'Papad / Appalam', nameTa: 'அப்பளம்', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Pickle', nameTa: 'ஊறுகாய்', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Tea Powder', nameTa: 'தேயிலைத் தூள்', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Coffee Powder', nameTa: 'காபித் தூள்', categoryId: 'cat-grocery', unit: 'packets' },
  { nameEn: 'Milk Powder', nameTa: 'பால் பவுடர்', categoryId: 'cat-grocery', unit: 'packets' },

  // Spices & Masala
  { nameEn: 'Mustard Seeds', nameTa: 'கடுகு', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Cumin Seeds', nameTa: 'சீரகம்', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Black Pepper', nameTa: 'மிளகு', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Fenugreek Seeds', nameTa: 'வெந்தயம்', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Turmeric Powder', nameTa: 'மஞ்சள் தூள்', categoryId: 'cat-spices', unit: 'packets' },
  { nameEn: 'Chilli Powder', nameTa: 'மிளகாய் தூள்', categoryId: 'cat-spices', unit: 'packets' },
  { nameEn: 'Coriander Powder', nameTa: 'மல்லித் தூள்', categoryId: 'cat-spices', unit: 'packets' },
  { nameEn: 'Garam Masala', nameTa: 'கரம் மசாலா', categoryId: 'cat-spices', unit: 'packets' },
  { nameEn: 'Asafoetida', nameTa: 'பெருங்காயம்', categoryId: 'cat-spices', unit: 'packets' },
  { nameEn: 'Cardamom', nameTa: 'ஏலக்காய்', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Cloves', nameTa: 'கிராம்பு', categoryId: 'cat-spices', unit: 'g' },
  { nameEn: 'Cinnamon', nameTa: 'பட்டை', categoryId: 'cat-spices', unit: 'g' },

  // Vegetables
  { nameEn: 'Onion', nameTa: 'வெங்காயம்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Tomato', nameTa: 'தக்காளி', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Potato', nameTa: 'உருளைக்கிழங்கு', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Carrot', nameTa: 'கேரட்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Beans', nameTa: 'பீன்ஸ்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Cabbage', nameTa: 'முட்டைகோஸ்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Cauliflower', nameTa: 'காலிஃபிளவர்', categoryId: 'cat-vegetables', unit: 'pcs' },
  { nameEn: 'Beetroot', nameTa: 'பீட்ரூட்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Green Chilli', nameTa: 'பச்சை மிளகாய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Capsicum', nameTa: 'குடைமிளகாய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Brinjal', nameTa: 'கத்தரிக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Drumstick', nameTa: 'முருங்கைக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Raw Banana', nameTa: 'வாழைக்காய்', categoryId: 'cat-vegetables', unit: 'pcs' },
  { nameEn: 'Plantain', nameTa: 'வாழைக்காய்', categoryId: 'cat-vegetables', unit: 'pcs' },
  { nameEn: 'Pumpkin', nameTa: 'பூசணிக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Bottle Gourd', nameTa: 'சுரைக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Bitter Gourd', nameTa: 'பாகற்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Snake Gourd', nameTa: 'புடலங்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Ladies Finger', nameTa: 'வெண்டைக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Cucumber', nameTa: 'வெள்ளரிக்காய்', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Radish', nameTa: 'முள்ளங்கி', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Green Peas', nameTa: 'பச்சை பட்டாணி', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Ginger', nameTa: 'இஞ்சி', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Garlic', nameTa: 'பூண்டு', categoryId: 'cat-vegetables', unit: 'kg' },
  { nameEn: 'Curry Leaves', nameTa: 'கறிவேப்பிலை', categoryId: 'cat-vegetables', unit: 'bundles' },
  { nameEn: 'Coriander Leaves', nameTa: 'கொத்தமல்லி தழை', categoryId: 'cat-vegetables', unit: 'bundles' },
  { nameEn: 'Mint Leaves', nameTa: 'புதினா', categoryId: 'cat-vegetables', unit: 'bundles' },
  { nameEn: 'Lemon', nameTa: 'எலுமிச்சம்பழம்', categoryId: 'cat-vegetables', unit: 'pcs' },

  // Oils & Other Ingredients
  { nameEn: 'Cooking Oil', nameTa: 'சமையல் எண்ணெய்', categoryId: 'cat-oils', unit: 'L' },
  { nameEn: 'Gingelly Oil', nameTa: 'நல்லெண்ணெய்', categoryId: 'cat-oils', unit: 'L' },
  { nameEn: 'Ghee', nameTa: 'நெய்', categoryId: 'cat-oils', unit: 'L' },
  { nameEn: 'Butter', nameTa: 'வெண்ணெய்', categoryId: 'cat-oils', unit: 'kg' },
  { nameEn: 'Mustard Oil', nameTa: 'கடுகு எண்ணெய்', categoryId: 'cat-oils', unit: 'L' },
  { nameEn: 'Cooking Soda', nameTa: 'சமையல் சோடா', categoryId: 'cat-oils', unit: 'packets' },
  { nameEn: 'Baking Powder', nameTa: 'பேக்கிங் பவுடர்', categoryId: 'cat-oils', unit: 'packets' },
  { nameEn: 'Food Colour', nameTa: 'உணவு வண்ணம்', categoryId: 'cat-oils', unit: 'packets' },
  { nameEn: 'Vinegar', nameTa: 'வினிகர்', categoryId: 'cat-oils', unit: 'L' },

  // Fruits
  { nameEn: 'Banana', nameTa: 'வாழைப்பழம்', categoryId: 'cat-fruits', unit: 'dozens' },
  { nameEn: 'Apple', nameTa: 'ஆப்பிள்', categoryId: 'cat-fruits', unit: 'kg' },
  { nameEn: 'Orange', nameTa: 'ஆரஞ்சு', categoryId: 'cat-fruits', unit: 'kg' },
  { nameEn: 'Grapes', nameTa: 'திராட்சை', categoryId: 'cat-fruits', unit: 'kg' },
  { nameEn: 'Pomegranate', nameTa: 'மாதுளை', categoryId: 'cat-fruits', unit: 'kg' },
];

export const inventoryService = {
  // ─── CATEGORIES ──────────────────────────────────────────
  getCategories(): InventoryCategory[] {
    try {
      const stored = localStorage.getItem(INVENTORY_CATEGORIES_KEY);
      if (!stored) {
        localStorage.setItem(INVENTORY_CATEGORIES_KEY, JSON.stringify(DEFAULT_INVENTORY_CATEGORIES));
        return DEFAULT_INVENTORY_CATEGORIES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_INVENTORY_CATEGORIES;
    }
  },

  addCategory(category: { nameEn: string; nameTa: string }): InventoryCategory {
    const categories = this.getCategories();
    const slug = category.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18);
    const newCat: InventoryCategory = {
      id: `cat-custom-${Date.now()}-${slug}`,
      nameEn: category.nameEn.trim(),
      nameTa: category.nameTa.trim() || category.nameEn.trim(),
      isCustom: true,
    };
    categories.push(newCat);
    localStorage.setItem(INVENTORY_CATEGORIES_KEY, JSON.stringify(categories));
    return newCat;
  },

  // ─── ITEMS ──────────────────────────────────────────────
  getItems(): InventoryItem[] {
    try {
      const stored = localStorage.getItem(INVENTORY_ITEMS_KEY);
      if (!stored) {
        // Initialize default catalogue
        const now = new Date().toISOString();
        const initial: InventoryItem[] = INITIAL_INVENTORY_ITEMS.map((item, idx) => ({
          ...item,
          id: `inv-${String(idx + 1).padStart(4, '0')}`,
          createdAt: now,
          updatedAt: now,
        }));
        localStorage.setItem(INVENTORY_ITEMS_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  getItemById(id: string): InventoryItem | undefined {
    return this.getItems().find((item) => item.id === id);
  },

  addItem(
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): InventoryItem {
    const items = this.getItems();
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newItem);
    localStorage.setItem(INVENTORY_ITEMS_KEY, JSON.stringify(items));
    return newItem;
  },

  updateItem(item: InventoryItem): InventoryItem {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      items[index] = {
        ...item,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(INVENTORY_ITEMS_KEY, JSON.stringify(items));
      return items[index];
    }
    return item;
  },

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length !== items.length) {
      localStorage.setItem(INVENTORY_ITEMS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  // ─── DOCUMENTS ──────────────────────────────────────────
  getDocuments(): InventoryDocument[] {
    try {
      const stored = localStorage.getItem(INVENTORY_DOCS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  getDocumentById(id: string): InventoryDocument | undefined {
    return this.getDocuments().find((d) => d.id === id);
  },

  createDocumentNumber(): string {
    let counter = 1;
    try {
      const stored = localStorage.getItem(INVENTORY_COUNTER_KEY);
      if (stored) {
        counter = parseInt(stored, 10) + 1;
      }
    } catch {
      counter = 1;
    }
    localStorage.setItem(INVENTORY_COUNTER_KEY, String(counter));
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    return `DOC-${dateStr}-${String(counter).padStart(3, '0')}`;
  },

  saveDocument(
    docData: Omit<InventoryDocument, 'id' | 'docNumber' | 'createdAt'> & {
      id?: string;
      docNumber?: string;
    }
  ): InventoryDocument {
    const docs = this.getDocuments();
    const now = new Date().toISOString();
    const id = docData.id || `invdoc-${Date.now()}`;
    const docNumber = docData.docNumber || this.createDocumentNumber();

    // Calculate total amount if prices are provided
    let totalAmount: number | undefined = undefined;
    const itemsWithTotals = docData.items.map((it) => {
      const qVal = typeof it.quantity === 'number' ? it.quantity : parseFloat(String(it.quantity)) || 0;
      const itemTotal =
        typeof it.unitPrice === 'number' && !isNaN(it.unitPrice) && it.unitPrice > 0
          ? Math.round(qVal * it.unitPrice * 100) / 100
          : undefined;
      if (itemTotal !== undefined) {
        totalAmount = (totalAmount || 0) + itemTotal;
      }
      return {
        ...it,
        totalPrice: itemTotal,
      };
    });

    const newDoc: InventoryDocument = {
      ...docData,
      id,
      docNumber,
      items: itemsWithTotals,
      totalAmount,
      createdAt: now,
    };

    const existingIdx = docs.findIndex((d) => d.id === id);
    if (existingIdx !== -1) {
      docs[existingIdx] = newDoc;
    } else {
      docs.unshift(newDoc);
    }

    localStorage.setItem(INVENTORY_DOCS_KEY, JSON.stringify(docs));
    return newDoc;
  },

  deleteDocument(id: string): boolean {
    const docs = this.getDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    if (filtered.length !== docs.length) {
      localStorage.setItem(INVENTORY_DOCS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  // ─── CSV EXPORT ──────────────────────────────────────────
  exportToCsv(doc: InventoryDocument, lang: 'en' | 'ta' = 'en'): void {
    const isTa = lang === 'ta';
    const headers = isTa
      ? ['வ.எண்', 'பொருளின் பெயர்', 'வகை', 'அளவு', 'அலகு', 'விலை (₹)', 'மொத்தம் (₹)', 'குறிப்பு']
      : ['S.No.', 'Item Name', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Total Price', 'Notes'];

    const rows = doc.items.map((item, index) => {
      const name = isTa ? item.nameTa || item.nameEn : item.nameEn;
      const cat = isTa ? item.categoryNameTa || item.categoryNameEn || '' : item.categoryNameEn || '';
      const unit = formatUnitLabel(item.unit, lang);
      const unitPrice = item.unitPrice !== undefined && item.unitPrice > 0 ? `₹${item.unitPrice}` : '';
      const totalPrice = item.totalPrice !== undefined && item.totalPrice > 0 ? `₹${item.totalPrice}` : '';
      const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';

      return [
        index + 1,
        `"${name.replace(/"/g, '""')}"`,
        `"${cat.replace(/"/g, '""')}"`,
        item.quantity,
        `"${unit}"`,
        unitPrice,
        totalPrice,
        notes,
      ].join(',');
    });

    const titleRow = `"${doc.title} - ${doc.eventName}"`;
    const metaRow = isTa
      ? `"ஆவண எண்: ${doc.docNumber} | தேதி: ${doc.documentDate} | நிகழ்வு தேதி: ${doc.eventDate || '—'} | வாடிக்கையாளர்: ${doc.customerName || '—'}"`
      : `"Doc No: ${doc.docNumber} | Date: ${doc.documentDate} | Event Date: ${doc.eventDate || '—'} | Customer: ${doc.customerName || '—'}"`;

    const csvContent = '\uFEFF' + [titleRow, metaRow, '', headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.docNumber}-${doc.eventName.replace(/[^a-zA-Z0-9_-]/g, '_')}-${lang.toUpperCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
