import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { InventoryItem, Transaction } from '../../types/erp';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  DollarSign,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  Search,
  X
} from 'lucide-react';

interface CartItem {
  product: InventoryItem;
  quantity: number;
}

export const PosView: React.FC = () => {
  const { products, addTransaction, adjustStock, businessProfile } = useERP();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [discount, setDiscount] = useState<number>(0);
  const [customerCash, setCustomerCash] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('qris');
  const [customerName, setCustomerName] = useState('Pelanggan Kasir');

  // Struk / Receipt modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    invoiceNo: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    cashPaid: number;
    change: number;
    paymentMethod: string;
    date: string;
    customerName: string;
  } | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const addToCart = (product: InventoryItem) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerCash('');
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.sellingPrice * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  const numericCash = Number(customerCash) || 0;
  const change = paymentMethod === 'cash' ? Math.max(0, numericCash - total) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && numericCash < total) return;

    const invoiceNo = `POS-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    // 1. Deduct inventory stock for each item sold
    cart.forEach((item) => {
      adjustStock(item.product.id, -item.quantity, `Penjualan Kasir #${invoiceNo}`);
    });

    // 2. Automatically record in EzyERP Cashflow Bookkeeping
    addTransaction({
      date: today,
      type: 'income',
      category: 'Penjualan Kasir POS',
      amount: total,
      description: `Penjualan Kasir ${invoiceNo} (${cart.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')})`,
      paymentMethod,
      reference: invoiceNo,
      contactName: customerName
    });

    // 3. Prepare receipt and show receipt modal
    setLastReceipt({
      invoiceNo,
      items: [...cart],
      subtotal,
      discount,
      total,
      cashPaid: paymentMethod === 'cash' ? numericCash : total,
      change,
      paymentMethod: paymentMethod.toUpperCase(),
      date: new Date().toLocaleString('id-ID'),
      customerName
    });

    clearCart();
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Kasir Cepat (Point of Sales)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transaksi kasir toko instan: potong stok barang otomatis dan catat omzet penjualan ke buku kas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari produk kasir atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              return (
                <button
                  key={p.id}
                  disabled={!inStock}
                  onClick={() => addToCart(p)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                    inStock
                      ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs active:scale-[0.98]'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {p.sku}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        Stok: {p.stock}
                      </span>
                      <span className="font-bold font-mono text-xs text-indigo-600">
                        Rp {p.sellingPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <span
                      className={`p-1 rounded-md ${
                        inStock ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Keranjang Kasir ({cart.length} item)
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Keranjang masih kosong. Klik produk di sebelah kiri untuk menambahkan.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      Rp {item.product.sellingPrice.toLocaleString('id-ID')} / {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-bold font-mono text-slate-900 w-20 text-right shrink-0">
                    Rp {(item.product.sellingPrice * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing & Calculations */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Penjualan:</span>
              <span className="font-mono font-semibold text-slate-900">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Diskon / Potongan:</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  value={discount === 0 ? '' : discount}
                  placeholder="0"
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-0.5 text-xs text-right bg-slate-50 border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Akhir:</span>
              <span className="font-mono text-indigo-600">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800">
              Metode Pembayaran Kasir:
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  paymentMethod === 'qris'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-rose-600" />
                <span>QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bca')}
                className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  paymentMethod === 'bca'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Transfer BCA</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('gopay')}
                className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  paymentMethod === 'gopay'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>e-Wallet GoPay</span>
              </button>
            </div>

            {/* Cash Input & Change Calculator */}
            {paymentMethod === 'cash' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Uang Diterima (Rp):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 100000"
                    value={customerCash}
                    onChange={(e) =>
                      setCustomerCash(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-32 px-2.5 py-1 text-xs text-right bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                  <span className="text-slate-700">Kembalian:</span>
                  <span
                    className={`font-mono text-sm ${
                      numericCash >= total ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {numericCash >= total
                      ? `Rp ${change.toLocaleString('id-ID')}`
                      : 'Kurang Rp ' + (total - numericCash).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0 || (paymentMethod === 'cash' && numericCash < total)}
            onClick={handleCheckout}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk Kasir</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {isReceiptOpen && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in duration-150">
            {/* Action Top Bar (no print) */}
            <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" /> Struk Pembelian Kasir
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold flex items-center gap-1 printable-btn"
                >
                  <Printer className="w-3 h-3" /> Cetak
                </button>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Thermal Printable Receipt Slip */}
            <div className="printable-document p-6 font-mono text-[11px] text-slate-800 space-y-3 bg-white">
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                <h3 className="font-bold text-sm uppercase text-slate-900">
                  {businessProfile.businessName}
                </h3>
                <p className="text-[10px] text-slate-500">{businessProfile.tagline}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{businessProfile.address}</p>
                <p className="text-[10px] text-slate-500">Telp: {businessProfile.phone}</p>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600">
                <span>No: {lastReceipt.invoiceNo}</span>
                <span>{lastReceipt.date}</span>
              </div>

              {/* Items */}
              <div className="border-y border-dashed border-slate-400 py-2 space-y-1.5">
                {lastReceipt.items.map((item) => (
                  <div key={item.product.id}>
                    <div className="font-semibold text-slate-900">{item.product.name}</div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>
                        {item.quantity} x Rp {item.product.sellingPrice.toLocaleString('id-ID')}
                      </span>
                      <span>
                        Rp {(item.quantity * item.product.sellingPrice).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rp {lastReceipt.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon</span>
                    <span>-Rp {lastReceipt.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                  <span>TOTAL</span>
                  <span>Rp {lastReceipt.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Bayar ({lastReceipt.paymentMethod})</span>
                  <span>Rp {lastReceipt.cashPaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kembalian</span>
                  <span>Rp {lastReceipt.change.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500">
                <p className="font-semibold text-slate-800">Terima kasih atas kunjungan Anda!</p>
                <p className="mt-0.5">Barang yang sudah dibeli tidak dapat ditukar.</p>
                <p className="mt-1 text-[9px]">Sistem Kasir Terpadu EzyERP</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
