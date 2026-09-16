import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  FileText,
  Shield,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeSalary } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SalaryPage: React.FC = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlip, setActiveSlip] = useState<EmployeeSalary | null>(null);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await api.getSalaries();
      setSalaries(res.salaries);
    } catch (err) {
      console.error('Failed to load salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <CreditCard className="w-7 h-7 text-emerald-600" />
          <span>Salary Slips & Payroll Statements</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official monthly remuneration breakdown, statutory deductions (PF/ESI), and electronic payslips.
        </p>
      </div>

      {/* Salary List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>
          </div>
        ) : salaries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">No salary slips generated yet for this period.</p>
          </div>
        ) : (
          salaries.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{item.month}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    PAID
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Payment Date: {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'Direct Bank Deposit'}
                </p>
                <div className="flex items-center space-x-4 pt-1 text-xs text-slate-600">
                  <span>Gross: ₹{(item.basicPay + item.hra + item.allowances).toLocaleString()}</span>
                  <span>•</span>
                  <span>Deductions: ₹{item.deductions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-start sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Pay Transferred</span>
                  <div className="text-xl font-extrabold text-emerald-600">
                    ₹{item.netPay.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setActiveSlip(item)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Payslip</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Official Payslip Modal */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6 animate-in zoom-in-95 duration-150">
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase text-slate-400">Electronic Pay Statement</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  title="Print Slip"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSlip(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Structure */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-6 text-xs bg-slate-50/30">
              {/* Org Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">AYUDH VIKAS FOUNDATION</h2>
                  <p className="text-[11px] text-slate-500">Manpower Services & Workplace Placement Cell</p>
                  <p className="text-[11px] text-slate-400">Begumpet / Banjara Hills, Hyderabad, Telangana</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    PAYSLIP
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{activeSlip.month}</div>
                </div>
              </div>

              {/* Employee metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Employee Name</span>
                  <span className="font-bold text-slate-800 text-sm">{activeSlip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{activeSlip.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Disbursement</span>
                  <span className="font-semibold text-slate-700">Bank Transfer (NEFT/IMPS)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pay Date</span>
                  <span className="font-semibold text-slate-700">{activeSlip.paymentDate ? new Date(activeSlip.paymentDate).toLocaleDateString() : '01 of Month'}</span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                    Earnings
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Basic Pay</span>
                    <span className="font-semibold text-slate-800">₹{activeSlip.basicPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-semibold text-slate-800">₹{activeSlip.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Duty Allowances</span>
                    <span className="font-semibold text-slate-800">₹{activeSlip.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-slate-900 pt-2">
                    <span>Gross Earnings</span>
                    <span>₹{(activeSlip.basicPay + activeSlip.hra + activeSlip.allowances).toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                    Deductions
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-semibold text-slate-800">₹{Math.round(activeSlip.deductions * 0.65).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Employees' State Insurance (ESI)</span>
                    <span className="font-semibold text-slate-800">₹{Math.round(activeSlip.deductions * 0.35).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-slate-900 pt-7">
                    <span>Total Deductions</span>
                    <span>₹{activeSlip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Total Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wide">Net Remuneration</span>
                  <div className="text-xs text-emerald-700">Credited to Verified Bank Account</div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-800">
                  ₹{activeSlip.netPay.toLocaleString()}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                This is a computer-generated statement issued under Ayudh Vikas Foundation Manpower Solutions regulations. No physical signature required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
