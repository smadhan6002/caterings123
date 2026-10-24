/**
 * rentalService — handles rental items inventory, categories, transactions and documents
 * Data is stored in localStorage under 'annapoorna_rental_*' keys.
 * Kept completely separate from food dishes and catering food orders.
 */
import type {
  RentalCategory,
  RentalItem,
  RentalDocument,
  RentalDocItem,
  RentalStatus,
} from '../types/rental';

const RENTAL_ITEMS_KEY = 'annapoorna_rental_items';
const RENTAL_CATEGORIES_KEY = 'annapoorna_rental_categories';
const RENTAL_DOCS_KEY = 'annapoorna_rental_documents';
const RENTAL_COUNTER_KEY = 'annapoorna_rental_counter';

export const DEFAULT_RENTAL_CATEGORIES: RentalCategory[] = [
  { id: 'cat-cooking', name: 'Cooking Vessels', nameTa: 'சமையல் பாத்திரங்கள்', description: 'Large pots, andas, cauldrons for cooking' },
  { id: 'cat-serving', name: 'Serving Vessels', nameTa: 'பரிமாறும் பாத்திரங்கள்', description: 'Buckets, basins, spoons, serving dishes' },
  { id: 'cat-carriers', name: 'Food Carriers', nameTa: 'உணவு எடுத்துச் செல்லும் பாத்திரங்கள்', description: 'Multi-tier carriers, food drums with lids' },
  { id: 'cat-hotboxes', name: 'Hot Boxes', nameTa: 'ஹாட்பாக்ஸ் வகைகள்', description: 'Insulated hot cases and casseroles' },
  { id: 'cat-plates', name: 'Plates and Trays', nameTa: 'தட்டுகள் & தட்டகங்கள்', description: 'Dining plates, water tumblers, buffet trays' },
  { id: 'cat-beverages', name: 'Beverage Equipment', nameTa: 'பான சாதனங்கள்', description: 'Coffee flasks, tea cans, milk warmers' },
  { id: 'cat-other', name: 'Other Items', nameTa: 'இதர பொருட்கள்', description: 'Miscellaneous catering equipment & accessories' },
];

export const INITIAL_RENTAL_ITEMS: Omit<RentalItem, 'id' | 'availableQuantity' | 'createdAt'>[] = [
  {
    code: 'RNT-001',
    nameEn: 'Anda (Large Cooking Vessel)',
    nameTa: 'அண்டா',
    categoryId: 'cat-cooking',
    totalQuantity: 25,
    rentalPrice: 150,
    pricingUnit: 'Per Day',
    securityDeposit: 500,
    description: 'Heavy duty stainless steel cooking cauldron for large feasts',
    isActive: true,
  },
  {
    code: 'RNT-002',
    nameEn: 'Aadukku (Tiered Cooking Pots)',
    nameTa: 'அடுக்கு',
    categoryId: 'cat-cooking',
    totalQuantity: 20,
    rentalPrice: 120,
    pricingUnit: 'Per Day',
    securityDeposit: 400,
    description: 'Traditional tiered cooking vessel set',
    isActive: true,
  },
  {
    code: 'RNT-003',
    nameEn: 'Thookku with Lid',
    nameTa: 'தூக்கு (மூடியுடன்)',
    categoryId: 'cat-cooking',
    totalQuantity: 30,
    rentalPrice: 80,
    pricingUnit: 'Per Day',
    securityDeposit: 200,
    description: 'Deep storage and cooking vessel with tight fitting lid',
    isActive: true,
  },
  {
    code: 'RNT-004',
    nameEn: 'Thookku without Lid',
    nameTa: 'தூக்கு (மூடி இல்லாமல்)',
    categoryId: 'cat-cooking',
    totalQuantity: 20,
    rentalPrice: 60,
    pricingUnit: 'Per Day',
    securityDeposit: 150,
    description: 'Deep open vessel for mixing and holding liquids',
    isActive: true,
  },
  {
    code: 'RNT-005',
    nameEn: 'Drum with Lid',
    nameTa: 'டிரம் (மூடியுடன்)',
    categoryId: 'cat-carriers',
    totalQuantity: 20,
    rentalPrice: 150,
    pricingUnit: 'Per Day',
    securityDeposit: 500,
    description: 'Large food transport drum with lockable lid',
    isActive: true,
  },
  {
    code: 'RNT-006',
    nameEn: 'Drum without Lid',
    nameTa: 'டிரம் (மூடி இல்லாமல்)',
    categoryId: 'cat-carriers',
    totalQuantity: 15,
    rentalPrice: 100,
    pricingUnit: 'Per Day',
    securityDeposit: 300,
    description: 'Large capacity holding drum',
    isActive: true,
  },
  {
    code: 'RNT-007',
    nameEn: 'Carrier (Multi-tier Food Carrier)',
    nameTa: 'கேரியர்',
    categoryId: 'cat-carriers',
    totalQuantity: 35,
    rentalPrice: 90,
    pricingUnit: 'Per Day',
    securityDeposit: 250,
    description: 'Multi-layer food carrier container',
    isActive: true,
  },
  {
    code: 'RNT-008',
    nameEn: 'Hotbox (Insulated Casserole)',
    nameTa: 'ஹாட்பாக்ஸ்',
    categoryId: 'cat-hotboxes',
    totalQuantity: 40,
    rentalPrice: 100,
    pricingUnit: 'Per Day',
    securityDeposit: 300,
    description: 'High-retention thermal insulated hotbox for rice & sides',
    isActive: true,
  },
  {
    code: 'RNT-009',
    nameEn: 'Bucket (Sambar / Rasam Bucket)',
    nameTa: 'பக்கெட்',
    categoryId: 'cat-serving',
    totalQuantity: 60,
    rentalPrice: 40,
    pricingUnit: 'Per Day',
    securityDeposit: 100,
    description: 'Stainless steel serving bucket with handle for gravies',
    isActive: true,
  },
  {
    code: 'RNT-010',
    nameEn: 'Basin (Mixing & Serving Basin)',
    nameTa: 'பேசின்',
    categoryId: 'cat-serving',
    totalQuantity: 45,
    rentalPrice: 50,
    pricingUnit: 'Per Day',
    securityDeposit: 150,
    description: 'Wide stainless steel basin for rice service and salad mixing',
    isActive: true,
  },
  {
    code: 'RNT-011',
    nameEn: 'Thattu (Dining Plates & Trays)',
    nameTa: 'தட்டு',
    categoryId: 'cat-plates',
    totalQuantity: 500,
    rentalPrice: 5,
    pricingUnit: 'Per Item',
    securityDeposit: 10,
    description: 'Standard stainless steel dinner plates',
    isActive: true,
  },
  {
    code: 'RNT-012',
    nameEn: 'Coffee Flask (Beverage Dispenser)',
    nameTa: 'காபி பிளாஸ்க்',
    categoryId: 'cat-beverages',
    totalQuantity: 25,
    rentalPrice: 200,
    pricingUnit: 'Per Day',
    securityDeposit: 600,
    description: 'Insulated hot coffee and tea dispenser with tap',
    isActive: true,
  },
];

function getRentalCounter(): number {
  return parseInt(localStorage.getItem(RENTAL_COUNTER_KEY) || '0', 10);
}

function generateRentalNumber(): string {
  const n = getRentalCounter() + 1;
  localStorage.setItem(RENTAL_COUNTER_KEY, String(n));
  return `RENT-${String(n).padStart(4, '0')}`;
}

export const rentalService = {
  // ─── CATEGORIES ────────────────────────────────────────────────────────
  getCategories(): RentalCategory[] {
    try {
      const stored = localStorage.getItem(RENTAL_CATEGORIES_KEY);
      if (!stored) {
        localStorage.setItem(RENTAL_CATEGORIES_KEY, JSON.stringify(DEFAULT_RENTAL_CATEGORIES));
        return DEFAULT_RENTAL_CATEGORIES;
      }
      return JSON.parse(stored) as RentalCategory[];
    } catch {
      return DEFAULT_RENTAL_CATEGORIES;
    }
  },

  addCategory(data: { name: string; nameTa: string; description?: string }): RentalCategory {
    const cats = this.getCategories();
    const id = `cat-custom-${Date.now()}`;
    const newCat: RentalCategory = { id, ...data };
    cats.push(newCat);
    localStorage.setItem(RENTAL_CATEGORIES_KEY, JSON.stringify(cats));
    return newCat;
  },

  updateCategory(id: string, data: Partial<RentalCategory>): RentalCategory | undefined {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    cats[idx] = { ...cats[idx], ...data };
    localStorage.setItem(RENTAL_CATEGORIES_KEY, JSON.stringify(cats));
    return cats[idx];
  },

  // ─── ITEMS ─────────────────────────────────────────────────────────────
  getRawItems(): RentalItem[] {
    try {
      const stored = localStorage.getItem(RENTAL_ITEMS_KEY);
      if (!stored) {
        const seeded: RentalItem[] = INITIAL_RENTAL_ITEMS.map((item, idx) => ({
          id: `rnt-itm-${String(idx + 1).padStart(4, '0')}`,
          ...item,
          availableQuantity: item.totalQuantity,
          createdAt: new Date().toISOString(),
        }));
        localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(stored) as RentalItem[];
    } catch {
      return [];
    }
  },

  /**
   * Returns items with real-time synchronized available quantities
   * Guaranteed against double-deduction or forgotten stock returns
   */
  getAllItems(): RentalItem[] {
    const items = this.getRawItems();
    const documents = this.getAllDocuments();

    // Calculate how many units are currently out on rent
    // Documents with status 'Items Issued', 'Confirmed', or 'Partially Returned'
    const rentedCountMap: Record<string, number> = {};
    for (const doc of documents) {
      if (doc.status === 'Items Issued' || doc.status === 'Confirmed' || doc.status === 'Partially Returned') {
        for (const itm of doc.items) {
          const outQty = Math.max(0, itm.quantity - (itm.returnedQuantity || 0));
          rentedCountMap[itm.itemId] = (rentedCountMap[itm.itemId] || 0) + outQty;
        }
      }
    }

    return items.map((item) => {
      const currentlyRented = rentedCountMap[item.id] || 0;
      const available = Math.max(0, item.totalQuantity - currentlyRented);
      return {
        ...item,
        availableQuantity: available,
      };
    });
  },

  getActiveItems(): RentalItem[] {
    return this.getAllItems().filter((item) => item.isActive);
  },

  getItemById(id: string): RentalItem | undefined {
    return this.getAllItems().find((item) => item.id === id);
  },

  getItemByCode(code: string): RentalItem | undefined {
    const trimmed = code.trim().toLowerCase();
    return this.getAllItems().find((item) => item.code.trim().toLowerCase() === trimmed);
  },

  addItem(
    data: Omit<RentalItem, 'id' | 'availableQuantity' | 'createdAt' | 'updatedAt'>
  ): RentalItem {
    const items = this.getRawItems();

    // Check code uniqueness
    const code = data.code.trim();
    if (items.some((i) => i.code.toLowerCase() === code.toLowerCase())) {
      throw new Error(`Item code "${code}" already exists. Please choose a unique code.`);
    }

    const nextId = `rnt-itm-${String(items.length + 1).padStart(4, '0')}`;
    const newItem: RentalItem = {
      ...data,
      id: nextId,
      code,
      availableQuantity: Math.max(0, data.totalQuantity),
      createdAt: new Date().toISOString(),
    };

    items.push(newItem);
    localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
    return newItem;
  },

  updateItem(
    id: string,
    changes: Partial<Omit<RentalItem, 'id' | 'createdAt'>>
  ): RentalItem | undefined {
    const items = this.getRawItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;

    // If code is being changed, verify uniqueness
    if (changes.code) {
      const code = changes.code.trim();
      const duplicate = items.find((i) => i.id !== id && i.code.toLowerCase() === code.toLowerCase());
      if (duplicate) {
        throw new Error(`Item code "${code}" is already in use by another item.`);
      }
      changes.code = code;
    }

    items[idx] = {
      ...items[idx],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
    return items[idx];
  },

  /**
   * Delete or soft-deactivate an item.
   * If item is referenced in any existing rental document, it is safely soft-deactivated.
   */
  deleteItem(id: string): { softDeleted: boolean } {
    const documents = this.getAllDocuments();
    const isReferenced = documents.some((doc) => doc.items.some((i) => i.itemId === id));

    if (isReferenced) {
      // Soft deactivate to protect historical transaction integrity
      this.updateItem(id, { isActive: false });
      return { softDeleted: true };
    }

    const items = this.getRawItems().filter((i) => i.id !== id);
    localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
    return { softDeleted: false };
  },

  // ─── DOCUMENTS & TRANSACTIONS ──────────────────────────────────────────
  getAllDocuments(): RentalDocument[] {
    try {
      return JSON.parse(localStorage.getItem(RENTAL_DOCS_KEY) || '[]') as RentalDocument[];
    } catch {
      return [];
    }
  },

  getDocumentById(id: string): RentalDocument | undefined {
    return this.getAllDocuments().find((d) => d.id === id || d.rentalNumber === id);
  },

  /**
   * Calculates subtotal, balance due, etc.
   */
  computeTotals(doc: {
    items: RentalDocItem[];
    additionalCharges?: number;
    discount?: number;
    securityDeposit?: number;
    advancePaid?: number;
  }) {
    const subtotal = doc.items.reduce((s, itm) => s + (itm.quantity * itm.pricePerUnit), 0);
    const additional = doc.additionalCharges || 0;
    const disc = doc.discount || 0;
    const deposit = doc.securityDeposit || 0;
    const grandTotal = Math.max(0, subtotal + additional - disc + deposit);
    const advance = doc.advancePaid || 0;
    const balanceDue = Math.max(0, grandTotal - advance);

    return {
      subtotal,
      additionalCharges: additional,
      discount: disc,
      securityDeposit: deposit,
      grandTotal,
      advancePaid: advance,
      balanceDue,
    };
  },

  addDocument(
    data: Omit<RentalDocument, 'id' | 'rentalNumber' | 'createdAt' | 'updatedAt' | 'subtotal' | 'grandTotal' | 'balanceDue'>
  ): RentalDocument {
    const documents = this.getAllDocuments();
    const rentalNumber = generateRentalNumber();
    const totals = this.computeTotals(data);

    // Snapshot line totals
    const preparedItems = data.items.map((i) => ({
      ...i,
      lineTotal: i.quantity * i.pricePerUnit,
      returnedQuantity: i.returnedQuantity || 0,
    }));

    const newDoc: RentalDocument = {
      ...data,
      id: `rent-doc-${Date.now()}`,
      rentalNumber,
      items: preparedItems,
      ...totals,
      createdAt: new Date().toISOString(),
    };

    documents.unshift(newDoc);
    localStorage.setItem(RENTAL_DOCS_KEY, JSON.stringify(documents));
    return newDoc;
  },

  updateDocument(
    id: string,
    changes: Partial<Omit<RentalDocument, 'id' | 'rentalNumber' | 'createdAt'>>
  ): RentalDocument | undefined {
    const documents = this.getAllDocuments();
    const idx = documents.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;

    const existing = documents[idx];
    const items = changes.items || existing.items;

    // Recalculate line totals
    const preparedItems = items.map((i) => ({
      ...i,
      lineTotal: i.quantity * i.pricePerUnit,
    }));

    const totals = this.computeTotals({
      items: preparedItems,
      additionalCharges: changes.additionalCharges ?? existing.additionalCharges,
      discount: changes.discount ?? existing.discount,
      securityDeposit: changes.securityDeposit ?? existing.securityDeposit,
      advancePaid: changes.advancePaid ?? existing.advancePaid,
    });

    documents[idx] = {
      ...existing,
      ...changes,
      items: preparedItems,
      ...totals,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(RENTAL_DOCS_KEY, JSON.stringify(documents));
    return documents[idx];
  },

  updateStatus(
    id: string,
    status: RentalStatus,
    actualReturnDate?: string,
    notes?: string
  ): RentalDocument | undefined {
    const doc = this.getDocumentById(id);
    if (!doc) return undefined;

    const updates: Partial<RentalDocument> = { status };
    if (actualReturnDate) updates.actualReturnDate = actualReturnDate;
    if (notes !== undefined) {
      updates.notes = doc.notes ? `${doc.notes}\n${notes}` : notes;
    }

    // If marking as returned, also mark all items as returned unless specified
    if (status === 'Returned') {
      updates.items = doc.items.map((i) => ({
        ...i,
        returnedQuantity: i.quantity,
      }));
      if (!updates.actualReturnDate) {
        updates.actualReturnDate = new Date().toISOString().split('T')[0];
      }
    }

    return this.updateDocument(id, updates);
  },

  deleteDocument(id: string): void {
    const documents = this.getAllDocuments().filter((d) => d.id !== id);
    localStorage.setItem(RENTAL_DOCS_KEY, JSON.stringify(documents));
  },
};
