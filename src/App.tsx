import React, { useState } from 'react';
import { ERPProvider } from './context/ERPContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CashflowView } from './components/cashflow/CashflowView';
import { PosView } from './components/pos/PosView';
import { InventoryView } from './components/inventory/InventoryView';
import { RecurringView } from './components/recurring/RecurringView';
import { EmployeeView } from './components/employees/EmployeeView';
import { OnlinePaymentView } from './components/payments/OnlinePaymentView';
import { ReportsView } from './components/reports/ReportsView';
import { DigitalCardView } from './components/business-card/DigitalCardView';
import { CatalogView } from './components/catalog/CatalogView';
import { SyncModal } from './components/sync/SyncModal';
import { Menu } from 'lucide-react';

function ERPMainApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Quick transaction modal trigger
  const [quickTxOpen, setQuickTxOpen] = useState(false);
  const [quickTxType, setQuickTxType] = useState<'income' | 'expense'>('income');

  const handleOpenQuickTx = (type: 'income' | 'expense') => {
    setQuickTxType(type);
    setCurrentTab('cashflow');
    setQuickTxOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuickTx={handleOpenQuickTx}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Mobile bar for toggling sidebar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1 rounded hover:bg-slate-100"
        >
          <Menu className="w-4 h-4 text-indigo-600" />
          <span>Menu EzyERP</span>
        </button>

        <span className="text-xs font-bold capitalize text-slate-800">
          {currentTab.replace('-', ' ')}
        </span>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              setCurrentTab={setCurrentTab}
              onOpenQuickTx={handleOpenQuickTx}
            />
          )}

          {currentTab === 'cashflow' && (
            <CashflowView
              quickTxOpen={quickTxOpen}
              quickTxType={quickTxType}
              onCloseQuickTx={() => setQuickTxOpen(false)}
            />
          )}

          {currentTab === 'pos' && <PosView />}

          {currentTab === 'inventory' && <InventoryView />}

          {currentTab === 'recurring' && <RecurringView />}

          {currentTab === 'employees' && <EmployeeView />}

          {currentTab === 'payments' && <OnlinePaymentView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'business-card' && <DigitalCardView />}

          {currentTab === 'catalog' && <CatalogView />}
        </main>
      </div>

      {/* Multi-Device Real-Time Sync Modal (rapihin.biz.id reference) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ERPMainApp />
    </ERPProvider>
  );
}
