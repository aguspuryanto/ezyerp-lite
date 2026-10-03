import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { CategoryBudget } from '../../types/erp';
import {
  PieChart,
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  DollarSign,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  Edit2,
  X,
  Volume2,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface BudgetMonitoringModuleProps {
  setCurrentTab: (tab: string) => void;
}

export const BudgetMonitoringModule: React.FC<BudgetMonitoringModuleProps> = ({ setCurrentTab }) => {
  const {
    transactions,
    categoryBudgets,
    updateCategoryBudget,
    desktopNotificationEnabled,
    requestDesktopNotificationPermission,
    triggerDesktopNotification
  } = useERP();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [editLimit, setEditLimit] = useState<number | ''>('');
  const [editThreshold, setEditThreshold] = useState<number>(80);

  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Current month key (YYYY-MM)
  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // Compute current month expenses aggregated by category
  const currentMonthExpensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonthKey)) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return map;
  }, [transactions, currentMonthKey]);

  // Enriched budget items with real-time utilization
  const enrichedBudgets = useMemo(() => {
    return categoryBudgets.map((b) => {
      const actualSpent = currentMonthExpensesByCategory[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (actualSpent / b.monthlyLimit) * 100 : 0;
      const isOverBudget = actualSpent >= b.monthlyLimit;
      const isNearThreshold = !isOverBudget && percentage >= b.warningThresholdPercent;
      const remaining = b.monthlyLimit - actualSpent;

      return {
        ...b,
        actualSpent,
        percentage: Math.round(percentage),
        rawPercentage: percentage,
        isOverBudget,
        isNearThreshold,
        remaining
      };
    });
  }, [categoryBudgets, currentMonthExpensesByCategory]);

  // Aggregate totals
  const totalBudgeted = categoryBudgets
    .filter((b) => b.isEnabled)
    .reduce((sum, b) => sum + b.monthlyLimit, 0);

  const totalSpent = enrichedBudgets
    .filter((b) => b.isEnabled)
    .reduce((sum, b) => sum + b.actualSpent, 0);

  const overBudgetCategories = enrichedBudgets.filter((b) => b.isEnabled && b.isOverBudget);
  const warningCategories = enrichedBudgets.filter((b) => b.isEnabled && b.isNearThreshold);

  const handleEnableDesktopNotifications = async () => {
    const granted = await requestDesktopNotificationPermission();
    if (granted) {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
  };

  const handleTestNotification = () => {
    triggerDesktopNotification(
      'Uji Coba Notifikasi EzyERP',
      'Sistem pemantauan anggaran pintar terhubung dengan desktop Anda. Peringatan akan otomatis muncul jika kategori melebihi pagu.'
    );
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleOpenEditModal = (budget: CategoryBudget) => {
    setEditingBudget(budget);
    setEditLimit(budget.monthlyLimit);
    setEditThreshold(budget.warningThresholdPercent);
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget || editLimit === '' || Number(editLimit) <= 0) return;

    updateCategoryBudget(editingBudget.category, {
      monthlyLimit: Number(editLimit),
      warningThresholdPercent: Number(editThreshold)
    });

    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Sistem Pemantauan Anggaran Cerdas (Smart Budgeting)
              </h2>
              {overBudgetCategories.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                  <AlertOctagon className="w-3 h-3" />
                  {overBudgetCategories.length} Kategori Over Budget!
                </span>
              ) : warningCategories.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  {warningCategories.length} Mendekati Batas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Anggaran Terkendali Aman
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Peringatan visual & notifikasi desktop otomatis saat pengeluaran kategori melampaui ambang batas
            </p>
          </div>
        </div>

        {/* Desktop Notification and Configuration Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {desktopNotificationEnabled ? (
            <button
              onClick={handleTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Kirim notifikasi uji coba ke desktop"
            >
              <BellRing className="w-3.5 h-3.5 text-emerald-600" />
              <span>{testNotificationSent ? 'Terkirim ke Desktop!' : 'Notifikasi Desktop Aktif'}</span>
            </button>
          ) : (
            <button
              onClick={handleEnableDesktopNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Izinkan notifikasi desktop untuk peringatan over budget"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Aktifkan Notifikasi Desktop</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('cashflow')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span>Buku Kas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Prominent Visual Alert Banner if Over Budget or Near Threshold */}
      {overBudgetCategories.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-rose-900">
                Peringatan Darurat Anggaran: {overBudgetCategories.map((c) => c.category).join(', ')} Melampaui Batas!
              </h3>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Pengeluaran kategori{' '}
                <strong>{overBudgetCategories[0].category}</strong> telah mencapai{' '}
                <strong className="font-mono">
                  Rp {overBudgetCategories[0].actualSpent.toLocaleString('id-ID')}
                </strong>{' '}
                (melebihi pagu Rp {overBudgetCategories[0].monthlyLimit.toLocaleString('id-ID')}).
                Telah dikirimkan sinyal notifikasi peringatan.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('cashflow')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0 flex items-center justify-center gap-1"
          >
            <span>Audit Mutasi Pengeluaran</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* High-level Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Total Pagu Anggaran Operasional</span>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            Rp {totalBudgeted.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Batas pagu bulan berjalan</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Realisasi Pengeluaran Aktif</span>
          <p className="text-lg font-bold font-mono text-rose-600 mt-1">
            Rp {totalSpent.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Terpakai {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% dari seluruh pagu
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Sisa Ruang Fiskal Kas</span>
          <p className="text-lg font-bold font-mono text-emerald-600 mt-1">
            Rp {Math.max(0, totalBudgeted - totalSpent).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalBudgeted >= totalSpent ? 'Dalam rentang batas aman' : 'Pagu total terlampaui'}
          </p>
        </div>
      </div>

      {/* Category Progress Bars Grid */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Pengawasan Real-Time Per Kategori Pengeluaran
          </h3>
          <span className="text-[11px] text-slate-400">
            Klik icon pensil untuk mengubah pagu & ambang batas waspada
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {enrichedBudgets.map((item) => {
            const isOver = item.isOverBudget;
            const isNear = item.isNearThreshold;

            return (
              <div
                key={item.category}
                className={`p-4 rounded-xl border transition-all ${
                  isOver
                    ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                    : isNear
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header item */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">{item.category}</h4>
                      {isOver && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          OVER BUDGET
                        </span>
                      )}
                      {isNear && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          WASPADA ({item.warningThresholdPercent}%)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Pagu: Rp {item.monthlyLimit.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isOver
                          ? 'text-rose-600'
                          : isNear
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Edit pagu batas anggaran"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="mt-3">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-600 animate-pulse'
                          : isNear
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Footer readouts */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Realisasi: Rp {item.actualSpent.toLocaleString('id-ID')}</span>
                  <span>
                    {isOver
                      ? `Lebih: Rp ${Math.abs(item.remaining).toLocaleString('id-ID')}`
                      : `Sisa: Rp ${item.remaining.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditModalOpen && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Atur Pagu Anggaran: {editingBudget.category}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Pagu Bulanan (Rp) *
                </label>
                <input
                  type="number"
                  min="100000"
                  step="100000"
                  required
                  value={editLimit}
                  onChange={(e) =>
                    setEditLimit(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambang Batas Peringatan Dini (% Terpakai)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-xs text-indigo-600 w-12 text-right">
                    {editThreshold}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Notifikasi waspada akan dikirim saat pengeluaran menyentuh {editThreshold}% dari pagu.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Simpan Batas Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
