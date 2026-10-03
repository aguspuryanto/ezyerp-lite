import {
  Transaction,
  InventoryItem,
  RecurringTransaction,
  Employee,
  AttendanceRecord,
  WorkSchedule,
  Payslip,
  BusinessProfile,
  PaymentGatewayChannel
} from '../types/erp';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'Kopi & Ritel Harmoni',
  ownerName: 'Agus Puryanto',
  tagline: 'Artisan Roastery & Lifestyle Goods Store',
  businessType: 'Food & Beverage / Retail',
  phone: '081289123456',
  email: 'halo@harmonistore.id',
  address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190',
  city: 'Jakarta Selatan',
  instagram: '@harmoni.store',
  websiteUrl: 'https://harmoni.rapihin.biz.id',
  bankAccounts: [
    { bank: 'BCA', accountNumber: '8830192841', accountHolder: 'AGUS PURYANTO' },
    { bank: 'Bank Mandiri', accountNumber: '1370018829102', accountHolder: 'HARMONI RETAIL INDO' },
    { bank: 'Bank BRI', accountNumber: '041201009182501', accountHolder: 'AGUS PURYANTO' }
  ],
  qrisPayload: '00020101021126580016ID.CO.QRIS.WWW011893600918002137452302150812891234565204581253033605802ID5919KOPI HARMONI JAKARTA6015JAKARTA SELATAN61051219062070703A0163046F9B',
  avatarUrl: '/src/assets/images/card_founder_avatar_1791062120473.jpg',
  bannerUrl: '/src/assets/images/catalog_hero_banner_1791062109034.jpg'
};

export const INITIAL_PRODUCTS: InventoryItem[] = [
  {
    id: 'prod-1',
    name: 'Biji Kopi Arabika Gayo Honey 250g',
    sku: 'KOP-GY-250',
    category: 'Kopi & Minuman',
    unit: 'pack',
    stock: 45,
    minStockAlert: 15,
    hppCost: 55000,
    sellingPrice: 95000,
    description: 'Biji kopi single origin Takengon Aceh Gayo proses honey, notes peach and jasmine.',
    isActive: true
  },
  {
    id: 'prod-2',
    name: 'Biji Kopi Flores Bajawa Natural 250g',
    sku: 'KOP-FLR-250',
    category: 'Kopi & Minuman',
    unit: 'pack',
    stock: 8, // Triggers low stock alert!
    minStockAlert: 12,
    hppCost: 52000,
    sellingPrice: 88000,
    description: 'Aroma chocolate nutty dan body tebal khas dataran tinggi Flores NTT.',
    isActive: true
  },
  {
    id: 'prod-3',
    name: 'Artisan Ceramic Mug 300ml Terracotta',
    sku: 'MUG-TRC-01',
    category: 'Merchandise',
    unit: 'pcs',
    stock: 22,
    minStockAlert: 10,
    hppCost: 45000,
    sellingPrice: 85000,
    description: 'Cangkir keramik handmade tanah liat lokal tahan microwave dan dishwasher.',
    isActive: true
  },
  {
    id: 'prod-4',
    name: 'Manual Brew Dripper V60 Matte Black',
    sku: 'DRP-V60-BLK',
    category: 'Alat Kopi',
    unit: 'unit',
    stock: 5, // Triggers low stock alert!
    minStockAlert: 8,
    hppCost: 85000,
    sellingPrice: 145000,
    description: 'Dripper resin tahan panas 02 size dengan aliran air stabil.',
    isActive: true
  },
  {
    id: 'prod-5',
    name: 'Sirup Karamel Artisan 750ml',
    sku: 'BVR-KRM-750',
    category: 'Bahan Baku',
    unit: 'botol',
    stock: 18,
    minStockAlert: 6,
    hppCost: 68000,
    sellingPrice: 110000,
    description: 'Sirup gula tebu karamelisasi alami tanpa pengawet buatan.',
    isActive: true
  },
  {
    id: 'prod-6',
    name: 'Totebag Kanvas Organik Harmoni',
    sku: 'BAG-KNV-01',
    category: 'Merchandise',
    unit: 'pcs',
    stock: 35,
    minStockAlert: 10,
    hppCost: 35000,
    sellingPrice: 75000,
    description: 'Tas jinjing kanvas tebal 14oz berlogo bordir ramah lingkungan.',
    isActive: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-10-03',
    type: 'income',
    category: 'Penjualan Kasir POS',
    amount: 380000,
    description: 'Penjualan 4 pack Arabika Gayo & 1 Mug Keramik',
    paymentMethod: 'qris',
    reference: 'QRIS-261003-8812',
    contactName: 'Pelanggan Meja 4'
  },
  {
    id: 'tx-002',
    date: '2026-10-03',
    type: 'income',
    category: 'Penjualan Online',
    amount: 276000,
    description: 'Order katalog web #ORD-9812 via WhatsApp',
    paymentMethod: 'bca',
    reference: 'TRF-BCA-98124',
    contactName: 'Ibu Ratna Dewi'
  },
  {
    id: 'tx-003',
    date: '2026-10-02',
    type: 'expense',
    category: 'Bahan Baku & Stok',
    amount: 1450000,
    description: 'Restock Green Beans Gayo 20kg dari Koperasi Tani',
    paymentMethod: 'bca',
    reference: 'INV-KOP-981',
    contactName: 'Koperasi Kopi Gayo'
  },
  {
    id: 'tx-004',
    date: '2026-10-01',
    type: 'expense',
    category: 'Operasional & Listrik',
    amount: 850000,
    description: 'Tagihan Listrik PLN Pasca Bayar Toko Oktober',
    paymentMethod: 'mandiri',
    reference: 'PLN-5321098234'
  },
  {
    id: 'tx-005',
    date: '2026-09-30',
    type: 'expense',
    category: 'Gaji Karyawan',
    amount: 10200000,
    description: 'Pembayaran Gaji Karyawan Bulan September 2026',
    paymentMethod: 'bca',
    reference: 'PAYROLL-2026-09'
  },
  {
    id: 'tx-006',
    date: '2026-09-29',
    type: 'income',
    category: 'Penjualan Kasir POS',
    amount: 2450000,
    description: 'Total Omzet Kasir Weekend Toko',
    paymentMethod: 'qris',
    reference: 'POS-260929-SUM'
  },
  {
    id: 'tx-007',
    date: '2026-09-28',
    type: 'expense',
    category: 'Pemasaran & Iklan',
    amount: 450000,
    description: 'Iklan Instagram Ads Peluncuran Produk Baru',
    paymentMethod: 'card',
    reference: 'FB-ADS-88129'
  },
  {
    id: 'tx-008',
    date: '2026-09-27',
    type: 'income',
    category: 'Penjualan B2B',
    amount: 3200000,
    description: 'Pasokan Biji Kopi Resto Kenari (20 Pack)',
    paymentMethod: 'mandiri',
    reference: 'INV-2026-09-88',
    contactName: 'Resto Kenari Senopati'
  }
];

export const INITIAL_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-1',
    title: 'Sewa Toko & Workspace Bulanan',
    type: 'expense',
    category: 'Sewa Tempat',
    amount: 4500000,
    interval: 'monthly',
    nextDueDate: '2026-10-05', // Due in 2 days -> Smart Alert!
    paymentMethod: 'bca',
    recipientOrPayer: 'Bpk. H. Suryono (Pemilik Gedung)',
    status: 'active',
    notes: 'Jatuh tempo setiap tanggal 5 awal bulan'
  },
  {
    id: 'rec-2',
    title: 'Langganan Internet Biznet Dedicated 100Mbps',
    type: 'expense',
    category: 'Utilitas & Komunikasi',
    amount: 675000,
    interval: 'monthly',
    nextDueDate: '2026-10-10',
    paymentMethod: 'mandiri',
    recipientOrPayer: 'PT Biznet Gio Nusantara',
    status: 'active',
    notes: 'Nomor Pelanggan: BZ-89102391'
  },
  {
    id: 'rec-3',
    title: 'Iuran Pengelolaan Keamanan & Kebersihan',
    type: 'expense',
    category: 'Operasional',
    amount: 250000,
    interval: 'monthly',
    nextDueDate: '2026-10-15',
    paymentMethod: 'cash',
    recipientOrPayer: 'Paguyuban Warga Senopati',
    status: 'active'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeCode: 'EMP-001',
    name: 'Budi Santoso',
    position: 'Head Barista & Supervisor',
    department: 'Operasional Toko',
    phone: '081377889901',
    email: 'budi.santoso@harmonistore.id',
    employmentType: 'tetap',
    joinDate: '2025-03-01',
    basicSalary: 4200000,
    allowances: {
      transport: 400000,
      meal: 600000,
      communication: 150000
    },
    bankName: 'BCA',
    bankAccount: '6041289102',
    bankHolder: 'BUDI SANTOSO'
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP-002',
    name: 'Siti Rahmawati',
    position: 'Kasir & Front Office',
    department: 'Pelayanan Pelanggan',
    phone: '085711223344',
    email: 'siti.rahma@harmonistore.id',
    employmentType: 'tetap',
    joinDate: '2025-07-15',
    basicSalary: 3500000,
    allowances: {
      transport: 350000,
      meal: 550000,
      communication: 100000
    },
    bankName: 'Bank Mandiri',
    bankAccount: '1270098124901',
    bankHolder: 'SITI RAHMAWATI'
  },
  {
    id: 'emp-3',
    employeeCode: 'EMP-003',
    name: 'Diki Kurniawan',
    position: 'Staff Gudang & Logistik',
    department: 'Gudang & Inventori',
    phone: '089655443322',
    email: 'diki.kurnia@harmonistore.id',
    employmentType: 'kontrak',
    joinDate: '2026-01-10',
    basicSalary: 3200000,
    allowances: {
      transport: 300000,
      meal: 500000,
      communication: 100000
    },
    bankName: 'Bank BRI',
    bankAccount: '091201088712502',
    bankHolder: 'DIKI KURNIAWAN'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    employeeId: 'emp-1',
    date: '2026-10-03',
    clockIn: '07:55',
    clockOut: '17:05',
    status: 'present',
    notes: 'Tepat waktu, shift pagi'
  },
  {
    id: 'att-102',
    employeeId: 'emp-2',
    date: '2026-10-03',
    clockIn: '08:15',
    clockOut: '17:00',
    status: 'late',
    notes: 'Terlambat 15 menit hujan lebat'
  },
  {
    id: 'att-103',
    employeeId: 'emp-3',
    date: '2026-10-03',
    clockIn: '08:00',
    clockOut: '17:10',
    status: 'present',
    notes: 'Pemeriksaan barang masuk gayo'
  },
  {
    id: 'att-104',
    employeeId: 'emp-1',
    date: '2026-10-02',
    clockIn: '07:50',
    clockOut: '17:00',
    status: 'present'
  },
  {
    id: 'att-105',
    employeeId: 'emp-2',
    date: '2026-10-02',
    clockIn: '07:58',
    clockOut: '17:02',
    status: 'present'
  },
  {
    id: 'att-106',
    employeeId: 'emp-3',
    date: '2026-10-02',
    clockIn: '08:00',
    clockOut: '17:05',
    status: 'present'
  }
];

export const INITIAL_SCHEDULES: WorkSchedule[] = [
  // Budi (EMP-001)
  { id: 'sch-1', employeeId: 'emp-1', dayOfWeek: 1, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-2', employeeId: 'emp-1', dayOfWeek: 2, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-3', employeeId: 'emp-1', dayOfWeek: 3, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-4', employeeId: 'emp-1', dayOfWeek: 4, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-5', employeeId: 'emp-1', dayOfWeek: 5, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-6', employeeId: 'emp-1', dayOfWeek: 6, shiftName: 'Shift Pendek', startTime: '08:00', endTime: '14:00', isOff: false },
  { id: 'sch-7', employeeId: 'emp-1', dayOfWeek: 0, shiftName: 'Libur', startTime: '-', endTime: '-', isOff: true },

  // Siti (EMP-002)
  { id: 'sch-8', employeeId: 'emp-2', dayOfWeek: 1, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-9', employeeId: 'emp-2', dayOfWeek: 2, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-10', employeeId: 'emp-2', dayOfWeek: 3, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-11', employeeId: 'emp-2', dayOfWeek: 4, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-12', employeeId: 'emp-2', dayOfWeek: 5, shiftName: 'Shift Pagi', startTime: '08:00', endTime: '17:00', isOff: false },
  { id: 'sch-13', employeeId: 'emp-2', dayOfWeek: 6, shiftName: 'Libur', startTime: '-', endTime: '-', isOff: true },
  { id: 'sch-14', employeeId: 'emp-2', dayOfWeek: 0, shiftName: 'Shift Siang', startTime: '11:00', endTime: '19:00', isOff: false }
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'pay-2609-01',
    payslipNumber: 'SLIP/2026/09/001',
    employeeId: 'emp-1',
    periodMonth: 'September 2026',
    createdAt: '2026-09-30',
    basicSalary: 4200000,
    allowanceTotal: 1150000, // transport + meal + comm
    overtimeHours: 6,
    overtimePay: 180000,
    bonus: 250000, // performa omzet
    deductions: {
      bpjs: 85000,
      latePenalty: 0,
      loans: 0,
      other: 0
    },
    totalDeductions: 85000,
    netSalary: 5695000,
    status: 'paid',
    paidAt: '2026-09-30',
    paymentMethod: 'Transfer BCA'
  },
  {
    id: 'pay-2609-02',
    payslipNumber: 'SLIP/2026/09/002',
    employeeId: 'emp-2',
    periodMonth: 'September 2026',
    createdAt: '2026-09-30',
    basicSalary: 3500000,
    allowanceTotal: 1000000,
    overtimeHours: 2,
    overtimePay: 50000,
    bonus: 100000,
    deductions: {
      bpjs: 70000,
      latePenalty: 25000,
      loans: 0,
      other: 0
    },
    totalDeductions: 95000,
    netSalary: 4555000,
    status: 'paid',
    paidAt: '2026-09-30',
    paymentMethod: 'Transfer Mandiri'
  }
];

export const INITIAL_PAYMENT_CHANNELS: PaymentGatewayChannel[] = [
  {
    id: 'pay-qris',
    name: 'QRIS Real-Time (Semua Bank & E-Wallet)',
    code: 'qris',
    category: 'qris',
    accountNumber: 'NMID: ID10200889102',
    accountHolder: 'HARMONI STORE OFFICIAL',
    feePercentage: 0.7,
    feeFixed: 0,
    isEnabled: true,
    instructions: [
      'Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay)',
      'Pindai kode QRIS dinamis yang muncul di layar',
      'Periksa nominal pembayaran dan nama merchant',
      'Konfirmasi PIN, pembayaran otomatis terverifikasi seketika'
    ]
  },
  {
    id: 'pay-bca',
    name: 'BCA Virtual Account & Transfer',
    code: 'bca',
    category: 'bank_transfer',
    accountNumber: '8830192841',
    accountHolder: 'AGUS PURYANTO / HARMONI',
    feePercentage: 0,
    feeFixed: 4000,
    isEnabled: true,
    instructions: [
      'Login ke BCA Mobile atau myBCA',
      'Pilih m-Transfer > Antar Rekening BCA',
      'Masukkan nomor rekening 8830192841',
      'Masukkan nominal sesuai tagihan persis hingga 3 digit terakhir'
    ]
  },
  {
    id: 'pay-mandiri',
    name: 'Bank Mandiri Livin Transfer',
    code: 'mandiri',
    category: 'bank_transfer',
    accountNumber: '1370018829102',
    accountHolder: 'HARMONI RETAIL INDO',
    feePercentage: 0,
    feeFixed: 4000,
    isEnabled: true,
    instructions: [
      'Buka aplikasi Livin by Mandiri',
      'Pilih Transfer Rupiah > Rekening Mandiri Baru',
      'Masukkan nomor 1370018829102',
      'Konfirmasi pembayaran dengan PIN Livin'
    ]
  },
  {
    id: 'pay-gopay',
    name: 'GoPay & GoPay Later',
    code: 'gopay',
    category: 'ewallet',
    accountNumber: '081289123456',
    accountHolder: 'Kopi Harmoni',
    feePercentage: 1.5,
    feeFixed: 1000,
    isEnabled: true,
    instructions: [
      'Buka aplikasi Gojek atau GoPay',
      'Konfirmasi permintaan tagihan dari EzyERP',
      'Pilih sumber dana GoPay Saldo atau GoPay Later',
      'Verifikasi biometrik / sidik jari untuk menyelesaikan'
    ]
  },
  {
    id: 'pay-dana',
    name: 'DANA Indonesia',
    code: 'dana',
    category: 'ewallet',
    accountNumber: '081289123456',
    accountHolder: 'Kopi Harmoni',
    feePercentage: 1.5,
    feeFixed: 1000,
    isEnabled: true,
    instructions: [
      'Buka aplikasi DANA pada ponsel Anda',
      'Konfirmasi pembayaran instan',
      'Status lunas otomatis masuk ke pembukuan EzyERP'
    ]
  },
  {
    id: 'pay-card',
    name: 'Kartu Kredit / Debit (Visa & Mastercard)',
    code: 'card',
    category: 'card',
    feePercentage: 2.0,
    feeFixed: 2000,
    isEnabled: true,
    instructions: [
      'Masukkan 16 digit nomor kartu kredit/debit berlogo Visa atau Mastercard',
      'Masukkan masa berlaku (MM/YY) dan 3 digit CVV di belakang kartu',
      'Masukkan kode OTP 3D-Secure dari bank penerbit Anda'
    ]
  }
];
