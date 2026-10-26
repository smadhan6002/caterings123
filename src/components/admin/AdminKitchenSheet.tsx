import React, { useState, useEffect } from 'react';
import {
  Search,
  ChefHat,
  Download,
  CheckCircle2,
  Clock,
  Flame,
  FileCheck2,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { kitchenSheetService } from '../../services/kitchenSheetService';
import { generateKitchenSheetPDF } from '../../utils/generateKitchenSheetPDF';
import { KitchenOrderSheetModal } from './KitchenOrderSheetModal';
import { useLanguage } from '../../context/LanguageContext';
import type { Order, KitchenPrepStatus } from '../../types/admin';

function formatDate(isoDate: string): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate.includes('T') ? isoDate : isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<KitchenPrepStatus, { bg: string; text: string; border: string }> = {
  'Not Prepared': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'In Preparation': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Ready': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'Completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
};

interface AdminKitchenSheetProps {
  initialOrderId?: string;
}

export const AdminKitchenSheet: React.FC<AdminKitchenSheetProps> = ({ initialOrderId }) => {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<KitchenPrepStatus | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function loadData() {
    const all = orderService.getAll();
    setOrders(all);

    if (initialOrderId) {
      const match = all.find((o) => o.id === initialOrderId);
      if (match) setSelectedOrder(match);
    }
  }

  useEffect(() => {
    loadData();
  }, [initialOrderId]);

  // Status stats
  const totalSheets = orders.length;
  const notPreparedCount = orders.filter((o) => (kitchenSheetService.getByOrderId(o.id)?.status || o.kitchenSheetStatus || 'Not Prepared') === 'Not Prepared').length;
  const inPrepCount = orders.filter((o) => (kitchenSheetService.getByOrderId(o.id)?.status || o.kitchenSheetStatus) === 'In Preparation').length;
  const readyCount = orders.filter((o) => (kitchenSheetService.getByOrderId(o.id)?.status || o.kitchenSheetStatus) === 'Ready').length;
  const completedCount = orders.filter((o) => (kitchenSheetService.getByOrderId(o.id)?.status || o.kitchenSheetStatus) === 'Completed').length;

  // Filter orders
  const filtered = orders.filter((order) => {
    const savedSheet = kitchenSheetService.getByOrderId(order.id);
    const sheetStatus = savedSheet?.status || order.kitchenSheetStatus || 'Not Prepared';

    if (statusFilter && sheetStatus !== statusFilter) return false;
    if (dateFilter && order.orderDate !== dateFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchMobile = order.mobile.includes(q);
      return matchId || matchName || matchMobile;
    }

    return true;
  });

  // Direct quick download
  async function handleQuickDownload(order: Order) {
    setDownloadingId(order.id);
    try {
      const sheet = kitchenSheetService.getOrCreateForOrder(order, isTa ? 'ta' : 'en');
      await generateKitchenSheetPDF(sheet, isTa ? 'ta' : 'en');
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">
              {isTa ? 'சமையல் குறிப்பு தாள்கள் (Kitchen Order Sheets)' : 'Kitchen Order Sheets'}
            </h2>
            <span className="bg-blue-100 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {totalSheets} {isTa ? 'ஆர்டர்கள்' : 'Orders'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isTa
              ? 'சமையல் மாஸ்டருக்கான உணவு தயாரிப்பு அளவுகளை நிர்வகித்து PDF பதிவிறக்கவும்.'
              : 'Generate and manage kitchen preparation sheets with confirmed dish quantities for cooking masters.'}
          </p>
        </div>
      </div>

      {/* Preparation Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Not Prepared */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Not Prepared' ? '' : 'Not Prepared')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'Not Prepared' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isTa ? 'தயாரிக்கப்படாதவை' : 'Not Prepared'}
            </span>
            <Clock size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{notPreparedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting prep start</p>
        </div>

        {/* In Preparation */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'In Preparation' ? '' : 'In Preparation')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'In Preparation' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {isTa ? 'தயாரிப்பில் உள்ளவை' : 'In Preparation'}
            </span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{inPrepCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Cooking in progress</p>
        </div>

        {/* Ready */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Ready' ? '' : 'Ready')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'Ready' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {isTa ? 'தயாரானவை' : 'Ready'}
            </span>
            <CheckCircle2 size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-2">{readyCount}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Ready for dispatch</p>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Completed' ? '' : 'Completed')}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'Completed' ? 'border-green-500 ring-2 ring-green-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
              {isTa ? 'முடிந்தவை' : 'Completed'}
            </span>
            <FileCheck2 size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-black text-green-900 mt-2">{completedCount}</p>
          <p className="text-[11px] text-green-600 mt-0.5">Prepared & dispatched</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTa ? 'ஆர்டர் எண், வாடிக்கையாளர் பெயர் தேடவும்…' : 'Search by Order ID, Customer Name, Mobile…'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as KitchenPrepStatus | '')}
          className="px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium text-slate-800 cursor-pointer"
        >
          <option value="">{isTa ? 'அனைத்து தயாரிப்பு நிலைகள்' : 'All Kitchen Prep Statuses'}</option>
          <option value="Not Prepared">Not Prepared</option>
          <option value="In Preparation">In Preparation</option>
          <option value="Ready">Ready</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="relative flex items-center">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-700"
            title="Filter by delivery date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="absolute right-8 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400 shadow-xs">
          <ChefHat size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-base font-bold text-slate-700">
            {orders.length === 0
              ? isTa ? 'ஆர்டர்கள் எதுவும் இல்லை' : 'No orders in system yet.'
              : isTa ? 'பொருத்தமான சமையல் தாள்கள் எதுவும் இல்லை' : 'No orders match your filter criteria.'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {orders.length === 0
              ? 'Create an order from the Orders page to generate kitchen sheets.'
              : 'Try clearing search filters to see all kitchen sheets.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Order ID</th>
                    <th className="px-5 py-3.5 text-left">Customer</th>
                    <th className="px-5 py-3.5 text-left">Delivery Date</th>
                    <th className="px-5 py-3.5 text-left">Dishes / Items</th>
                    <th className="px-5 py-3.5 text-left">Guests / Qty</th>
                    <th className="px-5 py-3.5 text-left">Kitchen Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => {
                    const savedSheet = kitchenSheetService.getByOrderId(order.id);
                    const currentStatus: KitchenPrepStatus =
                      savedSheet?.status || order.kitchenSheetStatus || 'Not Prepared';
                    const badge = STATUS_BADGE[currentStatus];

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Order ID */}
                        <td className="px-5 py-4 font-mono font-bold text-primary text-xs">
                          {order.id}
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-xs text-slate-500">{order.mobile}</p>
                        </td>

                        {/* Delivery Date */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 text-xs">
                            {formatDate(order.orderDate)}
                          </p>
                          {order.deliveryTime && (
                            <span className="text-[11px] text-slate-400 block">{order.deliveryTime}</span>
                          )}
                        </td>

                        {/* Dishes Count */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">
                              {savedSheet ? savedSheet.items.length : order.items.length} dish(es)
                            </span>
                            {savedSheet && (
                              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded font-semibold">
                                Saved
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Guests / Qty */}
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {order.guestCount && order.guestCount > 0 ? (
                            <span className="font-semibold text-slate-800">{order.guestCount} Guests</span>
                          ) : order.foodQuantities && order.foodQuantities.length > 0 ? (
                            <span className="font-semibold text-slate-800">{order.foodQuantities.length} custom items</span>
                          ) : (
                            <span className="text-slate-400">Custom / Not set</span>
                          )}
                        </td>

                        {/* Kitchen Status Badge with inline quick selector */}
                        <td className="px-5 py-4">
                          <select
                            value={currentStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value as KitchenPrepStatus;
                              kitchenSheetService.updateStatus(order.id, newStatus);
                              loadData();
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border} cursor-pointer focus:outline-none`}
                          >
                            <option value="Not Prepared">Not Prepared</option>
                            <option value="In Preparation">In Preparation</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              title="Open & Edit Kitchen Sheet"
                            >
                              <ChefHat size={14} />
                              <span>{isTa ? 'தாள் திற' : 'Open Sheet'}</span>
                            </button>

                            <button
                              onClick={() => handleQuickDownload(order)}
                              disabled={downloadingId === order.id}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Quick Download PDF"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => {
              const savedSheet = kitchenSheetService.getByOrderId(order.id);
              const currentStatus: KitchenPrepStatus =
                savedSheet?.status || order.kitchenSheetStatus || 'Not Prepared';
              const badge = STATUS_BADGE[currentStatus];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                      {order.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.customerName}</h4>
                    <p className="text-xs text-slate-500">{order.mobile} • {formatDate(order.orderDate)}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {savedSheet ? savedSheet.items.length : order.items.length} Dishes •{' '}
                      {order.guestCount ? `${order.guestCount} Guests` : 'Custom quantity'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <ChefHat size={14} />
                      <span>{isTa ? 'சமையல் தாள்' : 'Kitchen Sheet'}</span>
                    </button>
                    <button
                      onClick={() => handleQuickDownload(order)}
                      disabled={downloadingId === order.id}
                      className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs cursor-pointer disabled:opacity-50"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Kitchen Order Sheet Modal */}
      {selectedOrder && (
        <KitchenOrderSheetModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSaved={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
