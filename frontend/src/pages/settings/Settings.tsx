import React, { useState } from 'react';
import { useAuth } from '../../contexts/Auth';
import { UserService } from '../../services/userService';
import { AuthService } from '../../services/authService';
import { UserRole } from '../../types';
import {
  KeyRound,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
  ShieldCheck,
  Send,
  Check,
  UserRound,
  BadgeCheck,
  Fingerprint,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  CircleCheck,
  RefreshCw,
  AtSign,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const Settings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Role
  const [requestedRole, setRequestedRole] = useState<UserRole>(
    UserRole.REVIEWER
  );
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState('');
  const [roleError, setRoleError] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPwdError('');
    setPwdSuccess('');

    if (password.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setPwdError(
        'Password must contain at least one letter and one number.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setPwdLoading(true);

    try {
      await UserService.updateMe({ password: password as any });

      setPwdSuccess('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setEmailSuccess('');

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(newEmail)) {
      setEmailError('Please enter a valid new email address.');
      return;
    }

    setEmailLoading(true);

    try {
      await AuthService.requestEmailChange({
        new_email: newEmail as any,
      });

      setEmailChangeRequested(true);

      alert(
        `[DEMO SYSTEM] Simulated OTP email change code sent to ${newEmail}. Check popup/console.`
      );
    } catch (err: any) {
      setEmailError(
        err.message || 'Failed to initiate email change.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setEmailSuccess('');

    if (emailCode.length !== 6) {
      setEmailError(
        'Verification code must be exactly 6 digits.'
      );
      return;
    }

    setEmailLoading(true);

    try {
      await AuthService.verifyEmailChange({
        email: newEmail as any,
        code: emailCode,
      });

      setEmailSuccess(
        'Email updated successfully. Please sign in again with your new credentials.'
      );

      setTimeout(() => {
        logout();
      }, 2500);
    } catch (err: any) {
      setEmailError(
        err.message || 'Invalid or expired verification code.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRequestRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setRoleError('');
    setRoleSuccess('');
    setRoleLoading(true);

    try {
      const res = await UserService.requestRoleChange(
        requestedRole
      );

      setRoleSuccess(res.message);
      await refreshUser();
    } catch (err: any) {
      setRoleError(
        err.message || 'Failed to submit role change request.'
      );
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'CRITICAL WARNING: This will permanently delete your account and all associated profile details. This cannot be undone. Are you sure you want to proceed?'
      )
    ) {
      return;
    }

    try {
      await UserService.deleteMe();
      logout();
    } catch {
      alert('Failed to delete account.');
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return 'Member';

    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const roleLabel = formatRole(user?.role);

  return (
    <div className="min-h-full pb-10">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-7">

        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-40 top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="absolute right-8 top-8 opacity-[0.045] dark:opacity-[0.07]">
            <Fingerprint className="h-48 w-48" />
          </div>
        </div>

        <div className="relative px-6 py-7 md:px-9 md:py-9">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold uppercase tracking-[0.12em] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Account Control Center
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Security &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-600 to-cyan-500">
                  Settings
                </span>
              </h1>

              <p className="mt-3 text-sm md:text-[15px] leading-7 text-slate-500 dark:text-slate-400 max-w-xl">
                Manage your research identity, credentials, institutional
                email, and access permissions from one secure workspace.
              </p>

            </div>

            {/* Account mini card */}
            <div className="relative shrink-0 min-w-[290px]">

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/60 p-4 backdrop-blur">

                <div className="flex items-center gap-3">

                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-navy-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/10">
                    <UserRound className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.email || 'Research Member'}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {roleLabel}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                  </div>

                  <ShieldCheck className="w-5 h-5 text-emerald-500" />

                </div>

              </div>

            </div>

          </div>

          {/* Security indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">

            <SecurityIndicator
              icon={<ShieldCheck className="w-4 h-4" />}
              title="Account status"
              value={user?.status || 'Active'}
              positive
            />

            <SecurityIndicator
              icon={<BadgeCheck className="w-4 h-4" />}
              title="Verification"
              value={user?.is_verified ? 'Verified' : 'Pending'}
              positive={!!user?.is_verified}
            />

            <SecurityIndicator
              icon={<LockKeyhole className="w-4 h-4" />}
              title="Credentials"
              value="Protected"
              positive
            />

          </div>

        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* =======================================================
            LEFT
        ======================================================= */}
        <div className="xl:col-span-8 space-y-6">

          {/* =====================================================
              PASSWORD
          ===================================================== */}
          <SettingsCard
            icon={<KeyRound className="w-5 h-5" />}
            iconClass="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
            title="Password & Security"
            description="Keep your SCN account protected with a strong password."
          >

            {pwdError && (
              <MessageBox
                type="error"
                message={pwdError}
              />
            )}

            {pwdSuccess && (
              <MessageBox
                type="success"
                message={pwdSuccess}
              />
            )}

            <form
              onSubmit={handleUpdatePassword}
              className="mt-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <InputField
                  label="New password"
                  type="password"
                  placeholder="Enter a new password"
                  value={password}
                  onChange={setPassword}
                  disabled={pwdLoading}
                  icon={<LockKeyhole className="w-4 h-4" />}
                />

                <InputField
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={pwdLoading}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                />

              </div>

              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3.5">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 text-cyan-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Password requirements
                    </p>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Use at least 8 characters with a combination of
                      letters and numbers.
                    </p>
                  </div>

                </div>

              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-navy-600 hover:from-navy-600 hover:to-cyan-600 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-navy-900/10 transition-all duration-200"
              >
                {pwdLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole className="w-3.5 h-3.5" />
                    Update Password
                  </>
                )}
              </button>

            </form>

          </SettingsCard>

          {/* =====================================================
              EMAIL
          ===================================================== */}
          <SettingsCard
            icon={<Mail className="w-5 h-5" />}
            iconClass="bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400"
            title="Institutional Email"
            description="Update the email address associated with your research identity."
          >

            {emailError && (
              <MessageBox
                type="error"
                message={emailError}
              />
            )}

            {emailSuccess && (
              <MessageBox
                type="success"
                message={emailSuccess}
              />
            )}

            {!emailChangeRequested ? (

              <form
                onSubmit={handleRequestEmailChange}
                className="mt-5"
              >

                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 dark:from-slate-950 dark:to-cyan-950/10 border border-slate-100 dark:border-slate-800 p-5">

                  <div className="flex flex-col md:flex-row md:items-center gap-4">

                    <div className="h-11 w-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                      <AtSign className="w-5 h-5 text-cyan-600" />
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Current email
                      </p>

                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 break-all">
                        {user?.email || 'No email available'}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-full self-start md:self-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {user?.is_verified ? 'Verified' : 'Unverified'}
                    </div>

                  </div>

                </div>

                <div className="mt-5">
                  <InputField
                    label="New institutional email"
                    type="email"
                    placeholder="name@university.edu"
                    value={newEmail}
                    onChange={setNewEmail}
                    disabled={emailLoading}
                    icon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-navy-600 hover:from-cyan-500 hover:to-navy-500 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-cyan-900/10 transition-all"
                  >
                    {emailLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Verification Code
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-400">
                    A 6-digit verification code will be required.
                  </span>

                </div>

              </form>

            ) : (

              <form
                onSubmit={handleVerifyEmailChange}
                className="mt-5 animate-scale-in"
              >

                <div className="rounded-2xl border border-cyan-100 dark:border-cyan-900/40 bg-cyan-50/60 dark:bg-cyan-950/20 p-5">

                  <div className="flex items-start gap-3">

                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      <Mail className="w-4.5 h-4.5 text-cyan-600" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Verify your new email
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-5">
                        Enter the 6-digit confirmation code sent to
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {' '}{newEmail}
                        </span>.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="mt-5 max-w-sm">

                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verification code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="mt-2 w-full text-center px-4 py-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl text-2xl tracking-[0.45em] font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                    value={emailCode}
                    onChange={(e) =>
                      setEmailCode(
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    disabled={emailLoading}
                  />

                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">

                  <button
                    type="submit"
                    disabled={
                      emailLoading || emailCode.length !== 6
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-700 hover:bg-navy-600 disabled:opacity-40 text-white px-5 py-2.5 text-xs font-bold transition-all"
                  >
                    {emailLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Confirm Email
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailChangeRequested(false);
                      setEmailCode('');
                      setEmailError('');
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            )}

          </SettingsCard>

        </div>

        {/* =======================================================
            RIGHT
        ======================================================= */}
        <div className="xl:col-span-4 space-y-6">

          {/* =====================================================
              ACCOUNT IDENTITY
          ===================================================== */}
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600 text-white shadow-xl shadow-navy-900/15">

            <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-cyan-400/10 blur-2xl" />
            <div className="absolute -left-12 bottom-0 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative p-6">

              <div className="flex items-center justify-between">

                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur">
                  <Fingerprint className="w-5 h-5 text-cyan-300" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-300/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Secure
                </span>

              </div>

              <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/50 font-bold">
                Current identity
              </p>

              <p className="mt-1 text-lg font-black tracking-tight break-all">
                {user?.email || 'Research Member'}
              </p>

              <div className="mt-5 pt-5 border-t border-white/10 space-y-3">

                <AccountRow
                  label="Role"
                  value={roleLabel}
                />

                <AccountRow
                  label="Verification"
                  value={
                    user?.is_verified
                      ? 'Verified'
                      : 'Pending'
                  }
                />

                <AccountRow
                  label="Status"
                  value={user?.status || 'Active'}
                />

              </div>

            </div>
          </div>

          {/* =====================================================
              ROLE UPGRADE
          ===================================================== */}
          <SettingsCard
            icon={<GraduationCap className="w-5 h-5" />}
            iconClass="bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
            title="Role & Permissions"
            description="Request elevated access to participate in additional workflows."
          >

            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                    Current role
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                    {roleLabel}
                  </p>
                </div>

                <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                </div>

              </div>

              {user?.requested_role && (
                <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3">

                  <div className="flex items-start gap-2">

                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

                    <div>
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        Upgrade request pending
                      </p>

                      <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                        Requested:{' '}
                        <span className="font-bold">
                          {formatRole(user.requested_role)}
                        </span>
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {roleError && (
              <div className="mt-4">
                <MessageBox
                  type="error"
                  message={roleError}
                />
              </div>
            )}

            {roleSuccess && (
              <div className="mt-4">
                <MessageBox
                  type="success"
                  message={roleSuccess}
                />
              </div>
            )}

            <form
              onSubmit={handleRequestRoleChange}
              className="mt-5 space-y-4"
            >

              <div>

                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Request upgrade to
                </label>

                <select
                  className="mt-2 w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                  value={requestedRole}
                  onChange={(e) =>
                    setRequestedRole(
                      e.target.value as UserRole
                    )
                  }
                  disabled={roleLoading}
                >
                  <option value={UserRole.RESEARCHER}>
                    Researcher
                  </option>
                  <option value={UserRole.REVIEWER}>
                    Reviewer
                  </option>
                  <option value={UserRole.INSTITUTION_ADMIN}>
                    Institution Admin
                  </option>
                </select>

              </div>

              <button
                type="submit"
                disabled={
                  roleLoading ||
                  user?.role === requestedRole
                }
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 text-white dark:text-slate-900 px-4 py-3 text-xs font-bold transition-all"
              >
                {roleLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Upgrade Request
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </form>

          </SettingsCard>

        </div>

        {/* =======================================================
            RIGHT (xl:col-span-4)
        ======================================================= */}
        <div className="xl:col-span-4 space-y-6">

          {/* =====================================================
              APPEARANCE & THEME
          ===================================================== */}
          <SettingsCard
            icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            iconClass={theme === 'dark' ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-cyan-400" : "bg-amber-50 text-amber-600"}
            title="Appearance & Theme"
            description="Switch between Light Mode and Dark Mode for all pages."
          >
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Light Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  theme === 'light'
                    ? 'border-navy-600 bg-navy-50/50 dark:bg-navy-950/30 ring-2 ring-navy-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-500 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-navy-600 dark:bg-cyan-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">High clarity</p>
              </button>

              {/* Dark Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  theme === 'dark'
                    ? 'border-navy-600 dark:border-cyan-500 bg-navy-50/50 dark:bg-navy-950/30 ring-2 ring-cyan-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-navy-600 dark:text-cyan-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reduced glare</p>
              </button>
            </div>
          </SettingsCard>

          {/* =====================================================
              SECURITY CHECKLIST
          ===================================================== */}
          <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>

              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Security overview
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  Recommended account checks
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              <ChecklistItem
                label="Verified identity"
                complete={!!user?.is_verified}
              />

              <ChecklistItem
                label="Password protection"
                complete
              />

              <ChecklistItem
                label="Account active"
                complete
              />

            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          DANGER ZONE
      ========================================================= */}
      <section className="mt-7 rounded-[24px] border border-red-200/70 dark:border-red-950/50 bg-white dark:bg-slate-900 overflow-hidden">

        <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

        <div className="p-5 md:p-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="h-11 w-11 shrink-0 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div>

                <p className="text-sm font-black text-red-600">
                  Danger Zone
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-5">
                  Permanently deleting your account removes your
                  SCN profile, authorization details, and associated
                  research records. This action cannot be undone.
                </p>

              </div>

            </div>

            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/70 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 px-5 py-2.5 text-xs font-bold transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>

          </div>

        </div>

      </section>

      {/* Bottom note */}
      <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        Your account controls are managed through the SCN security layer.
      </div>

    </div>
  );
};

/* ===============================================================
   REUSABLE COMPONENTS
================================================================ */

interface SecurityIndicatorProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  positive?: boolean;
}

const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  icon,
  title,
  value,
  positive = true,
}) => {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 px-4 py-3">

      <div className="flex items-center gap-3">

        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            positive
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
            {title}
          </p>

          <p
            className={`text-[11px] font-bold mt-0.5 capitalize ${
              positive
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}
          >
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

interface SettingsCardProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  iconClass,
  title,
  description,
  children,
}) => {
  return (
    <section className="rounded-[24px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

      <div className="p-5 md:p-6">

        <div className="flex items-start gap-3">

          <div
            className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            {icon}
          </div>

          <div className="min-w-0">

            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="text-[10px] text-slate-400 mt-1 leading-5">
              {description}
            </p>

          </div>

        </div>

        {children}

      </div>

    </section>
  );
};

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  icon,
}) => {
  return (
    <div>

      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <div className="relative mt-2">

        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${
            icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all disabled:opacity-50`}
        />

      </div>

    </div>
  );
};

interface MessageBoxProps {
  type: 'success' | 'error';
  message: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  type,
  message,
}) => {
  const success = type === 'success';

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-xl px-4 py-3 border ${
        success
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-300'
      }`}
    >

      {success ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      )}

      <span className="text-[11px] font-semibold leading-5">
        {message}
      </span>

    </div>
  );
};

interface AccountRowProps {
  label: string;
  value: string;
}

const AccountRow: React.FC<AccountRowProps> = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-[10px] text-white/50">
        {label}
      </span>

      <span className="text-[10px] font-bold text-white capitalize text-right">
        {value}
      </span>

    </div>
  );
};

interface ChecklistItemProps {
  label: string;
  complete: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  label,
  complete,
}) => {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2.5">

        <div
          className={`h-6 w-6 rounded-lg flex items-center justify-center ${
            complete
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
          }`}
        >
          {complete ? (
            <CircleCheck className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
        </div>

        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>

      </div>

      <span
        className={`text-[9px] font-bold uppercase ${
          complete
            ? 'text-emerald-600'
            : 'text-amber-600'
        }`}
      >
        {complete ? 'Complete' : 'Pending'}
      </span>

    </div>
  );
};