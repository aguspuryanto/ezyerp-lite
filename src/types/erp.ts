export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'bca' | 'mandiri' | 'bri' | 'bni' | 'qris' | 'gopay' | 'ovo' | 'dana' | 'card';
  reference?: string;
  contactName?: string; // customer or supplier
  relatedId?: string; // product sale, recurring bill, or payslip id
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string; // pcs, kg, box, lusin, paket
  stock: number;
  minStockAlert: number;
  hppCost: number; // Harga Pokok Pembelian
  sellingPrice: number; // Harga Jual
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: string;
  recipientOrPayer: string;
  status: 'active' | 'paused';
  notes?: string;
}

export interface Employee {
  id: string;
  employeeCode: string; // EMP-001
  name: string;
  position: string; // Kasir, Barista, Staff Gudang, Manajer Toko, Marketing
  department: string; // Operasional, Keuangan, Gudang, Pelayanan
  phone: string;
  email: string;
  employmentType: 'tetap' | 'kontrak' | 'part-time' | 'magang';
  joinDate: string;
  basicSalary: number; // Gaji Pokok bulanan
  allowances: {
    transport: number;
    meal: number;
    communication: number;
  };
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
  status: 'present' | 'late' | 'sick' | 'permit' | 'absent';
  notes?: string;
}

export interface WorkSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: number; // 0 (Minggu) - 6 (Sabtu)
  shiftName: string; // Shift Pagi (08:00 - 16:00), Shift Siang (13:00 - 21:00), Full (09:00 - 18:00)
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface Payslip {
  id: string;
  payslipNumber: string; // SLIP/2026/10/001
  employeeId: string;
  periodMonth: string; // e.g. "Oktober 2026"
  createdAt: string;
  basicSalary: number;
  allowanceTotal: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  deductions: {
    bpjs: number;
    latePenalty: number;
    loans: number;
    other: number;
  };
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'paid';
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  tagline: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  instagram: string;
  websiteUrl: string;
  bankAccounts: Array<{
    bank: string;
    accountNumber: string;
    accountHolder: string;
  }>;
  qrisPayload?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface SmartNotification {
  id: string;
  type: 'stock' | 'bill' | 'payroll' | 'payment';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'warning' | 'danger' | 'info' | 'success';
  linkTarget?: string;
}

export interface PaymentGatewayChannel {
  id: string;
  name: string;
  code: string;
  category: 'bank_transfer' | 'ewallet' | 'qris' | 'card';
  accountNumber?: string;
  accountHolder?: string;
  feePercentage: number;
  feeFixed: number;
  isEnabled: boolean;
  instructions: string[];
}
