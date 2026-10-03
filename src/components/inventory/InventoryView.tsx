import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { InventoryItem } from '../../types/erp';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  PackagePlus,
  PackageMinus,
  CheckCircle,
  X
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustReason, setAdjustReason] = useState('Pembelian Restock Supplier');

  // Form states for product add/edit
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Kopi & Minuman');
  const [unit, setUnit] = useState('pack');
  const [stock, setStock] = useState<number | ''>(0);
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(10);
  const [hppCost, setHppCost] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (showLowStockOnly && p.stock > p.minStockAlert) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }
      return true;
    });
  }, [products, selectedCategory, showLowStockOnly, searchQuery]);

  const totalInventoryValuation = products.reduce((acc, p) => acc + p.stock * p.hppCost, 0);
  const totalPotentialRevenue = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('SKU-' + Math.floor(1000 + Math.random() * 9000));
    setCategory('Kopi & Minuman');
    setUnit('pack');
    setStock(10);
    setMinStockAlert(5);
    setHppCost('');
    setSellingPrice('');
    setDescription('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: InventoryItem) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setUnit(p.unit);
    setStock(p.stock);
    setMinStockAlert(p.minStockAlert);
    setHppCost(p.hppCost);
    setSellingPrice(p.sellingPrice);
    setDescription(p.description || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || hppCost === '' || sellingPrice === '') return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        sku,
        category,
        unit,
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        hppCost: Number(hppCost),
        sellingPrice: Number(sellingPrice),
        description
      });
    } else {
      addProduct({
        name,
        sku,
        category,
        unit,
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        hppCost: Number(hppCost),
        sellingPrice: Number(sellingPrice),
        description,
        isActive: true
      });
    }

    setIsProductModalOpen(false);
  };

  const handleOpenAdjustModal = (p: InventoryItem) => {
    setAdjustTargetProduct(p);
    setAdjustType('in');
    setAdjustAmount('');
    setAdjustReason('Pembelian Restock Supplier');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetProduct || !adjustAmount || adjustAmount <= 0) return;

    const delta = adjustType === 'in' ? Number(adjustAmount) : -Number(adjustAmount);
    adjustStock(adjustTargetProduct.id, delta, adjustReason);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pantau Stok Barang & HPP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen inventaris barang dagang, Harga Pokok Penjualan (HPP), dan margin laba.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          + Tambah Barang Baru
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Valuasi Aset Stok (HPP)</span>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            Rp {totalInventoryValuation.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Modal tertahan di gudang</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Potensi Nilai Penjualan</span>
          <p className="text-lg font-bold text-indigo-600 font-mono mt-1">
            Rp {totalPotentialRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Potensi Laba Kotor: Rp {(totalPotentialRevenue - totalInventoryValuation).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Status Ketersediaan</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900 font-mono">
              {products.length} SKU
            </span>
            {lowStockCount > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {lowStockCount} Menipis
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Item aktif dalam katalog</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
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

        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            showLowStockOnly
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Hanya Stok Menipis ({lowStockCount})</span>
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Nama Produk & SKU</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Sisa Stok</th>
                <th className="py-3 px-4 text-right">HPP (Beli)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Margin Laba</th>
                <th className="py-3 px-4 text-right">Total Valuasi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStockAlert;
                  const profitMargin = p.sellingPrice > 0
                    ? Math.round(((p.sellingPrice - p.hppCost) / p.sellingPrice) * 100)
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          SKU: {p.sku}
                        </p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 font-mono font-bold">
                          <span
                            className={isLow ? 'text-rose-600 font-extrabold' : 'text-slate-900'}
                          >
                            {p.stock}
                          </span>
                          <span className="text-slate-400 text-[11px] font-normal">
                            {p.unit}
                          </span>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-rose-600 font-medium mt-0.5 flex items-center justify-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Min: {p.minStockAlert}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                        Rp {p.hppCost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                        Rp {p.sellingPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        <span
                          className={`font-semibold ${
                            profitMargin >= 30
                              ? 'text-emerald-600'
                              : profitMargin >= 15
                              ? 'text-indigo-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {profitMargin}%
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          +Rp {(p.sellingPrice - p.hppCost).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-800">
                        Rp {(p.stock * p.hppCost).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAdjustModal(p)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Penyesuaian / Restock Stok"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit data produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Edit Data Barang & HPP' : 'Tambah Barang Dagang Baru'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Barang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biji Kopi Toraja Sapan 250g"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode SKU / Barcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Barang
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
                    Satuan (Unit)
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="pack">Pack / Kantong</option>
                    <option value="pcs">Pcs / Buah</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="botol">Botol</option>
                    <option value="box">Box / Dus</option>
                    <option value="unit">Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Minimum Alert Stok *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStockAlert}
                    onChange={(e) =>
                      setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Pokok Pembelian (HPP) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Contoh: 50000"
                    value={hppCost}
                    onChange={(e) =>
                      setHppCost(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual ke Pelanggan *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Contoh: 85000"
                    value={sellingPrice}
                    onChange={(e) =>
                      setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Stok Sekarang *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Karakteristik produk untuk katalog online..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  {editingProduct ? 'Perbarui Produk' : 'Simpan Barang Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && adjustTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Kartu Stok: {adjustTargetProduct.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Sisa saat ini: {adjustTargetProduct.stock} {adjustTargetProduct.unit}
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAdjustType('in')}
                  className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'in'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  Stok Masuk (Beli)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('out')}
                  className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'out'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PackageMinus className="w-3.5 h-3.5" />
                  Stok Keluar (Rusak/Opname)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah {adjustType === 'in' ? 'Masuk' : 'Keluar'} ({adjustTargetProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Contoh: 10"
                  value={adjustAmount}
                  onChange={(e) =>
                    setAdjustAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan Mutasi
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {adjustType === 'in' ? (
                    <>
                      <option value="Pembelian Restock Supplier">Pembelian Restock Supplier</option>
                      <option value="Retur dari Konsumen">Retur dari Konsumen</option>
                      <option value="Koreksi Lebih Stok Opname">Koreksi Lebih Stok Opname</option>
                    </>
                  ) : (
                    <>
                      <option value="Barang Rusak / Expired">Barang Rusak / Expired</option>
                      <option value="Sampling / Pemakaian Internal">Sampling / Pemakaian Internal Toko</option>
                      <option value="Hilang / Selisih Stok Opname">Hilang / Selisih Stok Opname</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Terapkan Mutasi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
