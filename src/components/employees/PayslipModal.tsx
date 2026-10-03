import React from 'react';
import { Payslip, Employee, BusinessProfile } from '../../types/erp';
import { Printer, Share2, X, Download, CheckCircle, Building } from 'lucide-react';

interface PayslipModalProps {
  payslip: Payslip;
  employee: Employee;
  businessProfile: BusinessProfile;
  onClose: () => void;
  onMarkPaid: (paymentMethod: string) => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payslip,
  employee,
  businessProfile,
  onClose,
  onMarkPaid
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*SLIP GAJI RESMI - ${businessProfile.businessName}*\n` +
      `No. Dokumen: ${payslip.payslipNumber}\n` +
      `Periode: ${payslip.periodMonth}\n\n` +
      `Kepada Yth: *${employee.name}* (${employee.employeeCode})\n` +
      `Jabatan: ${employee.position} - ${employee.department}\n\n` +
      `*Rincian Pendapatan:*\n` +
      `• Gaji Pokok: Rp ${payslip.basicSalary.toLocaleString('id-ID')}\n` +
      `• Total Tunjangan: Rp ${payslip.allowanceTotal.toLocaleString('id-ID')}\n` +
      `• Lembur (${payslip.overtimeHours} jam): Rp ${payslip.overtimePay.toLocaleString('id-ID')}\n` +
      `• Bonus / Insentif: Rp ${payslip.bonus.toLocaleString('id-ID')}\n\n` +
      `*Rincian Potongan:*\n` +
      `• BPJS Ketenagakerjaan: Rp ${payslip.deductions.bpjs.toLocaleString('id-ID')}\n` +
      `• Penalti Keterlambatan: Rp ${payslip.deductions.latePenalty.toLocaleString('id-ID')}\n` +
      `• Total Potongan: -Rp ${payslip.totalDeductions.toLocaleString('id-ID')}\n\n` +
      `*GAJI BERSIH (TAKE HOME PAY): Rp ${payslip.netSalary.toLocaleString('id-ID')}*\n` +
      `Status: ${payslip.status === 'paid' ? 'LUNAS DITRANSFER' : 'MENUNGGU TRANSFER'}\n` +
      `Rekening Tujuan: ${employee.bankName} - ${employee.bankAccount} a.n ${employee.bankHolder}\n\n` +
      `_Diterbitkan secara otomatis melalui Sistem EzyERP_`;

    const encoded = encodeURIComponent(text);
    const phoneClean = employee.phone.replace(/[^0-9]/g, '');
    const waPhone = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in duration-150">
        {/* Action Header (hidden in print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Dokumen Slip Gaji Karyawan</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              · {payslip.payslipNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors printable-btn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Payslip Paper */}
        <div className="printable-document p-6 sm:p-8 bg-white text-slate-900 text-xs leading-normal">
          {/* Header Kop Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                  {businessProfile.businessName}
                </h2>
                <p className="text-xs text-slate-600">{businessProfile.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                  {businessProfile.address}, {businessProfile.city} · Telp: {businessProfile.phone}
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                  SLIP GAJI KARYAWAN
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {payslip.payslipNumber}
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Periode: {payslip.periodMonth}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Identification */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">ID Karyawan:</span>
                <span className="font-mono font-bold text-slate-900">{employee.employeeCode}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Nama Lengkap:</span>
                <span className="font-semibold text-slate-900">{employee.name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Jabatan / Peran:</span>
                <span className="text-slate-800">{employee.position}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Departemen:</span>
                <span className="text-slate-800">{employee.department}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Status Kerja:</span>
                <span className="capitalize text-slate-800">{employee.employmentType}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Rekening Gaji:</span>
                <span className="font-mono text-slate-800">
                  {employee.bankName} - {employee.bankAccount}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Tables (Earnings vs Deductions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Earnings / Pendapatan */}
            <div>
              <div className="bg-slate-100 font-bold px-3 py-1.5 rounded-t border border-slate-200 text-slate-800">
                A. PENDAPATAN (EARNINGS)
              </div>
              <div className="border-x border-b border-slate-200 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span>Gaji Pokok</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.basicSalary.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Tunjangan Operasional & Makan</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.allowanceTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Upah Lembur ({payslip.overtimeHours} Jam)</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.overtimePay.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Insentif & Bonus Kehadiran</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.bonus.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 font-bold bg-slate-50">
                  <span>Total Pendapatan Kotor</span>
                  <span className="font-mono text-emerald-700">
                    Rp{' '}
                    {(
                      payslip.basicSalary +
                      payslip.allowanceTotal +
                      payslip.overtimePay +
                      payslip.bonus
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions / Potongan */}
            <div>
              <div className="bg-slate-100 font-bold px-3 py-1.5 rounded-t border border-slate-200 text-slate-800">
                B. POTONGAN (DEDUCTIONS)
              </div>
              <div className="border-x border-b border-slate-200 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span>Iuran BPJS Ketenagakerjaan (2%)</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.deductions.bpjs.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Potongan Keterlambatan Absensi</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.deductions.latePenalty.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Potongan Pinjaman / Kasbon</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.deductions.loans.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Potongan Lainnya</span>
                  <span className="font-mono font-medium">
                    Rp {payslip.deductions.other.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 font-bold bg-slate-50">
                  <span>Total Potongan</span>
                  <span className="font-mono text-rose-700">
                    -Rp {payslip.totalDeductions.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight */}
          <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-300">
                Gaji Bersih Diterima (Take Home Pay)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ditransfer ke {employee.bankName} - {employee.bankAccount}
              </p>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Rp {payslip.netSalary.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-6 text-center text-xs">
            <div>
              <p className="text-slate-500">Penerima,</p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold underline text-slate-900">{employee.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Karyawan / Staff</p>
            </div>

            <div>
              <p className="text-slate-500">
                {businessProfile.city}, {payslip.createdAt}
              </p>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold underline text-slate-900">
                  {businessProfile.ownerName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Owner / Direktur Usaha</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
            Dokumen ini sah dan diterbitkan otomatis oleh Sistem ERP & Payroll EzyERP · {businessProfile.businessName}
          </div>
        </div>

        {/* Footer Actions for payment trigger */}
        {payslip.status === 'draft' && (
          <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Slip masih berstatus <span className="font-semibold text-amber-600">Draft (Belum Dibayar)</span>
            </span>

            <button
              onClick={() => onMarkPaid(employee.bankName)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Konfirmasi Bayar & Catat ke Buku Kas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
