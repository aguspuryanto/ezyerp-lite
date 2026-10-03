import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  BadgeDollarSign,
  TrendingUp,
  Scale
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, products, businessProfile } = useERP();

  const [reportType, setReportType] = useState<'income_statement' | 'balance_sheet' | 'cash_flow'>('income_statement');
  const [reportPeriod, setReportPeriod] = useState<'current_month' | 'last_month' | 'year_to_date'>('current_month');
  const [isBankReadyMode, setIsBankReadyMode] = useState(false);

  // Calculations
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Expense categorized
  const cogsExpense = transactions
    .filter((t) => t.type === 'expense' && (t.category.includes('Stok') || t.category.includes('Bahan')))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const operationalExpense = transactions
    .filter((t) => t.type === 'expense' && !t.category.includes('Stok') && !t.category.includes('Bahan') && !t.category.includes('Gaji'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const payrollExpense = transactions
    .filter((t) => t.type === 'expense' && t.category.includes('Gaji'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = cogsExpense + operationalExpense + payrollExpense;
  const grossProfit = totalRevenue - cogsExpense;
  const netIncome = totalRevenue - totalExpense;

  // Balance sheet values
  const cashAndEquivalents = totalRevenue - totalExpense;
  const inventoryAssets = products.reduce((acc, p) => acc + p.stock * p.hppCost, 0);
  const fixedEquipmentAssets = 25000000; // Peralatan toko & mesin espresso estimasi
  const totalAssets = Math.max(0, cashAndEquivalents) + inventoryAssets + fixedEquipmentAssets;

  const currentLiabilities = 4500000; // Hutang sewa/dagang lancar
  const ownersEquity = totalAssets - currentLiabilities;

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ['LAPORAN KEUANGAN UMKM - ' + businessProfile.businessName],
      ['Periode: ' + (reportPeriod === 'current_month' ? 'Bulan Berjalan (Oktober 2026)' : 'Tahun 2026')],
      ['Dicetak pada: ' + new Date().toLocaleDateString('id-ID')],
      [''],
      ['KOMPONEN', 'NOMINAL (RP)'],
      ['A. PENDAPATAN USAHA (REVENUE)'],
      ['Total Omzet Penjualan', totalRevenue],
      [''],
      ['B. HARGA POKOK PENJUALAN (HPP)'],
      ['Bahan Baku & Pembelian Stok', cogsExpense],
      ['LABA KOTOR (GROSS PROFIT)', grossProfit],
      [''],
      ['C. BEBAN OPERASIONAL (EXPENSES)'],
      ['Beban Gaji & Upah Karyawan', payrollExpense],
      ['Beban Operasional, Listrik & Sewa', operationalExpense],
      ['Total Beban Operasional', operationalExpense + payrollExpense],
      [''],
      ['LABA BERSIH USAHA (NET INCOME)', netIncome],
      [''],
      ['D. RINGKASAN POSISI KEUANGAN (NERACA)'],
      ['Kas & Setara Kas', cashAndEquivalents],
      ['Persediaan Barang Dagang (Stok)', inventoryAssets],
      ['Aset Tetap / Peralatan', fixedEquipmentAssets],
      ['TOTAL ASET USAHA', totalAssets],
      ['Liabilitas / Hutang Lancar', currentLiabilities],
      ['EKUITAS / MODAL BERSIH', ownersEquity]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Laporan_Keuangan_${businessProfile.businessName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Laporan Siap Cetak & Kebutuhan Bank
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan keuangan standar akuntansi UMKM (SAK EMKM) siap cetak/PDF untuk pengajuan pinjaman bank / KUR & perpajakan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors printable-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Report Controls (Hidden in Print) */}
      <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setReportType('income_statement')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              reportType === 'income_statement'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Laba Rugi
          </button>
          <button
            onClick={() => setReportType('balance_sheet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              reportType === 'balance_sheet'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Neraca Keuangan
          </button>
          <button
            onClick={() => setReportType('cash_flow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              reportType === 'cash_flow'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arus Kas (Cash Flow)
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isBankReadyMode}
              onChange={(e) => setIsBankReadyMode(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Sertakan Kop Surat & Pengesahan Bank / KUR</span>
          </label>
        </div>
      </div>

      {/* Formal Printable Document Sheet */}
      <div className="printable-document bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 max-w-4xl mx-auto">
        {/* Official Letterhead (Kop Surat Usaha) */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                {businessProfile.businessName}
              </h2>
              <p className="text-xs text-slate-600 font-medium">{businessProfile.tagline}</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-lg">
                Alamat Usaha: {businessProfile.address} · Kota: {businessProfile.city}
              </p>
              <p className="text-[11px] text-slate-500">
                Kontak: {businessProfile.phone} · Email: {businessProfile.email}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider">
                {isBankReadyMode ? 'DOKUMEN PENGAJUAN FASILITAS BANK / KUR' : 'LAPORAN KEUANGAN UMKM'}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Ref: FIN/REP/{new Date().getFullYear()}/{Math.floor(100 + Math.random() * 900)}
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                Standar: SAK EMKM Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Title of Specific Statement */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold uppercase text-slate-900 underline decoration-slate-400 underline-offset-4">
            {reportType === 'income_statement' && 'LAPORAN LABA RUGI (INCOME STATEMENT)'}
            {reportType === 'balance_sheet' && 'NERACA KEUANGAN SEDERHANA (BALANCE SHEET)'}
            {reportType === 'cash_flow' && 'LAPORAN ARUS KAS (CASH FLOW STATEMENT)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Untuk Periode yang Berakhir pada 31 Oktober 2026 (Dinyatakan dalam Rupiah Indonesia)
          </p>
        </div>

        {/* 1. INCOME STATEMENT */}
        {reportType === 'income_statement' && (
          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 uppercase tracking-wide border-y border-slate-200">
                1. PENDAPATAN USAHA (REVENUE)
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2 px-3">
                  <span className="text-slate-700">Penjualan Produk & Jasa Langsung</span>
                  <span className="font-mono font-medium">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3 font-bold bg-slate-50/50">
                  <span>TOTAL PENDAPATAN BERSIH</span>
                  <span className="font-mono text-slate-900">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* COGS */}
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 uppercase tracking-wide border-y border-slate-200">
                2. HARGA POKOK PENJUALAN (HPP / COGS)
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2 px-3">
                  <span className="text-slate-700">Bahan Baku & Pembelian Barang Dagang</span>
                  <span className="font-mono font-medium">Rp {cogsExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3 font-bold bg-slate-50/50">
                  <span>TOTAL HARGA POKOK PENJUALAN</span>
                  <span className="font-mono text-rose-700">Rp {cogsExpense.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex justify-between font-bold text-emerald-900 text-xs">
              <span>LABA KOTOR (GROSS PROFIT)</span>
              <span className="font-mono text-sm">Rp {grossProfit.toLocaleString('id-ID')}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 uppercase tracking-wide border-y border-slate-200">
                3. BEBAN OPERASIONAL (OPERATING EXPENSES)
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2 px-3">
                  <span className="text-slate-700">Beban Gaji & Upah Karyawan</span>
                  <span className="font-mono font-medium">Rp {payrollExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3">
                  <span className="text-slate-700">Beban Sewa Toko, Listrik & Utilitas</span>
                  <span className="font-mono font-medium">Rp {operationalExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3 font-bold bg-slate-50/50">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span className="font-mono text-rose-700">
                    Rp {(payrollExpense + operationalExpense).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center font-bold text-sm">
              <div>
                <span>LABA BERSIH USAHA (NET INCOME / PROFIT)</span>
                <p className="text-[11px] text-slate-400 font-normal">
                  Margin Laba Bersih: {totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0}%
                </p>
              </div>
              <span className="font-mono text-lg text-emerald-400">
                Rp {netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET */}
        {reportType === 'balance_sheet' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Assets */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 border-b border-slate-200">
                  A. ASET (ASSETS)
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-bold text-slate-800 text-[11px]">Aset Lancar:</p>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Kas & Rekening Bank</span>
                    <span className="font-mono">Rp {Math.max(0, cashAndEquivalents).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Persediaan Barang Dagang (Stok HPP)</span>
                    <span className="font-mono">Rp {inventoryAssets.toLocaleString('id-ID')}</span>
                  </div>

                  <p className="font-bold text-slate-800 text-[11px] pt-2 border-t border-slate-100">
                    Aset Tidak Lancar:
                  </p>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Peralatan, Mesin & Perlengkapan</span>
                    <span className="font-mono">Rp {fixedEquipmentAssets.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between pt-3 border-t-2 border-slate-300 font-bold text-slate-900">
                    <span>TOTAL ASET</span>
                    <span className="font-mono text-indigo-700">Rp {totalAssets.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-900 border-b border-slate-200">
                  B. KEWAJIBAN & EKUITAS
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-bold text-slate-800 text-[11px]">Kewajiban Lancar:</p>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Hutang Operasional & Tagihan</span>
                    <span className="font-mono">Rp {currentLiabilities.toLocaleString('id-ID')}</span>
                  </div>

                  <p className="font-bold text-slate-800 text-[11px] pt-2 border-t border-slate-100">
                    Ekuitas Pemilik:
                  </p>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Modal Disetor Pemilik</span>
                    <span className="font-mono">Rp {(ownersEquity - Math.max(0, netIncome)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-600">Laba Berjalan Bulan Ini</span>
                    <span className="font-mono text-emerald-600">Rp {Math.max(0, netIncome).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between pt-3 border-t-2 border-slate-300 font-bold text-slate-900">
                    <span>TOTAL KEWAJIBAN & EKUITAS</span>
                    <span className="font-mono text-indigo-700">Rp {totalAssets.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CASH FLOW STATEMENT */}
        {reportType === 'cash_flow' && (
          <div className="space-y-4 text-xs">
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-y border-slate-200">
                1. ARUS KAS DARI AKTIVITAS OPERASIONAL
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2 px-3">
                  <span>Penerimaan Kas dari Pelanggan & Penjualan</span>
                  <span className="font-mono font-medium text-emerald-700">+Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3">
                  <span>Pembayaran Kas kepada Pemasok & Bahan Baku</span>
                  <span className="font-mono font-medium text-rose-700">-Rp {cogsExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3">
                  <span>Pembayaran Kas untuk Gaji & Upah Tenaga Kerja</span>
                  <span className="font-mono font-medium text-rose-700">-Rp {payrollExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 px-3">
                  <span>Pembayaran Kas untuk Biaya Operasional & Sewa</span>
                  <span className="font-mono font-medium text-rose-700">-Rp {operationalExpense.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2.5 px-3 font-bold bg-slate-50 border-t border-slate-200">
                  <span>ARUS KAS BERSIH DARI OPERASIONAL</span>
                  <span className="font-mono text-indigo-700">Rp {netIncome.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Legal Declaration & Signatures (for Bank / KUR requirement) */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <p className="text-[11px] text-slate-600 leading-relaxed italic">
            "Kami menyatakan dengan sebenarnya bahwa laporan keuangan ini disusun berdasarkan data pembukuan riil usaha {businessProfile.businessName} sesuai standar pencatatan akuntansi yang berlaku untuk keperluan evaluasi perbankan / KUR."
          </p>

          <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Disusun oleh Bagian Keuangan,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold underline text-slate-900">Staff Keuangan & ERP</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">EzyERP System Automated</p>
            </div>

            <div>
              <p className="text-slate-500">
                {businessProfile.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold underline text-slate-900">
                  {businessProfile.ownerName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Pemilik Usaha / Direktur Utama</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
