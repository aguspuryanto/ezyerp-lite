import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PaymentGatewayChannel } from '../../types/erp';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  ArrowRight,
  RefreshCw,
  Clock,
  Lock
} from 'lucide-react';

export const OnlinePaymentView: React.FC = () => {
  const { paymentChannels, togglePaymentChannel, addTransaction, businessProfile } = useERP();

  // Payment Link Generator states
  const [invoiceAmount, setInvoiceAmount] = useState<number | ''>(185000);
  const [customerName, setCustomerName] = useState('Ibu Siska Pratama');
  const [invoiceDescription, setInvoiceDescription] = useState('Pembelian 2 Pack Kopi Arabika Gayo & Mug');
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Customer Checkout Simulator state
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedSimChannel, setSelectedSimChannel] = useState<string>('qris');
  const [simPaymentStatus, setSimPaymentStatus] = useState<'pending' | 'success'>('pending');

  const paymentLink = `https://pay.ezyerp.id/inv/INV-${Date.now().toString().slice(-6)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateSuccessfulPayment = () => {
    if (!invoiceAmount) return;

    // Automatically book into EzyERP transactions
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Penjualan Online',
      amount: Number(invoiceAmount),
      description: `Pembayaran Online: ${invoiceDescription}`,
      paymentMethod: selectedSimChannel as any,
      reference: `PAY-GATEWAY-${Math.floor(100000 + Math.random() * 900000)}`,
      contactName: customerName
    });

    setSimPaymentStatus('success');
  };

  const getChannelIcon = (category: string) => {
    switch (category) {
      case 'qris':
        return <QrCode className="w-5 h-5 text-rose-600" />;
      case 'ewallet':
        return <Smartphone className="w-5 h-5 text-indigo-600" />;
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      default:
        return <Zap className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sistem Pembayaran Online & QRIS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dukung transfer bank, QRIS real-time, e-wallet (OVO, GoPay, Dana), dan kartu debit/kredit dengan pencatatan otomatis ke buku kas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enkripsi 256-bit TLS Aktif</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Channels & Invoice Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Channels Configuration */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Saluran Pembayaran Digital Terintegrasi
                </h2>
                <p className="text-xs text-slate-500">
                  Aktifkan saluran pembayaran yang ingin Anda sediakan bagi pelanggan
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {paymentChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                      {getChannelIcon(channel.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {channel.name}
                        </h3>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {channel.category.replace('_', ' ')}
                        </span>
                      </div>
                      {channel.accountNumber && (
                        <p className="text-xs font-mono text-slate-600 mt-0.5">
                          {channel.accountNumber} · a.n {channel.accountHolder}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        Biaya Transaksi: {channel.feePercentage > 0 ? `${channel.feePercentage}%` : ''}
                        {channel.feePercentage > 0 && channel.feeFixed > 0 ? ' + ' : ''}
                        {channel.feeFixed > 0 ? `Rp ${channel.feeFixed.toLocaleString('id-ID')}` : ''}
                        {channel.feePercentage === 0 && channel.feeFixed === 0 ? 'Gratis (0%)' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePaymentChannel(channel.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        channel.isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          channel.isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Payment Link Generator */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Buat Payment Link Tagihan
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Kirim link pembayaran instan ke pelanggan via WhatsApp atau SMS.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Tagihan (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  value={invoiceAmount}
                  onChange={(e) =>
                    setInvoiceAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Pesanan
                </label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSimPaymentStatus('pending');
                    setSimulatorOpen(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Buka Halaman Checkout Pelanggan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div className="truncate pr-2 font-mono text-[11px] text-slate-600">
                  {paymentLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors shrink-0"
                  title="Salin Tautan"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedLink && (
                <p className="text-[11px] text-emerald-600 font-medium text-center">
                  ✓ Link pembayaran berhasil disalin ke clipboard!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Checkout Simulator Modal */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            {/* Simulator Top Badge */}
            <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Checkout Aman · EzyERP Pay Gateway
              </span>
              <button
                onClick={() => setSimulatorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {simPaymentStatus === 'success' ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Pembayaran Berhasil Diverifikasi!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Terima kasih {customerName}, pembayaran sejumlah
                  </p>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    Rp {Number(invoiceAmount).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Otomatis tercatat masuk ke <strong>Buku Kas EzyERP</strong> dan stok diperbarui!
                  </p>
                </div>

                <button
                  onClick={() => setSimulatorOpen(false)}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Tutup Simulator
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Merchant & Order Summary */}
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-xs text-slate-500">Tagihan Pembayaran ke:</p>
                  <h3 className="font-bold text-slate-900 text-base">
                    {businessProfile.businessName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">{invoiceDescription}</p>

                  <div className="mt-3 flex items-baseline justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-medium text-slate-600">Total Tagihan</span>
                    <span className="text-lg font-bold font-mono text-indigo-600">
                      Rp {Number(invoiceAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Select Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Pilih Cara Pembayaran:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSimChannel('qris')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedSimChannel === 'qris'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">QRIS Instan</p>
                        <p className="text-[10px] text-slate-500">BCA, Mandiri, e-Wallet</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSimChannel('gopay')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedSimChannel === 'gopay'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">GoPay / OVO / Dana</p>
                        <p className="text-[10px] text-slate-500">Saldo e-Wallet</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSimChannel('bca')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedSimChannel === 'bca'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Transfer BCA</p>
                        <p className="text-[10px] text-slate-500">Virtual Account</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSimChannel('card')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedSimChannel === 'card'
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Kartu Kredit/Debit</p>
                        <p className="text-[10px] text-slate-500">Visa / Mastercard</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Instructions Display */}
                {selectedSimChannel === 'qris' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Pindai QRIS dengan m-Banking / e-Wallet Anda:
                    </p>
                    {/* Dynamic QR SVG */}
                    <div className="inline-block p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                      <svg
                        className="w-36 h-36 mx-auto text-slate-900"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        {/* Finder pattern top-left */}
                        <rect x="10" y="10" width="24" height="24" rx="3" fill="#1e293b" />
                        <rect x="15" y="15" width="14" height="14" fill="#ffffff" />
                        <rect x="18" y="18" width="8" height="8" fill="#1e293b" />
                        {/* Finder pattern top-right */}
                        <rect x="66" y="10" width="24" height="24" rx="3" fill="#1e293b" />
                        <rect x="71" y="15" width="14" height="14" fill="#ffffff" />
                        <rect x="74" y="18" width="8" height="8" fill="#1e293b" />
                        {/* Finder pattern bottom-left */}
                        <rect x="10" y="66" width="24" height="24" rx="3" fill="#1e293b" />
                        <rect x="15" y="71" width="14" height="14" fill="#ffffff" />
                        <rect x="18" y="74" width="8" height="8" fill="#1e293b" />
                        {/* Data bits simulation */}
                        <rect x="42" y="14" width="6" height="6" fill="#1e293b" />
                        <rect x="52" y="24" width="6" height="6" fill="#1e293b" />
                        <rect x="42" y="34" width="6" height="6" fill="#1e293b" />
                        <rect x="20" y="44" width="6" height="6" fill="#1e293b" />
                        <rect x="34" y="52" width="6" height="6" fill="#1e293b" />
                        <rect x="48" y="48" width="8" height="8" fill="#4f46e5" />
                        <rect x="64" y="44" width="6" height="6" fill="#1e293b" />
                        <rect x="76" y="54" width="6" height="6" fill="#1e293b" />
                        <rect x="42" y="70" width="6" height="6" fill="#1e293b" />
                        <rect x="56" y="78" width="6" height="6" fill="#1e293b" />
                        <rect x="70" y="70" width="6" height="6" fill="#1e293b" />
                        <rect x="80" y="80" width="6" height="6" fill="#1e293b" />
                      </svg>
                      <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase">
                        NMID: ID10200889102
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Batas waktu pembayaran: 14 menit 59 detik
                    </p>
                  </div>
                )}

                {selectedSimChannel === 'bca' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <p className="font-semibold text-slate-800">Nomor Virtual Account BCA:</p>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 font-mono font-bold text-indigo-600 text-sm">
                      <span>88301 92841 0029</span>
                      <Copy className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transfer tepat sesuai jumlah untuk verifikasi otomatis 24 jam.
                    </p>
                  </div>
                )}

                {/* Simulation Button */}
                <div className="pt-2">
                  <button
                    onClick={handleSimulateSuccessfulPayment}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>[Simulasi] Pelanggan Tekan Bayar Sekarang</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Simulasi ini akan otomatis memverifikasi transaksi dan mencatatnya ke buku kas EzyERP
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
