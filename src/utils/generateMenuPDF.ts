import jsPDF from 'jspdf';
import { categories as staticCategories } from '../data/menu';
import { dishService } from '../services/dishService';
import { siteConfig } from '../config/site';
import { ta } from '../locales/ta';
import logoImg from '../assets/LOGO.png';

interface MenuPageDish {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  categoryId: string;
  image?: string;
  defaultUnit: string;
}

interface MenuPageCategory {
  id: string;
  name: string;
  nameTa: string;
  dishes: MenuPageDish[];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    setTimeout(() => resolve(null), 2000);
  });
}

/**
 * Builds all category and dish data merging built-in and admin-added items
 */
function compileMenuData(): MenuPageCategory[] {
  const result: MenuPageCategory[] = [];
  const activeDishes = dishService.getActiveDishes();

  for (const cat of staticCategories) {
    const catNameTa = ta.categories?.[cat.id] || cat.name;
    const catDishes = activeDishes.filter((d) => d.categoryId === cat.id);
    if (catDishes.length > 0) {
      result.push({
        id: cat.id,
        name: cat.name,
        nameTa: catNameTa,
        dishes: catDishes.map((d) => ({
          id: d.id,
          name: d.name,
          nameTa: d.nameTa,
          category: cat.name,
          categoryId: d.categoryId,
          image: d.image,
          defaultUnit: d.defaultUnit,
        })),
      });
    }
  }

  // Check any custom categories
  const knownCatIds = new Set(staticCategories.map((c) => c.id));
  const otherDishes = activeDishes.filter((d) => !knownCatIds.has(d.categoryId));
  for (const od of otherDishes) {
    let target = result.find((c) => c.id === od.categoryId);
    if (!target) {
      target = {
        id: od.categoryId,
        name: od.categoryName || od.categoryId,
        nameTa: od.categoryName || od.categoryId,
        dishes: [],
      };
      result.push(target);
    }
    target.dishes.push({
      id: od.id,
      name: od.name,
      nameTa: od.nameTa,
      category: target.name,
      categoryId: od.categoryId,
      image: od.image,
      defaultUnit: od.defaultUnit,
    });
  }

  return result.filter((c) => c.dishes.length > 0);
}

/**
 * Generates and downloads a Food Menu PDF with Tamil Unicode support
 */
export async function generateMenuPDF(onProgress?: (percent: number, status: string) => void): Promise<void> {
  onProgress?.(10, 'Compiling menu items…');

  const menuCategories = compileMenuData();
  const logo = await loadImage(logoImg);

  // Pre-load dish images (in parallel batches)
  onProgress?.(25, 'Loading dish images…');
  const loadedImagesMap = new Map<string, HTMLImageElement | null>();
  const allDishes = menuCategories.flatMap((c) => c.dishes);

  // Load first 60 images or thumbnails to ensure rapid rendering
  await Promise.all(
    allDishes.slice(0, 70).map(async (d) => {
      if (d.image) {
        const img = await loadImage(d.image);
        loadedImagesMap.set(d.id, img);
      }
    })
  );

  onProgress?.(50, 'Designing PDF pages…');

  // Canvas A4 dimensions at 2x resolution (1240 x 1754 px)
  const PAGE_WIDTH = 1240;
  const PAGE_HEIGHT = 1754;

  // We distribute categories across multiple pages cleanly
  // ~2-3 categories per page
  const pagesData: MenuPageCategory[][] = [];
  let currentPage: MenuPageCategory[] = [];
  let currentDishCount = 0;

  for (const cat of menuCategories) {
    if (currentPage.length > 0 && currentDishCount + cat.dishes.length > 32) {
      pagesData.push(currentPage);
      currentPage = [cat];
      currentDishCount = cat.dishes.length;
    } else {
      currentPage.push(cat);
      currentDishCount += cat.dishes.length;
    }
  }
  if (currentPage.length > 0) {
    pagesData.push(currentPage);
  }

  const totalPages = pagesData.length;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    onProgress?.(
      50 + Math.round(((pageIdx + 1) / totalPages) * 45),
      `Rendering page ${pageIdx + 1} of ${totalPages}…`
    );

    // Clear background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    // Subtle page border
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40);

    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, PAGE_WIDTH - 64, PAGE_HEIGHT - 64);

    let y = 60;

    // Header Band
    if (pageIdx === 0) {
      // Luxurious Top Header for Page 1
      ctx.fillStyle = '#0966CC';
      ctx.fillRect(45, y, PAGE_WIDTH - 90, 160);

      // Accent line
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(45, y + 156, PAGE_WIDTH - 90, 4);

      // Logo
      if (logo) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, y + 80, 52, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(logo, 73, y + 28, 104, 104);
        ctx.restore();
      }

      // Title & Contact Info
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(siteConfig.name, 200, y + 60);

      ctx.font = 'bold 20px "Noto Sans Tamil", "Latha", sans-serif';
      ctx.fillStyle = '#EFF6FF';
      ctx.fillText('காஞ்சி அம்பாள் பாரம்பரிய கேட்டரிங் மெனு பட்டியல்', 200, y + 92);

      ctx.font = '16px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`Ph: +91 ${siteConfig.whatsappNumber}  |  Kanchipuram, Tamil Nadu`, 200, y + 125);

      y += 185;

      // Menu Title Banner
      ctx.fillStyle = '#EFF6FF';
      ctx.fillRect(45, y, PAGE_WIDTH - 90, 48);
      ctx.strokeStyle = '#DCE8F5';
      ctx.lineWidth = 1;
      ctx.strokeRect(45, y, PAGE_WIDTH - 90, 48);

      ctx.fillStyle = '#123B75';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('★ PURE VEGETARIAN CATERING SERVICES  |  FOOD MENU SELECTIONS ★', PAGE_WIDTH / 2 - 290, y + 30);

      y += 70;
    } else {
      // Compact Header for Subsequent Pages
      ctx.fillStyle = '#0966CC';
      ctx.fillRect(45, y, PAGE_WIDTH - 90, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(siteConfig.name, 65, y + 40);

      ctx.font = '16px "Inter", "Segoe UI", sans-serif';
      ctx.fillStyle = '#EFF6FF';
      ctx.fillText(`Ph: +91 ${siteConfig.whatsappNumber}`, PAGE_WIDTH - 250, y + 40);

      y += 85;
    }

    // Categories on this page
    const pageCategories = pagesData[pageIdx];

    for (const cat of pageCategories) {
      // Category Header Bar
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(45, y, PAGE_WIDTH - 90, 36);

      ctx.fillStyle = '#0966CC';
      ctx.fillRect(45, y, 6, 36);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(cat.name, 62, y + 24);

      ctx.font = 'bold 16px "Noto Sans Tamil", "Latha", sans-serif';
      ctx.fillStyle = '#0966CC';
      ctx.fillText(`(${cat.nameTa})`, 62 + ctx.measureText(cat.name).width + 12, y + 24);

      y += 48;

      // Dishes in 2 Columns
      const colWidth = (PAGE_WIDTH - 110) / 2;
      const leftX = 45;
      const rightX = leftX + colWidth + 20;

      const dishes = cat.dishes;
      const midPoint = Math.ceil(dishes.length / 2);

      let maxColY = y;

      for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        const isLeft = i < midPoint;
        const colX = isLeft ? leftX : rightX;
        const rowInCol = isLeft ? i : i - midPoint;
        const itemY = y + rowInCol * 40;

        if (itemY + 36 > maxColY) {
          maxColY = itemY + 36;
        }

        // Dish card background
        ctx.fillStyle = rowInCol % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
        ctx.fillRect(colX, itemY, colWidth, 34);

        // Thumbnail image or placeholder dot
        const dishImg = loadedImagesMap.get(dish.id);
        if (dishImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(colX + 18, itemY + 17, 12, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(dishImg, colX + 6, itemY + 5, 24, 24);
          ctx.restore();
        } else {
          ctx.fillStyle = '#0966CC';
          ctx.beginPath();
          ctx.arc(colX + 18, itemY + 17, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dish Name (English)
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 13px "Inter", "Segoe UI", sans-serif';
        const truncatedEn = dish.name.length > 24 ? dish.name.substring(0, 22) + '…' : dish.name;
        ctx.fillText(truncatedEn, colX + 38, itemY + 16);

        // Dish Name (Tamil)
        ctx.fillStyle = '#64748B';
        ctx.font = '12px "Noto Sans Tamil", "Latha", sans-serif';
        const truncatedTa = dish.nameTa.length > 22 ? dish.nameTa.substring(0, 20) + '…' : dish.nameTa;
        ctx.fillText(truncatedTa, colX + 38, itemY + 30);

        // Unit badge
        if (dish.defaultUnit) {
          ctx.fillStyle = '#EFF6FF';
          ctx.fillRect(colX + colWidth - 80, itemY + 8, 70, 18);
          ctx.fillStyle = '#123B75';
          ctx.font = 'bold 10px "Inter", "Segoe UI", sans-serif';
          ctx.fillText(dish.defaultUnit, colX + colWidth - 72, itemY + 21);
        }
      }

      y = maxColY + 24;
    }

    // Page Footer
    const footerY = PAGE_HEIGHT - 65;
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(45, footerY, PAGE_WIDTH - 90, 1);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(
      `${siteConfig.name}  •  Ph: ${siteConfig.whatsappNumber}  •  Delicious, Hygienic, Authentic Feast`,
      45,
      footerY + 22
    );

    ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#0966CC';
    ctx.fillText(`Page ${pageIdx + 1} of ${totalPages}`, PAGE_WIDTH - 140, footerY + 22);

    // Convert canvas to image data and add to jsPDF
    const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    if (pageIdx > 0) {
      doc.addPage();
    }
    doc.addImage(pageDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.(98, 'Finalizing download…');
  doc.save('Kanchi_Ambal_Catering_Food_Menu.pdf');
  onProgress?.(100, 'Complete!');
}
