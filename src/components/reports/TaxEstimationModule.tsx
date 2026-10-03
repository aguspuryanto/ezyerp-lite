import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calculator,
  Receipt,
  Percent,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sliders,
  HelpCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileText,
  BadgeDollarSign
} from 'lucide-react';

interface TaxEstimationModuleProps {
  reportPeriod: 'current_month' | 'last_month' | 'year_to_date';
  setReportPeriod: (period: 'current_month' | 'last_month' | 'year_to_date') => void;
  onSelectPrintTaxSheet?: () => void;
}

export const TaxEstimationModule: React.FC<TaxEstimationModuleProps> = ({
  reportPeriod,
  setReportPeriod,
  onSelectPrintTaxSheet
}) => {
  const { transactions, businessProfile } = useERP();

  // Tax configuration states
  const [taxRegime, setTaxRegime] = useState<'pp55_final' | 'corporate_31e'>('pp55_final');
  const [taxpayerType, setTaxpayerType] = useState<'individual' | 'corporate'>('corporate');
  const [isPkp, setIsPkp] = useState<boolean>(false);
  const [vatRate, setVatRate] = useState<number>(11); // 11% standard Indonesian VAT
  const [taxableTurnoverPercent, setTaxableTurnoverPercent] = useState<number>(100); // 100% of sales subject to VAT
  const [creditInputVat, setCreditInputVat] = useState<boolean>(true);
  const [includePph21, setIncludePph21] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Period filtering logic
  const now = new Date();
  const currentYearMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Previous month prefix
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYearMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYearPrefix = `${now.getFullYear()}-`;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (reportPeriod === 'current_month') {
        return t.date.startsWith(currentYearMonthPrefix);
      } else if (reportPeriod === 'last_month') {
        return t.date.startsWith(prevYearMonthPrefix);
      } else {
        // year_to_date
        return t.date.startsWith(currentYearPrefix);
      }
    });
  }, [transactions, reportPeriod, currentYearMonthPrefix, prevYearMonthPrefix, currentYearPrefix]);

  // Financial aggregates from cashflow
  const totalIncomeVolume = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenseVolume = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Eligible input VAT expenses (Purchases of Raw Materials, Inventory, Equipment)
  const eligibleInputVatExpenses = useMemo(() => {
    return filteredTransactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.category.includes('Stok') ||
            t.category.includes('Bahan') ||
            t.category.includes('Operasional') ||
            t.category.includes('Peralatan'))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Payroll expense for PPh 21
  const payrollExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense' && t.category.includes('Gaji'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netFiscalProfit = Math.max(0, totalIncomeVolume - totalExpenseVolume);

  // 1. VAT (PPN) Calculations
  const vatTaxableBase = (totalIncomeVolume * taxableTurnoverPercent) / 100;
  const outputVat = isPkp ? Math.round((vatTaxableBase * vatRate) / 100) : 0;
  const inputVat = isPkp && creditInputVat ? Math.round((eligibleInputVatExpenses * vatRate) / 100) : 0;
  const netVatPayable = Math.max(0, outputVat - inputVat);
  const isVatOverpaid = isPkp && inputVat > outputVat;
  const vatOverpaidAmount = isVatOverpaid ? inputVat - outputVat : 0;

  // 2. Income Tax (PPh) Calculations
  // PPh Final UMKM PP 55/2022 (0.5% from gross turnover)
  // For individual taxpayers (WP OP), UU HPP exempts turnover up to Rp 500 million/year
  const pphFinalTurnoverBase = totalIncomeVolume;
  let pphFinalEstimated = 0;
  if (taxRegime === 'pp55_final') {
    if (taxpayerType === 'individual' && totalIncomeVolume < 500000000 && reportPeriod === 'current_month') {
      // If individual under PTKP threshold
      pphFinalEstimated = Math.round(pphFinalTurnoverBase * 0.005);
    } else {
      pphFinalEstimated = Math.round(pphFinalTurnoverBase * 0.005);
    }
  }

  // Corporate PPh Article 31E (11% on taxable net profit)
  const pphCorporate31E = Math.round(netFiscalProfit * 0.11);
  const incomeTaxPayable = taxRegime === 'pp55_final' ? pphFinalEstimated : pphCorporate31E;

  // 3. PPh 21 (Employee Payroll Withholding Estimation)
  // Estimated at approx 2.5% effective withholding average for staff above PTKP
  const estimatedPph21 = includePph21 && payrollExpense > 0 ? Math.round(payrollExpense * 0.025) : 0;

  // 4. Grand Total Tax Liability
  const grandTotalTax = netVatPayable + incomeTaxPayable + estimatedPph21;
  const effectiveTaxRatio = totalIncomeVolume > 0 ? ((grandTotalTax / totalIncomeVolume) * 100).toFixed(2) : '0.00';

  // Tax Deadlines
  const currentMonthIdx = now.getMonth();
  const nextMonthIdx = (currentMonthIdx + 1) % 12;
  const nextMonthYear = nextMonthIdx === 0 ? now.getFullYear() + 1 : now.getFullYear();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const pphDueDate = `15 ${monthNames[nextMonthIdx]} ${nextMonthYear}`;
  const ppnDueDate = `Akhir ${monthNames[nextMonthIdx]} ${nextMonthYear}`;

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Decorative gradient highlight */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-50/60 via-slate-50/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

      {/* Header Row */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Estimator Pajak Usaha Real-Time (PPN & PPh)
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Receipt className="w-3 h-3" />
                DJP Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kalkulasi otomatis kewajiban PPN Masa dan PPh Usaha berdasarkan mutasi riil Buku Kas
            </p>
          </div>
        </div>

        {/* Period Selector & Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setReportPeriod('current_month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                reportPeriod === 'current_month'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Berjalan ({monthNames[now.getMonth()]})
            </button>
            <button
              onClick={() => setReportPeriod('last_month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                reportPeriod === 'last_month'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Lalu ({monthNames[prevMonthDate.getMonth()]})
            </button>
            <button
              onClick={() => setReportPeriod('year_to_date')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                reportPeriod === 'year_to_date'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahun {now.getFullYear()}
            </button>
          </div>

          {onSelectPrintTaxSheet && (
            <button
              onClick={onSelectPrintTaxSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Format Cetak Lembar Pajak</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {/* Total Omzet Penjualan (DPP) */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Omzet Peredaran Bruto</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            Rp {totalIncomeVolume.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dasar Pengenaan Pajak (DPP)
          </p>
        </div>

        {/* Estimasi PPN Terutang */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Estimasi PPN Kurang Bayar</span>
            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold font-mono text-indigo-700 mt-1">
            Rp {netVatPayable.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isPkp ? `Tarif PPN ${vatRate}% (Keluaran - Masukan)` : 'Non-PKP (Bebas PPN)'}
          </p>
        </div>

        {/* Estimasi PPh Terutang */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Estimasi PPh Usaha</span>
            <BadgeDollarSign className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <p className="text-lg font-bold font-mono text-sky-700 mt-1">
            Rp {incomeTaxPayable.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {taxRegime === 'pp55_final' ? 'PPh Final UMKM (0.5% Omzet)' : 'PPh Badan Ps 31E (11% Laba)'}
          </p>
        </div>

        {/* Total Setoran Pajak Bulan Ini */}
        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between text-xs text-indigo-900 font-medium">
            <span>Total Kewajiban Pajak</span>
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-lg font-bold font-mono text-indigo-900 mt-1">
            Rp {grandTotalTax.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">
            Rasio Pajak Efektif: {effectiveTaxRatio}% dari Omzet
          </p>
        </div>
      </div>

      {/* Interactive Controls & Parameters Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Left Column: PPN (VAT) Parameters */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">
                1. Parameter Pajak Pertambahan Nilai (PPN)
              </h3>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isPkp}
                onChange={(e) => setIsPkp(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Status PKP Aktif</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-500">
            {isPkp
              ? 'Usaha terdaftar sebagai Pengusaha Kena Pajak (PKP) dan wajib memungut PPN dari pelanggan serta berhak mengkreditkan Faktur Pajak Masukan.'
              : 'Status Non-PKP (Omzet < Rp 4,8 Miliar). Bebas dari kewajiban memungut PPN 11%. Centang jika usaha Anda telah dikukuhkan sebagai PKP.'}
          </p>

          {isPkp && (
            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              {/* VAT Rate Selection */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 font-medium">Tarif PPN Standar:</span>
                <div className="flex items-center gap-1.5">
                  {[11, 12].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setVatRate(rate)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        vatRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate}% {rate === 11 ? '(Berlaku)' : '(UU HPP)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taxable Sales Ratio */}
              <div>
                <div className="flex items-center justify-between text-slate-600 font-medium mb-1">
                  <span>Porsi Omzet Penjualan Kena PPN (BKP/JKP):</span>
                  <span className="font-mono font-bold text-indigo-600">{taxableTurnoverPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={taxableTurnoverPercent}
                  onChange={(e) => setTaxableTurnoverPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Input VAT Crediting Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={creditInputVat}
                    onChange={(e) => setCreditInputVat(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Kreditkan Pajak Masukan (Pembelian Bahan & Biaya)</span>
                </label>
                <span className="font-mono font-bold text-slate-700">
                  {creditInputVat ? `Rp ${inputVat.toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>

              {/* VAT Calculation Summary */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>PPN Keluaran ({vatRate}% × Rp {vatTaxableBase.toLocaleString('id-ID')}):</span>
                  <span className="font-bold text-slate-900">+Rp {outputVat.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN Masukan (Dapat Dikreditkan):</span>
                  <span className="font-bold text-emerald-700">-Rp {inputVat.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-xs text-indigo-700">
                  <span>Net PPN Kurang Bayar (Kas Negara):</span>
                  <span>Rp {netVatPayable.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PPh (Income Tax) Parameters */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900">
                2. Skema Pajak Penghasilan (PPh)
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setTaxRegime('pp55_final')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  taxRegime === 'pp55_final'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PP 55 (0.5%)
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime('corporate_31e')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  taxRegime === 'corporate_31e'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PPh Ps 31E
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            {taxRegime === 'pp55_final'
              ? 'Skema PPh Final UMKM PP No. 55/2022 dikenakan sebesar 0.5% dari peredaran bruto omzet setiap bulannya untuk kemudahan administrasi.'
              : 'Skema PPh Badan Normal dengan Fasilitas Pasal 31E UU PPh (Diskon 50% dari tarif normal 22% = 11% dari Laba Bersih Fiskal untuk omzet s.d. Rp 4.8 Miliar).'}
          </p>

          <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
            {taxRegime === 'pp55_final' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Bentuk Badan Usaha:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTaxpayerType('corporate')}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        taxpayerType === 'corporate'
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Badan (CV / PT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxpayerType('individual')}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        taxpayerType === 'individual'
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Orang Pribadi (OP)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Omzet Bruto Bulan Ini:</span>
                    <span className="font-bold text-slate-900">Rp {totalIncomeVolume.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tarif PPh Final UMKM:</span>
                    <span className="font-bold text-sky-700">0.5%</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-xs text-sky-800">
                    <span>Estimasi Setoran PPh Final:</span>
                    <span>Rp {pphFinalEstimated.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Laba Bersih Fiskal (Income - Expense):</span>
                  <span className="font-bold text-slate-900">Rp {netFiscalProfit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tarif Efektif Fasilitas Ps 31E:</span>
                  <span className="font-bold text-sky-700">11% (50% × 22%)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-xs text-sky-800">
                  <span>Estimasi PPh Badan Terutang:</span>
                  <span>Rp {pphCorporate31E.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {/* PPh 21 Employee Withholding */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={includePph21}
                  onChange={(e) => setIncludePph21(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                />
                <span>Potongan PPh 21 Payroll Karyawan (~2.5%):</span>
              </label>
              <span className="font-mono font-bold text-slate-700">
                Rp {estimatedPph21.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Tax Remittance & e-Billing Codes Guidance */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Petunjuk Pembuatan ID Billing Pajak (DJP Online)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Batas Setor PPh: <strong className="text-white">{pphDueDate}</strong></span>
            <span>·</span>
            <span>Batas Setor PPN: <strong className="text-white">{ppnDueDate}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
          {/* Billing Item 1: PPh Final / PPh Badan */}
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {taxRegime === 'pp55_final' ? 'PPh Final UMKM PP 55' : 'PPh Badan Ps 25'}
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-sm font-bold text-sky-400">
                  Rp {incomeTaxPayable.toLocaleString('id-ID')}
                </span>
                <span className="font-mono text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  {taxRegime === 'pp55_final' ? 'KAP: 411128 / KJS: 420' : 'KAP: 411126 / KJS: 100'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Uraian: PPh Final UMKM Peredaran Bruto Periode {monthNames[now.getMonth()]}
              </p>
            </div>
            <button
              onClick={() =>
                handleCopyCode(
                  taxRegime === 'pp55_final' ? '411128-420' : '411126-100',
                  'pph'
                )
              }
              className="mt-2 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1 bg-slate-700/60 hover:bg-slate-700 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCode === 'pph' ? 'Tersalin!' : 'Salin Kode KAP/KJS'}</span>
            </button>
          </div>

          {/* Billing Item 2: PPN Masa */}
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                PPN Dalam Negeri Masa (PKP)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-sm font-bold text-indigo-400">
                  Rp {netVatPayable.toLocaleString('id-ID')}
                </span>
                <span className="font-mono text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  KAP: 411211 / KJS: 100
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Uraian: PPN Kurang Bayar Masa Pajak {monthNames[now.getMonth()]}
              </p>
            </div>
            <button
              onClick={() => handleCopyCode('411211-100', 'ppn')}
              className="mt-2 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1 bg-slate-700/60 hover:bg-slate-700 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCode === 'ppn' ? 'Tersalin!' : 'Salin Kode KAP/KJS'}</span>
            </button>
          </div>

          {/* Billing Item 3: PPh 21 Payroll */}
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                PPh Pasal 21 Karyawan
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-sm font-bold text-emerald-400">
                  Rp {estimatedPph21.toLocaleString('id-ID')}
                </span>
                <span className="font-mono text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  KAP: 411121 / KJS: 100
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Uraian: Pemotongan Pajak Gaji Masa {monthNames[now.getMonth()]}
              </p>
            </div>
            <button
              onClick={() => handleCopyCode('411121-100', 'pph21')}
              className="mt-2 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 py-1 bg-slate-700/60 hover:bg-slate-700 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCode === 'pph21' ? 'Tersalin!' : 'Salin Kode KAP/KJS'}</span>
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              ID Billing dapat dibuat langsung di DJP Online (djponline.pajak.go.id) atau lewat Bank Persepsi / ATM / M-Banking.
            </span>
          </div>
          <span className="text-slate-500 font-mono">NPWP: {businessProfile.ownerName ? 'Terdaftar di DJP' : '-'}</span>
        </div>
      </div>
    </div>
  );
};
