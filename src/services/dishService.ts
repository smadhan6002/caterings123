/**
 * dishService — unified dish catalogue & persistence manager
 * Handles both built-in dishes (with editable overrides) and custom admin-added dishes.
 * Preserves historical order details, unit configs, and custom Tamil translations.
 */
import type { AdminDish } from '../types/admin';
import { categories as staticCategories } from '../data/menu';
import { getDishUnitConfig } from '../data/units';
import { ta } from '../locales/ta';

const DISHES_KEY = 'annapoorna_admin_dishes';
const DISH_COUNTER_KEY = 'annapoorna_dish_counter';
const UNIT_OVERRIDES_KEY = 'annapoorna_dish_unit_overrides';
const DISH_OVERRIDES_KEY = 'annapoorna_dish_overrides';
const DISH_TAMIL_NAMES_KEY = 'annapoorna_dish_tamil_names';
const DEACTIVATED_DISHES_KEY = 'annapoorna_deactivated_dishes';

export interface DishUnitOverride {
  defaultUnit: string;
  supportedUnits?: string[];
}

export interface DishOverride {
  name?: string;
  nameTa?: string;
  categoryId?: string;
  image?: string;
  defaultUnit?: string;
  isActive?: boolean;
}

export interface UnifiedDish {
  id: string;
  name: string;
  nameTa: string;
  categoryId: string;
  categoryName: string;
  image: string;
  defaultUnit: string;
  isBuiltIn: boolean;
  isAdminAdded: boolean;
  isActive: boolean;
}

function getDishCounter(): number {
  return parseInt(localStorage.getItem(DISH_COUNTER_KEY) || '0', 10);
}

function generateDishId(): string {
  const n = getDishCounter() + 1;
  localStorage.setItem(DISH_COUNTER_KEY, String(n));
  return `adm-${String(n).padStart(4, '0')}`;
}

export const dishService = {
  // Backward compatibility: get raw admin dishes
  getAll(): AdminDish[] {
    try {
      return JSON.parse(localStorage.getItem(DISHES_KEY) || '[]') as AdminDish[];
    } catch {
      return [];
    }
  },

  getOverrides(): Record<string, DishOverride> {
    try {
      return JSON.parse(localStorage.getItem(DISH_OVERRIDES_KEY) || '{}');
    } catch {
      return {};
    }
  },

  setOverride(dishId: string, changes: DishOverride): void {
    const allOverrides = this.getOverrides();
    allOverrides[dishId] = { ...(allOverrides[dishId] || {}), ...changes };
    localStorage.setItem(DISH_OVERRIDES_KEY, JSON.stringify(allOverrides));
  },

  getDeactivatedDishIds(): string[] {
    try {
      return JSON.parse(localStorage.getItem(DEACTIVATED_DISHES_KEY) || '[]');
    } catch {
      return [];
    }
  },

  getCustomTamilNames(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(DISH_TAMIL_NAMES_KEY) || '{}');
    } catch {
      return {};
    }
  },

  getCustomTamilName(dishId: string): string | undefined {
    const names = this.getCustomTamilNames();
    if (names[dishId]) return names[dishId];
    const overrides = this.getOverrides();
    return overrides[dishId]?.nameTa;
  },

  setCustomTamilName(dishId: string, nameTa: string): void {
    const names = this.getCustomTamilNames();
    names[dishId] = nameTa;
    localStorage.setItem(DISH_TAMIL_NAMES_KEY, JSON.stringify(names));
    this.setOverride(dishId, { nameTa });
  },

  /**
   * Retrieves the comprehensive, unified dish catalogue
   * Merges static catalogue + admin custom dishes + overrides + unit configurations
   */
  getAllDishes(): UnifiedDish[] {
    const overrides = this.getOverrides();
    const deactivated = this.getDeactivatedDishIds();
    const customTamil = this.getCustomTamilNames();
    const adminDishes = this.getAll();
    const list: UnifiedDish[] = [];

    // 1. Static built-in dishes
    staticCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        const ovr = overrides[item.id] || {};
        const isDeactivated = ovr.isActive !== undefined ? !ovr.isActive : deactivated.includes(item.id);
        const unitOverride = this.getDishUnit(item.id);
        const unitCfg = unitOverride || getDishUnitConfig(item.categoryId);

        const canonicalName = ovr.name || item.name;
        const canonicalCatId = ovr.categoryId || item.categoryId;
        const currentCat = staticCategories.find((c) => c.id === canonicalCatId);
        const categoryName = currentCat ? currentCat.name : canonicalCatId;

        // Resolve Tamil name
        const nameTa =
          ovr.nameTa ||
          customTamil[item.id] ||
          ta.dishTranslationsByEnglishName?.[canonicalName] ||
          ta.dishTranslationsByEnglishName?.[item.name] ||
          (ta.dishes as Record<string, string>)[item.id] ||
          canonicalName;

        list.push({
          id: item.id,
          name: canonicalName,
          nameTa,
          categoryId: canonicalCatId,
          categoryName,
          image: ovr.image || item.image,
          defaultUnit: ovr.defaultUnit || unitCfg.defaultUnit,
          isBuiltIn: true,
          isAdminAdded: false,
          isActive: !isDeactivated,
        });
      });
    });

    // 2. Custom admin-added dishes
    adminDishes.forEach((ad) => {
      const ovr = overrides[ad.id] || {};
      const isDeactivated = ovr.isActive !== undefined ? !ovr.isActive : deactivated.includes(ad.id);
      const unitOverride = this.getDishUnit(ad.id);
      const unitCfg = unitOverride || getDishUnitConfig(ad.categoryId);

      const canonicalName = ovr.name || ad.name;
      const canonicalCatId = ovr.categoryId || ad.categoryId;
      const currentCat = staticCategories.find((c) => c.id === canonicalCatId);
      const categoryName = currentCat ? currentCat.name : canonicalCatId;

      const nameTa =
        ovr.nameTa ||
        customTamil[ad.id] ||
        (ta.dishes as Record<string, string>)[ad.id] ||
        ta.dishTranslationsByEnglishName?.[canonicalName] ||
        canonicalName;

      list.push({
        id: ad.id,
        name: canonicalName,
        nameTa,
        categoryId: canonicalCatId,
        categoryName,
        image: ovr.image || ad.image,
        defaultUnit: ovr.defaultUnit || ad.defaultUnit || unitCfg.defaultUnit,
        isBuiltIn: false,
        isAdminAdded: true,
        isActive: !isDeactivated,
      });
    });

    return list;
  },

  /**
   * Returns active dishes only, optionally filtered by category
   */
  getActiveDishes(categoryId?: string): UnifiedDish[] {
    const all = this.getAllDishes().filter((d) => d.isActive);
    if (!categoryId || categoryId === 'all') return all;
    return all.filter((d) => d.categoryId === categoryId);
  },

  /**
   * Look up a dish by ID (even if deactivated, guaranteeing past order integrity)
   */
  getDishById(id: string): UnifiedDish | undefined {
    return this.getAllDishes().find((d) => d.id === id);
  },

  /**
   * Add a new custom dish
   */
  add(data: Omit<AdminDish, 'id' | 'isAdminAdded'> & { nameTa?: string }): AdminDish {
    const dishes = this.getAll();
    const dishId = generateDishId();
    const dish: AdminDish = {
      id: dishId,
      name: data.name,
      categoryId: data.categoryId,
      image: data.image,
      isAdminAdded: true,
      defaultUnit: data.defaultUnit,
    };
    dishes.push(dish);
    localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));

    if (data.nameTa) {
      this.setCustomTamilName(dishId, data.nameTa);
    }
    if (data.defaultUnit) {
      this.setUnitOverride(dishId, data.defaultUnit);
    }

    return dish;
  },

  /**
   * Update any dish (built-in or admin-added)
   */
  updateDish(
    id: string,
    changes: {
      name?: string;
      nameTa?: string;
      categoryId?: string;
      image?: string;
      defaultUnit?: string;
      isActive?: boolean;
    }
  ): void {
    // 1. Update override table
    this.setOverride(id, changes);

    // 2. If it's an admin dish, also update the raw admin entry
    const dishes = this.getAll();
    const idx = dishes.findIndex((d) => d.id === id);
    if (idx !== -1) {
      dishes[idx] = {
        ...dishes[idx],
        name: changes.name ?? dishes[idx].name,
        categoryId: changes.categoryId ?? dishes[idx].categoryId,
        image: changes.image ?? dishes[idx].image,
        defaultUnit: changes.defaultUnit ?? dishes[idx].defaultUnit,
      };
      localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));
    }

    // 3. Update Tamil name if provided
    if (changes.nameTa) {
      this.setCustomTamilName(id, changes.nameTa);
    }

    // 4. Update unit override if provided
    if (changes.defaultUnit) {
      this.setUnitOverride(id, changes.defaultUnit);
    }

    // 5. Update active status if provided
    if (changes.isActive !== undefined) {
      if (changes.isActive) {
        this.reactivateDish(id);
      } else {
        this.deactivateDish(id);
      }
    }
  },

  // Backward compatibility alias
  update(id: string, changes: Partial<Omit<AdminDish, 'id' | 'isAdminAdded'>>): AdminDish | undefined {
    this.updateDish(id, changes);
    return this.getAll().find((d) => d.id === id);
  },

  /**
   * Soft-deactivate a dish so it disappears from customer menu while preserving orders
   */
  deactivateDish(id: string): void {
    const deactivated = this.getDeactivatedDishIds();
    if (!deactivated.includes(id)) {
      deactivated.push(id);
      localStorage.setItem(DEACTIVATED_DISHES_KEY, JSON.stringify(deactivated));
    }
    this.setOverride(id, { isActive: false });
  },

  /**
   * Reactivate a previously deactivated dish
   */
  reactivateDish(id: string): void {
    const deactivated = this.getDeactivatedDishIds().filter((d) => d !== id);
    localStorage.setItem(DEACTIVATED_DISHES_KEY, JSON.stringify(deactivated));
    this.setOverride(id, { isActive: true });
  },

  /**
   * Deletes or soft-deactivates dish
   */
  deleteDish(id: string): void {
    const adminDishes = this.getAll();
    const isCustom = adminDishes.some((d) => d.id === id);
    if (isCustom) {
      // Filter from admin dishes
      const updated = adminDishes.filter((d) => d.id !== id);
      localStorage.setItem(DISHES_KEY, JSON.stringify(updated));
    }
    // Always deactivate to guarantee order safety
    this.deactivateDish(id);
  },

  // Backward compatibility alias
  delete(id: string): void {
    this.deleteDish(id);
  },

  getUnitOverrides(): Record<string, DishUnitOverride> {
    try {
      return JSON.parse(localStorage.getItem(UNIT_OVERRIDES_KEY) || '{}');
    } catch {
      return {};
    }
  },

  setUnitOverride(dishId: string, defaultUnit: string, supportedUnits?: string[]): void {
    const overrides = this.getUnitOverrides();
    overrides[dishId] = { defaultUnit, supportedUnits };
    localStorage.setItem(UNIT_OVERRIDES_KEY, JSON.stringify(overrides));
  },

  getDishUnit(dishId: string): DishUnitOverride | undefined {
    const adminDish = this.getAll().find((d) => d.id === dishId);
    if (adminDish?.defaultUnit) {
      return {
        defaultUnit: adminDish.defaultUnit,
        supportedUnits: adminDish.supportedUnits,
      };
    }
    const overrides = this.getUnitOverrides();
    return overrides[dishId];
  },
};
