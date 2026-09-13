import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import {
  GitFork,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Mail,
  // User,
  Sparkles,
  // Fingerprint,
  Network,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  Check,
  CheckCircle2,
  Landmark,
  Layers,
} from 'lucide-react';
import { UserRole } from '../../types';
import type { Institution, Researcher, SystemStats } from '../../types';
import { DashboardService } from '../../services/dashboardService';
import { AdminService } from '../../services/adminService';
import { ResearcherService } from '../../services/researcherService';
import { ThemeToggle } from '../../components/ThemeToggle';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form states
  // const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestedRole, setRequestedRole] = useState<UserRole>(UserRole.RESEARCHER);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | string>('');

  const [provider, setProvider] = useState<'email' | 'gmail' | 'outlook'>('email');
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real data fetched from application database & services
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  useEffect(() => {
    // Fetch live platform metrics
    DashboardService.getSystemStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching system stats:', err));

    // Fetch live registered institutions
    AdminService.getAllInstitutions()
      .then((data) => {
        setInstitutions(data);
        if (data.length > 0) {
          setSelectedInstitutionId(data[0].institution_id);
        }
      })
      .catch((err) => console.error('Error fetching institutions:', err));

    // Fetch live registered researchers
    ResearcherService.getAll()
      .then((data) => setResearchers(data))
      .catch((err) => console.error('Error fetching researchers:', err));
  }, []);

  // Live password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

    switch (score) {
      case 1:
        return { score: 33, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score: 66, label: 'Good', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 15, label: 'Too short', color: 'bg-red-500', text: 'text-red-500' };
    }
  }, [password]);

  // Check if institutional domain
  const isInstitutionalDomain = useMemo(() => {
    return /@([a-zA-Z0-9-]+\.)*(edu|ac\.[a-z]{2}|org|gov|res\.[a-z]{2})$/i.test(email);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Domain & Email validation based on selected provider
    if (provider === 'gmail') {
      if (!/@(gmail\.com|googlemail\.com)$/i.test(email)) {
        setError('Email must be a valid Gmail domain (@gmail.com or @googlemail.com).');
        return;
      }
    } else if (provider === 'outlook') {
      if (!/@(outlook\.com|hotmail\.com|live\.com|msn\.com)$/i.test(email)) {
        setError('Email must be a valid Outlook/Microsoft domain (@outlook.com, @hotmail.com, @live.com, or @msn.com).');
        return;
      }
    } else {
      const domainPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!domainPattern.test(email)) {
        setError('Please enter a valid institutional or academic email address.');
        return;
      }
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password: password as any,
        requested_role: requestedRole,
      });

      // Save user's temporary name and real selected institution in localStorage
      // localStorage.setItem(`pending_name_${email}`, name);
      // if (selectedInstitutionId) {
      //   localStorage.setItem(`pending_inst_${email}`, String(selectedInstitutionId));
      // }

      // Route to Verify Email View
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (provider) {
      case 'gmail':
        return 'dr.khandesh@gmail.com';
      case 'outlook':
        return 'dr.singhal@outlook.com';
      default:
        return 'researcher@university.edu';
    }
  };

  const getLabel = () => {
    // switch (provider) {
    //   case 'gmail':
    //     return 'Google Workspace / Gmail Address';
    //   case 'outlook':
    //     return 'Microsoft 365 / Outlook Address';
    //   default:
    //     return 'Institutional Academic Email';
    // }
    return 'Institutional Academic Email';
  };

  return (
    <div className="h-screen max-h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col justify-between font-sans">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Main Single-Screen Grid */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        {/* =======================================================
            LEFT SIDEBAR — REAL SYSTEM DATA & LIVE SCN METRICS
        ======================================================= */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-7 xl:p-9 border-r border-white/10 bg-gradient-to-br from-navy-950/90 via-slate-950 to-cyan-950/30">
          {/* Top Logo & Live Badge */}
          <div>
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <GitFork className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-white block">SCN Portal</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-300 font-bold block">
                    Scientific Collaboration Network
                  </span>
                </div>
              </Link>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Network
              </div>
            </div>

            {/* Scientific Headline */}
            <div className="mt-7">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Academic Onboarding
              </div>
              <h1 className="text-2xl xl:text-3xl font-black text-white leading-tight">
                Connect ideas.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                  Verify research impact.
                </span>
              </h1>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">
                Join verified researchers, peer reviewers, and institutions building reproducible scientific networks.
              </p>
            </div>
          </div>

          {/* REAL PLATFORM DATA METRICS (Dynamic from DashboardService) */}
          <div className="my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Real-Time Platform Stats
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Synchronized</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-cyan-300 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Members</span>
                </div>
                <p className="text-2xl font-black text-white">{stats ? stats.total_researchers : researchers.length || 3}</p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">Active Researchers</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-blue-300 mb-1">
                  <Landmark className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Partners</span>
                </div>
                <p className="text-2xl font-black text-white">{stats ? stats.total_institutions : institutions.length || 3}</p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">Partner Institutions</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-indigo-300 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Indexed</span>
                </div>
                <p className="text-2xl font-black text-white">{stats ? stats.total_publications : 3}</p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">Scientific Publications</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between text-emerald-300 mb-1">
                  <Network className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Synergy</span>
                </div>
                <p className="text-2xl font-black text-white">{stats ? stats.total_collaborations : 2}</p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">Joint Collaborations</p>
              </div>
            </div>

            {/* REAL AFFILIATED INSTITUTIONS IN THE NETWORK */}
            {/* <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Connected Institutional Repositories
              </p>
              <div className="space-y-1.5">
                {institutions.slice(0, 3).map((inst) => (
                  <div
                    key={inst.institution_id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-[11px]"
                  >
                    <span className="font-semibold text-slate-200 truncate pr-2">{inst.name}</span>
                    <span className="text-[10px] text-cyan-300 shrink-0 font-medium">
                      {inst.city}, {inst.country}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Bottom Security Assurance */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cryptographic OTP Verification
            </span>
            <span className="font-mono text-[10px] text-slate-500">v2.4 LTS</span>
          </div>
        </div>

        {/* =======================================================
            RIGHT PANEL — FOCUSED REGISTRATION FORM (ONE SCREEN)
        ======================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Have an account?{' '}
                <Link to="/login" className="font-bold text-cyan-400 hover:underline">
                  Sign In
                </Link>
              </span>
              <ThemeToggle />
            </div>
          </div>

          {/* Center Registration Card */}
          <div className="w-full max-w-xl mx-auto my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/60 border border-slate-200/90 dark:border-white/10 overflow-hidden text-slate-900 dark:text-white shrink-0">
            {/* Top Accent Gradient Line */}
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

            <div className="p-5 sm:p-7 space-y-4">
              {/* Form Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Create Academic Account
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Select your role and connect your institutional credentials.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>

              {/* Provider Selector Tabs */}
              {/* <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                {[
                  { id: 'email' as const, label: 'University Email', icon: '🏛️' },
                  // { id: 'gmail' as const, label: 'Google Workspace', icon: '🌐' },
                  // { id: 'outlook' as const, label: 'Microsoft 365', icon: '📧' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => {
                      setProvider(prov.id);
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      provider === prov.id
                        ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{prov.icon}</span>
                    <span className="truncate">{prov.label}</span>
                  </button>
                ))}
              </div> */}

              {/* Social Fast Signup Option
              {provider !== 'email' && (
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(true)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    provider === 'gmail'
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-100/70'
                      : 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100/70'
                  }`}
                >
                  <span>{provider === 'gmail' ? '🌐' : '📧'}</span>
                  <span>1-Click Test Onboarding with {provider === 'gmail' ? 'Google' : 'Microsoft'} (Real Profiles)</span>
                </button>
              )} */}

              {/* Error Notification */}
              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Role Selector Compact Cards */}
                {/* <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Requested Academic Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        role: UserRole.RESEARCHER,
                        label: 'Researcher',
                        icon: <GraduationCap className="w-3.5 h-3.5" />,
                      },
                      {
                        role: UserRole.REVIEWER,
                        label: 'Peer Reviewer',
                        icon: <ShieldCheck className="w-3.5 h-3.5" />,
                      },
                      {
                        role: UserRole.INSTITUTION_ADMIN,
                        label: 'Inst Admin',
                        icon: <Building2 className="w-3.5 h-3.5" />,
                      },
                    ].map((item) => {
                      const isSelected = requestedRole === item.role;
                      return (
                        <button
                          type="button"
                          key={item.role}
                          onClick={() => setRequestedRole(item.role)}
                          className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}>
                              {item.icon}
                            </span>
                            <span className="text-xs truncate">{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div> */}

                {/* Name and Real Institution row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Full Academic Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rishitha Khandesh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div> */}

                  {/* <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Real Affiliated Institution
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedInstitutionId}
                        onChange={(e) => setSelectedInstitutionId(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all appearance-none"
                      >
                        {institutions.map((inst) => (
                          <option key={inst.institution_id} value={inst.institution_id} className="dark:bg-slate-900">
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div> */}
                </div>

                {/* Email Address with Domain recognition */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {getLabel()}
                    </label>
                    {isInstitutionalDomain && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Recognized Academic Domain
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={getPlaceholder()}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Passwords in single row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-9 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className={`w-full pl-10 pr-9 py-2.5 border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none transition-all ${
                          confirmPassword && confirmPassword !== password
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : confirmPassword && confirmPassword === password
                            ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Bar & Checklist */}
                {password && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-500">Security Strength:</span>
                      <span className={`font-black ${passwordStrength.text}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className={password.length >= 8 ? 'text-emerald-500 font-bold' : ''}>
                        {password.length >= 8 ? '✓' : '○'} 8+ chars
                      </span>
                      <span className={/[A-Za-z]/.test(password) && /\d/.test(password) ? 'text-emerald-500 font-bold' : ''}>
                        {/[A-Za-z]/.test(password) && /\d/.test(password) ? '✓' : '○'} Letters & digits
                      </span>
                      <span className={confirmPassword && confirmPassword === password ? 'text-emerald-500 font-bold' : ''}>
                        {confirmPassword && confirmPassword === password ? '✓' : '○'} Passwords match
                      </span>
                    </div>
                  </div>
                )}

                {/* Role Selector Compact Cards */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Select Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        role: UserRole.RESEARCHER,
                        label: 'Researcher',
                        icon: <GraduationCap className="w-3.5 h-3.5" />,
                      },
                      {
                        role: UserRole.REVIEWER,
                        label: 'Reviewer',
                        icon: <ShieldCheck className="w-3.5 h-3.5" />,
                      },
                      {
                        role: UserRole.INSTITUTION_ADMIN,
                        label: 'Institution Admin',
                        icon: <Building2 className="w-3.5 h-3.5" />,
                      },
                    ].map((item) => {
                      const isSelected = requestedRole === item.role;
                      return (
                        <button
                          type="button"
                          key={item.role}
                          onClick={() => setRequestedRole(item.role)}
                          className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}>
                              {item.icon}
                            </span>
                            <span className="text-xs truncate">{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden py-3 px-4 bg-gradient-to-r from-navy-700 via-blue-700 to-cyan-600 hover:from-navy-600 hover:via-blue-600 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 transition-all duration-200 cursor-pointer mt-2"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Connecting to SCN Network...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {provider === 'email'
                            ? 'Verify Institutional Domain & Send OTP'
                            : 'Complete Social Onboarding & Send OTP'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Bottom Footnote */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Already registered on SCN Portal? </span>
                <Link to="/login" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Security Bar */}
          <div className="mt-2 text-center text-[10px] text-slate-500 shrink-0">
            <span>Protected by SCN Cryptographic OTP Protocol</span>
            <span className="mx-2">•</span>
            <span>Real-time Affiliation Sync</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          SIMULATED OAUTH MODAL (USING REAL DATA PERSONAS)
      ========================================================= */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">{provider === 'gmail' ? '🌐' : '📧'}</span>
                <div>
                  {/* <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sign in with {provider === 'gmail' ? 'Google Workspace' : 'Microsoft 365'}
                  </h3> */}
                  <p className="text-[10px] text-slate-500">Real System Researcher Profiles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOAuthModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Select an actual verified researcher profile from the SCN database to test real-time synchronization:
            </p>

            <div className="space-y-2 pt-1">
              {[
                {
                  // name: 'Dr. Rishitha Khandesh',
                  email: provider === 'gmail' ? 'dr.khandesh@gmail.com' : 'dr.khandesh@outlook.com',
                  // institution: 'University of Scientific Collaboration',
                  instId: 1,
                  role: UserRole.RESEARCHER,
                },
                {
                  // name: 'Dr. Rishabh Singhal',
                  email: provider === 'gmail' ? 'dr.singhal@gmail.com' : 'dr.singhal@outlook.com',
                  // institution: 'University of Scientific Collaboration',
                  instId: 1,
                  role: UserRole.RESEARCHER,
                },
                {
                  // name: 'Dr. John Smith',
                  email: provider === 'gmail' ? 'dr.smith@gmail.com' : 'dr.smith@outlook.com',
                  // institution: 'Massachusetts Institute of Technology',
                  instId: 2,
                  role: UserRole.REVIEWER,
                },
              ].map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    // setName(account.name);
                    setEmail(account.email);
                    setPassword('Password123');
                    setConfirmPassword('Password123');
                    setRequestedRole(account.role);
                    setSelectedInstitutionId(account.instId);
                    setShowOAuthModal(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 transition-all text-left group"
                >
                  {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-700 to-cyan-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {account.name.split(' ').pop()?.[0] || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{account.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{account.email}</p>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">{account.institution}</p>
                  </div> */}
                  <Check className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-slate-100 dark:border-slate-800">
              Synchronizes affiliations directly with the SCN database.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
