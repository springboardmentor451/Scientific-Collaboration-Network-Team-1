import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import {
  GitFork,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Mail,
  Sparkles,
  Fingerprint,
  Network,
  Users,
  BookOpen,
  Activity,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login({
        email,
        password,
        requested_role: 'researcher' as any,
      });

      navigate(
        `/verify-login?email=${encodeURIComponent(email)}`
      );
    } catch (err: any) {
      setError(
        err.message || 'Failed to authenticate.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative transition-colors duration-200">

      {/* =========================================================
          GLOBAL BACKGROUND
      ========================================================= */}

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />

        <div className="absolute -bottom-48 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />

        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

      </div>

      {/* =========================================================
          PAGE
      ========================================================= */}

      <div className="relative min-h-screen flex">

        {/* =======================================================
            LEFT — SCIENTIFIC NETWORK EXPERIENCE
        ======================================================= */}

        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">

          <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-slate-950 to-cyan-950/40" />

          {/* Decorative network lines */}

          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            viewBox="0 0 900 900"
            preserveAspectRatio="xMidYMid slice"
          >

            <defs>

              <linearGradient
                id="lineGradient"
                x1="0"
                x2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                  stopOpacity="0"
                />
                <stop
                  offset="50%"
                  stopColor="#22d3ee"
                  stopOpacity="0.8"
                />
                <stop
                  offset="100%"
                  stopColor="#60a5fa"
                  stopOpacity="0"
                />
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur
                  stdDeviation="5"
                  result="coloredBlur"
                />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

            </defs>

            {/* connections */}

            <g stroke="url(#lineGradient)" strokeWidth="1">

              <line x1="80" y1="160" x2="270" y2="300" />
              <line x1="270" y1="300" x2="450" y2="190" />
              <line x1="450" y1="190" x2="670" y2="300" />
              <line x1="670" y1="300" x2="790" y2="150" />

              <line x1="270" y1="300" x2="360" y2="520" />
              <line x1="450" y1="190" x2="520" y2="440" />
              <line x1="670" y1="300" x2="520" y2="440" />

              <line x1="360" y1="520" x2="190" y2="680" />
              <line x1="360" y1="520" x2="520" y2="440" />
              <line x1="520" y1="440" x2="720" y2="610" />
              <line x1="720" y1="610" x2="780" y2="780" />

              <line x1="190" y1="680" x2="420" y2="760" />
              <line x1="420" y1="760" x2="780" y2="780" />

            </g>

            {/* network nodes */}

            <g filter="url(#glow)">

              <circle cx="80" cy="160" r="5" fill="#22d3ee" />
              <circle cx="270" cy="300" r="8" fill="#38bdf8" />
              <circle cx="450" cy="190" r="6" fill="#60a5fa" />
              <circle cx="670" cy="300" r="9" fill="#22d3ee" />
              <circle cx="790" cy="150" r="5" fill="#60a5fa" />

              <circle cx="360" cy="520" r="10" fill="#22d3ee" />
              <circle cx="520" cy="440" r="7" fill="#38bdf8" />

              <circle cx="190" cy="680" r="6" fill="#60a5fa" />
              <circle cx="720" cy="610" r="8" fill="#22d3ee" />

              <circle cx="420" cy="760" r="6" fill="#38bdf8" />
              <circle cx="780" cy="780" r="5" fill="#60a5fa" />

            </g>

            {/* rings */}

            <circle
              cx="360"
              cy="520"
              r="30"
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.15"
            />

            <circle
              cx="360"
              cy="520"
              r="48"
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.08"
            />

          </svg>

          {/* content */}

          <div className="relative z-10 w-full flex flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Link
              to="/"
              className="inline-flex items-center gap-3 w-fit group"
            >

              <div className="relative">

                <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-2xl group-hover:bg-cyan-400/50 transition-all" />

                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <GitFork className="w-5 h-5 text-white" />
                </div>

              </div>

              <div>

                <p className="text-lg font-black tracking-tight text-white">
                  SCN Portal
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
                  Scientific Collaboration Network
                </p>

              </div>

            </Link>

            {/* Main message */}

            <div className="max-w-xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur mb-6">

                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>

                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                  Research collaboration intelligence
                </span>

              </div>

              <h1 className="text-5xl xl:text-6xl font-black tracking-[-0.04em] leading-[1.02] text-white">

                Connect ideas.

                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400">
                  Discover impact.
                </span>

              </h1>

              <p className="mt-6 text-sm xl:text-[15px] leading-7 text-white/80 max-w-lg font-medium">
                A unified research ecosystem for discovering
                researchers, building collaborations, exploring
                publications, and understanding scientific impact.
              </p>

              {/* Feature pills */}

              <div className="mt-8 flex flex-wrap gap-2">

                <FeaturePill
                  icon={<Network className="w-3.5 h-3.5" />}
                  text="Research Networks"
                />

                <FeaturePill
                  icon={<Users className="w-3.5 h-3.5" />}
                  text="Collaboration"
                />

                <FeaturePill
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  text="Publications"
                />

                <FeaturePill
                  icon={<Activity className="w-3.5 h-3.5" />}
                  text="Research Impact"
                />

              </div>

            </div>

            {/* Bottom stats */}

            <div className="grid grid-cols-3 max-w-lg border-t border-white/10 pt-6">

              <MiniStat
                value="01"
                label="Research ecosystem"
              />

              <MiniStat
                value="∞"
                label="Connections"
              />

              <MiniStat
                value="24/7"
                label="Knowledge discovery"
              />

            </div>

          </div>

        </div>

        {/* =======================================================
            RIGHT — LOGIN
        ======================================================= */}

        <div className="w-full lg:w-[48%] flex items-center justify-center p-5 sm:p-8 relative bg-slate-950/75 backdrop-blur-sm transition-colors duration-200">

          <div className="w-full max-w-[470px]">

            {/* Desktop Top Nav with Back to Home & Theme Toggle */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
              <ThemeToggle />
            </div>

            {/* Mobile brand with Theme Toggle */}
            <div className="lg:hidden flex items-center justify-between mb-7">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-navy-700 to-cyan-600 flex items-center justify-center shadow-lg">
                  <GitFork className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-white">
                    SCN Portal
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-cyan-400 font-bold">
                    Scientific Collaboration Network
                  </p>
                </div>
              </Link>
              <ThemeToggle />
            </div>

            {/* Login Card - in light mode toggle, ONLY this card is in light theme */}
            <div className="bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl shadow-black/50 dark:shadow-black/70 overflow-hidden border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white">

              {/* Accent */}

              <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

              <div className="p-7 sm:p-9">

                {/* Header */}

                <div className="mb-7">

                  <div className="flex items-center justify-between">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-200 text-[10px] font-extrabold uppercase tracking-[0.14em]">

                      <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />

                      Researcher Access

                    </div>

                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <LockKeyhole className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                    </div>

                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Welcome back.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200 font-medium">
                    Sign in to continue to your research
                    workspace.
                  </p>

                </div>

                {/* Security */}

                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-3 mb-6">

                  <div className="h-9 w-9 shrink-0 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">

                    <ShieldCheck className="w-4 h-4 text-emerald-600" />

                  </div>

                  <div>

                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                      Secure authentication
                    </p>

                    <p className="text-[9px] text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">
                      Protected research account access
                    </p>

                  </div>

                  <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />

                </div>

                {/* Error */}

                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs text-red-700 dark:text-red-400 flex items-start gap-3">

                    <div className="h-7 w-7 shrink-0 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">

                      <AlertTriangle className="w-3.5 h-3.5" />

                    </div>

                    <div>

                      <p className="font-bold">
                        Authentication failed
                      </p>

                      <p className="mt-0.5 leading-5 opacity-80">
                        {error}
                      </p>

                    </div>

                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>

                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Institutional Email
                    </label>

                    <div className="relative">

                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />

                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="researcher@university.edu"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-sm font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition-all"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
                        onClick={() =>
                          alert(
                            'Please consult the database administrator.'
                          )
                        }
                      >
                        Forgot Password?
                      </button>

                    </div>

                    <div className="relative">

                      <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />

                      <input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        disabled={loading}
                        className="w-full pl-11 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-sm font-medium focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition-all"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden py-3.5 px-5 bg-gradient-to-r from-navy-700 via-blue-700 to-cyan-600 hover:from-navy-600 hover:via-blue-600 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-900/20 transition-all duration-300"
                  >

                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    <span className="relative flex items-center justify-center gap-2">

                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                          Validating credentials...
                        </>
                      ) : (
                        <>
                          Continue to Login OTP

                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}

                    </span>

                  </button>

                </form>

                {/* OTP */}

                <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="flex items-start gap-3">

                    <div className="h-9 w-9 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">

                      <Fingerprint className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Two-step verification
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300 font-medium">
                        A verification code will be required
                        after your credentials are validated.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Register */}

                <div className="flex items-center gap-3 my-7">

                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />

                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-300">
                    New to SCN?
                  </span>

                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />

                </div>

                <Link
                  to="/register"
                  className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm"
                >

                  Create a Research Account

                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-500 dark:text-slate-400" />

                </Link>

              </div>

            </div>

            {/* Footer */}

            <div className="mt-5 text-center">

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Scientific Collaboration Network
                <span className="mx-2">•</span>
                Secure Research Access
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

/* ===============================================================
   SMALL COMPONENTS
================================================================ */

interface FeaturePillProps {
  icon: React.ReactNode;
  text: string;
}

const FeaturePill: React.FC<FeaturePillProps> = ({
  icon,
  text,
}) => {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold backdrop-blur-sm shadow-sm">

      <span className="text-cyan-300">
        {icon}
      </span>

      <span className="text-xs font-bold">
        {text}
      </span>

    </div>
  );
};

interface MiniStatProps {
  value: string;
  label: string;
}

const MiniStat: React.FC<MiniStatProps> = ({
  value,
  label,
}) => {
  return (
    <div>

      <p className="text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-wider font-bold text-slate-300">
        {label}
      </p>

    </div>
  );
};