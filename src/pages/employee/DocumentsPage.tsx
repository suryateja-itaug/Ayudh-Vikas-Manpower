import React, { useEffect, useState } from 'react';
import {
  Award,
  FileText,
  Shield,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeIdCard, AppointmentLetter, ManpowerEmployee } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<ManpowerEmployee | null>(null);
  const [idCard, setIdCard] = useState<EmployeeIdCard | null>(null);
  const [appointmentLetter, setAppointmentLetter] = useState<AppointmentLetter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getIdCard(), api.getAppointmentLetter()])
      .then(([cardRes, letterRes]) => {
        setIdCard(cardRes.idCard);
        setEmployee(cardRes.employee);
        setAppointmentLetter(letterRes.appointmentLetter);
      })
      .catch(err => console.error('Failed to load employee documents:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
        <div className="h-96 bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-7 h-7 text-amber-500" />
            <span>Official Credentials & Documentation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Ayudh Vikas Foundation biometric ID card and signed appointment letter.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 self-start transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save Credentials</span>
        </button>
      </div>

      {/* SECTION 1: OFFICIAL EMPLOYEE ID CARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Biometric Employee Identification Card</span>
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Active Verified Badge
          </span>
        </div>

        {idCard ? (
          <div className="max-w-md mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden space-y-5">
            {/* Top Card Band */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider">AYUDH VIKAS FOUNDATION</h3>
                  <span className="text-[9px] text-amber-400 font-medium block -mt-0.5">
                    MANPOWER SOLUTIONS • IDENTITY CARD
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{idCard.cardCode}</span>
            </div>

            {/* Profile Row */}
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
                alt={idCard.employeeName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/60 shadow-md shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">{idCard.employeeName}</h4>
                <div className="text-amber-400 font-mono text-xs font-bold">{idCard.employeeId}</div>
                <div className="text-slate-300 text-xs font-medium">{idCard.designation}</div>
                <div className="text-slate-400 text-[11px]">{idCard.department}</div>
              </div>
            </div>

            {/* Card Metadata & QR Code */}
            <div className="flex items-end justify-between pt-2 border-t border-slate-700/80 text-xs">
              <div className="space-y-1 text-[11px] text-slate-400">
                <div>
                  <span>Date of Issue: </span>
                  <span className="text-slate-200">{new Date(idCard.issueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span>Valid Through: </span>
                  <span className="text-slate-200">{new Date(idCard.validUntil).toLocaleDateString()}</span>
                </div>
                <div>
                  <span>Emergency Line: </span>
                  <span className="text-slate-200">+91 040-23456789</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-2 rounded-xl text-slate-900 text-center shadow-md">
                <QrCode className="w-12 h-12" />
                <span className="text-[8px] font-mono font-bold block mt-0.5">VERIFIED</span>
              </div>
            </div>

            <div className="text-[9px] text-center text-slate-500 pt-1">
              Property of Ayudh Vikas Foundation. If found, please return to Begumpet HQ, Hyderabad.
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No ID card generated yet.</p>
        )}
      </div>

      {/* SECTION 2: OFFICIAL APPOINTMENT LETTER */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Formal Letter of Appointment</span>
          </h2>
        </div>

        {appointmentLetter ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base sm:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>AYUDH VIKAS FOUNDATION</span>
                </div>
                <p className="text-xs text-slate-500">
                  Manpower Solutions & Institutional Employment Placement Division
                </p>
                <p className="text-[11px] text-slate-400">
                  Headquarters: Ayudh Vikas Bhawan, Road No 12, Banjara Hills / Begumpet, Hyderabad - 500034
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="font-mono text-slate-500 block">Ref: {appointmentLetter.refNo}</span>
                <span className="text-slate-500 block">Date: {new Date(appointmentLetter.issuedDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Recipient details */}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900">To,</p>
              <p className="font-bold text-slate-800">{appointmentLetter.employeeName}</p>
              <p className="text-slate-600">Employee Identification No: <span className="font-mono font-bold text-slate-900">{appointmentLetter.employeeId}</span></p>
              <p className="text-slate-600">Department: {appointmentLetter.department}</p>
            </div>

            {/* Subject */}
            <div className="font-bold text-slate-900 text-xs sm:text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
              Subject: Formal Letter of Appointment as <span className="text-amber-700">{appointmentLetter.designation}</span>
            </div>

            {/* Body */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Dear {appointmentLetter.employeeName},
              </p>
              <p>
                Consequent to your application, technical assessment, background document verification, and unanimous sign-off across our 3-Level Governance Confirmation Committee (HR, Operations, and Managing Directorate), we are pleased to formally appoint you to the position of <strong className="text-slate-900">{appointmentLetter.designation}</strong> in the <strong className="text-slate-900">{appointmentLetter.department}</strong> at Ayudh Vikas Foundation.
              </p>
              <p>
                Your effective joining date shall be <strong className="text-slate-900">{new Date(appointmentLetter.joiningDate).toLocaleDateString()}</strong>. You shall receive a consolidated monthly basic remuneration of <strong className="text-slate-900">₹{appointmentLetter.salary.toLocaleString()}</strong>, subject to statutory deductions (PF, ESI) and applicable allowances.
              </p>
            </div>

            {/* Terms list */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Conditions of Employment & Service Conduct:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {appointmentLetter.terms?.map((t, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signatory Footer */}
            <div className="pt-8 border-t border-slate-100 flex items-end justify-between">
              <div className="space-y-1 text-xs text-slate-400">
                <p>Seal of the Foundation</p>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase text-center p-1">
                  Ayudh Vikas Seal
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic text-base text-slate-900 font-bold">
                  {appointmentLetter.authorizedSignatory}
                </div>
                <p className="font-bold text-slate-900 text-xs">{appointmentLetter.authorizedSignatory}</p>
                <p className="text-[11px] text-slate-500">{appointmentLetter.signatoryTitle}</p>
                <p className="text-[10px] text-slate-400">Ayudh Vikas Foundation Governance Board</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No appointment letter issued yet.</p>
        )}
      </div>
    </div>
  );
};
