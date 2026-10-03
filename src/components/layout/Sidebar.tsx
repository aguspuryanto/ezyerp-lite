import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Boxes,
  RotateCw,
  Users,
  CreditCard,
  FileSpreadsheet,
  Contact2,
  Globe2,
  RefreshCcw,
  Store
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenSyncModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenSyncModal
}) => {
  const { businessProfile } = useERP();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Usaha',
      icon: LayoutDashboard,
      section: 'Utama'
    },
    {
      id: 'cashflow',
      label: 'Buku Kas & Transaksi',
      icon: Wallet,
      section: 'Keuangan'
    },
    {
      id: 'pos',
      label: 'Kasir Cepat POS',
      icon: ShoppingCart,
      section: 'Penjualan'
    },
    {
      id: 'inventory',
      label: 'Stok Barang & HPP',
      icon: Boxes,
      section: 'Operasional'
    },
    {
      id: 'recurring',
      label: 'Transaksi Rutin',
      icon: RotateCw,
      section: 'Operasional'
    },
    {
      id: 'employees',
      label: 'Karyawan & Payroll',
      icon: Users,
      section: 'SDM / HR'
    },
    {
      id: 'payments',
      label: 'Pembayaran Online',
      icon: CreditCard,
      section: 'Keuangan'
    },
    {
      id: 'reports',
      label: 'Laporan Siap Bank & CSV',
      icon: FileSpreadsheet,
      section: 'Laporan'
    },
    {
      id: 'business-card',
      label: 'Kartu Nama Digital',
      icon: Contact2,
      section: 'Pemasaran'
    },
    {
      id: 'catalog',
      label: 'Katalog Website',
      icon: Globe2,
      section: 'Pemasaran'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-14 h-screen md:h-[calc(100vh-3.5rem)] z-40 md:z-20 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Brand header on mobile */}
          <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-slate-900 text-lg">EzyERP</span>
            </div>
            <button
              onClick={() => setIsOpenMobile(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Sync & rapihin.biz.id reference */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={onOpenSyncModal}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg shadow-2xs text-left transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <RefreshCcw className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  Sinkronisasi Real-Time
                </p>
                <p className="text-[10px] text-slate-400">Ref: rapihin.biz.id</p>
              </div>
            </div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>
      </aside>
    </>
  );
};
