/**
 * Rental Management System Types
 * Kept completely separate from food dishes and food orders.
 */

export interface RentalCategory {
  id: string;
  name: string;      // English category name
  nameTa: string;    // Tamil category name
  description?: string;
}

export type RentalPricingUnit =
  | 'Per Item'
  | 'Per Set'
  | 'Per Day'
  | 'Per Function';

export interface RentalItem {
  id: string;               // e.g. rnt-itm-0001
  code: string;             // Unique item code e.g. RNT-001
  nameEn: string;           // English name
  nameTa: string;           // Tamil name
  categoryId: string;       // Rental Category ID
  totalQuantity: number;    // Total stock owned
  availableQuantity: number;// Calculated currently available stock
  rentalPrice: number;      // Price per unit in INR
  pricingUnit: RentalPricingUnit | string; // per item, per set, per day, per function
  securityDeposit?: number; // Optional security deposit per item
  description?: string;     // Public/customer description
  notes?: string;           // Internal admin notes
  isActive: boolean;        // Active/inactive status
  createdAt: string;
  updatedAt?: string;
}

export type RentalStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Items Issued'
  | 'Partially Returned'
  | 'Returned'
  | 'Cancelled';

export interface RentalDocItem {
  itemId: string;           // Reference to RentalItem.id
  itemCode: string;         // Snapshot of item code
  nameEn: string;           // Snapshot of English name
  nameTa: string;           // Snapshot of Tamil name
  quantity: number;         // Quantity rented (non-negative)
  pricePerUnit: number;     // Price per unit at time of document creation
  pricingUnit: string;      // Snapshot of pricing unit or rental duration
  lineTotal: number;        // Calculated quantity * pricePerUnit
  returnedQuantity?: number;// Quantity returned by customer
  notes?: string;           // Optional item notes (e.g. condition, marks)
}

export interface RentalDocument {
  id: string;               // Unique internal ID
  rentalNumber: string;     // Formatted document number e.g. RENT-0001
  createdAt: string;        // ISO datetime
  updatedAt?: string;

  // Customer Details
  customerName: string;
  mobile: string;
  address?: string;
  functionName?: string;    // Function name or event description

  // Dates
  documentDate: string;     // YYYY-MM-DD
  functionDate: string;     // YYYY-MM-DD
  rentalStartDate: string;  // YYYY-MM-DD
  expectedReturnDate: string;// YYYY-MM-DD
  actualReturnDate?: string;// YYYY-MM-DD

  // Logistics
  deliveryDetails?: string; // Optional delivery or collection notes

  // Items
  items: RentalDocItem[];

  // Financial Breakdown (INR)
  subtotal: number;
  additionalCharges: number;
  discount: number;
  securityDeposit: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;

  // Status & Operational Notes
  status: RentalStatus;
  notes?: string;           // Internal notes on damaged, missing or returned items
  terms?: string;           // Configurable rental terms
  preferredLanguage?: 'en' | 'ta';
}
