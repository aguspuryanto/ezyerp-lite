import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { calculateSalesForecast, QuarterlyForecastingResult } from '../../utils/salesForecastingML';
import {
  TrendingUp,
  BrainCircuit,
  Sparkles,
  BarChart3,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Info,
  ChevronRight,
  PackageCheck,
  Wallet
} from 'lucide-react';

interface SalesForecastModuleProps {
  setCurrentTab: (tab: string) => void;
}

export const SalesForecastModule: React.FC<SalesForecastModuleProps> = ({ setCurrentTab }) => {
  const { transactions } = useERP();

  // Selected scenario: 'expected' (baseline), 'conservative' (95% CI lower), 'optimistic' (95% CI upper)
  const [scenario, setScenario] = useState<'expected' | 'conservative' | 'optimistic'>('expected');
  // Sensitivity growth modifier (-10% to +20%)
  const [sensitivityAdjustment, setSensitivityAdjustment] = useState<number>(0);

  // Compute machine learning model forecast
  const forecastResult: QuarterlyForecastingResult = useMemo(() => {
    return calculateSalesForecast(transactions);
  }, [transactions]);

  // Apply sensitivity modifier if user moves the slider
  const modifierMultiplier = 1 + sensitivityAdjustment / 100;

  const adjustedMonthlyForecasts = useMemo(() => {
    return forecastResult.forecastedMonths.map((m) => {
      let baseVal = m.expectedRevenue;
      if (scenario === 'conservative') baseVal = m.conservativeRevenue;
      if (scenario === 'optimistic') baseVal = m.optimisticRevenue;

      return {
        ...m,
        projectedValue: Math.round(baseVal * modifierMultiplier)
      };
    });
  }, [forecastResult, scenario, modifierMultiplier]);

  const totalAdjustedQuarter = adjustedMonthlyForecasts.reduce(
    (sum, m) => sum + m.projectedValue,
    0
  );

  // Combine historical and forecasted months for chart visualization
  const maxRevenue = Math.max(
    ...forecastResult.historicalMonths.map((h) => h.actualRevenue),
    ...adjustedMonthlyForecasts.map((f) => f.projectedValue),
    30000000
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Top Header Badge & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Prediksi Penjualan Kuartal Mendatang (Machine Learning)
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Model Fit R² {forecastResult.modelConfidenceScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis time-series deret waktu arus kas historis untuk proyeksi {forecastResult.nextQuarterName}
            </p>
          </div>
        </div>

        {/* Scenario Switcher Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setScenario('conservative')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              scenario === 'conservative'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Konservatif
          </button>
          <button
            onClick={() => setScenario('expected')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              scenario === 'expected'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ekspektasi (Baseline)
          </button>
          <button
            onClick={() => setScenario('optimistic')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              scenario === 'optimistic'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Optimis
          </button>
        </div>
      </div>

      {/* Primary Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {/* Total Projected Quarter */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            Total Proyeksi Kuartal Depan
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-indigo-600">
              Rp {totalAdjustedQuarter.toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
              Skenario {scenario} ({forecastResult.nextQuarterName})
            </p>
          </div>
        </div>

        {/* QoQ Growth Rate */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            Pertumbuhan Kuartalan (QoQ)
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600">
              +{forecastResult.qoqGrowthRate + sensitivityAdjustment}%
            </span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Pola pertumbuhan akseleratif
            </p>
          </div>
        </div>

        {/* Monthly Run Rate */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            Rata-rata Penjualan / Bulan
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              Rp {Math.round(totalAdjustedQuarter / 3).toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Target laju per 30 hari
            </p>
          </div>
        </div>

        {/* Peak Surge Month */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">
            Puncak Lonjakan (Peak Month)
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold font-mono text-amber-600">
              {adjustedMonthlyForecasts[1]?.monthName}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rp {adjustedMonthlyForecasts[1]?.projectedValue.toLocaleString('id-ID')} (Holiday Season)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart: Historical Actual vs ML Forecasted Months */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Grafik Tren Historis & Proyeksi Mesin Prediksi (9 Bulan)
            </h3>
            <p className="text-[11px] text-slate-500">
              Garis biru solid menunjukkan data riil kas; kolom ungu bercahaya menunjukkan prediksi algoritma ML
            </p>
          </div>

          {/* Interactive Sensitivity Slider */}
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-600">Simulasi What-If:</span>
            <input
              type="range"
              min="-15"
              max="25"
              step="5"
              value={sensitivityAdjustment}
              onChange={(e) => setSensitivityAdjustment(Number(e.target.value))}
              className="w-20 accent-indigo-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-indigo-600 w-8 text-right">
              {sensitivityAdjustment >= 0 ? `+${sensitivityAdjustment}%` : `${sensitivityAdjustment}%`}
            </span>
          </div>
        </div>

        {/* Responsive Bar / Chart Canvas */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <div className="h-44 sm:h-52 flex items-end gap-2 sm:gap-3 pt-6 pb-2">
            {/* 1. Historical Actual Months (Solid Indigo) */}
            {forecastResult.historicalMonths.map((item) => {
              const heightPercent = Math.max(12, Math.round((item.actualRevenue / maxRevenue) * 100));

              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Rp {(item.actualRevenue / 1000000).toFixed(1)}Jt
                  </div>
                  <div
                    className="w-full bg-slate-300 hover:bg-slate-400 rounded-t-lg transition-all relative group-hover:shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 h-1 bg-white/40 rounded-full mx-1" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 mt-2 whitespace-nowrap">
                    {item.monthName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Aktual</span>
                </div>
              );
            })}

            {/* Divider between past and future */}
            <div className="h-full flex flex-col justify-end items-center px-1">
              <div className="h-full border-r-2 border-dashed border-indigo-300" />
              <span className="text-[9px] font-bold text-indigo-500 uppercase mt-2">ML</span>
            </div>

            {/* 2. Projected Future Months (Glowing Violet with Seasonal indicator) */}
            {adjustedMonthlyForecasts.map((item) => {
              const heightPercent = Math.max(12, Math.round((item.projectedValue / maxRevenue) * 100));

              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono font-bold text-indigo-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Rp {(item.projectedValue / 1000000).toFixed(1)}Jt
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 rounded-t-lg transition-all relative shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 h-1 bg-white/40 rounded-full mx-1" />
                    {item.seasonalFactor > 1.1 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-900 mt-2 whitespace-nowrap">
                    {item.monthName.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-indigo-600 font-semibold font-mono">
                    {item.growthRateMom >= 0 ? `+${item.growthRateMom}%` : `${item.growthRateMom}%`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200 mt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-400" /> Data Realisasi Historis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-indigo-600 to-violet-500" /> Proyeksi ML ({scenario})
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline font-mono">
              Model: {forecastResult.modelType}
            </span>
          </div>
        </div>
      </div>

      {/* Surfaced Strategic Machine-Learning Insights */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Rekomendasi Strategis Berdasarkan Prediksi AI & ML
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Dihasilkan otomatis dari permodelan data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {forecastResult.insights.map((insight, idx) => {
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 shrink-0 shadow-2xs">
                  {insight.type === 'inventory' && <PackageCheck className="w-4 h-4 text-amber-600" />}
                  {insight.type === 'growth' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                  {insight.type === 'cashflow' && <Wallet className="w-4 h-4 text-indigo-600" />}
                  {insight.type === 'strategy' && <ShieldCheck className="w-4 h-4 text-sky-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {insight.title}
                    </h4>
                    {insight.metricValue && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 shrink-0">
                        {insight.metricValue}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button for Executive Action */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
          <div className="text-xs text-indigo-950 font-medium">
            Siapkan pasokan stok untuk menyambut lonjakan penjualan Desember sebesar{' '}
            <strong className="font-mono">
              Rp {adjustedMonthlyForecasts[1]?.projectedValue.toLocaleString('id-ID')}
            </strong>
          </div>
          <button
            onClick={() => setCurrentTab('inventory')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
          >
            <span>Tinjau Stok & Restock Gudang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
