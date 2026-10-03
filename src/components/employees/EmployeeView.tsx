import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Employee, AttendanceRecord, Payslip, WorkSchedule } from '../../types/erp';
import { PayslipModal } from './PayslipModal';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Receipt,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  Printer,
  Trash2,
  Edit2,
  X,
  Share2
} from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    attendance,
    todayClockIn,
    todayClockOut,
    schedules,
    updateSchedule,
    payslips,
    generateAutoPayslip,
    markPayslipPaid,
    deletePayslip,
    businessProfile
  } = useERP();

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'schedule' | 'payroll'>('employees');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payrollPeriodMonth, setPayrollPeriodMonth] = useState('Oktober');
  const [payrollYear, setPayrollYear] = useState(2026);

  // Employee form state
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Operasional Toko');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employmentType, setEmploymentType] = useState<Employee['employmentType']>('tetap');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number | ''>('');
  const [transportAllowance, setTransportAllowance] = useState<number | ''>(350000);
  const [mealAllowance, setMealAllowance] = useState<number | ''>(550000);
  const [communicationAllowance, setCommunicationAllowance] = useState<number | ''>(100000);
  const [bankName, setBankName] = useState('BCA');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');

  // Attendance manual clock-in state
  const [clockInEmployeeId, setClockInEmployeeId] = useState(employees[0]?.id || '');
  const [clockInStatus, setClockInStatus] = useState<AttendanceRecord['status']>('present');
  const [clockInNotes, setClockInNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get today's attendance for employee
  const getTodayAttendance = (empId: string) => {
    return attendance.find((a) => a.employeeId === empId && a.date === todayStr);
  };

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setName('');
    setEmployeeCode(`EMP-00${employees.length + 1}`);
    setPosition('Staff Operasional');
    setDepartment('Operasional Toko');
    setPhone('');
    setEmail('');
    setEmploymentType('tetap');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setBasicSalary(3500000);
    setTransportAllowance(350000);
    setMealAllowance(550000);
    setCommunicationAllowance(100000);
    setBankName('BCA');
    setBankAccount('');
    setBankHolder('');
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmployeeCode(emp.employeeCode);
    setPosition(emp.position);
    setDepartment(emp.department);
    setPhone(emp.phone);
    setEmail(emp.email);
    setEmploymentType(emp.employmentType);
    setJoinDate(emp.joinDate);
    setBasicSalary(emp.basicSalary);
    setTransportAllowance(emp.allowances.transport);
    setMealAllowance(emp.allowances.meal);
    setCommunicationAllowance(emp.allowances.communication);
    setBankName(emp.bankName);
    setBankAccount(emp.bankAccount);
    setBankHolder(emp.bankHolder);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position || basicSalary === '') return;

    const payload = {
      name,
      employeeCode,
      position,
      department,
      phone,
      email,
      employmentType,
      joinDate,
      basicSalary: Number(basicSalary),
      allowances: {
        transport: Number(transportAllowance) || 0,
        meal: Number(mealAllowance) || 0,
        communication: Number(communicationAllowance) || 0
      },
      bankName,
      bankAccount,
      bankHolder: bankHolder || name
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }

    setIsEmployeeModalOpen(false);
  };

  const handleManualClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockInEmployeeId) return;
    todayClockIn(clockInEmployeeId, clockInStatus, clockInNotes);
    setClockInNotes('');
  };

  const handleGeneratePayslipForEmployee = (empId: string) => {
    const slip = generateAutoPayslip(empId, payrollPeriodMonth, payrollYear);
    setSelectedPayslip(slip);
  };

  const handleGenerateAllPayslips = () => {
    employees.forEach((emp) => {
      // Check if payslip already generated for this month
      const exists = payslips.find(
        (p) =>
          p.employeeId === emp.id &&
          p.periodMonth.toLowerCase().includes(payrollPeriodMonth.toLowerCase())
      );
      if (!exists) {
        generateAutoPayslip(emp.id, payrollPeriodMonth, payrollYear);
      }
    });
  };

  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Karyawan & Payroll
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan data karyawan, absensi kehadiran, jadwal kerja, dan pembuatan slip gaji otomatis.
          </p>
        </div>

        {activeTab === 'employees' && (
          <button
            onClick={handleOpenAddEmployee}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Karyawan
          </button>
        )}

        {activeTab === 'payroll' && (
          <button
            onClick={handleGenerateAllPayslips}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Receipt className="w-3.5 h-3.5" />
            + Generate Slip Gaji Semua Karyawan
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'employees'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Data Karyawan ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Presensi & Absensi</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Jadwal Kerja (Shift)</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Hitung Gaji & Slip Gaji</span>
        </button>
      </div>

      {/* TAB 1: DATA KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const totalAllowance =
                (emp.allowances.transport || 0) +
                (emp.allowances.meal || 0) +
                (emp.allowances.communication || 0);

              const todayAtt = getTodayAttendance(emp.id);

              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {emp.employeeCode}
                          </span>
                          <span className="text-[11px] text-slate-500 capitalize">
                            {emp.employmentType}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5">{emp.name}</h3>
                        <p className="text-xs text-indigo-600 font-medium">{emp.position}</p>
                        <p className="text-[11px] text-slate-400">{emp.department}</p>
                      </div>

                      {/* Today attendance status badge */}
                      <div>
                        {todayAtt ? (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              todayAtt.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : todayAtt.status === 'late'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {todayAtt.status === 'present'
                              ? 'Hadir'
                              : todayAtt.status === 'late'
                              ? 'Terlambat'
                              : todayAtt.status}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                            Belum Clock In
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Salary & Allowances details */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gaji Pokok:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          Rp {emp.basicSalary.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Tunjangan:</span>
                        <span className="font-mono text-slate-700">
                          Rp {totalAllowance.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
                        <span className="text-slate-700">Estimasi THP:</span>
                        <span className="font-mono text-indigo-600">
                          Rp {(emp.basicSalary + totalAllowance).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Banking info */}
                    <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">
                          {emp.bankName} - {emp.bankAccount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleGeneratePayslipForEmployee(emp.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Buat Slip Gaji
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Edit data karyawan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus karyawan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ABSENSI & PRESENSI */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Quick Clock In Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs self-start">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Presensi Mandiri Hari Ini ({todayStr})
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan waktu kedatangan dan kepulangan tim kerja harian.
            </p>

            <form onSubmit={handleManualClockIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Karyawan
                </label>
                <select
                  value={clockInEmployeeId}
                  onChange={(e) => setClockInEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeCode} - {emp.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={clockInStatus}
                  onChange={(e) =>
                    setClockInStatus(e.target.value as AttendanceRecord['status'])
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="present">Hadir Tepat Waktu</option>
                  <option value="late">Terlambat</option>
                  <option value="permit">Izin</option>
                  <option value="sick">Sakit (Ada Surat)</option>
                  <option value="absent">Alpa / Tanpa Keterangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Terlambat 10 menit karena macet"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Clock In Masuk
                </button>
                <button
                  type="button"
                  onClick={() => todayClockOut(clockInEmployeeId)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Clock Out Pulang
                </button>
              </div>
            </form>
          </div>

          {/* Right: Attendance History Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Log Kehadiran & Presensi
                </h2>
                <p className="text-xs text-slate-500">
                  Riwayat jam masuk dan pulang untuk perhitungan lembur & penalti
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">Jam Masuk</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((rec) => {
                    const emp = employees.find((e) => e.id === rec.employeeId);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-600">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {emp ? emp.name : 'Karyawan'}
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            ({emp?.employeeCode})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {rec.clockIn || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {rec.clockOut || (
                            <span className="text-amber-600 font-medium">Sedang Kerja</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              rec.status === 'present'
                                ? 'text-emerald-600'
                                : rec.status === 'late'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {rec.status === 'present'
                              ? 'Tepat Waktu'
                              : rec.status === 'late'
                              ? 'Terlambat'
                              : rec.status === 'sick'
                              ? 'Sakit'
                              : rec.status === 'permit'
                              ? 'Izin'
                              : 'Alpa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {rec.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JADWAL KERJA & SHIFT ROSTER */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Matriks Jadwal Kerja & Shift Mingguan
              </h2>
              <p className="text-xs text-slate-500">
                Atur jadwal shift kerja (Pagi / Siang / Full / Libur) untuk setiap karyawan.
              </p>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Masuk Kerja
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Hari Libur (Off)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4 w-52">Nama Karyawan</th>
                  {daysName.map((d, idx) => (
                    <th key={d} className="py-3 px-3 text-center">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{emp.position}</p>
                    </td>

                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const sched = schedules.find(
                        (s) => s.employeeId === emp.id && s.dayOfWeek === day
                      );
                      const isOff = sched?.isOff ?? (day === 0);

                      return (
                        <td key={day} className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => {
                              updateSchedule(emp.id, day, {
                                isOff: !isOff,
                                shiftName: !isOff ? 'Libur' : 'Shift Pagi',
                                startTime: !isOff ? '-' : '08:00',
                                endTime: !isOff ? '-' : '17:00'
                              });
                            }}
                            className={`w-full py-2 px-1 rounded-lg text-xs font-semibold transition-all border ${
                              isOff
                                ? 'bg-slate-100 text-slate-400 border-dashed border-slate-300 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title="Klik untuk beralih Masuk / Libur"
                          >
                            <div>{isOff ? 'OFF (Libur)' : sched?.shiftName || 'Pagi'}</div>
                            {!isOff && (
                              <div className="text-[10px] font-mono text-emerald-600 font-normal">
                                {sched?.startTime || '08:00'} - {sched?.endTime || '17:00'}
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HITUNG GAJI & SLIP GAJI */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Payroll Filter & Period */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Periode Penggajian:</span>
              <select
                value={payrollPeriodMonth}
                onChange={(e) => setPayrollPeriodMonth(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>
              <span className="text-xs font-mono font-bold text-slate-800">{payrollYear}</span>
            </div>

            <div className="text-xs text-slate-500">
              Perhitungan mencakup: Gaji Pokok + Tunjangan + Lembur Absensi - Penalti - BPJS
            </div>
          </div>

          {/* Payslips Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">No. Slip & Periode</th>
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4 text-right">Gaji Pokok</th>
                    <th className="py-3 px-4 text-right">Tunjangan & Lembur</th>
                    <th className="py-3 px-4 text-right">Potongan</th>
                    <th className="py-3 px-4 text-right">Gaji Bersih (THP)</th>
                    <th className="py-3 px-4 text-center">Status Bayar</th>
                    <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                        Belum ada slip gaji yang digenerate. Klik "+ Generate Slip Gaji" di atas.
                      </td>
                    </tr>
                  ) : (
                    payslips.map((slip) => {
                      const emp = employees.find((e) => e.id === slip.employeeId);
                      return (
                        <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-mono font-bold text-slate-900">
                              {slip.payslipNumber}
                            </p>
                            <p className="text-[11px] text-slate-400">{slip.periodMonth}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">
                              {emp ? emp.name : 'Karyawan'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {emp?.position} · {emp?.bankName} ({emp?.bankAccount})
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            Rp {slip.basicSalary.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-700">
                            +Rp{' '}
                            {(
                              slip.allowanceTotal +
                              slip.overtimePay +
                              slip.bonus
                            ).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-700">
                            -Rp {slip.totalDeductions.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 text-sm">
                            Rp {slip.netSalary.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                slip.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {slip.status === 'paid' ? 'Lunas Ditransfer' : 'Draft / Menunggu'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedPayslip(slip)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-xs flex items-center gap-1 transition-colors"
                                title="Buka dan Cetak Slip Gaji Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Lihat Slip</span>
                              </button>
                              <button
                                onClick={() => deletePayslip(slip.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Hapus slip"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Karyawan *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan / Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Barista, Kasir, Supervisor"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departemen / Divisi
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081288990011"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Ikatan Kerja
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(e.target.value as Employee['employmentType'])
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="tetap">Karyawan Tetap</option>
                    <option value="kontrak">Karyawan Kontrak</option>
                    <option value="part-time">Part-Time / Paruh Waktu</option>
                    <option value="magang">Magang / Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gaji Pokok Bulanan (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Contoh: 3500000"
                    value={basicSalary}
                    onChange={(e) =>
                      setBasicSalary(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tunjangan Makan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mealAllowance}
                    onChange={(e) =>
                      setMealAllowance(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tunjangan Transportasi (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transportAllowance}
                    onChange={(e) =>
                      setTransportAllowance(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Bank Penggajian
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank BRI">Bank BRI</option>
                    <option value="Bank BNI">Bank BNI</option>
                    <option value="Bank Jago">Bank Jago</option>
                    <option value="Tunai">Tunai Langsung</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Rekening & Atas Nama
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nomor Rekening"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Nama Pemilik Rekening"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  {editingEmployee ? 'Perbarui Karyawan' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Payslip Printable Document Modal */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          employee={
            employees.find((e) => e.id === selectedPayslip.employeeId) || employees[0]
          }
          businessProfile={businessProfile}
          onClose={() => setSelectedPayslip(null)}
          onMarkPaid={(paymentMethod) => {
            markPayslipPaid(selectedPayslip.id, paymentMethod);
            setSelectedPayslip(null);
          }}
        />
      )}
    </div>
  );
};
