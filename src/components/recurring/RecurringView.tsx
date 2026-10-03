import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { RecurringTransaction } from '../../types/erp';
import {
  RotateCw,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurringBill
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Sewa Tempat');
  const [amount, setAmount] = useState<number | ''>('');
  const [interval, setInterval] = useState<RecurringTransaction['interval']>('monthly');
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bca');
  const [recipientOrPayer, setRecipientOrPayer] = useState('');
  const [notes, setNotes] = useState('');

  const today = new Date();

  const totalMonthlyCommitment = recurring
    .filter((r) => r.status === 'active' && r.type === 'expense')
    .reduce((acc, curr) => {
      if (curr.interval === 'monthly') return acc + curr.amount;
      if (curr.interval === 'weekly') return acc + curr.amount * 4;
      if (curr.interval === 'daily') return acc + curr.amount * 30;
      if (curr.interval === 'yearly') return acc + curr.amount / 12;
      return acc + curr.amount;
    }, 0);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setType('expense');
    setCategory('Sewa Tempat');
    setAmount('');
    setInterval('monthly');
    setNextDueDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('bca');
    setRecipientOrPayer('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: RecurringTransaction) => {
    setEditingItem(item);
    setTitle(item.title);
    setType(item.type);
    setCategory(item.category);
    setAmount(item.amount);
    setInterval(item.interval);
    setNextDueDate(item.nextDueDate);
    setPaymentMethod(item.paymentMethod);
    setRecipientOrPayer(item.recipientOrPayer);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || amount <= 0) return;

    if (editingItem) {
      updateRecurring(editingItem.id, {
        title,
        type,
        category,
        amount: Number(amount),
        interval,
        nextDueDate,
        paymentMethod,
        recipientOrPayer,
        notes
      });
    } else {
      addRecurring({
        title,
        type,
        category,
        amount: Number(amount),
        interval,
        nextDueDate,
        paymentMethod,
        recipientOrPayer,
        status: 'active',
        notes
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Kelola Transaksi Rutin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Otomatisasi pengingat beban rutin bulanan seperti sewa toko, tagihan listrik, internet, dan langganan.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          + Tambah Tagihan Rutin
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Estimasi Beban Tetap Bulanan</span>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            Rp {Math.round(totalMonthlyCommitment).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total komitmen biaya aktif</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Jadwal Rutin</span>
          <p className="text-lg font-bold text-indigo-600 font-mono mt-1">
            {recurring.length} Item
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {recurring.filter((r) => r.status === 'active').length} berstatus aktif
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Metode Eksekusi</span>
          <p className="text-xs font-semibold text-slate-800 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Klik Posting Otomatis ke Buku Kas</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tidak perlu input manual berulang</p>
        </div>
      </div>

      {/* Recurring Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.map((item) => {
          const dueDate = new Date(item.nextDueDate);
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0;
          const isDueToday = diffDays === 0;
          const isDueSoon = diffDays > 0 && diffDays <= 4;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-colors ${
                isOverdue
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isDueToday
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status === 'active' ? 'Aktif' : 'Dijeda'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    Rp {item.amount.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-500 capitalize">
                    Frekuensi: Tiap {item.interval} · {item.paymentMethod.toUpperCase()}
                  </p>
                </div>

                {/* Due Date Indicator */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Jatuh Tempo:
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {item.nextDueDate}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] font-medium">
                    {isOverdue && (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Terlambat {Math.abs(diffDays)} hari! Segera bayar.
                      </span>
                    )}
                    {isDueToday && (
                      <span className="text-amber-600 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Jatuh tempo HARI INI!
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="text-amber-600">
                        Jatuh tempo dalam {diffDays} hari ke depan.
                      </span>
                    )}
                    {!isOverdue && !isDueToday && !isDueSoon && (
                      <span className="text-slate-400">
                        Masih {diffDays} hari lagi.
                      </span>
                    )}
                  </div>
                </div>

                {item.recipientOrPayer && (
                  <p className="text-[11px] text-slate-500 mt-2 truncate">
                    Penerima: <span className="text-slate-800">{item.recipientOrPayer}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateRecurring(item.id, {
                        status: item.status === 'active' ? 'paused' : 'active'
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                    title={item.status === 'active' ? 'Jeda pengingat' : 'Aktifkan kembali'}
                  >
                    {item.status === 'active' ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-xs"
                    title="Edit tagihan"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRecurring(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Hapus jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => executeRecurringBill(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  title="Catat pengeluaran ke buku kas dan perbarui tanggal jatuh tempo"
                >
                  <span>Bayar & Catat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Recurring Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingItem ? 'Edit Transaksi Rutin' : 'Tambah Transaksi Rutin Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tagihan / Transaksi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Langganan Internet Biznet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Biaya (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Contoh: 650000"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Frekuensi Siklus
                  </label>
                  <select
                    value={interval}
                    onChange={(e) =>
                      setInterval(e.target.value as RecurringTransaction['interval'])
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="monthly">Bulanan</option>
                    <option value="weekly">Mingguan</option>
                    <option value="daily">Harian</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Jatuh Tempo Berikutnya *
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pengeluaran
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  >
                    <option value="bca">Bank BCA</option>
                    <option value="mandiri">Bank Mandiri</option>
                    <option value="bri">Bank BRI</option>
                    <option value="cash">Tunai (Cash)</option>
                    <option value="qris">QRIS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penerima / Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Biznet Gio"
                    value={recipientOrPayer}
                    onChange={(e) => setRecipientOrPayer(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Nomor Pelanggan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ID Pelanggan: 109283192"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Jadwalkan Rutin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
