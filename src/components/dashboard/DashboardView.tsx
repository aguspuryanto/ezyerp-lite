import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronRight,
  Plus,
  ShoppingCart,
  Users,
  CreditCard
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
  onOpenQuickTx: (type: 'income' | 'expense') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setCurrentTab,
  onOpenQuickTx
}) => {
  const {
    transactions,
    products,
    recurring,
    employees,
    notifications,
    unreadNotificationsCount
  } = useERP();

  // Metrics computation
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalInventoryValuation = products.reduce(
    (acc, curr) => acc + curr.stock * curr.hppCost,
    0
  );

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;
  const activeEmployees = employees.length;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dashboard Usaha
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar kesehatan finansial, inventori, dan operasional bisnis Anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickTx('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            + Pemasukan
          </button>
          <button
            onClick={() => onOpenQuickTx('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Smart Alerts Ribbon */}
      {unreadNotificationsCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-amber-900">
                {unreadNotificationsCount} Peringatan Operasional Aktif
              </span>
              <span className="text-amber-700 ml-2 hidden sm:inline">
                {notifications[0]?.title}: {notifications[0]?.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (notifications[0]?.linkTarget) {
                setCurrentTab(notifications[0].linkTarget);
              }
            }}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0"
          >
            Tinjau Sekarang <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pemasukan</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              Rp {totalIncome.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>Arus kas masuk tercatat</span>
            </p>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Pengeluaran</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              Rp {totalExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <span>Biaya operasional & HPP</span>
            </p>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Laba Bersih (Net Profit)</span>
            <span className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-xl font-bold tracking-tight font-mono ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              Rp {netProfit.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {netProfit >= 0 ? 'Surplus operasional' : 'Defisit operasional'}
            </p>
          </div>
        </div>

        {/* Valuasi Aset Stok */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Valuasi Aset Stok (HPP)</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              Rp {totalInventoryValuation.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              {lowStockCount > 0 ? `${lowStockCount} barang perlu restock` : 'Stok dalam batas aman'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Mutasi Buku Kas Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Arus kas masuk & keluar terakhir secara real-time
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('cashflow')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.date}</span>
                        <span>·</span>
                        <span className="capitalize">{tx.category}</span>
                        <span>·</span>
                        <span className="uppercase">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-xs font-semibold font-mono whitespace-nowrap ml-4 ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} Rp{' '}
                    {tx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Operasional & Modul Pintar */}
        <div className="space-y-4">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Akses Cepat Fitur EzyERP
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentTab('pos')}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg text-left transition-colors group"
              >
                <ShoppingCart className="w-4 h-4 text-indigo-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-900">Kasir POS</p>
                <p className="text-[10px] text-slate-500">Jual & Cetak Struk</p>
              </button>

              <button
                onClick={() => setCurrentTab('inventory')}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg text-left transition-colors group"
              >
                <Package className="w-4 h-4 text-amber-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-900">Stok & HPP</p>
                <p className="text-[10px] text-slate-500">{products.length} Item Produk</p>
              </button>

              <button
                onClick={() => setCurrentTab('employees')}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg text-left transition-colors group"
              >
                <Users className="w-4 h-4 text-emerald-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-900">SDM & Gaji</p>
                <p className="text-[10px] text-slate-500">{activeEmployees} Karyawan</p>
              </button>

              <button
                onClick={() => setCurrentTab('payments')}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-lg text-left transition-colors group"
              >
                <CreditCard className="w-4 h-4 text-sky-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-900">Bayar Online</p>
                <p className="text-[10px] text-slate-500">QRIS & VA Bank</p>
              </button>
            </div>
          </div>

          {/* Stock Health Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Peringatan Stok Menipis
              </h2>
              <button
                onClick={() => setCurrentTab('inventory')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Inventori
              </button>
            </div>

            <div className="space-y-2">
              {products
                .filter((p) => p.stock <= p.minStockAlert)
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 font-mono">
                        {item.stock} {item.unit}
                      </span>
                      <p className="text-[10px] text-slate-400">Min: {item.minStockAlert}</p>
                    </div>
                  </div>
                ))}
              {lowStockCount === 0 && (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Seluruh stok barang dalam kondisi aman.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
