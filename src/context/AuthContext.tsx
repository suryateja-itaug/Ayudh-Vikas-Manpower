import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CandidateProfile, ManpowerEmployee, ManpowerRegistration } from '../types';
import { api } from '../services/api';

interface AvailableUserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  label: string;
}

interface AuthContextType {
  user: User | null;
  candidateProfile: CandidateProfile | null;
  employeeRecord: ManpowerEmployee | null;
  isRegisteredCandidate: boolean;
  registration: ManpowerRegistration | null;
  availableUsers: AvailableUserOption[];
  portalMode: 'candidate' | 'employee' | 'admin' | 'staff';
  loading: boolean;
  setPortalMode: (mode: 'candidate' | 'employee' | 'admin' | 'staff') => void;
  switchUser: (userId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [employeeRecord, setEmployeeRecord] = useState<ManpowerEmployee | null>(null);
  const [isRegisteredCandidate, setIsRegisteredCandidate] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ManpowerRegistration | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUserOption[]>([]);
  const [portalMode, setPortalMode] = useState<'candidate' | 'employee' | 'admin' | 'staff'>('admin');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data.user);
      setCandidateProfile(data.candidateProfile || null);
      setEmployeeRecord(data.employeeRecord || null);
      setIsRegisteredCandidate(data.isRegisteredCandidate);
      setRegistration(data.registration || null);

      // Auto-set portal mode according to user role, preserving explicit staff routes in preview mode.
      if (window.location.pathname.startsWith('/manpower/staff') || data.user.role === 'staff') {
        setPortalMode('staff');
      } else if (['admin', 'hr_admin', 'ops_admin', 'director_admin'].includes(data.user.role)) {
        setPortalMode('admin');
      } else if (data.user.role === 'employee') {
        setPortalMode('employee');
      } else {
        setPortalMode('candidate');
      }
    } catch (err) {
      console.error('Failed to load authenticated user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load available demo personas
    api.getAvailableUsers()
      .then(res => setAvailableUsers(res.users))
      .catch(err => console.error('Failed to load available demo users:', err));

    refreshUserData();
  }, []);

  const switchUser = async (userId: string) => {
    try {
      setLoading(true);
      api.setToken(userId);
      await refreshUserData();
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setCandidateProfile(null);
    setEmployeeRecord(null);
    setIsRegisteredCandidate(false);
    setRegistration(null);
    setPortalMode('candidate');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        candidateProfile,
        employeeRecord,
        isRegisteredCandidate,
        registration,
        availableUsers,
        portalMode,
        loading,
        setPortalMode,
        switchUser,
        refreshUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
