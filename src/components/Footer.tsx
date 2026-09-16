import React from 'react';
import { Shield, MapPin, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100/75 text-xs border-t border-emerald-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-lime-400 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span>Ayudh Vikas Foundation</span>
            </div>
            <p className="text-emerald-100/70 text-xs leading-relaxed">
              Manpower Solutions is an institutional human resource placement, skill enrichment, and workplace enablement division committed to transparent employment matching.
            </p>
            <div className="flex items-center space-x-1.5 text-lime-300 text-[11px] font-medium">
              <Award className="w-4 h-4" />
              <span>Registered Section 8 Non-Profit Foundation</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Placement Wings</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-white">AV Vacancies:</span> Security, Office Support, Healthcare, Sanitation, Logistics
              </li>
              <li>
                <span className="text-white">All Jobs:</span> Software, Hardware IT, Accounts ERP, Customer Operations
              </li>
              <li>
                <span className="text-slate-300">Standard Registration:</span> One-time ₹10 verifiable candidate fee
              </li>
              <li>
                <span className="text-white">Governance:</span> 3-Level Verified Job Confirmation
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Employee Standards</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Clock-In & Duty Tracking</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Salary & Electronic Payslips</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official QR-Enabled Employee ID Cards</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transparent Grievance & Leave Redressal</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Headquarters & Contact</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-lime-300 shrink-0 mt-0.5" />
                <span>Ayudh Vikas Bhawan, Road No 12, Banjara Hills / Begumpet, Hyderabad, Telangana - 500034</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-lime-300 shrink-0" />
                <span>+91 040-23456789 / 1800-425-AVF</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-lime-300 shrink-0" />
                <span>manpower@ayudhvikas.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-emerald-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-100/55">
          <p>© {new Date().getFullYear()} Ayudh Vikas Foundation. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <span>₹10 Fixed Registration Policy</span>
            <span>•</span>
            <span>Zero Exploitation Guarantee</span>
            <span>•</span>
            <span>Secure Cloud Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
