import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { InventoryItem } from '../../types/erp';
import {
  Globe2,
  Search,
  ShoppingCart,
  MessageCircle,
  Share2,
  Check,
  Package,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { products, businessProfile } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');
  const [copiedCatalog, setCopiedCatalog] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  const activeProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const catalogUrl = `${window.location.origin}/katalog/${businessProfile.businessName.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopyCatalogUrl = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2000);
  };

  const handleSendWhatsAppOrder = (product: InventoryItem, qty: number, notes?: string) => {
    const totalAmount = product.sellingPrice * qty;
    const text =
      `Halo *${businessProfile.businessName}*! 👋\n` +
      `Saya ingin memesan produk dari katalog website Anda:\n\n` +
      `📦 *Produk:* ${product.name}\n` +
      `🔖 *SKU:* ${product.sku}\n` +
      `🔢 *Jumlah:* ${qty} ${product.unit}\n` +
      `💰 *Harga Satuan:* Rp ${product.sellingPrice.toLocaleString('id-ID')}\n` +
      `💵 *Total Pembayaran:* Rp ${totalAmount.toLocaleString('id-ID')}\n` +
      (notes ? `📝 *Catatan:* ${notes}\n\n` : '\n') +
      `Mohon informasikan ketersediaan stok & nomor rekening pembayaran ya. Terima kasih! 🙏`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = businessProfile.phone.replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Katalog Website & Etalase Online
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Etalase produk online interaktif untuk dibagikan ke pelanggan dengan tombol pemesanan langsung ke WhatsApp.
          </p>
        </div>

        <button
          onClick={handleCopyCatalogUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          {copiedCatalog ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Link Tersalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Link Katalog</span>
            </>
          )}
        </button>
      </div>

      {/* Catalog Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[220px] flex items-center">
        <img
          src={businessProfile.bannerUrl || '/src/assets/images/catalog_hero_banner_1791062109034.jpg'}
          alt="Etalase Toko"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-transparent" />

        <div className="relative p-6 sm:p-8 max-w-xl text-white">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-300 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Resmi Terverifikasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {businessProfile.businessName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
            {businessProfile.tagline}
          </p>
          <div className="flex items-center gap-3 mt-4 text-xs text-slate-300">
            <span>📍 {businessProfile.city}</span>
            <span>·</span>
            <span>💬 Fast Response WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Produk ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === c
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeProducts.map((p) => {
          const inStock = p.stock > 0;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Product Visual Container with Fallback */}
              <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Package className="w-8 h-8" />
                </div>

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900/80 text-white rounded backdrop-blur-xs">
                    {p.sku}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {inStock ? `Tersedia (${p.stock} ${p.unit})` : 'Habis'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'Produk kualitas pilihan bergaransi langsung dari Harmoni Store.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Harga Satuan</span>
                    <div className="text-base font-bold font-mono text-indigo-600">
                      Rp {p.sellingPrice.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <button
                    disabled={!inStock}
                    onClick={() => {
                      setSelectedProduct(p);
                      setOrderQuantity(1);
                      setCustomerNotes('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      inStock
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pesan via WA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Konfirmasi Pemesanan Produk
                </h3>
                <p className="text-xs text-slate-500">
                  Langsung terhubung dengan WhatsApp penjual
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {selectedProduct.sku} · Stok: {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 font-mono mt-0.5">
                    Rp {selectedProduct.sellingPrice.toLocaleString('id-ID')} / {selectedProduct.unit}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Pesanan ({selectedProduct.unit})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-slate-900 w-12 text-center">
                    {orderQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderQuantity(Math.min(selectedProduct.stock, orderQuantity + 1))
                    }
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tolong digiling halus untuk tubruk ya"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">
                  Total Estimasi Pesanan:
                </span>
                <span className="text-base font-bold font-mono text-indigo-600">
                  Rp {(selectedProduct.sellingPrice * orderQuantity).toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={() => {
                  handleSendWhatsAppOrder(selectedProduct, orderQuantity, customerNotes);
                  setSelectedProduct(null);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Pesanan ke WhatsApp Toko Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
