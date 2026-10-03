import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  RefreshCw,
  PlusCircle,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ExternalLink,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenQuickTx: (type: 'income' | 'expense') => void;
  onOpenSyncModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickTx,
  onOpenSyncModal
}) => {
  const {
    businessProfile,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    syncStatus
  } = useERP();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              EzyERP
            </span>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              · {businessProfile.businessName}
            </span>
          </div>

          {/* Real-time sync status indicator */}
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Klik untuk kelola sinkronisasi multi-perangkat real-time"
          >
            {syncStatus.isOnline ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tersinkron {syncStatus.lastSynced}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline (Tersimpan Lokal)</span>
              </span>
            )}
          </button>
        </div>

        {/* Zone 2: Navigation contextual trail / Quick tags */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <span className="capitalize">{currentTab.replace('-', ' ')}</span>
          <span aria-hidden="true">·</span>
          <span>Room: {syncStatus.syncRoomCode}</span>
          <span aria-hidden="true">·</span>
          <span>Device: {syncStatus.deviceId}</span>
        </div>

        {/* Zone 3: Primary Actions and Smart Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Smart Notification Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifikasi Cerdas"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Notifikasi Cerdas</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs text-slate-500">({unreadNotificationsCount} baru)</span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      Semua operasional lancar. Tidak ada peringatan aktif.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 transition-colors cursor-pointer ${
                          notif.read ? 'bg-white opacity-70' : 'bg-slate-50/80 hover:bg-slate-100'
                        }`}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkTarget) {
                            setCurrentTab(notif.linkTarget);
                            setShowNotifDropdown(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          {getSeverityIcon(notif.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                              <span>{notif.date}</span>
                              {notif.linkTarget && (
                                <>
                                  <span>·</span>
                                  <span className="text-indigo-600 font-medium flex items-center gap-0.5">
                                    Buka modul <ChevronRight className="w-3 h-3" />
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                  <span className="text-[11px] text-slate-400">
                    Otomatis mendeteksi stok menipis, tagihan jatuh tempo & gaji
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* POS Quick Button */}
          <button
            onClick={() => setCurrentTab('pos')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Kasir Cepat POS</span>
          </button>

          {/* Quick Record Button */}
          <button
            onClick={() => onOpenQuickTx('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Catat Kas</span>
            <span className="sm:hidden">+ Kas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
