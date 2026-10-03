import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { SalesForecastModule } from './SalesForecastModule';
import { BudgetMonitoringModule } from './BudgetMonitoringModule';
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
  CreditCard,
  Target,
  Edit3,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  X
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
    unreadNotificationsCount,
    monthlySalesTarget,
    updateMonthlySalesTarget
  } = useERP();

  // Target Edit Modal State
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = useState(false);
  const [tempTargetInput, setTempTargetInput] = useState<number | ''>(monthlySalesTarget);

  // Date and Monthly Time Math
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed (9 for October)
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const currentMonthName = monthNames[currentMonthIdx];
  const currentYearMonthPrefix = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

  // Monthly Sales Computation (all income in current month)
  const currentMonthSales = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentYearMonthPrefix))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions, currentYearMonthPrefix]);

  // Overall metrics computation
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

  // Monthly Target Calculations
  const targetAmount = monthlySalesTarget > 0 ? monthlySalesTarget : 15000000;
  const achievementRate = Math.min(200, (currentMonthSales / targetAmount) * 100);
  const rawPercentage = Math.round((currentMonthSales / targetAmount) * 100);
  const remainingToTarget = Math.max(0, targetAmount - currentMonthSales);
  const isTargetAchieved = currentMonthSales >= targetAmount;

  // Pacing math
  const dailyNeeded = remainingDays > 0 ? Math.ceil(remainingToTarget / remainingDays) : 0;
  const currentDailyAvg = currentDay > 0 ? Math.round(currentMonthSales / currentDay) : 0;
  const projectedMonthEndSales = Math.round(currentDailyAvg * daysInMonth);
  const projectedAchievementPercent = Math.round((projectedMonthEndSales / targetAmount) * 100);

  // Milestones
  const milestones = [
    { percent: 25, nominal: targetAmount * 0.25, label: '25%' },
    { percent: 50, nominal: targetAmount * 0.50, label: '50%' },
    { percent: 75, nominal: targetAmount * 0.75, label: '75%' },
    { percent: 100, nominal: targetAmount, label: '100% Target' }
  ];

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTargetInput && Number(tempTargetInput) > 0) {
      updateMonthlySalesTarget(Number(tempTargetInput));
      setIsEditTargetModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dashboard Usaha
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar kesehatan finansial, inventori, dan performa pencapaian target penjualan real-time.
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

      {/* ======================================================== */}
      {/* MODUL TARGET PENJUALAN BULANAN REAL-TIME DENGAN PROGRESS BAR */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 via-slate-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative">
          {/* Header Row: Target Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isTargetAchieved
                    ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200'
                    : 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100'
                }`}
              >
                {isTargetAchieved ? (
                  <Sparkles className="w-5 h-5 animate-bounce" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Target Penjualan Bulanan · {currentMonthName} {currentYear}
                  </h2>
                  {isTargetAchieved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Target Tercapai!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoring pencapaian omzet penjualan toko & kasir secara real-time
                </p>
              </div>
            </div>

            {/* Target Settings and Quick Add */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempTargetInput(monthlySalesTarget);
                  setIsEditTargetModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Sesuaikan target penjualan nominal bulan ini"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Atur Target</span>
              </button>

              <button
                onClick={() => setCurrentTab('pos')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buka Kasir POS</span>
              </button>
            </div>
          </div>

          {/* Main Progress Indicator Section */}
          <div className="mt-5 space-y-3">
            {/* Top Numeric Readouts */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-500">
                  Total Realisasi Omzet Bulan Ini
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                    Rp {currentMonthSales.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium font-mono">
                    / Rp {targetAmount.toLocaleString('id-ID')} Target
                  </span>
                </div>
              </div>

              {/* Percentage Badge */}
              <div className="text-left sm:text-right">
                <span className="text-xs font-medium text-slate-500">Persentase Capaian</span>
                <div className="flex items-baseline sm:justify-end gap-1.5 mt-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                      isTargetAchieved
                        ? 'text-emerald-600'
                        : rawPercentage >= 70
                        ? 'text-indigo-600'
                        : rawPercentage >= 40
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {rawPercentage}%
                  </span>
                  {rawPercentage > 100 && (
                    <span className="text-xs font-semibold text-emerald-600">
                      (+{rawPercentage - 100}% Surplus)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Progress Bar Track */}
            <div className="relative pt-2 pb-5">
              {/* Outer Track */}
              <div className="w-full h-5 bg-slate-100 rounded-full p-1 border border-slate-200 relative overflow-hidden shadow-inner">
                {/* Milestone guide markers inside bar */}
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10">
                  <div className="w-px h-full bg-slate-300/40 ml-[25%]" />
                  <div className="w-px h-full bg-slate-300/40 ml-[25%]" />
                  <div className="w-px h-full bg-slate-300/40 ml-[25%]" />
                </div>

                {/* Animated Gradient Progress Fill */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                    isTargetAchieved
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 shadow-xs'
                      : rawPercentage >= 75
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-xs'
                      : rawPercentage >= 40
                      ? 'bg-gradient-to-r from-blue-500 to-sky-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, achievementRate)}%` }}
                >
                  {/* Subtle gloss highlight on progress bar */}
                  <div className="absolute inset-0 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Milestones Labels along the bar */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
                <span>Rp 0</span>
                {milestones.map((m) => (
                  <span
                    key={m.percent}
                    className={`transition-colors ${
                      achievementRate >= m.percent ? 'font-bold text-indigo-700' : 'text-slate-400'
                    }`}
                  >
                    {m.label} (Rp {(m.nominal / 1000000).toFixed(1)}Jt)
                  </span>
                ))}
              </div>
            </div>

            {/* Pacing & Target Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Card 1: Sisa Target / Status Capaian */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">Sisa Kekurangan Target</span>
                </div>
                <div className="mt-1">
                  {isTargetAchieved ? (
                    <p className="font-bold text-emerald-700 font-mono text-sm">
                      Lunas! (+Rp {(currentMonthSales - targetAmount).toLocaleString('id-ID')})
                    </p>
                  ) : (
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      Rp {remainingToTarget.toLocaleString('id-ID')}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isTargetAchieved
                      ? 'Melampaui ekspektasi target'
                      : `Tersisa ${100 - rawPercentage}% dari target`}
                  </p>
                </div>
              </div>

              {/* Card 2: Laju Harian (Daily Run-Rate) */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium">Target Harian yang Dibutuhkan</span>
                </div>
                <div className="mt-1">
                  <p className="font-bold text-slate-900 font-mono text-sm">
                    {isTargetAchieved ? (
                      'Bebas Tekanan'
                    ) : (
                      `Rp ${dailyNeeded.toLocaleString('id-ID')} / hari`
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tersisa {remainingDays} hari di bulan {currentMonthName}
                  </p>
                </div>
              </div>

              {/* Card 3: Proyeksi Akhir Bulan */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">Proyeksi Penjualan Akhir Bulan</span>
                </div>
                <div className="mt-1">
                  <p className="font-bold text-indigo-600 font-mono text-sm">
                    Rp {projectedMonthEndSales.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {projectedAchievementPercent >= 100
                      ? `Diproyeksikan capai ${projectedAchievementPercent}%`
                      : `Laju saat ini ~${projectedAchievementPercent}% target`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Machine-Learning Based Sales Forecasting Module */}
      <SalesForecastModule setCurrentTab={setCurrentTab} />

      {/* Smart Budget Monitoring System with Real-Time Desktop Notifications & Visual Alerts */}
      <BudgetMonitoringModule setCurrentTab={setCurrentTab} />

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
            <span
              className={`p-2 rounded-lg ${
                netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div
              className={`text-xl font-bold tracking-tight font-mono ${
                netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
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

      {/* Adjust Monthly Target Modal */}
      {isEditTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Atur Target Penjualan {currentMonthName} {currentYear}
                </h3>
              </div>
              <button
                onClick={() => setIsEditTargetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Target Omzet Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="1000000"
                  step="500000"
                  required
                  value={tempTargetInput}
                  onChange={(e) =>
                    setTempTargetInput(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold text-slate-900"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Pilihan Cepat Target:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[10000000, 15000000, 20000000, 25000000, 30000000, 50000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempTargetInput(preset)}
                      className={`py-1.5 px-2 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                        tempTargetInput === preset
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Rp {(preset / 1000000).toFixed(0)} Jt
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Realisasi Saat Ini:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rp {currentMonthSales.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Capaian Baru:</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {tempTargetInput && Number(tempTargetInput) > 0
                      ? Math.round((currentMonthSales / Number(tempTargetInput)) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditTargetModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Simpan Target Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
