import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  FileText,
  Calendar,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react';
import { api } from '../../services/api';
import { CandidateProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CandidateDossierModal } from './CandidateDossierModal';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const HistoricalSearchPage: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  // Filters
  const [query, setQuery] = useState('');
  const [qualification, setQualification] = useState('');
  const [graduationRequired, setGraduationRequired] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await api.searchCandidates({
        query: query || undefined,
        qualification: qualification || undefined,
        graduationRequired: graduationRequired !== '' ? graduationRequired === 'true' : undefined,
        status: status || undefined,
        location: location || undefined,
      });
      setCandidates(res.candidates);
      setTotalMatches(res.totalMatches);
    } catch (err) {
      console.error('Candidate search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleReset = () => {
    setQuery('');
    setQualification('');
    setGraduationRequired('');
    setStatus('');
    setLocation('');
    setTimeout(() => {
      api.searchCandidates({}).then(res => {
        setCandidates(res.candidates);
        setTotalMatches(res.totalMatches);
      });
    }, 50);
  };
  const candidatesPager = usePaginatedRows(candidates, 10);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Users className="w-7 h-7 text-purple-600" />
          <span>Historical Candidate Search & Talent Pool</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perform multi-parameter searches across all historical applicant records, qualifications, past applications, and hiring status logs.
        </p>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Query input */}
          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-slate-700">Search by Name, Mobile, Email, or Skills</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Vikram, 9876543210, Security, Electrician..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && performSearch()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Qualification */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Qualification</label>
            <select
              value={qualification}
              onChange={e => setQualification(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Any Qualification</option>
              <option value="10th">10th / SSC Pass</option>
              <option value="12th">12th / Intermediate</option>
              <option value="Graduate">Graduate (Any Degree)</option>
              <option value="B.Tech">B.Tech / B.E.</option>
              <option value="Post Graduate">Post Graduate / Master</option>
            </select>
          </div>

          {/* Graduation Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Degree Requirement</label>
            <select
              value={graduationRequired}
              onChange={e => setGraduationRequired(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Candidates</option>
              <option value="true">Graduates Only</option>
              <option value="false">Non-Graduates (10th/12th)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Location & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Preferred Location</label>
            <input
              type="text"
              placeholder="e.g. Hyderabad, Secunderabad, Gachibowli..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && performSearch()}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Application Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="SELECTED">Selected / Confirmed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              onClick={performSearch}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              Search Records
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">
          Search Results ({totalMatches} Candidate Records Found)
        </h3>
        <span className="text-xs text-slate-400">
          Showing enrolled talent pool
        </span>
      </div>

      {/* Candidates List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Candidate & Contact</th>
                <th className="py-3.5 px-4">Qualification & Degree</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Preferred Role & City</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Querying candidate databases...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No candidates matched your filter parameters.
                  </td>
                </tr>
              ) : (
                candidatesPager.paginatedItems.map(cand => (
                  <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{cand.fullName}</div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{cand.mobile}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cand.email}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{cand.qualification}</span>
                      {cand.graduation && (
                        <span className="block text-[10px] text-slate-400">{cand.graduation}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {cand.experienceYears} Year{cand.experienceYears > 1 ? 's' : ''}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{cand.preferredJob}</div>
                      <div className="text-[11px] text-slate-400">{cand.preferredLocation}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Rs.10 Paid</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCandidateId(cand.id)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-xl text-xs transition-colors"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={candidatesPager.page}
          totalPages={candidatesPager.totalPages}
          totalItems={candidates.length}
          pageSize={candidatesPager.pageSize}
          onPageChange={candidatesPager.setPage}
        />
      </div>

      {selectedCandidateId && (
        <CandidateDossierModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  );
};
