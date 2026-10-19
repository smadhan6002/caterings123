/**
 * kitchenSheetService — localStorage-based kitchen order sheet persistence.
 * Designed to map cleanly to Supabase or any REST/SQL backend in the future.
 */
import type { Order, KitchenOrderSheet, KitchenSheetItem, KitchenPrepStatus } from '../types/admin';
import { orderService } from './orderService';
import { getDishUnitConfig } from '../data/units';
import { ta } from '../locales/ta';

const KITCHEN_SHEETS_KEY = 'annapoorna_kitchen_sheets';

export interface KitchenUnitOption {
  value: string;
  labelEn: string;
  labelTa: string;
  shortEn: string;
  shortTa: string;
  allowDecimals: boolean;
}

export const KITCHEN_UNIT_OPTIONS: KitchenUnitOption[] = [
  { value: 'kg', labelEn: 'Kilograms (kg)', labelTa: 'கிலோகிராம் (kg)', shortEn: 'kg', shortTa: 'கிலோ', allowDecimals: true },
  { value: 'g', labelEn: 'Grams (g)', labelTa: 'கிராம் (g)', shortEn: 'g', shortTa: 'கிராம்', allowDecimals: false },
  { value: 'Litres', labelEn: 'Litres (L)', labelTa: 'லிட்டர் (L)', shortEn: 'L', shortTa: 'லிட்டர்', allowDecimals: true },
  { value: 'ml', labelEn: 'Millilitres (ml)', labelTa: 'மில்லிலிட்டர் (ml)', shortEn: 'ml', shortTa: 'மி.லி', allowDecimals: false },
  { value: 'Pieces', labelEn: 'Pieces (pcs)', labelTa: 'துண்டுகள் (pcs)', shortEn: 'pcs', shortTa: 'எண்ணிக்கை', allowDecimals: false },
  { value: 'Cups', labelEn: 'Cups', labelTa: 'கப்புகள்', shortEn: 'cups', shortTa: 'கப்', allowDecimals: false },
  { value: 'Plates', labelEn: 'Plates', labelTa: 'தட்டுகள்', shortEn: 'plates', shortTa: 'தட்டு', allowDecimals: false },
  { value: 'Packs', labelEn: 'Packs / Packets', labelTa: 'பாக்கெட்டுகள்', shortEn: 'packs', shortTa: 'பாக்கெட்', allowDecimals: false },
  { value: 'Trays', labelEn: 'Trays', labelTa: 'டிரேக்கள் (Trays)', shortEn: 'trays', shortTa: 'டிரே', allowDecimals: false },
  { value: 'Buckets', labelEn: 'Buckets', labelTa: 'வாளிகள் (Buckets)', shortEn: 'buckets', shortTa: 'வாளி', allowDecimals: false },
  { value: 'Servings', labelEn: 'Servings / Portions', labelTa: 'பங்குகள் (Servings)', shortEn: 'servings', shortTa: 'பங்கு', allowDecimals: false },
  { value: 'Custom', labelEn: 'Other Custom Unit…', labelTa: 'மற்ற தனிப்பயன் அலகு…', shortEn: '', shortTa: '', allowDecimals: true },
];

export function getTamilDishName(dishName: string, dishId?: string): string {
  if (ta.dishTranslationsByEnglishName?.[dishName]) {
    return ta.dishTranslationsByEnglishName[dishName];
  }
  if (dishId && (ta.dishes as Record<string, string>)[dishId]) {
    return (ta.dishes as Record<string, string>)[dishId];
  }
  return '';
}

export function formatUnitLabel(unit: string, isTamil = false): string {
  const match = KITCHEN_UNIT_OPTIONS.find(
    (u) => u.value.toLowerCase() === unit.toLowerCase() || u.shortEn.toLowerCase() === unit.toLowerCase()
  );
  if (match) {
    return isTamil ? match.shortTa || match.labelTa : match.shortEn || match.labelEn;
  }
  return unit;
}

export const kitchenSheetService = {
  getAll(): KitchenOrderSheet[] {
    try {
      return JSON.parse(localStorage.getItem(KITCHEN_SHEETS_KEY) || '[]') as KitchenOrderSheet[];
    } catch {
      return [];
    }
  },

  getByOrderId(orderId: string): KitchenOrderSheet | undefined {
    return this.getAll().find((s) => s.orderId === orderId);
  },

  getOrCreateForOrder(order: Order, defaultLang: 'en' | 'ta' = 'en'): KitchenOrderSheet {
    const existing = this.getByOrderId(order.id);
    if (existing) {
      return existing;
    }

    // Compile items from customer's order
    const items: KitchenSheetItem[] = [];
    const processedDishIds = new Set<string>();

    // 1. Items selected by customer
    (order.items || []).forEach((item, index) => {
      processedDishIds.add(item.dishId || item.dishName);

      const matchedFq = order.foodQuantities?.find(
        (fq) => (item.dishId && fq.dishId === item.dishId) || fq.dishName === item.dishName
      );

      const customerQty = item.quantity ?? matchedFq?.quantity ?? null;
      const customerUnit = item.unit ?? matchedFq?.unit ?? '';

      // Determine appropriate default unit
      const unitCfg = getDishUnitConfig(item.categoryId);
      const chosenUnit = customerUnit || unitCfg.defaultUnit || 'kg';

      items.push({
        id: `kos-item-${index + 1}-${Date.now()}`,
        dishId: item.dishId || `dish-${index + 1}`,
        dishName: item.dishName,
        dishNameTa: getTamilDishName(item.dishName, item.dishId),
        customerQuantity: customerQty,
        customerUnit: customerUnit,
        prepQuantity: customerQty !== null ? customerQty : '',
        unit: chosenUnit,
        isCustomUnit: !KITCHEN_UNIT_OPTIONS.some((u) => u.value.toLowerCase() === chosenUnit.toLowerCase()),
        kitchenNotes: item.notes || matchedFq?.note || '',
      });
    });

    // 2. Extra customer food quantities if not already listed
    if (order.foodQuantities) {
      order.foodQuantities.forEach((fq, idx) => {
        if (!processedDishIds.has(fq.dishId) && !processedDishIds.has(fq.dishName)) {
          processedDishIds.add(fq.dishId || fq.dishName);
          items.push({
            id: `kos-item-extra-${idx + 1}-${Date.now()}`,
            dishId: fq.dishId || `dish-extra-${idx + 1}`,
            dishName: fq.dishName,
            dishNameTa: getTamilDishName(fq.dishName, fq.dishId),
            customerQuantity: fq.quantity,
            customerUnit: fq.unit,
            prepQuantity: fq.quantity,
            unit: fq.unit || 'kg',
            isCustomUnit: !KITCHEN_UNIT_OPTIONS.some((u) => u.value.toLowerCase() === (fq.unit || '').toLowerCase()),
            kitchenNotes: fq.note || '',
          });
        }
      });
    }

    const now = new Date().toISOString();
    const newSheet: KitchenOrderSheet = {
      id: `KOS-${order.id}`,
      orderId: order.id,
      customerName: order.customerName,
      mobile: order.mobile,
      alternativeMobile: order.alternativeMobile,
      eventAddress: order.eventAddress,
      eventType: order.eventType,
      orderDate: order.orderDate,
      deliveryTime: order.deliveryTime,
      guestCount: order.guestCount,
      createdAt: now,
      updatedAt: now,
      items,
      status: order.kitchenSheetStatus || 'Not Prepared',
      cookingInstructions: order.notes || '',
      chefNotes: '',
      pdfLanguage: defaultLang,
    };

    return newSheet;
  },

  save(sheet: KitchenOrderSheet): KitchenOrderSheet {
    const sheets = this.getAll();
    const idx = sheets.findIndex((s) => s.orderId === sheet.orderId);
    const updatedSheet: KitchenOrderSheet = {
      ...sheet,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      sheets[idx] = updatedSheet;
    } else {
      sheets.push(updatedSheet);
    }

    localStorage.setItem(KITCHEN_SHEETS_KEY, JSON.stringify(sheets));

    // Also update order's kitchenSheetStatus in orderService without mutating order.status
    try {
      const order = orderService.getById(sheet.orderId);
      if (order && order.kitchenSheetStatus !== sheet.status) {
        orderService.update(sheet.orderId, { kitchenSheetStatus: sheet.status });
      }
    } catch {
      // safe fallback
    }

    return updatedSheet;
  },

  updateStatus(orderId: string, status: KitchenPrepStatus): KitchenOrderSheet | undefined {
    const sheet = this.getByOrderId(orderId);
    if (!sheet) {
      // If sheet doesn't exist yet, create from order
      const order = orderService.getById(orderId);
      if (!order) return undefined;
      const newSheet = this.getOrCreateForOrder(order);
      newSheet.status = status;
      return this.save(newSheet);
    }
    sheet.status = status;
    return this.save(sheet);
  },

  delete(orderId: string): void {
    const sheets = this.getAll().filter((s) => s.orderId !== orderId);
    localStorage.setItem(KITCHEN_SHEETS_KEY, JSON.stringify(sheets));
  },
};
