import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  RefreshCw,
  Smartphone,
  Laptop,
  CheckCircle2,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Wifi,
  ShieldCheck,
  X,
  QrCode,
  Share2
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    setSyncRoomCode,
    exportDatabaseToJson,
    importDatabaseFromJson,
    resetToDemoData,
    businessProfile
  } = useERP();

  const [customRoomCode, setCustomRoomCode] = useState(syncStatus.syncRoomCode);
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedPairUrl, setCopiedPairUrl] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const pairUrl = `${window.location.origin}/?syncRoom=${encodeURIComponent(syncStatus.syncRoomCode)}`;

  const handleCopyPairUrl = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopiedPairUrl(true);
    setTimeout(() => setCopiedPairUrl(false), 2000);
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomCode.trim()) return;
    setSyncRoomCode(customRoomCode.trim().toUpperCase());
  };

  const handleExportFile = () => {
    const jsonStr = exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EzyERP_Backup_${businessProfile.businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = importDatabaseFromJson(importJsonText.trim());
    if (success) {
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus(null);
        setImportJsonText('');
        onClose();
      }, 1500);
    } else {
      setImportStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-auto overflow-hidden animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sinkronisasi Multi-Perangkat Real-Time
              </h2>
              <p className="text-[11px] text-slate-500">
                Arsitektur sinkronisasi instan terinspirasi dari <strong>rapihin.biz.id</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-emerald-900">Koneksi Sinkronisasi Aktif</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  ID Perangkat: <span className="font-mono font-bold">{syncStatus.deviceId}</span> · Terakhir sync: {syncStatus.lastSynced}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 bg-white text-emerald-700 font-semibold rounded-md border border-emerald-200 text-[10px]">
              BroadcastChannel ON
            </span>
          </div>

          {/* Sync Room Code Pair Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              1. Kode Pasangan Perangkat (Sync Room PIN)
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Gunakan Kode Ruang yang sama pada Smartphone, Tablet Kasir, dan Laptop Anda untuk bekerja secara simultan tanpa delay:
            </p>

            <form onSubmit={handleUpdateRoom} className="flex gap-2">
              <input
                type="text"
                value={customRoomCode}
                onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                placeholder="Contoh: HARMONI-889"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs transition-colors"
              >
                Ganti Kode
              </button>
            </form>

            {/* Quick Share Link */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <div className="truncate font-mono text-[11px] text-slate-600">
                {pairUrl}
              </div>
              <button
                onClick={handleCopyPairUrl}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3 h-3 text-slate-400" />
                <span>{copiedPairUrl ? 'Disalin!' : 'Salin Link Pairing'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON Database */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              2. Backup & Restore Data Lengkap (Offline / Cloud Transfer)
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Simpan cadangan data buku kas, stok, transaksi rutin, karyawan, dan slip gaji dalam satu file JSON aman:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportFile}
                className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unduh File Backup (.json)</span>
              </button>

              <button
                onClick={resetToDemoData}
                className="py-2.5 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset ke Data Demo</span>
              </button>
            </div>

            {/* Import Area */}
            <div className="space-y-2 pt-2">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Pulihkan Data (Paste JSON Backup di sini):
              </label>
              <textarea
                rows={3}
                placeholder="Paste isi file JSON backup Anda di sini untuk memulihkan..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] focus:outline-none focus:border-indigo-500"
              />

              {importStatus === 'success' && (
                <p className="text-emerald-600 font-semibold text-center">
                  ✓ Database EzyERP berhasil dipulihkan & disinkronkan ke seluruh perangkat!
                </p>
              )}
              {importStatus === 'error' && (
                <p className="text-rose-600 font-semibold text-center">
                  ✕ Format JSON tidak valid. Pastikan file backup berasal dari EzyERP.
                </p>
              )}

              {importJsonText.trim() && (
                <button
                  onClick={handleImportSubmit}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Terapkan & Pulihkan Database</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
