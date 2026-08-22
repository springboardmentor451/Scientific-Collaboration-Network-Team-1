import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  FlaskConical,
  Network,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Users,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Clock3,
  ArrowLeft,
  UserPlus,
  Building2,
  User,
  LogIn,
} from 'lucide-react';

const ACCOUNT_STORAGE_KEY = 'scinexus_accounts';
const CURRENT_USER_STORAGE_KEY = 'scinexus_current_user';
const LOGIN_STORAGE_KEY = 'scinexus_logged_in';

// Frontend demo OTP
const DEMO_OTP = '123456';

export default function Login() {
  const navigate = useNavigate();

  // ==========================================
  // AUTHENTICATION MODE
  // ==========================================

  const [authMode, setAuthMode] = useState('login');

  // ==========================================
  // ACCOUNT DETAILS
  // ==========================================

  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Researcher');

  // ==========================================
  // OTP
  // ==========================================

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSeconds, setOtpSeconds] = useState(300);
  const [otpExpired, setOtpExpired] = useState(false);

  // ==========================================
  // UI STATES
  // ==========================================

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ==========================================
  // ROLES
  // ==========================================

  const roles = [
    'Researcher',
    'Institution Admin',
    'Reviewer',
    'System Admin',
  ];

  // ==========================================
  // FORMAT TIMER
  // ==========================================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  // ==========================================
  // OTP COUNTDOWN
  // ==========================================

  useEffect(() => {
    if (!otpStep || otpExpired) {
      return;
    }

    if (otpSeconds <= 0) {
      setOtpExpired(true);
      setErrorMessage(
        'Your OTP has expired. Please request a new OTP.'
      );
      return;
    }

    const timer = setInterval(() => {
      setOtpSeconds((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpStep, otpExpired, otpSeconds]);

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ==========================================
  // GET ACCOUNTS
  // ==========================================

  const getAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem(
        ACCOUNT_STORAGE_KEY
      );

      if (!storedAccounts) {
        return [];
      }

      const accounts = JSON.parse(storedAccounts);

      return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
      console.error(
        'Unable to read SciNexus accounts:',
        error
      );

      return [];
    }
  };

  // ==========================================
  // SAVE ACCOUNTS
  // ==========================================

  const saveAccounts = (accounts) => {
    try {
      localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(accounts)
      );
    } catch (error) {
      console.error(
        'Unable to save SciNexus accounts:',
        error
      );
    }
  };

  // ==========================================
  // CREATE DEMO OTP
  // ==========================================

  const createOtp = () => {
    return DEMO_OTP;
  };

  // ==========================================
  // SAVE CURRENT USER
  // ==========================================

  const saveCurrentUser = (account) => {
    const currentUser = {
      id: account.id,
      name: account.fullName,
      fullName: account.fullName,
      email: account.email,
      role: account.role || 'Researcher',
      institution: account.institution || '',
      department: account.institution || '',
      emailVerified: true,
    };

    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(currentUser)
    );

    localStorage.setItem(
      LOGIN_STORAGE_KEY,
      'true'
    );
  };

  // ==========================================
  // SWITCH AUTH MODE
  // ==========================================

  const switchAuthMode = (mode) => {
    setAuthMode(mode);

    setOtpStep(false);
    setOtp('');
    setGeneratedOtp('');
    setOtpSeconds(300);
    setOtpExpired(false);

    setErrorMessage('');
    setSuccessMessage('');

    setFullName('');
    setInstitution('');
    setEmail('');
    setRole('Researcher');
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const sendOtp = () => {
    const newOtp = createOtp();

    setGeneratedOtp(newOtp);
    setOtp('');
    setOtpSeconds(300);
    setOtpExpired(false);

    console.log('====================================');
    console.log('SciNexus DEVELOPMENT OTP');
    console.log(`Email: ${email}`);
    console.log(`OTP: ${newOtp}`);
    console.log('Expires in: 5 minutes');
    console.log('====================================');

    setOtpStep(true);

    setSuccessMessage(
      `Demo verification code generated for ${email}.`
    );
  };

  // ==========================================
  // EXISTING USER - REQUEST OTP
  // ==========================================

  const handleExistingUserLogin = (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage(
        'Please enter your institutional email.'
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage(
        'Please enter a valid email address.'
      );
      return;
    }

    const accounts = getAccounts();

    const existingAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === cleanEmail
    );

    if (!existingAccount) {
      setErrorMessage(
        'No SciNexus account was found with this email. Please create a new account first.'
      );
      return;
    }

    setFullName(existingAccount.fullName || '');
    setInstitution(existingAccount.institution || '');
    setRole(existingAccount.role || 'Researcher');

    setIsSendingOtp(true);

    setTimeout(() => {
      sendOtp();
      setIsSendingOtp(false);
    }, 700);
  };

  // ==========================================
  // NEW USER - REQUEST OTP
  // ==========================================

  const handleCreateAccountRequest = (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      setErrorMessage(
        'Please enter your full name.'
      );
      return;
    }

    if (!institution.trim()) {
      setErrorMessage(
        'Please enter your institution.'
      );
      return;
    }

    if (!cleanEmail) {
      setErrorMessage(
        'Please enter your institutional email.'
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage(
        'Please enter a valid email address.'
      );
      return;
    }

    const accounts = getAccounts();

    const existingAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === cleanEmail
    );

    if (existingAccount) {
      setErrorMessage(
        'An account with this email already exists. Please use Sign In instead.'
      );
      return;
    }

    setEmail(cleanEmail);
    setIsSendingOtp(true);

    setTimeout(() => {
      sendOtp();
      setIsSendingOtp(false);
    }, 700);
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (otpExpired || otpSeconds <= 0) {
      setOtpExpired(true);

      setErrorMessage(
        'This OTP has expired. Please request a new OTP.'
      );

      return;
    }

    if (!otp || otp.length !== 6) {
      setErrorMessage(
        'Please enter the complete 6-digit OTP.'
      );

      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      // ==========================================
      // CHECK DEMO OTP
      // ==========================================

      if (otp !== generatedOtp) {
        setErrorMessage(
          'Incorrect OTP. For this frontend demo, use 123456.'
        );

        setIsVerifyingOtp(false);

        return;
      }

      // ==========================================
      // OTP VERIFIED
      // ==========================================

      setSuccessMessage(
        'Email verified successfully.'
      );

      const accounts = getAccounts();

      // ==========================================
      // NEW ACCOUNT
      // ==========================================

      if (authMode === 'register') {
        const newAccount = {
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          institution: institution.trim(),
          email: email.trim().toLowerCase(),
          role: role || 'Researcher',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        const updatedAccounts = [
          ...accounts,
          newAccount,
        ];

        saveAccounts(updatedAccounts);

        saveCurrentUser(newAccount);

        setIsVerifyingOtp(false);

        setTimeout(() => {
          navigate('/dashboard', {
            replace: true,
          });
        }, 800);

        return;
      }

      // ==========================================
      // EXISTING ACCOUNT
      // ==========================================

      const existingAccount = accounts.find(
        (account) =>
          account.email.toLowerCase() ===
          email.trim().toLowerCase()
      );

      if (!existingAccount) {
        setIsVerifyingOtp(false);

        setErrorMessage(
          'Account could not be found. Please create an account first.'
        );

        return;
      }

      saveCurrentUser(existingAccount);

      setIsVerifyingOtp(false);

      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
        });
      }, 800);
    }, 500);
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = () => {
    if (!email || !isValidEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address.'
      );

      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const newOtp = createOtp();

    setGeneratedOtp(newOtp);
    setOtp('');
    setOtpSeconds(300);
    setOtpExpired(false);

    console.log('====================================');
    console.log('SciNexus DEVELOPMENT OTP - RESENT');
    console.log(`Email: ${email}`);
    console.log(`OTP: ${newOtp}`);
    console.log('Expires in: 5 minutes');
    console.log('====================================');

    setSuccessMessage(
      `New demo verification code generated for ${email}.`
    );
  };

  // ==========================================
  // BACK FROM OTP
  // ==========================================

  const handleBackFromOtp = () => {
    setOtpStep(false);
    setOtp('');
    setGeneratedOtp('');
    setOtpSeconds(300);
    setOtpExpired(false);

    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff7f3] via-[#fffaf8] to-[#fff1f5]">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-orange-300/25 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* ==========================================
          MAIN
      ========================================== */}

      <div className="relative z-10 min-h-screen flex">

        {/* ==========================================
            LEFT SIDE
        ========================================== */}

        <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16">

          {/* LOGO */}

          <div className="flex items-center space-x-3">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-pink-300/30 overflow-hidden p-1.5">

              <img
                src="./logo.png"
                alt="SciNexus Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <FlaskConical className="w-6 h-6 hidden" />

            </div>

            <div>

              <h1 className="font-bold text-xl text-slate-900">

                Sci<span className="text-pink-500">
                  Nexus
                </span>

              </h1>

              <p className="text-xs text-slate-500">
                Scientific collaboration network analyzer
              </p>

            </div>

          </div>

          {/* HERO */}

          <div className="max-w-xl">

            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-pink-200/60 text-pink-600 text-xs font-semibold mb-6 shadow-sm">

              <Sparkles className="w-3.5 h-3.5" />

              <span>
                Research Intelligence Workspace
              </span>

            </div>

            <h2 className="text-5xl xl:text-6xl font-bold text-slate-900 leading-[1.08]">

              Connect the

              <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 bg-clip-text text-transparent">

                science behind

              </span>

              every discovery.

            </h2>

            <p className="mt-6 text-sm leading-7 text-slate-600 max-w-lg">

              Explore researchers, publications,
              collaborations, institutions, projects
              and research impact through one connected
              workspace.

            </p>

            {/* STATISTICS */}

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg">

              <div className="bg-white/55 backdrop-blur-xl border border-white/70 rounded-2xl p-4 shadow-lg shadow-pink-100/40">

                <p className="text-xl font-bold text-slate-900">
                  1,482
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  Researchers
                </p>

              </div>

              <div className="bg-white/55 backdrop-blur-xl border border-white/70 rounded-2xl p-4 shadow-lg shadow-pink-100/40">

                <p className="text-xl font-bold text-slate-900">
                  9,376
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  Publications
                </p>

              </div>

              <div className="bg-white/55 backdrop-blur-xl border border-white/70 rounded-2xl p-4 shadow-lg shadow-orange-100/40">

                <p className="text-xl font-bold text-slate-900">
                  126
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  Institutions
                </p>

              </div>

            </div>

            {/* FEATURES */}

            <div className="grid grid-cols-2 gap-3 mt-5 max-w-lg">

              <div className="bg-white/50 backdrop-blur-xl border border-white/70 rounded-2xl p-4 shadow-lg shadow-pink-100/30">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center">

                    <BarChart3 className="w-4 h-4" />

                  </div>

                  <div>

                    <h4 className="text-xs font-bold text-slate-800">
                      Research Analytics
                    </h4>

                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Track research impact
                    </p>

                  </div>

                </div>

              </div>

              <div className="bg-white/50 backdrop-blur-xl border border-white/70 rounded-2xl p-4 shadow-lg shadow-orange-100/30">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">

                    <Users className="w-4 h-4" />

                  </div>

                  <div>

                    <h4 className="text-xs font-bold text-slate-800">
                      Collaboration Mapping
                    </h4>

                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Discover partnerships
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* NETWORK */}

            <div className="relative mt-6 h-40 rounded-3xl overflow-hidden bg-white/40 backdrop-blur-xl border border-white/70 shadow-xl shadow-pink-100/40">

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="absolute w-32 h-32 rounded-full border border-pink-300/40" />

                <div className="absolute w-52 h-52 rounded-full border border-orange-300/30" />

                <div className="absolute w-72 h-72 rounded-full border border-pink-200/20" />

                <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg shadow-pink-400/40 flex items-center justify-center">

                  <Network className="w-6 h-6 text-white" />

                </div>

                <div className="absolute top-7 left-[28%] w-3 h-3 rounded-full bg-pink-400 shadow-lg shadow-pink-300" />

                <div className="absolute top-16 right-[25%] w-3 h-3 rounded-full bg-orange-400 shadow-lg shadow-orange-300" />

                <div className="absolute bottom-7 left-[40%] w-3 h-3 rounded-full bg-rose-400 shadow-lg shadow-rose-300" />

                <div className="absolute bottom-10 right-[35%] w-2.5 h-2.5 rounded-full bg-pink-300" />

              </div>

              <div className="absolute bottom-3 left-4 text-[9px] font-semibold tracking-wider text-slate-400">
                COLLABORATION NETWORK
              </div>

              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">

                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />

                LIVE RESEARCH MAP

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-between gap-4">

            <p className="text-[10px] text-slate-400">
              © 2026 Scientific Collaboration Network Analyzer
            </p>

            <div className="flex items-center gap-3 text-[10px] text-slate-400">

              <span className="flex items-center gap-1">

                <ShieldCheck className="w-3 h-3" />

                Secure Workspace

              </span>

              <span>•</span>

              <span>
                Research Intelligence Platform
              </span>

            </div>

          </div>

        </div>

        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            <div className="relative bg-white/65 backdrop-blur-2xl border border-white/80 rounded-[28px] p-7 sm:p-9 shadow-2xl shadow-pink-200/40">

              <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-300/30 blur-3xl rounded-full pointer-events-none" />

              <div className="relative">

                {/* MOBILE LOGO */}

                <div className="lg:hidden flex items-center space-x-3 mb-8">

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center overflow-hidden p-1">

                    <img
                      src="./logo.png"
                      alt="SciNexus Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <FlaskConical className="w-5 h-5 hidden" />

                  </div>

                  <div>

                    <h1 className="font-bold text-lg text-slate-900">

                      Sci<span className="text-pink-500">
                        Nexus
                      </span>

                    </h1>

                    <p className="text-[10px] text-slate-500">
                      Scientific collaboration network analyzer
                    </p>

                  </div>

                </div>

                {/* ==========================================
                    OTP SCREEN
                ========================================== */}

                {otpStep ? (

                  <div>

                    <button
                      type="button"
                      onClick={handleBackFromOtp}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-pink-500 transition-colors mb-6"
                    >

                      <ArrowLeft className="w-3.5 h-3.5" />

                      Back

                    </button>

                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-pink-200/60 mb-5">

                      <KeyRound className="w-6 h-6" />

                    </div>

                    <div className="mb-6">

                      <p className="text-xs font-semibold text-pink-500 mb-2">
                        EMAIL VERIFICATION
                      </p>

                      <h2 className="text-3xl font-bold text-slate-900">
                        Verify your email
                      </h2>

                      <p className="text-sm text-slate-500 mt-2 leading-6">

                        Enter the 6-digit verification
                        code to continue.

                      </p>

                      <div className="mt-3 px-3 py-2.5 rounded-xl bg-pink-50/70 border border-pink-100">

                        <p className="text-xs text-slate-500">
                          Verification code sent to
                        </p>

                        <p className="text-xs font-bold text-pink-600 mt-0.5 break-all">
                          {email}
                        </p>

                      </div>

                    </div>

                    <form
                      onSubmit={handleVerifyOtp}
                      className="space-y-5"
                    >

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          One-Time Password
                        </label>

                        <div className="relative">

                          <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-pink-400" />

                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {

                              const value =
                                e.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 6);

                              setOtp(value);
                              setErrorMessage('');
                              setSuccessMessage('');

                            }}
                            placeholder="Enter 6-digit OTP"
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 text-sm tracking-[0.3em] font-bold bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                          />

                        </div>

                      </div>

                      {/* TIMER */}

                      <div
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl border ${
                          otpExpired
                            ? 'bg-red-50 border-red-100'
                            : 'bg-orange-50/70 border-orange-100'
                        }`}
                      >

                        <div className="flex items-center gap-2">

                          <Clock3
                            className={`w-4 h-4 ${
                              otpExpired
                                ? 'text-red-400'
                                : 'text-orange-400'
                            }`}
                          />

                          <span className="text-xs font-semibold text-slate-600">

                            {otpExpired
                              ? 'OTP expired'
                              : 'Code expires in'}

                          </span>

                        </div>

                        {!otpExpired && (

                          <span className="text-sm font-bold text-orange-500">
                            {formatTime(otpSeconds)}
                          </span>

                        )}

                      </div>

                      {/* ERROR */}

                      {errorMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">

                          <p className="text-xs font-medium text-red-500">
                            {errorMessage}
                          </p>

                        </div>

                      )}

                      {/* SUCCESS */}

                      {successMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">

                          <div className="flex items-start gap-2">

                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />

                            <p className="text-xs font-medium text-green-600">
                              {successMessage}
                            </p>

                          </div>

                        </div>

                      )}

                      {/* VERIFY */}

                      <button
                        type="submit"
                        disabled={
                          isVerifyingOtp ||
                          otpExpired ||
                          otp.length !== 6
                        }
                        className={`w-full py-3.5 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg ${
                          isVerifyingOtp ||
                          otpExpired ||
                          otp.length !== 6
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 shadow-pink-200/60 hover:shadow-xl'
                        }`}
                      >

                        {isVerifyingOtp ? (

                          <>

                            <RefreshCw className="w-4 h-4 animate-spin" />

                            <span>
                              Verifying...
                            </span>

                          </>

                        ) : (

                          <>

                            <span>
                              Verify OTP
                            </span>

                            <ArrowRight className="w-4 h-4" />

                          </>

                        )}

                      </button>

                    </form>

                    {/* RESEND */}

                    <div className="mt-5 text-center">

                      <p className="text-[11px] text-slate-400">
                        Didn't receive the code?
                      </p>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="mt-1 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors inline-flex items-center gap-1.5"
                      >

                        <RefreshCw className="w-3 h-3" />

                        Resend OTP

                      </button>

                    </div>

                    {/* DEVELOPMENT MESSAGE */}

                    <div className="mt-5 bg-amber-50/80 border border-amber-100 rounded-xl p-3">

                      <p className="text-[10px] font-bold text-amber-600">
                        Development Mode
                      </p>

                      <p className="text-[10px] text-amber-600/80 mt-1 leading-4">

                        Email delivery is not connected yet.
                        Use demo OTP

                        <strong className="ml-1">
                          123456
                        </strong>

                        to continue.

                      </p>

                    </div>

                  </div>

                ) : authMode === 'login' ? (

                  /* ==========================================
                      EXISTING USER LOGIN
                  ========================================== */

                  <div>

                    <div className="mb-7">

                      <p className="text-xs font-semibold text-pink-500 mb-2">
                        WELCOME BACK
                      </p>

                      <h2 className="text-3xl font-bold text-slate-900">
                        Sign in to SciNexus
                      </h2>

                      <p className="text-sm text-slate-500 mt-2">
                        Access your research collaboration workspace.
                      </p>

                    </div>

                    <form
                      onSubmit={handleExistingUserLogin}
                      className="space-y-5"
                    >

                      {/* EMAIL */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Institutional Email
                        </label>

                        <div className="relative">

                          <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />

                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setErrorMessage('');
                              setSuccessMessage('');
                            }}
                            placeholder="e.g. alex.chen@stanford.edu"
                            className="w-full pl-10 pr-4 py-3 text-sm bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 placeholder:text-slate-400"
                          />

                        </div>

                      </div>

                      {/* ERROR */}

                      {errorMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">

                          <p className="text-xs font-medium text-red-500">
                            {errorMessage}
                          </p>

                        </div>

                      )}

                      {/* SUCCESS */}

                      {successMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">

                          <div className="flex items-start gap-2">

                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />

                            <p className="text-xs font-medium text-green-600">
                              {successMessage}
                            </p>

                          </div>

                        </div>

                      )}

                      {/* SUBMIT BUTTON */}

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className={`w-full py-3.5 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg ${
                          isSendingOtp
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 shadow-pink-200/60 hover:shadow-xl'
                        }`}
                      >

                        {isSendingOtp ? (

                          <>

                            <RefreshCw className="w-4 h-4 animate-spin" />

                            <span>
                              Sending OTP...
                            </span>

                          </>

                        ) : (

                          <>

                            <LogIn className="w-4 h-4" />

                            <span>
                              Continue with OTP
                            </span>

                          </>

                        )}

                      </button>

                    </form>

                    {/* SWITCH TO REGISTER */}

                    <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">

                      <p className="text-xs text-slate-500">
                        Don't have an account yet?
                      </p>

                      <button
                        type="button"
                        onClick={() => switchAuthMode('register')}
                        className="mt-2 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors inline-flex items-center gap-1.5"
                      >

                        <UserPlus className="w-3.5 h-3.5" />

                        Create new SciNexus account

                      </button>

                    </div>

                  </div>

                ) : (

                  /* ==========================================
                      NEW USER REGISTER
                  ========================================== */

                  <div>

                    <div className="mb-7">

                      <p className="text-xs font-semibold text-pink-500 mb-2">
                        JOIN THE NETWORK
                      </p>

                      <h2 className="text-3xl font-bold text-slate-900">
                        Create an account
                      </h2>

                      <p className="text-sm text-slate-500 mt-2">
                        Get started with SciNexus today.
                      </p>

                    </div>

                    <form
                      onSubmit={handleCreateAccountRequest}
                      className="space-y-4"
                    >

                      {/* FULL NAME */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name
                        </label>

                        <div className="relative">

                          <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />

                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Dr. Alex Chen"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 placeholder:text-slate-400"
                          />

                        </div>

                      </div>

                      {/* INSTITUTION */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Institution / Organization
                        </label>

                        <div className="relative">

                          <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />

                          <input
                            type="text"
                            required
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="Stanford University"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 placeholder:text-slate-400"
                          />

                        </div>

                      </div>

                      {/* EMAIL */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Institutional Email
                        </label>

                        <div className="relative">

                          <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />

                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex.chen@stanford.edu"
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 placeholder:text-slate-400"
                          />

                        </div>

                      </div>

                      {/* ROLE */}

                      <div>

                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Primary Role
                        </label>

                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white/60 border border-slate-200/80 rounded-xl outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100/70 text-slate-700"
                        >

                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}

                        </select>

                      </div>

                      {/* ERROR */}

                      {errorMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">

                          <p className="text-xs font-medium text-red-500">
                            {errorMessage}
                          </p>

                        </div>

                      )}

                      {/* SUCCESS */}

                      {successMessage && (

                        <div className="px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">

                          <div className="flex items-start gap-2">

                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />

                            <p className="text-xs font-medium text-green-600">
                              {successMessage}
                            </p>

                          </div>

                        </div>

                      )}

                      {/* SUBMIT BUTTON */}

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className={`w-full py-3.5 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg ${
                          isSendingOtp
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 shadow-pink-200/60 hover:shadow-xl'
                        }`}
                      >

                        {isSendingOtp ? (

                          <>

                            <RefreshCw className="w-4 h-4 animate-spin" />

                            <span>
                              Creating Account...
                            </span>

                          </>

                        ) : (

                          <>

                            <UserPlus className="w-4 h-4" />

                            <span>
                              Register & Send OTP
                            </span>

                          </>

                        )}

                      </button>

                    </form>

                    {/* SWITCH TO LOGIN */}

                    <div className="mt-6 pt-5 border-t border-slate-200/60 text-center">

                      <p className="text-xs text-slate-500">
                        Already have an account?
                      </p>

                      <button
                        type="button"
                        onClick={() => switchAuthMode('login')}
                        className="mt-2 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors inline-flex items-center gap-1.5"
                      >

                        <LogIn className="w-3.5 h-3.5" />

                        Sign in instead

                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
