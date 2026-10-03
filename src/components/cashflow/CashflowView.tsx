import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Transaction } from '../../types/erp';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  Filter,
  Trash2,
  Calendar,
  Wallet,
  X
} from 'lucide-react';

interface CashflowViewProps {
  quickTxOpen: boolean;
  quickTxType: 'income' | 'expense';
  onCloseQuickTx: () => void;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  quickTxOpen,
  quickTxType,
  onCloseQuickTx
}) => {
  const { transactions, addTransaction, deleteTransaction } = useERP();

  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Penjualan');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('qris');
  const [reference, setReference] = useState('');
  const [contactName, setContactName] = useState('');

  // Handle external quick modal triggers from navbar or dashboard
  React.useEffect(() => {
    if (quickTxOpen) {
      setTxType(quickTxType);
      setCategory(quickTxType === 'income' ? 'Penjualan' : 'Bahan Baku & Stok');
      setIsModalOpen(true);
    }
  }, [quickTxOpen, quickTxType]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeFilter !== 'all' && tx.type !== activeFilter) return false;
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesRef = tx.reference?.toLowerCase().includes(q);
        const matchesContact = tx.contactName?.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        if (!matchesDesc && !matchesRef && !matchesContact && !matchesCat) return false;
      }
      return true;
    });
  }, [transactions, activeFilter, selectedCategory, searchQuery]);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !description.trim()) return;

    addTransaction({
      date,
      type: txType,
      category,
      amount: Number(amount),
      description: description.trim(),
      paymentMethod,
      reference: reference.trim() || undefined,
      contactName: contactName.trim() || undefined
    });

    // Reset form
    setAmount('');
    setDescription('');
    setReference('');
    setContactName('');
    setIsModalOpen(false);
    onCloseQuickTx();
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Metode Pembayaran', 'Nominal (Rp)', 'Referensi', 'Kontak'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${tx.category.replace(/"/g, '""')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.paymentMethod.toUpperCase(),
      tx.amount,
      `"${(tx.reference || '').replace(/"/g, '""')}"`,
      `"${(tx.contactName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EzyERP_BukuKas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Buku Kas & Transaksi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan mutasi arus kas, penerimaan penjualan, dan beban pengeluaran usaha.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setTxType('income');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Pemasukan
          </button>
          <button
            onClick={() => {
              setTxType('expense');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pemasukan Terfilter</span>
          <p className="text-lg font-bold text-emerald-600 font-mono mt-1">
            + Rp {totalFilteredIncome.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pengeluaran Terfilter</span>
          <p className="text-lg font-bold text-rose-600 font-mono mt-1">
            - Rp {totalFilteredExpense.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Selisih Kas Bersih</span>
          <p
            className={`text-lg font-bold font-mono mt-1 ${
              totalFilteredIncome - totalFilteredExpense >= 0
                ? 'text-indigo-600'
                : 'text-rose-600'
            }`}
          >
            Rp {(totalFilteredIncome - totalFilteredExpense).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Interactive Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setActiveFilter('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'income'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setActiveFilter('expense')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'expense'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Search & Category select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi, referensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tipe & Kategori</th>
                <th className="py-3 px-4">Deskripsi / Kontak</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-800">
                          {tx.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {tx.type === 'income' ? 'Arus Masuk' : 'Arus Keluar'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{tx.description}</p>
                      {(tx.contactName || tx.reference) && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {tx.contactName && <span>Kontak: {tx.contactName} </span>}
                          {tx.reference && <span>· Ref: {tx.reference}</span>}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      <span
                        className={
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'} Rp{' '}
                        {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    txType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <h3 className="font-bold text-sm text-slate-900">
                  {txType === 'income' ? 'Catat Pemasukan Kas' : 'Catat Pengeluaran Kas'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  onCloseQuickTx();
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setCategory('Penjualan');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    txType === 'income'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setCategory('Bahan Baku & Stok');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    txType === 'expense'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Pengeluaran
                </button>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Transaksi (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Contoh: 150000"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Transaksi *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Transaksi
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    {txType === 'income' ? (
                      <>
                        <option value="Penjualan">Penjualan Langsung</option>
                        <option value="Penjualan Kasir POS">Penjualan Kasir POS</option>
                        <option value="Penjualan Online">Penjualan Online</option>
                        <option value="Penjualan B2B">Penjualan B2B / Grosir</option>
                        <option value="Pendapatan Jasa">Pendapatan Jasa</option>
                        <option value="Pemasukan Lainnya">Pemasukan Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Bahan Baku & Stok">Bahan Baku & Stok</option>
                        <option value="Operasional & Listrik">Operasional & Listrik</option>
                        <option value="Sewa Tempat">Sewa Tempat</option>
                        <option value="Gaji Karyawan">Gaji Karyawan</option>
                        <option value="Pemasaran & Iklan">Pemasaran & Iklan</option>
                        <option value="Peralatan & Aset">Peralatan & Aset</option>
                        <option value="Biaya Lainnya">Biaya Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as Transaction['paymentMethod'])
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  >
                    <option value="cash">Tunai (Cash)</option>
                    <option value="qris">QRIS Real-Time</option>
                    <option value="bca">Bank BCA</option>
                    <option value="mandiri">Bank Mandiri</option>
                    <option value="bri">Bank BRI</option>
                    <option value="gopay">GoPay</option>
                    <option value="ovo">OVO</option>
                    <option value="dana">DANA</option>
                    <option value="card">Kartu Kredit/Debit</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran bahan baku kopi 10kg dari Koperasi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Contact & Reference Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pelanggan / Vendor (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Toko Barokah / Budi"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Ref / No. Resi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-2026-001"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onCloseQuickTx();
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                    txType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
