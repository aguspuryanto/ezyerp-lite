import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  InventoryItem,
  RecurringTransaction,
  Employee,
  AttendanceRecord,
  WorkSchedule,
  Payslip,
  BusinessProfile,
  SmartNotification,
  PaymentGatewayChannel
} from '../types/erp';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECURRING,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_SCHEDULES,
  INITIAL_PAYSLIPS,
  INITIAL_PAYMENT_CHANNELS
} from '../data/initialData';

interface ERPContextType {
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  products: InventoryItem[];
  addProduct: (product: Omit<InventoryItem, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<InventoryItem>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number, reason: string) => void;

  recurring: RecurringTransaction[];
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  executeRecurringBill: (id: string) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  attendance: AttendanceRecord[];
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  todayClockIn: (employeeId: string, status?: AttendanceRecord['status'], notes?: string) => void;
  todayClockOut: (employeeId: string) => void;

  schedules: WorkSchedule[];
  updateSchedule: (employeeId: string, dayOfWeek: number, shift: Partial<WorkSchedule>) => void;

  payslips: Payslip[];
  generateAutoPayslip: (employeeId: string, periodMonth: string, year: number) => Payslip;
  markPayslipPaid: (payslipId: string, paymentMethod: string) => void;
  deletePayslip: (id: string) => void;

  paymentChannels: PaymentGatewayChannel[];
  togglePaymentChannel: (id: string) => void;

  monthlySalesTarget: number;
  updateMonthlySalesTarget: (target: number) => void;

  notifications: SmartNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  syncStatus: {
    lastSynced: string;
    deviceId: string;
    isOnline: boolean;
    syncRoomCode: string;
    channelActive: boolean;
  };
  setSyncRoomCode: (code: string) => void;
  exportDatabaseToJson: () => string;
  importDatabaseFromJson: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'ezyerp_business_profile',
  TRANSACTIONS: 'ezyerp_transactions',
  PRODUCTS: 'ezyerp_products',
  RECURRING: 'ezyerp_recurring',
  EMPLOYEES: 'ezyerp_employees',
  ATTENDANCE: 'ezyerp_attendance',
  SCHEDULES: 'ezyerp_schedules',
  PAYSLIPS: 'ezyerp_payslips',
  PAYMENT_CHANNELS: 'ezyerp_payment_channels',
  SYNC_ROOM: 'ezyerp_sync_room_code',
  MONTHLY_TARGET: 'ezyerp_monthly_sales_target'
};

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Device ID for cross-device identification
  const [deviceId] = useState(() => {
    const existing = localStorage.getItem('ezyerp_device_id');
    if (existing) return existing;
    const newId = 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('ezyerp_device_id', newId);
    return newId;
  });

  const [syncRoomCode, setSyncRoomCodeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SYNC_ROOM) || 'HARMONI-889';
  });

  const [lastSynced, setLastSynced] = useState(() => new Date().toLocaleTimeString('id-ID'));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [channelActive, setChannelActive] = useState(false);

  // States with localStorage initializer
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PROFILE;
  });

  const [monthlySalesTarget, setMonthlySalesTarget] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_TARGET);
    return saved ? Number(saved) : 15000000; // Rp 15.000.000 target default
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [products, setProducts] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [schedules, setSchedules] = useState<WorkSchedule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYSLIPS);
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  const [paymentChannels, setPaymentChannels] = useState<PaymentGatewayChannel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_CHANNELS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_CHANNELS;
  });

  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('ezyerp_dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Broadcast Channel setup for multi-device / multi-tab instantaneous real-time sync (referencing rapihin.biz.id)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('ezyerp_realtime_sync_channel');
      setChannelActive(true);

      bc.onmessage = (event) => {
        if (!event.data || !event.data.payload) return;
        const { type, payload, senderDevice } = event.data;
        if (senderDevice === deviceId) return; // skip self echo

        if (type === 'SYNC_ALL_DATA') {
          if (payload.businessProfile) setBusinessProfile(payload.businessProfile);
          if (payload.transactions) setTransactions(payload.transactions);
          if (payload.products) setProducts(payload.products);
          if (payload.recurring) setRecurring(payload.recurring);
          if (payload.employees) setEmployees(payload.employees);
          if (payload.attendance) setAttendance(payload.attendance);
          if (payload.schedules) setSchedules(payload.schedules);
          if (payload.payslips) setPayslips(payload.payslips);
          if (payload.paymentChannels) setPaymentChannels(payload.paymentChannels);
          if (typeof payload.monthlySalesTarget === 'number') setMonthlySalesTarget(payload.monthlySalesTarget);
          setLastSynced(new Date().toLocaleTimeString('id-ID'));
        }
      };
    } catch {
      setChannelActive(false);
    }

    return () => {
      if (bc) bc.close();
    };
  }, [deviceId]);

  // Helper to persist and broadcast changes
  const broadcastSync = useCallback((fullPayload: Record<string, unknown>) => {
    try {
      const bc = new BroadcastChannel('ezyerp_realtime_sync_channel');
      bc.postMessage({
        type: 'SYNC_ALL_DATA',
        senderDevice: deviceId,
        syncRoom: syncRoomCode,
        payload: fullPayload,
        timestamp: Date.now()
      });
      bc.close();
    } catch {
      // BroadcastChannel fallback
    }
    setLastSynced(new Date().toLocaleTimeString('id-ID'));
  }, [deviceId, syncRoomCode]);

  // Persist items to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }, [recurring]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYSLIPS, JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CHANNELS, JSON.stringify(paymentChannels));
  }, [paymentChannels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_TARGET, monthlySalesTarget.toString());
  }, [monthlySalesTarget]);

  const updateMonthlySalesTarget = (target: number) => {
    const validTarget = Math.max(1000000, target);
    setMonthlySalesTarget(validTarget);
    broadcastSync({ monthlySalesTarget: validTarget });
  };

  // Profile actions
  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => {
      const updated = { ...prev, ...profile };
      broadcastSync({ businessProfile: updated });
      return updated;
    });
  };

  // Transaction actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now()
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      broadcastSync({ transactions: updated });
      return updated;
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      broadcastSync({ transactions: updated });
      return updated;
    });
  };

  // Inventory actions
  const addProduct = (prod: Omit<InventoryItem, 'id'>) => {
    const newProd: InventoryItem = {
      ...prod,
      id: 'prod-' + Date.now()
    };
    setProducts(prev => {
      const updated = [...prev, newProd];
      broadcastSync({ products: updated });
      return updated;
    });
  };

  const updateProduct = (id: string, updates: Partial<InventoryItem>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      broadcastSync({ products: updated });
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      broadcastSync({ products: updated });
      return updated;
    });
  };

  const adjustStock = (id: string, delta: number, reason: string) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      if (!target) return prev;
      const newStock = Math.max(0, target.stock + delta);
      const updated = prev.map(p => p.id === id ? { ...p, stock: newStock } : p);
      broadcastSync({ products: updated });
      return updated;
    });

    // If stock was added via purchase, optionally log transaction or note
    if (delta > 0 && reason.toLowerCase().includes('beli')) {
      const target = products.find(p => p.id === id);
      if (target) {
        addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category: 'Bahan Baku & Stok',
          amount: delta * target.hppCost,
          description: `Restock ${delta} ${target.unit} ${target.name} (${reason})`,
          paymentMethod: 'bca',
          reference: `STK-IN-${Date.now().toString().slice(-4)}`
        });
      }
    }
  };

  // Recurring actions
  const addRecurring = (rec: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...rec,
      id: 'rec-' + Date.now()
    };
    setRecurring(prev => {
      const updated = [...prev, newRec];
      broadcastSync({ recurring: updated });
      return updated;
    });
  };

  const updateRecurring = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurring(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      broadcastSync({ recurring: updated });
      return updated;
    });
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => {
      const updated = prev.filter(r => r.id !== id);
      broadcastSync({ recurring: updated });
      return updated;
    });
  };

  const executeRecurringBill = (id: string) => {
    const bill = recurring.find(r => r.id === id);
    if (!bill) return;

    // Log transaction
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: bill.type,
      category: bill.category,
      amount: bill.amount,
      description: `Pembayaran Rutin: ${bill.title}`,
      paymentMethod: (bill.paymentMethod as Transaction['paymentMethod']) || 'bca',
      reference: `REC-${Date.now().toString().slice(-4)}`,
      contactName: bill.recipientOrPayer,
      relatedId: bill.id
    });

    // Update nextDueDate forward based on interval
    const current = new Date(bill.nextDueDate);
    if (bill.interval === 'daily') current.setDate(current.getDate() + 1);
    else if (bill.interval === 'weekly') current.setDate(current.getDate() + 7);
    else if (bill.interval === 'monthly') current.setMonth(current.getMonth() + 1);
    else if (bill.interval === 'yearly') current.setFullYear(current.getFullYear() + 1);

    const nextDateStr = current.toISOString().split('T')[0];
    updateRecurring(id, { nextDueDate: nextDateStr });
  };

  // Employee actions
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Date.now()
    };
    setEmployees(prev => {
      const updated = [...prev, newEmp];
      broadcastSync({ employees: updated });
      return updated;
    });

    // Create default schedule for 5 working days + 2 off
    const newSchedules: WorkSchedule[] = [1, 2, 3, 4, 5].map(day => ({
      id: 'sch-' + Date.now() + '-' + day,
      employeeId: newEmp.id,
      dayOfWeek: day,
      shiftName: 'Shift Reguler',
      startTime: '08:00',
      endTime: '17:00',
      isOff: false
    })).concat([
      { id: 'sch-' + Date.now() + '-6', employeeId: newEmp.id, dayOfWeek: 6, shiftName: 'Shift Pendek', startTime: '08:00', endTime: '14:00', isOff: false },
      { id: 'sch-' + Date.now() + '-0', employeeId: newEmp.id, dayOfWeek: 0, shiftName: 'Libur', startTime: '-', endTime: '-', isOff: true }
    ]);

    setSchedules(prev => [...prev, ...newSchedules]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      broadcastSync({ employees: updated });
      return updated;
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      broadcastSync({ employees: updated });
      return updated;
    });
  };

  // Attendance actions
  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRec: AttendanceRecord = {
      ...record,
      id: 'att-' + Date.now()
    };
    setAttendance(prev => {
      const updated = [newRec, ...prev];
      broadcastSync({ attendance: updated });
      return updated;
    });
  };

  const todayClockIn = (employeeId: string, status: AttendanceRecord['status'] = 'present', notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Check if already clocked in today
    const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);
    if (existing) return;

    addAttendance({
      employeeId,
      date: today,
      clockIn: nowTime,
      status,
      notes: notes || 'Presensi langsung via sistem'
    });
  };

  const todayClockOut = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    setAttendance(prev => {
      const updated = prev.map(a => {
        if (a.employeeId === employeeId && a.date === today) {
          return { ...a, clockOut: nowTime };
        }
        return a;
      });
      broadcastSync({ attendance: updated });
      return updated;
    });
  };

  // Schedule actions
  const updateSchedule = (employeeId: string, dayOfWeek: number, shift: Partial<WorkSchedule>) => {
    setSchedules(prev => {
      const exists = prev.find(s => s.employeeId === employeeId && s.dayOfWeek === dayOfWeek);
      let updated: WorkSchedule[];
      if (exists) {
        updated = prev.map(s => (s.employeeId === employeeId && s.dayOfWeek === dayOfWeek) ? { ...s, ...shift } : s);
      } else {
        const newSched: WorkSchedule = {
          id: 'sch-' + Date.now(),
          employeeId,
          dayOfWeek,
          shiftName: shift.shiftName || 'Shift Pagi',
          startTime: shift.startTime || '08:00',
          endTime: shift.endTime || '17:00',
          isOff: shift.isOff || false
        };
        updated = [...prev, newSched];
      }
      broadcastSync({ schedules: updated });
      return updated;
    });
  };

  // Payroll calculation & Payslip generation
  const generateAutoPayslip = (employeeId: string, periodMonth: string, year: number): Payslip => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) throw new Error('Karyawan tidak ditemukan');

    const totalAllowance = (emp.allowances.transport || 0) + (emp.allowances.meal || 0) + (emp.allowances.communication || 0);

    // Calculate overtime & late penalties from attendance records this month
    const empAttendance = attendance.filter(a => a.employeeId === employeeId);
    let lateCount = 0;
    let overtimeHours = 0;

    empAttendance.forEach(a => {
      if (a.status === 'late') lateCount += 1;
      if (a.clockOut && a.clockOut > '17:30') {
        const [hours] = a.clockOut.split(':').map(Number);
        if (hours >= 18) overtimeHours += (hours - 17);
      }
    });

    const overtimeRatePerHour = Math.round(emp.basicSalary / 173); // Depnaker standard rate approx
    const overtimePay = overtimeHours * overtimeRatePerHour;
    const latePenalty = lateCount * 25000;
    const bpjsEstimate = Math.round(emp.basicSalary * 0.02); // 2% BPJS Ketenagakerjaan employee share
    const bonus = 150000; // performance / attendance bonus

    const totalDeductions = latePenalty + bpjsEstimate;
    const netSalary = emp.basicSalary + totalAllowance + overtimePay + bonus - totalDeductions;

    const newSlip: Payslip = {
      id: 'pay-' + Date.now(),
      payslipNumber: `SLIP/${year}/${periodMonth.slice(0, 3).toUpperCase()}/${emp.employeeCode}`,
      employeeId,
      periodMonth: `${periodMonth} ${year}`,
      createdAt: new Date().toISOString().split('T')[0],
      basicSalary: emp.basicSalary,
      allowanceTotal: totalAllowance,
      overtimeHours,
      overtimePay,
      bonus,
      deductions: {
        bpjs: bpjsEstimate,
        latePenalty,
        loans: 0,
        other: 0
      },
      totalDeductions,
      netSalary,
      status: 'draft'
    };

    setPayslips(prev => {
      const updated = [newSlip, ...prev];
      broadcastSync({ payslips: updated });
      return updated;
    });

    return newSlip;
  };

  const markPayslipPaid = (payslipId: string, paymentMethod: string) => {
    const target = payslips.find(p => p.id === payslipId);
    if (!target) return;

    const emp = employees.find(e => e.id === target.employeeId);
    const empName = emp ? emp.name : 'Karyawan';

    const now = new Date().toISOString().split('T')[0];

    // 1. Update payslip status to paid
    setPayslips(prev => {
      const updated = prev.map(p => p.id === payslipId ? { ...p, status: 'paid' as const, paidAt: now, paymentMethod } : p);
      broadcastSync({ payslips: updated });
      return updated;
    });

    // 2. Automatically record in EzyERP Cashflow as expense!
    addTransaction({
      date: now,
      type: 'expense',
      category: 'Gaji Karyawan',
      amount: target.netSalary,
      description: `Gaji ${target.periodMonth} - ${empName} (${target.payslipNumber})`,
      paymentMethod: (paymentMethod.toLowerCase().includes('mandiri') ? 'mandiri' : paymentMethod.toLowerCase().includes('bri') ? 'bri' : 'bca'),
      reference: target.payslipNumber,
      contactName: empName,
      relatedId: target.id
    });
  };

  const deletePayslip = (id: string) => {
    setPayslips(prev => {
      const updated = prev.filter(p => p.id !== id);
      broadcastSync({ payslips: updated });
      return updated;
    });
  };

  // Payment channel toggling
  const togglePaymentChannel = (id: string) => {
    setPaymentChannels(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isEnabled: !c.isEnabled } : c);
      broadcastSync({ paymentChannels: updated });
      return updated;
    });
  };

  // Smart Notifications Generator
  const notifications: SmartNotification[] = useMemo(() => {
    const list: SmartNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();

    // 1. Low stock alerts
    products.forEach(p => {
      if (p.stock <= p.minStockAlert) {
        list.push({
          id: `notif-stock-${p.id}`,
          type: 'stock',
          title: `Stok Menipis: ${p.name}`,
          message: `Sisa stok ${p.stock} ${p.unit} (Batas minimum: ${p.minStockAlert} ${p.unit}). Segera lakukan order ke supplier!`,
          date: todayStr,
          read: dismissedNotifications.includes(`notif-stock-${p.id}`),
          severity: p.stock <= 2 ? 'danger' : 'warning',
          linkTarget: 'inventory'
        });
      }
    });

    // 2. Recurring bills due soon (within 3 days) or overdue
    recurring.forEach(r => {
      if (r.status !== 'active') return;
      const dueDate = new Date(r.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        list.push({
          id: `notif-rec-due-${r.id}`,
          type: 'bill',
          title: `Tagihan Jatuh Tempo Hari Ini: ${r.title}`,
          message: `Nominal Rp ${r.amount.toLocaleString('id-ID')} kepada ${r.recipientOrPayer}. Klik untuk catat pembayaran.`,
          date: r.nextDueDate,
          read: dismissedNotifications.includes(`notif-rec-due-${r.id}`),
          severity: 'danger',
          linkTarget: 'recurring'
        });
      } else if (diffDays <= 4) {
        list.push({
          id: `notif-rec-soon-${r.id}`,
          type: 'bill',
          title: `Tagihan Rutin Menjelang Tempo: ${r.title}`,
          message: `Jatuh tempo dalam ${diffDays} hari (${r.nextDueDate}). Nominal: Rp ${r.amount.toLocaleString('id-ID')}.`,
          date: r.nextDueDate,
          read: dismissedNotifications.includes(`notif-rec-soon-${r.id}`),
          severity: 'warning',
          linkTarget: 'recurring'
        });
      }
    });

    // 3. Payroll reminder
    const currentMonthPayslips = payslips.filter(p => p.status === 'draft');
    if (currentMonthPayslips.length > 0) {
      list.push({
        id: 'notif-payroll-draft',
        type: 'payroll',
        title: 'Draft Slip Gaji Belum Dibayar',
        message: `Terdapat ${currentMonthPayslips.length} slip gaji karyawan berstatus draft menunggu pembayaran dan konfirmasi.`,
        date: todayStr,
        read: dismissedNotifications.includes('notif-payroll-draft'),
        severity: 'info',
        linkTarget: 'employees'
      });
    }

    return list;
  }, [products, recurring, payslips, dismissedNotifications]);

  const markNotificationRead = (id: string) => {
    setDismissedNotifications(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('ezyerp_dismissed_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    const allIds = notifications.map(n => n.id);
    setDismissedNotifications(allIds);
    localStorage.setItem('ezyerp_dismissed_notifications', JSON.stringify(allIds));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Sync Room Code
  const setSyncRoomCode = (code: string) => {
    setSyncRoomCodeState(code);
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, code);
  };

  // Export & Import Database for backup & multi-device transfer
  const exportDatabaseToJson = (): string => {
    const db = {
      app: 'EzyERP',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      businessProfile,
      transactions,
      products,
      recurring,
      employees,
      attendance,
      schedules,
      payslips,
      paymentChannels,
      monthlySalesTarget
    };
    return JSON.stringify(db, null, 2);
  };

  const importDatabaseFromJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !data.businessProfile) return false;

      if (data.businessProfile) setBusinessProfile(data.businessProfile);
      if (data.transactions) setTransactions(data.transactions);
      if (data.products) setProducts(data.products);
      if (data.recurring) setRecurring(data.recurring);
      if (data.employees) setEmployees(data.employees);
      if (data.attendance) setAttendance(data.attendance);
      if (data.schedules) setSchedules(data.schedules);
      if (data.payslips) setPayslips(data.payslips);
      if (data.paymentChannels) setPaymentChannels(data.paymentChannels);
      if (typeof data.monthlySalesTarget === 'number') setMonthlySalesTarget(data.monthlySalesTarget);

      broadcastSync(data);
      setLastSynced(new Date().toLocaleTimeString('id-ID'));
      return true;
    } catch {
      return false;
    }
  };

  const resetToDemoData = () => {
    setBusinessProfile(INITIAL_BUSINESS_PROFILE);
    setTransactions(INITIAL_TRANSACTIONS);
    setProducts(INITIAL_PRODUCTS);
    setRecurring(INITIAL_RECURRING);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setSchedules(INITIAL_SCHEDULES);
    setPayslips(INITIAL_PAYSLIPS);
    setPaymentChannels(INITIAL_PAYMENT_CHANNELS);
    setMonthlySalesTarget(15000000);
    setDismissedNotifications([]);
    localStorage.removeItem('ezyerp_dismissed_notifications');
    setLastSynced(new Date().toLocaleTimeString('id-ID'));
  };

  return (
    <ERPContext.Provider
      value={{
        businessProfile,
        updateBusinessProfile,
        transactions,
        addTransaction,
        deleteTransaction,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        recurring,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        executeRecurringBill,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendance,
        addAttendance,
        todayClockIn,
        todayClockOut,
        schedules,
        updateSchedule,
        payslips,
        generateAutoPayslip,
        markPayslipPaid,
        deletePayslip,
        paymentChannels,
        togglePaymentChannel,
        monthlySalesTarget,
        updateMonthlySalesTarget,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        syncStatus: {
          lastSynced,
          deviceId,
          isOnline,
          syncRoomCode,
          channelActive
        },
        setSyncRoomCode,
        exportDatabaseToJson,
        importDatabaseFromJson,
        resetToDemoData
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within an ERPProvider');
  return context;
};
